<?php
/**
 * @package		Joomla.Site
 * @subpackage	com_jbmplayer
 * @copyright	Copyright (C) 2005 - 2012 Open Source Matters, Inc. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

// No direct access
defined('_JEXEC') or die;
jimport('joomla.application.component.modelform');

/**
 * Jbmplayer Component player 
 *
 * @package		Joomla.Site
 * @subpackage	com_jbmplayer
 * @since 1.5
 */
class JbmplayerPlugin extends JObject
{
    protected static $plugins = array();
    protected $_scripts = array();
    protected $_stylesheets = array();
    protected $name = '';
        
    /**
	 * Returns a jbmplayer plugin object.
	 *
	 * @param   string   $plugin   The plugin to use.
	 *
	 * @return  JbmplayerPlugin  The Plugin object.
	 *
	 * @since   1.6
	 */
	public static function getInstance($plugin)
	{
		if (!isset(self::$plugins[$plugin]))
		{
			return self::_load($plugin);
		} 
        
        return self::$plugins[$plugin];
	}

    protected function _load($plugin = null)
    {
        if (!$plugin) return false;
        
        $file = COM_JBMPLAYER_PLUGINS.DS.$plugin.DS.$plugin.'.php';
        if (is_file($file)) { 
            require_once($file);
            $class = 'JbmplayerPlugin'.ucfirst(strtolower($plugin));
            if (class_exists($class)) {
                return self::$plugins[$plugin] = new $class($plugin);
            }
            else return false;
        }
        else return false;
    }
    
    public function addScript($path = '') 
    {
        if (preg_match('/^http:/i', $path)) {
            $this->_scripts[] = $path;
        } else {
            if (file_exists(COM_JBMPLAYER_PLUGINS.DS.$this->name.DS.'js'.DS.$path)) {
                $this->_scripts[] = COM_JBMPLAYER_PLUGINS_URL.DS.$this->name.DS.'js'.DS.$path;
            } else return false;
        }
        return true;
    }
    
    public function addStylesheet($path = '') 
    {
        if (preg_match('/^http:/i', $path)) {
            $this->_stylesheets[] = $path;
        } else {
            if (file_exists(COM_JBMPLAYER_PLUGINS.DS.$this->name.DS.'css'.DS.$path)) {
                $this->_stylesheets[] = COM_JBMPLAYER_PLUGINS_URL.DS.$this->name.DS.'css'.DS.$path;
            } else return false;
        }
        return true;
    }
    
    public function getScripts()
    {
        return $this->_scripts;
    }
    
    public function getStylesheets()
    {
        return $this->_stylesheets;
    }
    
    // TODO
    public function getInfo()
    {
        return array('author'=>'me', 'date'=>'now');
    }
    
    /**
	 * Method to get plugin params
     * returns object ... intended to be used as source for JForm data
	 * @since	2.5
	 */
	public function getParams()
	{
        $plugin = $this->name;
        $data = JComponentHelper::getParams('com_jbmplayer')->get('plugins.'.$plugin.'.params', false);
        return $data ? $data : false;
	}

    /**
	 * Method to get plugins params as html form
     * returns JForm html
	 * @since	2.5
	 */
	public function getParamsForm()
	{
        $plugin = $this->name;
        $xml = COM_JBMPLAYER_PLUGINS.DS.$plugin.DS.$plugin.'.xml';
        $data = JComponentHelper::getParams('com_jbmplayer')->get('plugins.'.$plugin, false);
        $form = '';
        $html = '';
        
        // Get the form.
		JForm::addFormPath( COM_JBMPLAYER_PLUGINS.DS.$plugin );
        try
		{
            $form = JForm::getInstance('com_jbmplayer.plugins', $xml, array(), false, 'config/fields');
			$form->bind($data);
		}
		catch (Exception $e)
		{
			$this->setError($e->getMessage());
			return false;
		}
        
        foreach ($form->getFieldsets('params') as $fieldsets => $fieldset) 
        {
            foreach($form->getFieldset($fieldset->name) as $field) 
            {
                $html .=    $field->hidden ? $field->input : '<span>'.$field->label.'</span>'.'<span>'.$field->input.'</span>'.'<br />';
            }
        }
        
        return $html;
	}
    /*
    * returns data for all installed and published plugins
    */
    public function getPluginData() 
    {
        $result = array();
        
        $plugins = JComponentHelper::getParams('com_jbmplayer')->get('plugins', array());
        foreach($plugins as $name=>$plugin) {
            if ((int)$plugin->published) {
                $plugin = JbmplayerPlugin::getInstance($name);
                $result[$name]['scripts'] = $plugin->getScripts();
                $result[$name]['stylesheets'] = $plugin->getStylesheets();
                $result[$name]['info'] = $plugin->getInfo();
                $result[$name]['paramsform'] = $plugin->getParamsForm();
                $result[$name]['params'] = $plugin->getParams();
            }
        }
        return $result;
    }

}
