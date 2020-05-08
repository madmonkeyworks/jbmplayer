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
class JbmplayerViewPlayer extends JView
{
    protected $pagination;
    
	public function display($tpl = null)
	{
		$app		= JFactory::getApplication();
		$menus      = $app->getMenu();
		$menu       = $menus->getActive();
        $model      = $this->getModel('player');
        $document   = & JFactory::getDocument();
        $actions    = JbmplayerHelper::getActions();
        $helper     = new JbmplayerHelper();
        $params = $app->getParams();
        
        // prepare player options
        $menu->params->set('baseUrl', JURI::base());
        $menu->params->set('pluginUrl', COM_JBMPLAYER_URL);
        $playerOptions = json_encode($menu->params->toArray());
        
        // check alias menu item
        if ((int) $menu->params->get('use_alias')) {
            JRequest::setVar('Itemid', (int) $menu->params->get('alias_id'));
        }

        // load css
        $document->addStylesheet(COM_JBMPLAYER_URL.DS.'css'.DS.'jbmplayer.css');
        
        // load js
        $document->addScript(COM_JBMPLAYER_URL.DS.'js'.DS.'player.js');
        
        $document->addScriptDeclaration('
            (function ($, window, document) {
                $(function () {
                    $(window).ready(function() {
                        $(".jbmplayer-container").jbmplayer('.$playerOptions.');
                    });
                });
            } (this.jQuery.noConflict(), this, this.document));        
        ');
        // load manager js
        if ($actions->get('core.admin')) {
            $document->addScript(COM_JBMPLAYER_URL.DS.'js'.DS.'plupload'.DS.'js'.DS.'plupload.full.js');
            $document->addScript(COM_JBMPLAYER_URL.DS.'js'.DS.'plupload'.DS.'js'.DS.'plupload.browserplus.js');
            $document->addScript(COM_JBMPLAYER_URL.DS.'js'.DS.'plupload'.DS.'js'.DS.'jquery.ui.plupload'.DS.'jquery.ui.plupload.js');
            $document->addScript(COM_JBMPLAYER_URL.DS.'js'.DS.'manager.js');
            $document->addScriptDeclaration('
                (function ($, window, document) {
                    $(function () {
                        $(window).ready(function() {
                            $(".jbmplayer-container").bind("jbmplayer.onReady", function() { $(this).jbmplayerManager() });
                        });
                    });
                } (this.jQuery.noConflict(), this, this.document));        
            ');
        }

        $data = $model->getData();
        $Itemid = isset($data->Itemid) ? $data->Itemid : JRequest::getVar('Itemid');
        $id = isset($data->id) ? $data->id : 0;
        
        // check if we have anything to show
        $content = json_decode(isset($data->content) ? $data->content : '') ? json_decode($data->content, true) : array();
        $content = $this->addDescriptionArticles($content);
          
        $this->assignRef('plugins', $plugins);
		$this->assignRef('params', $params);
		$this->assignRef('content', $content);
        $this->assignRef('actions', $actions);
        $this->assignRef('pluginParams', $pluginParams);
        $this->assignRef('Itemid', $Itemid);
        $this->assignRef('id', $id);
        
		parent::display($tpl);
	}
    
    private function addDescriptionArticles($content = array()) 
    {
        require_once (JPATH_SITE.DS.'components'.DS.'com_content'.DS.'helpers'.DS.'route.php');
        
        $currentLang = &JFactory::getLanguage()->getTag();

        foreach ($content as $key=>$item) {
            if (isset($item['type']) && $item['type']=='album' && isset($item['data']) && is_array($item['data'])) 
            {
                $data = new JRegistry();
                $data->loadArray($item['data']);
                
                $out = array();
                $articles = (Array) $data->get('description_articles', array());
                
                foreach ($articles as $k => $id) 
                {
                    $id = (int) $id;
                    $article = & JTable::getInstance('content');
                    
                    if (!$article->load($id)) continue;
                    
                    if ($currentLang === $article->get('language')) {
                        $data->set('description_article_introtext', $article->get('introtext'));
                        $data->set('description_article_link', ContentHelperRoute::getArticleRoute($id, $article->get('catid')));
                    } 
                    $out[$k]['id'] = $article->get('id');
                    $out[$k]['language'] = $article->get('language');
                    $out[$k]['title'] = $article->get('title');
                }
                
                // if no language match load the first article
                if (!$data->get('description_article_introtext',false) && $id = array_shift($articles))
                {
                    $id = (int) $id;
                    $article = & JTable::getInstance('content');
                    if ($article->load($id)) {
                        $data->set('description_article_introtext', $article->get('introtext'));
                        $data->set('description_article_link', ContentHelperRoute::getArticleRoute($id, $article->get('catid')));
                    } else {
                        $data->set('show_description_article', 0);
                    }
                }
                $data->set('description_articles', $out);
                $content[$key]['data'] = $data->toArray();
 
            }
        }
        return $content;
    }
}
