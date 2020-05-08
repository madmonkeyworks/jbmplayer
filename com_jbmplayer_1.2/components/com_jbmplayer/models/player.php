<?php
/**
 * @package		Joomla.Site
 * @subpackage	com_jbmplayer
 * @copyright	Copyright (C) 2005 - 2012 Open Source Matters, Inc. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

// No direct access
defined('_JEXEC') or die;

jimport('joomla.application.component.modelitem');

/**
 * Jbmplayer Component player Model
 *
 * @package		Joomla.Site
 * @subpackage	com_jbmgallery
 * @since 1.5
 */
class JbmplayerModelPlayer extends JModelItem
{
	/**
	 * Method to get page content (images) from db
	 * @since	2.5
	 */
	public function getData()
	{
        $db = $this->getDbo();

		// Load state from the request.
		$Itemid = JRequest::getInt('Itemid');

        $db->setQuery(
                        'SELECT `id`,`Itemid`,`content`,`params` FROM #__jbmplayer' .
                        ' WHERE `Itemid` = ' .$Itemid.
                        ' AND published = 1'.
                        ' LIMIT 1;'
                );

        if (!$db->query()) {
            $this->setError($db->getErrorMsg());
            return false;
        } else {
            return $db->loadObject();
        }        
	}
    
    /**
	 * Method to get pagination from db
	 * @since	2.5
	 */
    public function pagesCount()
    {
        $db = $this->getDbo();

		// Load state from the request.
		$Itemid = JRequest::getInt('Itemid');
        
        $db->setQuery(
                        'SELECT count(id) FROM #__jbmplayer' .
                        ' WHERE Itemid = ' .$Itemid.
                        ' AND published = 1'
                );
                
        if (!$db->query()) {
            $this->setError($db->getErrorMsg());
            return false;
        } else {
            return (int) $db->loadResult();
        }  
    }
}
