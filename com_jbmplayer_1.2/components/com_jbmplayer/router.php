<?php
/**
 * @subpackage	com_jbmplayer
 * @copyright	Copyright (C) 2005 - 2012 
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

/**
 * @param	array
 * @return	array
 */
function JbmplayerBuildRoute(&$query)
{
	$segments = array();

	if (isset($query['id'])) {
		unset($query['Itemid']);
	}

	return $segments;
}

/**
 * @param	array
 * @return	array
 */
function JbmplayerParseRoute($segments)
{
	$vars = array();

	$vars['view'] = 'wrapper';

	return $vars;
}
