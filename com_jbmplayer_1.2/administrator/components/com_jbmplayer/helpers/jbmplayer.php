<?php
/**
 * @copyright	Copyright (C) 2013 Jan B Mwesigwa. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

jimport('joomla.filesystem.file');
jimport('joomla.filesystem.folder');
jimport('joomla.filesystem.path');

/**
 * Jbmplayer component helper.
 *
 * @package		Joomla
 * @subpackage	com_jbmplayer
 * @since		1.6
 */
class JbmplayerHelper
{
    var $config;
    var $_errors = array();
    var $result;
    
	public function __construct($config = array())
	{
        $this->_errors = array();
        $this->result = array('jsonrpc' => '2.0');
	}
    
	/**
	 * Configure the Linkbar.
	 *
	 * @param	string	The name of the active view.
	 *
	 * @return	void
	 * @since	1.6
	 */
	public static function addSubmenu($vName)
	{
		JSubMenuHelper::addEntry(
			JText::_('COM_JBMPLAYER_SUBMENU_DASHBOARD'),
			'index.php?option=com_jbmplayer&view=dashboard',
			$vName == 'dashboard'
		);
	}

	/**
	 * Gets a list of the actions that can be performed.
	 *
	 *
	 * @return	JObject
	 * @since	1.6
	 */
	public static function getActions()
	{
		$user	= JFactory::getUser();
		$result	= new JObject;
	
        $assetName = 'com_jbmplayer';

		$actions = array(
			'core.admin', 'core.manage', 'core.upload', 'core.delete'
		);

		foreach ($actions as $action) {
			$result->set($action,	$user->authorise($action, $assetName));
		}

		return $result;
	}
    
    private function setError($message)
    {
        $this->_errors[] = $message;
    }

    public function getErrors()
    {
        return $this->_errors;
    }
    
    /**
     * Get value from configuration
    */
    public function getConfig($param, $def=false)
    {
        return isset($this->config[$param]) ? trim($this->config[$param]) : $def;
    }

	/**
	 * Get the list of files in a given folder
	 * @param string $relative The relative path of the folder
	 * @param string $filter A regex filter option
	 * @return File list array
	 */
	public function getFiles($relative, $filter = '.')
	{

		$list = JFolder::files($this->get('dir').DS.$relative, $filter);

		return $list;
	}
    
	/**
	 * Get the list of folders in a given folder
	 * @param string $relative The relative path of the folder
	 * @return Folder list array
	 */
	private function getFolders($relative)
	{
		$list = JFolder::folders($this->get('dir').DS.$relative);

		return $list;
	}
    
	/**
	 * Resize uploaded image
	 */
    private function resize($file)
    {
        jimport('joomla.filesystem.file');
        jimport('joomla.filesystem.folder');
        
        $result = array( 'jsonrpc' => '2.0', 'result'=>'');
        $path = dirname($file);
        $name = str_replace($path.DS, '', $file);
        $dest = $file;
    
        // resize the image
        if (intval($this->getConfig('resize', 1))) {
            $canvas = $this->imgResize($file, 400, 400);
            if ($canvas)
            {	
                if (file_exists($dest)) JFile::delete($dest);
                if(!@imagejpeg($canvas, $dest, 90)) {
                    $this->setResultError('Resizing image failed');
                }
                imagedestroy($canvas);
            }
        }
    }

	

    /*
     * Resize image
     * returns canvas of the resized image
    */
	function imgResize($src, $maxWidth, $maxHeight)
	{
		jimport('joomla.filesystem.file');

		$ext 	= strtolower(JFile::getExt($src));

		list($imgWidth,$imgHeight)=@getimagesize($src);

		if ($imgWidth < $maxWidth && $imgHeight < $maxHeight) {
			return false;
		}

		if ($imgWidth > $imgHeight) {
			$width = $maxWidth;
			$height = round(($maxWidth / $imgWidth) * $imgHeight);
		} else {
			$height = $maxHeight;
			$width = round(($maxHeight / $imgHeight) * $imgWidth);
		}

	// create image resource according to its extension
		switch ($ext) 
			{
				case 'jpg'	: $src = imagecreatefromjpeg($src);
				break;
					
				case 'jpeg'	: $src = imagecreatefromjpeg($src);
				break;
					
				case 'gif' 	: $src = imagecreatefromgif($src);
				break;
						
				case 'png'	: $src = imagecreatefrompng($src);
				break;
			}
		
		
		$canvas = imagecreatetruecolor($width,$height);

		imagecopyresampled($canvas, $src, 0,0,0,0, $width, $height, $imgWidth, $imgHeight);
		imagedestroy($src);

		return $canvas;
	}

