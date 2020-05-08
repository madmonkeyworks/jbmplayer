DROP TABLE IF EXISTS `#__jbmplayer`;
CREATE TABLE IF NOT EXISTS `#__jbmplayer` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`Itemid` int(11) NOT NULL,
	`content` mediumtext,
	`published` tinyint(3) NOT NULL DEFAULT '1',
	`params` text NOT NULL,
	PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;