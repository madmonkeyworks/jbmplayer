(function ($, window, document) {
	$(function () {
        
        var log = {
            debug : true,
            error : function(message) {
                var m = 'Jbmplayer error';
                try {
                  if (this.debug && window.console && window.console.error){
                    window.console.error([m, message].join(': '));
                  }
                } catch (e) {
                  // no console available
                }
            },
            info : function(message) {
                var m = 'Jbmplayer notice';
                try {    
                    if (window.console && window.console.info){
                        window.console.info([m, message].join(': '));
                    }
                } catch (e) {
                  // no console available
                }
            }
        }
        
        var methods = {
            plugins : {},
            started : false,
            xhrPool : [],
            _request : function(task, args, handle) {
                $.ajax({
                    url: 'index.php?option=com_jbmplayer&view=player',
                    type: 'post',
                    dataType: 'json',
                    data: { task: task, args: args },
                    success: function(data) { handle(data); },
                    error: function(result) { log.error(result.responseText);  },
                    beforeSend: function(jqXHR) { methods.xhrPool.push(jqXHR) }
                });
            },
            init : function( options ) { 
                return this.each(function() {
                    var $this = $(this),
                        settings = {
                            plugins : {},
                            playerShowControls : true,
                            playerSelector : '.jbmplayer-player',
                            autoplay : false,
                            loop : false,
                            initialVolume : 60,
                            remoteControl : true,
                            remoteAutoHide : true,
                            remoteControlSelector : '.jbmplayer-remote',
                            remoteAlwaysVisible : true,
                            contentSelector : '.jbmplayer-content',
                            playButton : '.jbmplayer-play',
                            stopButton : '.jbmplayer-stop',
                            prevButton : '.jbmplayer-prev',
                            nextButton : '.jbmplayer-next',
                            positionHandle : '.position-handle',
                            positionHandleContainer : '.position-handle-container',
                            positionSelector : '.position',
                            remainingSelector : '.remaining',
                            volumeHandle : '.volume-handle',
                            volumeHandleContainer : '.volume-handle-container',
                            trackSelector : '.track',
                            albumSelector : '.album',
                            albumDescriptionSelector : '.albumdescription',
                            albumArtworkSelector : '.albumartwork',
                            albumNameSelector : '.albumname',
                            albumPriceSelector : '.albumprice',
                            trackNameSelector : '.name',
                            trackLengthSelector : '.length',
                            trackArtworkSelector : 'img.artwork',
                            trackLinkSelector : '.track-link',
                            trackInfoSelector : '.moreinfo',
                            totalDurationSelector : '.totalduration',
                            totalDurationContainerSelector : '.total-duration-container',
                            templatesSelector : '.jbmplayer-templates',
                            ajaxLinks : true,
                            ajaxComponentContainerSelector : '#content-container',
                            ajaxLinksSelector : '#menu a, #content a, .mod-languages a'
                        },
                        o = $this.data('jbmplayer');
                    
                    // plugin not yet initialized?
                    if (!o) {   
                        $this.data('jbmplayer', $.extend(settings, options));
                        o = $this.data('jbmplayer');
                        methods.$this = $this;
                        o.player = methods;
                        o.player.$ = $;
                    }
                    
                    // TODO check compatibility
                    // check JSON.stringify()
                    // check parseJSON
                    
                    // disable user interaction if waiting for AJAX requests
                    $('body')
                        .append($('<div id="jbmplayer-overlay" />').hide()
                            .append($('<div id="jbmplayer-overlay-background" />'))
                            .append($('<div id="jbmplayer-overlay-message"/>')
                                    .append($('<img src="' + o.pluginUrl + '/images/icon-loader-32.gif" />'))
                                    .append($('<a class="cancel-all-button" href="#">cancel</a>')
                                                .click(function(e){ 
                                                    e.preventDefault();
                                                    methods.xhrPool.abortAll();
                                                    location.href = location.href;
                                                    $('#jbmplayer-overlay').fadeOut();
                                                })
                                            )
                            )
                        );
                    var ajaxTimer;
                    $('#jbmplayer-overlay')
                        .ajaxStop(function(){ $(this).fadeOut(); window.clearTimeout(ajaxTimer); })
                        .ajaxStart(function(){ var $t = $(this); ajaxTimer = setTimeout(function() { $t.fadeIn() }, 1000); });
                    // support for canceling all ajax requests
                    methods.xhrPool = [];
                    methods.xhrPool.abortAll = function() {
                        $(this).each(function(idx, jqXHR) {
                            jqXHR.abort();
                        });
                        methods.xhrPool.length = 0
                        $('#overlay').fadeOut();
                    };
                    
                    // transfer data attribute into elements data
                    $('[data]', $this.find(o.contentSelector)).each(function(){
                        $(this).data('jbmplayer', $.parseJSON($(this).attr('data')));
                        $(this).attr('data','');
                    });
                    
                    // get remote
                    $remote = $('#jbmplayer-remote-' + o.remoteId);
                    
                    // bind player console events 
                    $(o.playButton, $this).add(o.playButton, $remote).click( function(e) {
                        e.preventDefault();
                        methods._play();
                    });
                    
                    $(o.stopButton, $this).add(o.stopButton, $remote).click( function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        methods._stop();
                    });
                    
                    $(o.nextButton, $this).add(o.nextButton, $remote).click( function(e) {
                        e.preventDefault();
                        // get next track
                        methods._playNext(methods._getNextTrack());
                    });
                    
                    $(o.prevButton, $this).add(o.prevButton, $remote).click( function(e) {
                        e.preventDefault();
                        methods._playNext(methods._getPrevTrack());
                    });
                    
                    // install plugins
                    methods._request('getPluginData', [], function(r){
                        if (r.error) {
                            log.error('No plugins found. Cannot start.');
                            return;
                        }
                        if (r.result) {
                            var stylesheets=[],
                                deferred = $.Deferred();
                                promise = deferred.promise();
                            $.each(r.result, function(plugin, data) {
                                // collect scripts from every plugin
                                $.each(data.scripts, function(i,url) {
                                    promise = promise.pipe(function () { 
                                                return $.getScript(url)
                                                        .done(function(){
                                                            if(typeof JbmplayerPlugin != 'undefined' && JbmplayerPlugin[plugin]) { 
                                                                $.extend(JbmplayerPlugin[plugin], data);
                                                                methods._registerPlugin(plugin, JbmplayerPlugin[plugin]);
                                                            }
                                                        });
                                                });
                                });
                                // collect stylesheets from every plugin
                                $.each(data.stylesheets, function(i,href) {
                                    promise = promise.pipe( function() {
                                        var link = $('<link />');
                                        $('head').append(link); //IE hack: append before setting href
                                        link.attr({
                                            rel:  "stylesheet",
                                            type: "text/css",
                                            href: href
                                        });
                                    });
                                });
                            });
                            
                            // load scripts one by one and only then move on to ready.
                            promise = promise.pipe(function(){ methods._ready() });
                            deferred.resolve();
                        }
                    });
                });
            },
            /*  The ready function gets executed on every 
            *   instance of the player after all plugins are registered. 
            */
            _ready : function() {
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),
                    $tracks = $(o.trackSelector, $this.find(o.contentSelector)),
                    $remote = $('#jbmplayer-remote-' + o.remoteId);
                
                $this.trigger('jbmplayer.onReady');
                
                // show or hide remote control
                if (methods.get('remoteAutoHide', true, 'boolean')) $remote.hide(); else $remote.show('fast');
                
                // set remote always visible
                if ($remote.length) {
                    var pos = $remote.css('top') == '0px' ? 'top' : 'bottom',
                        offset = $remote.offset().top - 50,
                        direction = pos == 'top' ? 1 : -1,
                        initial = {
                            marginTop : $remote.css('marginTop'),
                            marginBottom : $remote.css('marginBottom'),
                            top : $remote.css('top'),
                            bottom : $remote.css('bottom')
                        };

                    $(window).scroll(function(){
                        var params = {};
                        if (methods.get('remoteAlwaysVisible', false, 'boolean')) {
                            switch ($remote.css('position')) {
                                case 'absolute' : 
                                case 'relative' :
                                case 'fixed' :
                                    params[pos] = $(window).scrollTop() * direction;
                                    break;
                                default :
                                    params = {'marginTop': ($(window).scrollTop() )}
                            }
                            if ($(window).scrollTop() > offset) { 
                                    $remote.addClass('floating');
                                } else {
                                    $remote.removeClass('floating');
                                }
                            $remote
                                .stop()
                                .animate(params, 'slow' );    
                        } else {
                            switch ($remote.css('position')) {
                                case 'absolute' : 
                                case 'relative' :
                                    params[pos] = 0;
                                    break;
                                default :
                                    params = {'marginTop': 0}
                            }
                            $remote
                                .removeClass('floating')
                                .stop()
                                .animate(initial, 'fast' )
                        }
                    });
                }
                
                // load links over ajax 
                if (methods.get('ajaxLinks',true,'boolean')) {
                    var $playerLink = $('li.current.active a'),
                        $ajaxContainer = $('<div id="ajax-container" />').prependTo(o.ajaxComponentContainerSelector).hide(),
                        pageClass = $('body').attr('class'),
                        local = new RegExp('^'+location.protocol+'//'+location.host, 'i'),
                        remoteAlwaysVisibleInitial = methods.get('remoteAlwaysVisible', true, 'boolean'),
                        navigation = {
                            path : [[$playerLink.attr('href'), document.title]],
                            add : function(href, title) {
                                if (navigation.path[navigation.path.length -1][0] != href) {
                                    navigation.path.push([href,title]);
                                }
                                return navigation;
                            },
                            reset : function() { 
                                document.title = navigation.path[0][1];
                                navigation.path = []; navigation.path.push([$playerLink.attr('href'), document.title]); 
                            },
                            backLable : '<< back',
                            display : function() {
                                if (navigation.path.length > 1) {
                                    document.title = navigation.path[navigation.path.length - 1][1];
                                    var href = navigation.path[navigation.path.length - 2][0],
                                        title = navigation.path[navigation.path.length - 2][1],
                                        $link = $('<a />')
                                            .text(navigation.backLable)
                                            .attr('href', href)
                                            .hide()
                                            .click(function(e) {
                                                e.preventDefault();
                                                navigation.path.pop();
                                            });
                                    $ajaxContainer.prepend(
                                        $link.show('fast')
                                    );
                                } 
                            }
                        };
                    $(o.ajaxLinksSelector).live('click', function(e){
                        if (!local.test(this.href) || $('a'+o.trackLinkSelector).is(this) )     
                            { return; }
                        e.preventDefault();
                        var href = $(this).attr('href'),
                            title = $.trim($(this).text());
                        if (href != $playerLink.attr('href')) {
                            $this.hide('fast');
                            $('<div/>').load($(this).attr('href') + ' ' + o.ajaxComponentContainerSelector, function(data) {
                                $ajaxContainer
                                    .hide()
                                    .html($(this).children().html())
                                    .show('slow');
                                
                                // get class of retrieved body element
                                var r = new RegExp('\<body.*(?=class)class="(.*)"','i'),
                                    c = data.match(r);
                                if (c && c.length == 2) { 
                                    $('body').attr('class', c[1]);
                                }
                                
                                // trigger onAjaxContentLoaded and pass the data as $ object
                                var body = data.split(/(<body[^>]*>|<\/body>)/ig);
                                body = (body && body.length > 2) ? body[2] : '';
                                $(document).trigger('jbmplayer.onAjaxContentLoaded', [body, href]);
                                
                                if (remoteAlwaysVisibleInitial) methods.set('remoteAlwaysVisible', false);
                                
                                /* did we open another jbmplayer with tracks?
                                * stop music and
                                * shift global $this scope to new container and restart */
                                if ($(o.trackSelector, $ajaxContainer).length > 0) {
                                    methods.$this = $('.jbmplayer-container', $ajaxContainer).data('jbmplayer', o);
                                    methods._start();
                                    if (remoteAlwaysVisibleInitial) methods.set('remoteAlwaysVisible', true);
                                }
                                if (methods.get('remoteAutoHide')) $remote.hide('slow'); else $remote.show();
                                navigation.add(href, title).display();
                            });
                        } else {
                            $('body').attr('class',pageClass);
                            $ajaxContainer.hide();
                            /* stop music and
                            * shift global scope of $this back */
                            methods.$this = $this; 
                            $this.show('fast');
                            if (methods.get('remoteAutoHide', true, 'boolean')) $remote.hide(); else $remote.show('fast');
                            $(document).trigger('jbmplayer.onAjaxHome');
                            if (remoteAlwaysVisibleInitial) methods.set('remoteAlwaysVisible', true);
                            navigation.reset();
                        }
                    });
                }

                // show or hide the main player controls?
                if (methods.get('playerShowControls', true, 'boolean')) {
                    $(o.playerSelector, $this).show();
                } else $(o.playerSelector, $this).hide();

                // prepare volume bar
                var $volumeHandleContainer = $(o.volumeHandleContainer, $this).add(o.volumeHandleContainer, $remote),
                    $volumeHandle = $(o.volumeHandle, $this).add(o.volumeHandle, $remote);
                
                $volumeHandle.draggable({
                    axis: 'x',
                    containment: 'parent',
                    create : function(event, ui) {
                        var iniVolume = methods.get('initialVolume',80,'int');
                        $(this).css({ left : $(this).parent().width() * iniVolume / 100 }) 
                    },
                    drag: function(event, ui) {
                        var value = Math.floor((100 / (ui.helper.parent().width() - ui.helper.width())) * ui.position.left),
                            $current = $(o.trackSelector+'.current',$this);
                        if ($current.length) {
                            methods._triggerPlugin($current.data('jbmplayer').plugin, 'setVolume', [value]);
                        }
                    }
                });
                $volumeHandleContainer.click(function(e) {
                    var $handle = $(o.volumeHandle, this),
                        $handleContainer = $(this),
                        value = e.pageX - $(this).offset().left - ($handle.width()/2);
                    $handle.animate({left: value}, { 
                        step: function(now, fx){
                            var volume = Math.floor(100 / ($handleContainer.width() - $handle.width()) * now),
                                $current = $(o.trackSelector+'.current',$this);
                            volume = volume > 100 ? 100 : volume;
                            if($current.length) {
                                methods._triggerPlugin($current.data('jbmplayer').plugin, 'setVolume', [volume]);
                            }
                        }
                    });
                });
                
                // set position event
                var $positionHandleContainer = $(o.positionHandleContainer, $this).add(o.positionHandleContainer, $remote),
                    $positionHandle = $(o.positionHandle, $this).add(o.positionHandle, $remote);
                $positionHandleContainer.click(function(e) {
                    var $handle = $(o.positionHandle, this),
                        $handleContainer = $(this),
                        left = Math.floor((e.pageX - $(this).offset().left - ($handle.width()/2))), 
                        value = (left > $handleContainer.width() ? $handleContainer.width() : left) / $handleContainer.width(),
                        $current = $(o.trackSelector+'.current',$this);
                    $handle.css({left: left});
                    if ($current.length) {
                        methods._triggerPlugin($current.data('jbmplayer').plugin, 'setPosition', [value], function(v) { methods._setPosition(v.position, v.duration); });
                    }
                });
                $positionHandle.draggable({
                    axis: 'x',
                    containment: 'parent',
                    drag: function(event,ui) {
                        var $current = $(o.trackSelector+'.current', $this);
                        $(ui.helper).addClass('dragging');
                        if ($current.data('jbmplayer').duration) {
                            var value = $current.data('jbmplayer').duration * (ui.position.left / $(this).parent().width());
                            value = Math.round(value);
                            $(o.positionSelector, $this).add(o.positionSelector, $remote).text(methods._getHMS(value));
                        }
                    },
                    stop: function(event, ui) {
                        var value = ui.position.left > 0 ? (ui.position.left / ui.helper.parent().width()) : 0,
                            $current = $(o.trackSelector+'.current',$this);
                        if ($current.length) {
                            methods._triggerPlugin($current.data('jbmplayer').plugin, 'setPosition', [value]);
                        }
                        $(ui.helper).removeClass('dragging');
                    } 
                });
                
                methods._start();
            },
            _start : function() {
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),
                    $tracks = $(o.trackSelector, $this.find(o.contentSelector));

                // check if data attribute is transferred into elements data
                $('[data]', $this.find(o.contentSelector)).each(function(){
                    if (!$(this).data('jbmplayer')) {
                        $(this).data('jbmplayer', $.parseJSON($(this).attr('data')));
                        $(this).attr('data','');
                    }
                });
                
                // do we have anything to play?
                if ($tracks.length < 1) { 
                    log.info('There are no tracks to play');
                    return;
                } 
                
                // bind click event to tracks
                $(o.trackLinkSelector, $this).click(function(e) {
                    e.preventDefault();
                    methods._playNext($(this).parent(o.trackSelector));
                });
                    
                // update track info from plugins
                $tracks.each(function(){
                    var plugin = $(this).data('jbmplayer').plugin,
                        $track = $(this);
                    methods._triggerPlugin(plugin, 'getTrackData', [$track.data('jbmplayer').data], function(update) {
                        methods._updateTrackData($track, update);
                    });  
                });

                // prepare first track
                var $first = $tracks.eq(0).addClass('current');
                if ($first.length) {
                    methods._triggerPlugin($first.data('jbmplayer').plugin, 'load', [$first.data('jbmplayer').data]);
                }

                // update total length for albums
                $(o.albumSelector, $(o.contentSelector,$this)).each(function() {
                    var duration = 0,
                        $tracks = $(o.trackSelector, this);
                    if ($tracks.length < 1) {
                        $(o.totalDurationContainerSelector, this).hide();
                        return;
                    }
                    $tracks.each(function() {
                        duration += parseInt($(this).data('jbmplayer').duration);
                    });
                    $(o.totalDurationSelector,this).html(methods._getHMS(duration)).show();
                });
                
                // autoplay first track in playlist
                if (methods.get('autoplay', false, 'boolean')) { methods._play(); }

                // execute all onStarted methods
                methods.started = true;
                $this.trigger('jbmplayer.onStarted');
            },
            log : {
                error : function(message) { log.error(message) },
                info : function(message) { log.info(message) }
            },
            set : function(param, value) {
                var $this = methods.$this,
                    o = $this.data('jbmplayer');

                if (!o) return false;
                if (o[param] === undefined) {
                    return false;
                } else {
                    o[param] = value;
                    return true;
                }
            },
            get : function(param, def, type) {
                var $this = methods.$this,
                    o = $this.data('jbmplayer');
                
                if (!o) return false;
                type = type ? type : '';
                switch (type) {
                    case 'int' : 
                        return o[param] ? parseInt(o[param]) : (def ? def : false);
                        break;
                    case 'float' : 
                        return o[param] ? parseFloat(o[param]) : (def ? def : false);
                        break;
                    case 'boolean' :
                        if (typeof o[param] === 'boolean') {
                            return o[param];
                        } else if (typeof o[param] === 'string') {
                            p = o[param].toLowerCase(); 
                            return (p == 'true' || p == '1') ? true : false;
                        } else if (typeof o[param] === 'number') {
                            return o[param] == 0 ? false : true;
                        } else {
                            return false;
                        }
                        break;
                    default : 
                        var p, r = new RegExp('^(true|false|0|1)$', 'i');
                        if (typeof o[param] === 'string' && r.test(o[param])) {
                            p = o[param].toLowerCase(); 
                            return p == 'true' || p == '1' ? true : false;
                        } else {
                            return o[param] ? o[param] : (def ? def : '');
                        }
                }
            },
            _loop : function() {
                var $this = methods.$this,
                    o = $this.data('jbmplayer');
                if (methods.get('loop', false, 'boolean')) {
                    methods._playNext(methods._getNextTrack());
                } else {
                    methods._stop();
                }
            },
            _play : function() {
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),
                    $current = $(o.trackSelector+'.current',$this),
                    $remote = $('#jbmplayer-remote-' + o.remoteId);
                if ($current.length) {
                    var plugin = $current.data('jbmplayer').plugin,
                        $play = $(o.playButton,$this).add(o.playButton,$remote);
                    if ($play.hasClass('playing')) {
                        methods._triggerPlugin(plugin, 'pause', [$(o.trackSelector+'.current',$this).data('jbmplayer').data]);
                        $play.removeClass('playing').text('play');
                    } else {
                        //methods._triggerPlugin(plugin, 'stopAll');
                        methods._triggerPlugin(plugin, 'play', [$(o.trackSelector+'.current',$this).data('jbmplayer').data, false]);
                        $play.addClass('playing').text('pause'); 
                    }
                } else log.info('No track to play');
            },
            _playNext : function($track) {
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),
                    $current = $(o.trackSelector+'.current',$this);
                if ($current.length) {
                    var plugin = $track.data('jbmplayer').plugin,
                    $play = $(o.playButton, $this).add(o.playButton, $remote);
                    methods._stop();
                    $play.addClass('playing').text('pause');
                    $(o.trackSelector+'.current', $this).toggleClass('current');
                    $track.toggleClass('current');
                    methods._triggerPlugin(plugin, 'stopAll');
                    methods._triggerPlugin(plugin, 'play', [$(o.trackSelector+'.current',$this).data('jbmplayer').data, true]);
                } else log.info('No track to play');
            },
            _stop: function() {
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),
                    $remote = $('#jbmplayer-remote-' + o.remoteId),
                    $play = $(o.playButton, $this).add(o.playButton, $remote),
                    $current = $(o.trackSelector+'.current', $this);
                
                if ($current.length) {
                    var plugin = $(o.trackSelector+'.current', $this).data('jbmplayer').plugin;
                    $play.removeClass('playing').text('play');
                    methods._triggerPlugin(plugin, 'stopAll');
                    methods._triggerPlugin(plugin, 'setPosition', [0], function(v) { methods._setPosition(0, v.duration); });
                } else log.info('No track to stop');
            },
            _getNextTrack : function() {
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),
                    playlist = $(o.trackSelector, $this.find(o.contentSelector)),
                    $current = $(o.trackSelector+'.current', $(o.contentSelector, $this)),
                    i = playlist.index($current) + 1;
                return playlist.eq(i >= playlist.length ? 0 : i );
            },
            _getPrevTrack : function() {
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),
                    playlist = $(o.trackSelector, $this.find(o.contentSelector)),
                    $current = $(o.trackSelector+'.current', $this.find(o.contentSelector)),
                    i = playlist.index($current) - 1;
                return playlist.eq(i < 0 ? (playlist.length - 1) : i );
            },
            /* sets players position */
            _setPosition : function(position, duration) {
                var $this = methods.$this,
                    o = $this.data('jbmplayer');
                position = parseInt(position);
                duration = parseInt(duration);
                if (!$(o.positionHandle,$this).hasClass('dragging')) {
                    percentage = (position == 0 || duration == 0) ? 0 : position/duration;
                    var left = Math.floor(($(o.positionHandleContainer, $this).width()-$(o.positionHandle, $this).width()) * percentage);
                    left = left == 0 ? '0px' : left;
                    $(o.positionHandle, $this).css({left : left});
                    $(o.positionSelector, $this).html(methods._getHMS(position));
                    $(o.remainingSelector, $this).html('-' + methods._getHMS(duration - position));
                }
                return;
            },
            _getVolume : function() {
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),
                    $remote = $remote = $('#jbmplayer-remote-' + o.remoteId),
                    $handle = $(o.volumeHandle, $this).not(':hidden').add(o.volumeHandle, $remote).not(':hidden');
                if ($handle.length) {
                    return Math.round($handle.position().left / ($handle.parent().width()-$handle.width()) * 100);
                } else return methods.get('initialVolume', 80, 'int');
            },
            _setVolume : function(volume) {
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),
                    $remote = $('#jbmplayer-remote-' + o.remoteId),
                    $handle = $(o.volumeHandle, $this).add(o.volumeHandle, $remote);
                $handle.animate({left: ($handle.parent().width()-$handle.width()) * volume / 100 }, 'fast');
            },
            /* Convert milliseconds into Hours (h), Minutes (m), and Seconds (s) */
            _getHMS : function(ms) {
                var hms = function(ms) {
                        return {
                        h: Math.floor(ms/(60*60*1000)),
                        m: Math.floor((ms/60000) % 60),
                        s: Math.floor((ms/1000) % 60)
                        };
                    }(ms),
                    tc = []; // Timecode array to be joined with '.'
                if (hms.h > 0) {
                    tc.push(hms.h);
                }

                tc.push((hms.m < 10 && hms.h > 0 ? "0" + hms.m : hms.m));
                tc.push((hms.s < 10  ? "0" + hms.s : hms.s));

                return tc.join(':');
            },
            _isPlugin : function(name) {
                var plugins = methods.$this.data('jbmplayer').plugins;
                return plugins[name] ? true : false;
            },
            _triggerPlugin : function(pluginName, method, args, callback) {
                var plugins = methods.$this.data('jbmplayer').plugins;
                if (!$.isArray(args)) args = [args];
                if (methods._isPlugin(pluginName)) {
                    if( plugins[pluginName][method] ) {
                        c = plugins[pluginName][method].apply(this, args);
                        if (callback && c) callback(c);
                    }
                } else log.error('Plugin "' + pluginName + '" does not exist or it has no "'+ method +'" method.');
            },
            _updateTrackData : function($track, update) {
                var $this = methods.$this,
                    o = $this.data('jbmplayer');

                // insert duration into tracks data 
                $track.data('jbmplayer').duration = update.duration ? update.duration : 0;
                
                $(o.trackNameSelector, $track).text(update.name ? update.name : '');
                $(o.trackInfoSelector, $track).html(update.info ? update.info : '');
                $(o.trackLengthSelector, $track).text(update.duration ? methods._getHMS(update.duration) : methods._getHMS(0));
                $(o.trackArtworkSelector, $track)
                    .clone()
                    .attr('src', update.artwork ? update.artwork : '')
                    .load(function() {
                        $(this).show();
                        $(o.trackArtworkSelector, $track).replaceWith($(this));
                    })
                    .error(function() { $(this).hide() });
            },
            _registerPlugin : function(name, plugin) {
                var $this = methods.$this,
                    o = $this.data('jbmplayer');
                    plugins = o.plugins;
                    
                if (!methods._isPlugin(name)) {
                    // register plugin
                    plugins[name] = plugin;
                    $this.data('jbmplayer').plugins[name] = plugin;
                    // run plugins init method
                    if (plugin.init) plugin.init(methods);
                    log.info('plugin "' + name + '" successfully registered');
                } else {
                    log.info('plugin "' + name + '" is already registered');
                }
            }
        }
        
        $.fn.jbmplayer = function( method ) {
            var public = 'ready, registerPlugin',
                isPublic = false;
            
            if (typeof method === 'string') {
                var r = new RegExp(method, 'i');
                isPublic = r.test(public);
            }
            
            // Method calling logic
            if (typeof method ==='string' && !isPublic) {
                log.error( method + ' is a protected method on jQuery.Jbmplayer' );
            } else if ( methods[method] ) {
                return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
            } else if ( typeof method === 'object' || ! method ) {
                return methods.init.apply( this, arguments );
            } else {
                log.error( 'Method ' +  method + ' does not exist on jQuery.Jbmplayer' );
            } 
        };
    });
} (this.jQuery.noConflict(), this, this.document));        