<?php
/**
 * @package		Joomla.Site
 * @subpackage	mod_jbmplayer
 * @copyright	Copyright (C) 2013 Jan B Mwesigwa, Inc. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

// no direct access
defined('_JEXEC') or die;
?>

<div id="jbmplayer-remote-<?php echo $module->id; ?>" class="jbmplayer-remote <?php echo $moduleclass_sfx ?>" style="display:none;" >
    <div class="buttons">
        <div class="jbmplayer-prev">prev</div>
        <div class="jbmplayer-play">play</div>
        <div class="jbmplayer-stop">stop</div>
        <div class="jbmplayer-next">next</div>
    </div>
    <div class="volume">
        <div class="volume-handle-container">
            <div class="volume-handle"></div>
        </div>
    </div>
</div>
