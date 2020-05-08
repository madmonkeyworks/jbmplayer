<?php
/**
 * @subpackage	com_jbmplayer
 * @copyright	Copyright (C) 2005 - 2012 Jan B Mwesigwa
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

// No direct access
defined('_JEXEC') or die;

jimport('joomla.application.component.controller');
jimport('joomla.application.component.helper');

/**
 * Content Component Controller
 *
 * @subpackage	com_jbmplayer
 * @since		1.5
 */
class JbmplayerController extends JController
{	
    /**
	 * Method to display a view.
	 *
	 * @param	boolean			If true, the view output will be cached
	 * @param	array			An array of safe url parameters and their variable types, for valid values see {@link JFilterInput::clean()}.
	 *
	 * @return	JController		This object to support chaining.
	 * @since	1.5
	 */
	public function display($cachable = false, $urlparams = false)
	{
		$cachable = true;

		// Set the default view name and format from the Request.
		$vName		= JRequest::getCmd('view', 'player');
		JRequest::setVar('view', $vName);

		return parent::display($cachable, array('Itemid'=>'INT'));
	}

    
    /*
    * Get helper
    */
    private function getHelper() 
    {
        $p = COM_JBMPLAYER_ADMIN.DS.'helpers'.DS.'jbmplayer.php';

        if (is_file($p)) require($p); 
            else return false;
        
        $helper = new JbmplayerHelper();
        
        return $helper;
    }
    
    /*
    * returns data for all installed and published plugins
    * returns JSON result:{ plugin: data }
    */
    public function getPluginData() 
    {
        require_once(COM_JBMPLAYER_PLUGINS.DS.'plugin.php');
        $helper = $this->getHelper();
        
        $result = JbmplayerPlugin::getPluginData();
        
        $helper->setResult($result);
        die($helper->getResult());
    }
    
    public function savePluginSettings()
    {
        $helper = $this->getHelper();
        $args = JRequest::getVar('args',array());
        
        if (!$helper->getActions()->get('core.admin')) {
            $helper->setResultError('No access');
            die($helper->getResult());
        }
        $params = JComponentHelper::getParams('com_jbmplayer');
        
        foreach ($args as $name => $uri) {
            $u = & JURI::getInstance( '?'.$uri );
            $new = $u->getQuery(true);
            $params->set('plugins.'.$name.'.params', $new['params']);
        }
        
        $component = JComponentHelper::getComponent('com_jbmplayer');
        $table = JTable::getInstance('extension');
        $table->load( $component->id ); 

        $table->bind( array('params'=>$params->toString()) );
        // pre-save checks
        if (!$table->check()) {
           JError::raiseWarning( 500, $table->getError() );
           return false;
        }

        // save the changes
        if (!$table->store()) {
           JError::raiseWarning( 500, $table->getError() );
           return false;
        }
        $result = $params->toArray();
        
        $helper->setResult($result['plugins']);
        die($helper->getResult());
    }
    
    /**
    * Method to delete a file
    * @args = array of absolute file paths to delete
    * return JSON
    */
    public function deleteFiles() 
    {
        jimport('joomla.filesystem.file');
        $args = JRequest::getVar('args');
        $helper = $this->getHelper();
        
        if (!$helper->getActions()->get('core.admin')) {
            $helper->setResultError('No access');
            die($helper->getResult());
        }
        
        // now loop through files and delete them
        $result = array();
        $error = array();
        if(is_array($args)) {
            foreach ($args as $key=>$path) {
                if (JFile::delete($path)) { 
                    $result['files'][$key]['path'] = $path;
                } else {
                    $error['files'][$key]['path'] = $path;
                }
            }
        } else { 
            $helper->setResultError('No files to delete');
            die(json_encode($helper->getResult()));
        }
        
        if (count($error)) $helper->setResultError('Failed to delete some files', $error);
        $helper->setResult($result);
        die($helper->getResult());
    }    

    
    /**
    * Method to save content
    * returns jsonrpc
    */
    public function save()
    {   
        $args = JRequest::getVar('args');
        $helper = $this->getHelper();        
        $row = $helper->getTable();
        
        // check values before saving into db
        if (!isset($args['Itemid']) || !$args['Itemid'] || $args['Itemid'] == '') {
            $helper->setResultError('Failed to save: incorrect Itemid supplied');
            die($helper->getResult());
        }
        
        $content = new JRegistry();
        if (!$content->loadArray(isset($args['content']) ? $args['content'] : array())) {
            $helper->setResultError('Failed to save: invalid content supplied');
            die($helper->getResult());
        }
        $args['content'] = $content->toString();
        $args['id'] = isset($args['id']) ? $args['id'] : 0;
        
        if (!$row->bind( $args )) { 
            $helper->setResultError('Failed to bind data: '.$row->getError());
            die($helper->getResult());
        }
        
        if (!$row->store()) {
            $helper->setResultError('Failed to store data: '.$row->getError());
            die($helper->getResult());
        } else {
            $helper->setResult(array('saved' => true));
            die($helper->getResult());
        }
    }
    
    /*
    * Method to check if file exists
    * returns json true or false
    */
    public function fileExists()
    {
        $args = JRequest::getVar('args',array());
        $path = JPATH_SITE.DS.array_shift($args);
        if (is_file($path)) { 
            die('{"jsonrpc" : "2.0", "result" : {"path" : "'.$path.'"} }'); 
        } else {
            die('{"jsonrpc" : "2.0", "error" : {"code": 0, "message": "File does not exist: '.$path.'"}}');
        }
    }
    
    /*
    * upload files
    */
    public function upload()
    {        
      //JRequest::checkToken() or die( json_encode('Invalid Token') );
        $files = array();
        $result = array();
        $helper = $this->getHelper();
        
        $helper->upload();
    }
 }
