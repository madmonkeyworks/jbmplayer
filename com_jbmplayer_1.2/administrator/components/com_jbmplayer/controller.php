<?php
/**
 * @copyright	Copyright (C) 2013 Jan B Mwesigwa. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

// No direct access
defined('_JEXEC') or die;

jimport('joomla.application.component.controller');

/**
 * jbmplayer master display controller.
 *
 * @package		Joomla.Administrator
 * @subpackage	com_jbmplayer
 * @since		1.6
 */
class JbmplayerController extends JController
{
	/**
	 * Method to display a view.
	 *
	 * @param	boolean			If true, the view output will be cached
	 * @param	array			An array of safe url parameters and their variable types, for valid values see {@link JFilterInput::clean()}.
	 *
	 * @return	JController		This object to support chaining.
	 * @since	1.5
	 */
	public function display($cachable = false, $urlparams = false)
	{
		require_once JPATH_COMPONENT.'/helpers/jbmplayer.php';

		$view	= JRequest::getCmd('view', 'dashboard');
		$layout = JRequest::getCmd('layout', 'default');
		$id		= JRequest::getInt('id');

		parent::display();

		return $this;
	}
}
