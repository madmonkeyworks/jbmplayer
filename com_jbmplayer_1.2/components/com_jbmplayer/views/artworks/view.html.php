<?php
/**
 * @package		Joomla.Site
 * @subpackage	com_jbmplayer
 * @copyright	Copyright (C) 2005 - 2012 Open Source Matters, Inc. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

// No direct access
defined('_JEXEC') or die;

jimport('joomla.application.component.view');
jimport('joomla.registry.registry');
jimport('joomla.filesystem.folder');
jimport('joomla.filesystem.file');
require_once(COM_JBMPLAYER_ADMIN.DS.'helpers'.DS.'jbmplayer.php');
/**
 * @package		Joomla.Site
 * @subpackage	com_jbmplayer
 */
class JbmplayerViewArtworks extends JView
{   
	public function display($tpl = null)
	{
		$app		= JFactory::getApplication();
        $actions    = JbmplayerHelper::getActions();
        $helper     = new JbmplayerHelper();
        
        if (!$actions->get('core.admin')) {
            echo "No access";
            return;
        }
        
        // get artworks 
        $list = JFolder::files(COM_JBMPLAYER_ARTWORKS, 'jpg|jpeg|gif|png|JPG|JPEG|GIF|PNG');
        $list = is_array($list) ? $list : array();
        $artworks = array();
        
        if (!count($list)) { 
            echo 'No artworks found...';
            return false;
        }
        
        foreach ($list as $i => $img) {
            $artworks[$i] = new JRegistry();
            $artworks[$i]->set('url', COM_JBMPLAYER_ARTWORKS_URL.DS.$img);
            $artworks[$i]->set('path',COM_JBMPLAYER_ARTWORKS.DS.$img);
            $artworks[$i]->set('name',JFile::stripExt($img));
            
        }

		$this->assignRef('artworks', $artworks);
        $this->assignRef('actions', $actions);

		parent::display($tpl);
	}
}