	/**
	 * Return a list of allowed file extensions in selected format
	 *
	 * @access public
	 * @return extension list
	 */
	public function getFileTypes($format = 'map')
	{
		$list = $this->getConfig('filetypes','jpg,jpeg,gif,png,JPG,JPEG,GIF,PNG');

		// Remove excluded file types (those that have a - prefix character) from the list
		$data 	= array();
		
		foreach(explode(',', $list) as $group) {	
			if (substr(trim($group), 0, 1) === '-') {
				continue;
			}
			// remove excluded file types (those that have a - prefix character) from the list
			$data[] = preg_replace('#(,)?-([\w]+)#', '', $group);
		}
		
		$list = implode(',', $data);

		switch ($format) {
			case 'list':
				return $this->listFileTypes($list);
				break;
			case 'array':
				return explode(',', $this->listFileTypes($list));
				break;
			case 'reg':
				return str_replace(',', '|', $list);
				break;                
			default:
			case 'map':
				return $list;
				break;
		}
	}
    
    /*
    * private function to check valid filetype
    */
    private function checkFileType($ext)
    {
        $filetypes = $this->getFileTypes('array');
        return in_array($ext, $filetypes);
    }

	/**
	 * Converts the extensions map to a list
	 * @param string $map The extensions map eg: images=jpg,jpeg,gif,png
	 * @return string jpg,jpeg,gif,png
	 */
	private function listFileTypes($map)
	{
		return preg_replace(array('/([\w]+)=([\w]+)/', '/;/'), array('$2', ','), $map);
	}

