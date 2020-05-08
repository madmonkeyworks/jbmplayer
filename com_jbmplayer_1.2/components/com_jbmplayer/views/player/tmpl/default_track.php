<?php
/**
 * @package		Joomla.Site
 * @subpackage	com_jbmplayer
 * @copyright	Copyright (C) 2012 Jan B Mwesigwa, Inc. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

// no direct access
defined('_JEXEC') or die;
$item = $this->item;
?>

<div class="jbmplayer-track track" data="<?php echo htmlentities(json_encode($item->toArray())); ?>">
    <a href="#" class="track-link">
        <img class="artwork" src="<?php echo COM_JBMPLAYER_URL.DS.'images'.DS.'blank.gif'; ?>" />
        <span class="name"></span>
    </a>
    <span class="moreinfo"></span>
    <span class="length"></span>
    <div class="separator"></div>
</div>