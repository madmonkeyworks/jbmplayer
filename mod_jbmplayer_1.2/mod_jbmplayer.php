<?php
/**
 * @package		Joomla.Site
 * @subpackage	mod_jbmplayer
 * @copyright	Copyright (C) 2005 - 2012 Open Source Matters, Inc. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

// no direct access
defined('_JEXEC') or die;

$moduleclass_sfx = htmlspecialchars($params->get('moduleclass_sfx'));

// add css
$doc = &JFactory::getDocument();
$doc->addStylesheet(JURI::base().'modules'.DS.'mod_jbmplayer'.DS.'css'.DS.'jbmplayer-remote.css');

require JModuleHelper::getLayoutPath('mod_jbmplayer', $params->get('layout', 'default'));