    /*
    * get a table instance 
    */
    public function getTable($table='jbmplayer')
    {
        JTable::addIncludePath(COM_JBMPLAYER_PATH.DS.'tables');
        return $row = & JTable::getInstance($table, 'Table');
    }
    
    
    /**
    *
    * Copyright 2009, Moxiecode Systems AB
    * Released under GPL License.
    *
    * License: http://www.plupload.com/license
    * Contributing: http://www.plupload.com/contributing
    */
    public function upload()
    {
        jimport('joomla.filesystem.file');
        
        // HTTP headers for no cache etc
        header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
        header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
        header("Cache-Control: no-store, no-cache, must-revalidate");
        header("Cache-Control: post-check=0, pre-check=0", false);
        header("Pragma: no-cache");

        // Settings
        $targetDir = COM_JBMPLAYER_MEDIA.DS.strtolower(JRequest::getVar('upload_dir', 'artworks'));

        $cleanupTargetDir = true; // Remove old files
        $maxFileAge = 5 * 3600; // Temp file age in seconds

        // 5 minutes execution time
        @set_time_limit(5 * 60);

        // Uncomment this one to fake upload time
        // usleep(5000);

        // Get parameters
        $chunk = isset($_REQUEST["chunk"]) ? intval($_REQUEST["chunk"]) : 0;
        $chunks = isset($_REQUEST["chunks"]) ? intval($_REQUEST["chunks"]) : 0;
        $fileName = isset($_REQUEST["name"]) ? $_REQUEST["name"] : '';

        $ext = JFile::getExt($fileName);

		// strip extension
		$rawname = JFile::stripExt($fileName);

		// make file name 'web safe' and treat blank spaces
		$fileName = str_replace(' ', '_', JFile::makeSafe($fileName));
		
		// check for extension in file name or blank file name
		if (preg_match('#\.(php|php(3|4|5)|phtml|pl|py|jsp|asp|htm|shtml|sh|cgi)#i', $rawname)) {
            $this->setResultError('Invalid file type', array('file'=>$fileName));
			die($this->getResult());
		}

        // Make sure the fileName is unique but only if chunking is disabled
        if ($chunks < 2 && file_exists($targetDir . DS . $fileName)) {
            $ext = strrpos($fileName, '.');
            $fileName_a = substr($fileName, 0, $ext);
            $fileName_b = substr($fileName, $ext);

            $count = 1;
            while (file_exists($targetDir . DS . $fileName_a . '_' . $count . $fileName_b))
                $count++;

            $fileName = $fileName_a . '_' . $count . $fileName_b;
        }

        $filePath = $targetDir . DS . $fileName;

        // Create target dir
        if (!file_exists($targetDir)) {
            if (!JFolder::create($targetDir,0777)) {
                $this->setResultError('Failed to create target directory', array('dir'=>$targetDir));
                die($this->getResult());
            }
        }

        // Remove old temp files	
        if ($cleanupTargetDir && is_dir($targetDir) && ($dir = opendir($targetDir))) {
            while (($file = readdir($dir)) !== false) {
                $tmpfilePath = $targetDir . DS . $file;

                // Remove temp file if it is older than the max age and is not the current file
                if (preg_match('/\.part$/', $file) && (filemtime($tmpfilePath) < time() - $maxFileAge) && ($tmpfilePath != "{$filePath}.part")) {
                    @unlink($tmpfilePath);
                }
            }

            closedir($dir);
        } else {
            $this->setResultError('Failed to open the temp directory', array('dir'=>$targetDir));
            die($this->getResult());
        }


        // Look for the content type header
        if (isset($_SERVER["HTTP_CONTENT_TYPE"]))
            $contentType = $_SERVER["HTTP_CONTENT_TYPE"];

        if (isset($_SERVER["CONTENT_TYPE"]))
            $contentType = $_SERVER["CONTENT_TYPE"];

        // Handle non multipart uploads older WebKit versions didn't support multipart in HTML5
        if (strpos($contentType, "multipart") !== false) {
            if (isset($_FILES['file']['tmp_name']) && is_uploaded_file($_FILES['file']['tmp_name'])) {
                // Open temp file
                $out = fopen("{$filePath}.part", $chunk == 0 ? "wb" : "ab");
                if ($out) {
                    // Read binary input stream and append it to temp file
                    $in = fopen($_FILES['file']['tmp_name'], "rb");

                    if ($in) {
                        while ($buff = fread($in, 4096))
                            fwrite($out, $buff);
                    } else {
                        $this->setResultError('Failed to open input stream');
                        die($this->getResult());
                    }
                    fclose($in);
                    fclose($out);
                    @unlink($_FILES['file']['tmp_name']);
                } else {
                    $this->setResultError('Failed to open output stream');
                    die($this->getResult());
                }
            } else {
                $this->setResultError('Upload failed.');
                die($this->getResult());
            }
        } else {
            // Open temp file
            $out = fopen("{$filePath}.part", $chunk == 0 ? "wb" : "ab");
            if ($out) {
                // Read binary input stream and append it to temp file
                $in = fopen("php://input", "rb");

                if ($in) {
                    while ($buff = fread($in, 4096))
                        fwrite($out, $buff);
                } else {
                    $this->setResultError('Failed to open input stream');
                    die($this->getResult());
                }

                fclose($in);
                fclose($out);
            } else {
                $this->setResultError('Failed to open output stream');
                die($this->getResult());
            }
        }

        // Check if file has been uploaded
        if (!$chunks || $chunk == $chunks - 1) {
            // Strip the temp .part suffix off 
            rename("{$filePath}.part", $filePath);

            // if image, resize
            if (preg_match('#(jpg|jpeg|gif|png|JPG|JPEG|GIF|PNG)#i', $ext)) {
                $this->resize($filePath);
            }
            
            // add index.html in the directory
            $filePath = $targetDir.DS.'index.html';
            if (!is_file($filePath)) {
                $file = fopen($filePath, 'wb');
                fwrite($file, '<p>.</p>');
                fclose($file);
            }
        }
        
        // Return JSON-RPC response
        $this->setResult(true);
        die($this->getResult());
    } 
    
    /*
    * getter for JSON result
    *   
    */
    public function getResult()
    {
        return json_encode($this->result);
    }
    
    public function setResultError($message='', $error=array(), $code='0')
    {
        $this->result['error']['data'] = $error;
        $this->result['error']['code'] = $code;
        $this->result['error']['message'] = $message;        
    }
    
    public function setResult($result=array())
    {
        $this->result['result'] = is_array($result) ? $result : array($result) ;
    }
}
