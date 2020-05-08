<?php
/**
 * @package		Joomla.Site
 * @subpackage	com_jbmgallery
 * @copyright	Copyright (C) 2012 Jan B Mwesigwa, Inc. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

// no direct access
defined('_JEXEC') or die;
?>

<div class="jbmplayer-container <?php echo $this->params->get('pageclass_sfx'); ?>">
    <?php if ($this->params->get('show_page_heading', 1)) : ?>
        <h1>
            <?php if ($this->escape($this->params->get('page_heading'))) :?>
                <?php echo $this->escape($this->params->get('page_heading')); ?>
            <?php else : ?>
                <?php echo $this->escape($this->params->get('page_title')); ?>
            <?php endif; ?>
        </h1>
    <?php endif; ?>

    <div class="jbmplayer-player" style="display:none;">
        <div class="head"></div>
        <div class="body">
            <div class="position-container">
                <div class="position-bar"></div>
                <div class="position-handle-container">
                    <div class="position-handle"></div>
                </div>
                <span class="position">0:00</span>
                <span class="remaining">0:00</span>
            </div>
            <div class="buttons">
                <div class="jbmplayer-prev"></div>
                <div class="jbmplayer-play"></div>
                <div class="jbmplayer-stop"></div>
                <div class="jbmplayer-next"></div>
            </div>
            <div class="clear"></div>
            <div class="volume">
                <div class="volume-handle-container">
                    <div class="volume-handle"></div>
                </div>
            </div>
        </div>
    </div>    

    <div class="jbmplayer-content">
        <?php   ob_start();
                    foreach ($this->content as $item) {
                        if (isset($item['type']) && $item['type']!='') {
                            $this->item = new JRegistry();
                            $this->item->loadArray(is_array($item) ? $item : array());
                            echo $this->loadTemplate($item['type']);
                        }
                    }
                    $output = ob_get_contents();
                ob_end_clean();
                echo JHTML::_('content.prepare', $output);
        ?>
    </div>
    <div class="clear"></div>
    <?php if ($this->actions->get('core.admin')) : ?>
        <div class="tools">
            <div class="buttons"></div>
            <div class="settings"></div>
            <div class="tracklist loading"></div>
        </div>
        <div class="clear"></div>
    <?php endif; ?>
    <?php if ($this->actions->get('core.admin')) :
        $this->item = new JRegistry();
        $this->item->set('tracks',array(0));
        $this->item->set('data.description', JText::_('COM_JBMPLAYER_NEW_ALBUM_DESC'));
        $this->item->set('data.name', JText::_('COM_JBMPLAYER_NEW_ALBUM_NAME'));
        $this->albumtrack = new JRegistry(); ?>
        <div class="jbmplayer-templates" style="display:none;">
            <?php echo $this->loadTemplate('album'); ?>
            <?php $this->item = new JRegistry(); ?>
            <?php echo $this->loadTemplate('track'); ?>
        </div>
    <?php endif; ?>
    <input type="hidden" id="Itemid" value="<?php echo $this->Itemid; ?>" />
    <input type="hidden" id="id" value="<?php echo $this->id; ?>" />
</div>