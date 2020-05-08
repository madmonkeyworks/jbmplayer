<?php
/**
 * @package		Joomla.Site
 * @subpackage	com_jbmgallery
 * @copyright	Copyright (C) 2012 Jan B Mwesigwa, Inc. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

// no direct access
defined('_JEXEC') or die;
$item = $this->item;
JHTML::_('behavior.modal');
?>

<div class="jbmplayer-album album" data="<?php echo htmlentities(json_encode($item->toArray())); ?>">
    <a id="<?php echo str_replace(' ', '_', strtolower(trim($item->get('data.name','albumanchor')))); ?>" ></a>
    <div class="col col1">
        <div class="inside">
            <h2 class="albumname">
                <?php echo $item->get('data.name',''); ?>
            </h2>
            <div class="albumdescription">
                <?php 
                    if ($item->get('data.show_description_article',false)) : ?>
                        <?php echo $item->get('data.description_article_introtext'); ?>
                    <?php else : ?>
                        <?php echo $item->get('data.description',''); ?>
                <?php endif; ?>
            </div>
            <?php if ($item->get('data.show_description_article',false)) : ?>
            <div class="albumreadmore">
                <a href="<?php echo $item->get('data.description_article_link','index.php'); ?>" title="CD <?php echo JText::_('READ_MORE'); ?>">
                    <?php echo JText::_('READ_MORE'); ?>
                </a>
            </div>
            <?php endif; ?>
            <div class="albummoreinfo">
                <span>
                    <a href="order" title="buy CD">
                        <img src="images/buy_button.gif" alt="buy CD" />
                    </a>
                </span>
                <span class="albumprice">
                    <?php echo $item->get('data.price','buy this album'); ?>
                </span>
            </div>
        </div>
    </div>
    <div class="col col2">
        <div class="inside">
            <div>
                <img class="albumartwork" src="<?php echo file_exists($item->get('data.artwork_path','')) ? $item->get('data.artwork') : COM_JBMPLAYER_URL.DS.'images'.DS.'blank.gif'; ?>" path="<? echo $this->actions->get('core.admin') ? $item->get('data.artwork_path') : ''; ?>"/>
            </div>
        </div>
    </div>
    <div class="col col3">
        <div class="inside">
            <div class="tracks">
                <?php   if ($item->get('tracks', false)) {
                            foreach($item->get('tracks') as $track) { 
                                $this->albumtrack = new JRegistry();
                                $this->albumtrack->loadArray($track);
                                echo $this->loadTemplate('albumtrack');
                            }
                        }
                ?>
            </div>
            <div class="total-duration-container">
                <span class="jbmplayer-album-totalduration-label">
                    <?php echo JText::_('COM_JBMPLAYER_TOTAL_DURATION_LABEL'); ?>
                </span>
                <span class="totalduration length"></span>
            </div>
        </div>
    </div>
    <div class="clear"></div>
    <?php if ($this->actions->get('core.admin')) : ?>
        <div class="album-settings">
            <span>Show description article?</span><input class="show_description_article" type="checkbox" <?php echo (int) $item->get('data.show_description_article', 0) ? 'checked' : ''?> />
            <ul class="description-articles" style="margin:0; ">
                <?php foreach ($item->get('data.description_articles', array()) as $article) : $article = (Array) $article; ?>
                    <li>
                        <span class="description_article_language_label">[<?php echo $article['language']; ?>]</span>
                        <span class="description_article_title_label"><?php echo $article['title']; ?></span>
                        <input type="hidden" class="description_article_id" value="<?php echo $article['id']; ?>"/>
                    </li>
                <?php endforeach; ?>
            </ul>
            <a class="modal-button modal select-description-article-button" title="Article" href="index.php?option=com_content&amp;view=articles&amp;layout=modal&amp;tmpl=component&amp;<?php echo JUtility::getToken(); ?>=1" rel="{handler: 'iframe', size: {x: 770, y: 400}}">
                Add description article
            </a>
        </div>
    <?php endif; ?>
    <div class="separator"></div>
</div>
