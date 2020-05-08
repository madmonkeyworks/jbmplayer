<?php
/**
 * @package		Joomla.Site
 * @subpackage	com_jbmplayer
 * @copyright	Copyright (C) 2012 Jan B Mwesigwa, Inc. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

// no direct access
defined('_JEXEC') or die;
?>

<div id="jbmplayer-artworks">
    <?php  foreach($this->artworks as $artwork) : ; ?>
        <div class="artwork-wrapper">
            <img class="browser-artwork" src="<?php echo $artwork->get('url'); ?>" alt="<?php echo $artwork->get('name',''); ?>" path="<?php echo $artwork->get('path',''); ?>"/>
        </div>
    <?php endforeach; ?>
</div>