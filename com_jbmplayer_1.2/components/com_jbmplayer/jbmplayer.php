<?php
/**
 * @package		Joomla.Site
 * @subpackage	com_wrapper
 * @copyright	Copyright (C) 2005 - 2012 Open Source Matters, Inc. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

// no direct access
defined('_JEXEC') or die;

// Include dependancies
jimport('joomla.application.component.controller');

define('COM_JBMPLAYER_PATH', JPATH_SITE.DS.'components'.DS.'com_jbmplayer');
define('COM_JBMPLAYER_ADMIN', JPATH_ADMINISTRATOR.DS.'components'.DS.'com_jbmplayer');
define('COM_JBMPLAYER_URL', JURI::base().'components'.DS.'com_jbmplayer');
define('COM_JBMPLAYER_PLUGINS', JPATH_SITE.DS.'components'.DS.'com_jbmplayer'.DS.'plugins');
define('COM_JBMPLAYER_PLUGINS_URL', JURI::base().'components'.DS.'com_jbmplayer'.DS.'plugins');
define('COM_JBMPLAYER_MEDIA', JPATH_SITE.DS.'media'.DS.'jbmplayer');
define('COM_JBMPLAYER_ARTWORKS', JPATH_SITE.DS.'media'.DS.'jbmplayer'.DS.'artworks');
define('COM_JBMPLAYER_ARTWORKS_URL', JURI::base().'media'.DS.'jbmplayer'.DS.'artworks');

$controller = JController::getInstance('Jbmplayer');
$controller->execute(JRequest::getCmd('task'));
$controller->redirect();
