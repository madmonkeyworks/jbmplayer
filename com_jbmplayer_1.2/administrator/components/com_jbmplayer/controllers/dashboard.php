<?php
/**
 * @copyright	Copyright (C) 2013 Jan B Mwesigwa. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

// No direct access.
defined('_JEXEC') or die;

jimport('joomla.application.component.controlleradmin');

/**
 * Jbmplayer list controller class.
 *
 * @package		Joomla.Administrator
 * @subpackage	com_jbmplayer
 * @since		1.6
 */
class JbmplayerControllerDashboard extends JControllerAdmin
{
	/**
	 * @var		string	The prefix to use with controller messages.
	 * @since	1.6
	 */
	protected $text_prefix = 'COM_JBMPLAYER_DASHBOARD';

	/**
	 * Constructor.
	 *
	 * @param	array An optional associative array of configuration settings.
	 * @see		JController
	 * @since	1.6
	 */
	public function __construct($config = array())
	{
		parent::__construct($config);
        
	}
    
	/**
	 * Proxy for getModel.
	 * @since	1.6
	 */
	public function getModel($name = 'Dashboard', $prefix = 'JbmplayerModel', $config = array('ignore_request' => true))
	{
		$model = parent::getModel($name, $prefix, $config);
		return $model;
	}    
}
