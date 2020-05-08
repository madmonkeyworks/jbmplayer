<?php
/**
 * @package		Joomla.Site
 * @subpackage	com_jbmplayer
 * @copyright	Copyright (C) 2005 - 2012 Open Source Matters, Inc. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

// no direct access
defined('_JEXEC') or die;
require_once (COM_JBMPLAYER_PLUGINS.DS.'plugin.php');

class jbmplayerPluginSoundcloud extends JbmplayerPlugin
{
    public function __construct()
    {
        $this->name = 'soundcloud';
        $this->addScript('http://connect.soundcloud.com/sdk.js');
        $this->addScript('soundcloud.js');
    }
}
