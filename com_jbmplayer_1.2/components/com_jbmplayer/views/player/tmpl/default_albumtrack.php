<?php
/**
 * @package		Joomla.Site
 * @subpackage	com_jbmplayer
 * @copyright	Copyright (C) 2012 Jan B Mwesigwa, Inc. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

// no direct access
defined('_JEXEC') or die;
$track = $this->albumtrack;
?>

<div class="jbmplayer-track track" data="<?php echo htmlentities(json_encode($track->toArray())); ?>">
    <span class="playbutton"></span>
    <a href="#" class="track-link">
        <span class="name"></span>
    </a>
    <span class="moreinfo"></span>
    <span class="length"></span>
    <div class="separator"></div>
</div>
