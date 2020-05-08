<?php
/**
 * @copyright	Copyright (C) 2005 - 2012 Open Source Matters, Inc. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

// No direct access.
defined('_JEXEC') or die;

/**
 * jbmgallery table
 *
 * @package		Joomla.Site
 * @subpackage	com_jbmplayer
 * @since		1.5
 */
class TableJbmplayer extends JTable
{
    var $id = null;
    var $Itemid = null;
    var $content = '';
    var $published = null;
    var $ordering = null;
    var $params = '';
    
	/**
	 * Constructor
	 *
	 * @since	1.5
	 */
	function __construct(&$_db)
	{
		parent::__construct('#__jbmplayer', 'id', $_db);
	}

}
