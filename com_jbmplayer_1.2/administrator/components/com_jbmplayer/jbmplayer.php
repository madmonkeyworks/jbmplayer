<?php
/**
 * @package		Joomla.Administrator
 * @subpackage	com_jbmplayer
 * @copyright	Copyright (C) 2013 Jan B Mwesigwa. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

// Access check.
if (!JFactory::getUser()->authorise('core.manage', 'com_jbmplayer')) {
	return JError::raiseWarning(404, JText::_('JERROR_ALERTNOAUTHOR'));
}

// Include dependancies
jimport('joomla.application.component.controller');

// Execute the task.
$controller	= JController::getInstance('Jbmplayer');
$controller->execute(JRequest::getCmd('task'));
$controller->redirect();
