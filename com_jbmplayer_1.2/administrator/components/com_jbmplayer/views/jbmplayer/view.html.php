<?php
/**
 * @copyright	Copyright (C) 2013 Jan B Mwesigwa. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

// No direct access
defined('_JEXEC') or die;

jimport('joomla.application.component.view');
jimport('joomla.html.pane');
JLoader::register('JbmplayerHelper', JPATH_COMPONENT.'/helpers/jbmplayer.php');

/**
 * View jbmplayer Dashboard.
 *
 * @package		Joomla.Administrator
 * @subpackage	com_jbmplayer
 * @since		2.5
 */
class JbmplayerViewJbmplayer extends JView
{
	protected $form;
    protected $pane;
	/**
	 * Display the view
	 */
	public function display($tpl = null)
	{
		// Initialiase variables.
		$this->form		= $this->get('Form');
        $this->pane     = JPane::getInstance('sliders',array('allowAllClose'=>true));

		// Check for errors.
		if (count($errors = $this->get('Errors'))) {
			JError::raiseError(500, implode("\n", $errors));
			return false;
		}

		$this->addToolbar();
		parent::display($tpl);
	}

	/**
	 * Add the page title and toolbar.
	 *
	 * @since	1.6
	 */
	protected function addToolbar()
	{
		// get permissions
		$canDo		= JbmplayerHelper::getActions();

		JToolBarHelper::title(JText::_('COM_JBMPLAYER_DASHBOARD'), 'configuration.png');
        
        if ($canDo->get('core.admin'))
		{
            JToolBarHelper::divider();
			JToolBarHelper::preferences('com_jbmplayer');
		}
	}
}
