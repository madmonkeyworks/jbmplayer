/* Jbmplayer manager functions */
(function ($, window, document) { 
    $(function() {
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
                    console.log(e);
                  // no console available
                }
            }
        }
        var uploader = new plupload.Uploader({
                // General settings
                runtimes : 'html5,gears,silverlight,flash',
                browse_button: 'jbmplayer-upload-button',
                container : 'jbmplayer-uploader',
                url : 'index.php?option=com_jbmplayer&view=player&task=upload',
                max_file_size : '2048kb',
                chunk_size : '1mb',
                unique_names : false,
                upload_dir : 'artworks',
                
                // Specify what files to browse for
                filters : [
                    {title : "Image files", extensions : 'jpg,jpeg,gif,png'},
                    {title : "Music files", extensions : 'mp3,ogg,wav,wma'},
                ],

                // Flash settings
                flash_swf_url : 'components/com_jbmplayer/js/plupload/js/plupload.flash.swf',

                // Silverlight settings
                silverlight_xap_url : 'components/com_jbmplayer/js/plupload/js/plupload.silverlight.xap'
            });

        var methods = {
            availableTracks : {},
            gc : {
                collection : $(),
                add : function(el) { methods.gc.collection = methods.gc.collection.add(el)}
            },
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
                            autosave : false,
                            availableTracksLimit : 15,
                            autosave_interval : 3 // in minutes, minimum is 1 min 
                        },
                        o = $this.data('jbmplayer');
                        om = $this.data('jbmplayerManager');
                    
                    // plugin not yet initialized?
                    if (!om) {   
                        $this.data('jbmplayerManager', $.extend(settings, options));
                        o = $this.data('jbmplayer');
                        om = $this.data('jbmplayerManager');
                        methods.$this = $this;
                    }
                    
                    // disable ajax linking
                    o.ajaxLinks = false;
                    
                    // TODO check compatibility
                    // check JSON.stringify()
                    // check parseJSON
                    
                    /* hide total duration */
                    $(o.totalDurationSelector, $(o.contentSelector,$this)).remove();
                    
                    /* init system dialog */
                    methods.dialog.init();
                    
                    /* make items sortable */
                    $(o.contentSelector, $this).sortable({axis : 'y'});
                    $([o.contentSelector,o.albumSelector,'.tracks'].join(' '), $this).sortable({axis : 'y'});
                    
                    /* add track add-button in album */
                    methods._addControls($([o.albumSelector,o.trackSelector].join(','), $this.find(o.contentSelector)));  
                    
                    /* prepare settings and tracklist */
                    var $tools = $('.tools', $this),
                        $settings = $('.settings', $this).hide();
                          
                    $('.buttons', $tools)
                        .append(function() {
                                var b = $('<a href="#" class="add-album-button button">add album</a>')
                                        .click(function(e){
                                            e.preventDefault();
                                            methods._addAlbum();
                                    });
                                methods.gc.add(b);
                                return b;
                            }
                        )
                        .append(function() {
                                var b =$('<a href="#" class="add-track-button button">add track</a>')
                                    .click(function(e){
                                        e.preventDefault();
                                        methods._addTrack();
                                    });
                                methods.gc.add(b);
                                return b;
                            }
                        )
                        .append($('<a href="#" class="toggle-button button">preview</a>')
                                    .click(function(e){
                                        e.preventDefault();
                                        if ($(this).hasClass('closed')) {
                                            methods._open();
                                            $(this).removeClass('closed').text('preview');
                                        } else {
                                            methods._close();
                                            $(this).addClass('closed').text('show tools');
                                        }
                                        methods._reset();
                                    })
                        )
                        .append(function() {
                                var b =$('<a href="#" class="save-button button">save</a>')
                                    .click(function(e){
                                        e.preventDefault();
                                        methods._save();
                                    });
                                methods.gc.add(b);
                                return b;
                            }
                        )
                        .append(function() {
                                var b =$('<a href="#" class="refresh-button button">refresh</a>')
                                    .click(function(e){
                                        e.preventDefault();
                                        location.reload();
                                    });
                                methods.gc.add(b);
                                return b;
                            }
                        )
                        .append(function() {
                                var b = $('<a href="#" class="settings-button button">settings</a>')
                                    .click(function(e){
                                        e.preventDefault();
                                        $(this).parent().parent().find('.settings').toggle('fast');
                                    });
                                methods.gc.add(b);
                                return b;
                            }
                        );

                    /* form settings for each plugin */
                    $.each(o.plugins, function(name, plugin) {
                        $settings.append(
                            $('<div class="plugin" />')
                                .append($('<a href="#"/>').text(name))
                                .append($('<form class="form" />').attr('plugin',name).html(plugin.paramsform).hide()
                                    .append($('<a href="#" class="save-settings-button button" />').text('save settings')
                                                .click(function(e) {
                                                    e.preventDefault();
                                                    methods._savePluginSettings();
                                                })
                                    )
                                    .append($('<a href="#" class="close-button button" />').text('close')
                                                .click(function(e) {
                                                    e.preventDefault();
                                                    $(this).parent().parent().parent().hide('slow');
                                                })
                                    ) 
                                )
                            );
                    });
                    $('.plugin a', $settings).click(function(e) { e.preventDefault(); $(this).parent().find('.form').toggle('fast') });
                });
            },
            get : function(param, def, type) {
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),
                    om = $this.data('jbmplayerManager');
                s = $.extend({}, o, om);
                type = type ? type : '';
                switch (type) {
                    case 'int' : 
                        return s[param] ? parseInt(s[param]) : (def ? def : false);
                        break;
                    case 'float' : 
                        return s[param] ? parseFloat(s[param]) : (def ? def : false);
                        break;
                    case 'boolean' :
                        if (typeof s[param] === 'boolean') {
                            return s[param];
                        } else if (typeof s[param] === 'string') {
                            p = s[param].toLowerCase(); 
                            return (p == 'true' || p == '1') ? true : false;
                        } else if (typeof s[param] === 'number') {
                            return s[param] == 0 ? false : true;
                        } else {
                            return (def ? def : false);
                        }
                        break;
                    default : return s[param] ? s[param] : (def ? def : '');
                }
            },
            _update : function() {
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),
                    $content = $(o.contentSelector, $this),
                    list = {};
                $content.children().each(function(i, child) {
                    $child = $(child);
                    if ($child.hasClass(o.albumSelector.replace(/(\.|\#)/,''))) {
                        var data = {
                                name : $child.find(o.albumNameSelector).text(),
                                artwork : $child.find(o.albumArtworkSelector).attr('src'),
                                artwork_path : $child.find(o.albumArtworkSelector).attr('path'),
                                description : $child.find(o.albumDescriptionSelector).hasClass('empty') ? '' : $child.find(o.albumDescriptionSelector).html(),
                                price : $child.find(o.albumPriceSelector).hasClass('empty') ? '' : $child.find(o.albumPriceSelector).text(),
                                show_description_article : $child.find('input.show_description_article').is(':checked') ? '1' : '0'
                            };
                        // collect description articles
                        var articles = [];
                        $child.find('ul.description-articles li').each(function() {
                            articles.push($(this).find('input.description_article_id').val());
                        });
                        data.description_articles = articles;
                        
                        list[i] = { type: "album", data: data, tracks: {} };
                        
                        $child.find('.tracks '+o.trackSelector).each(function(ii, track) {
                            list[i].tracks[ii] = $(track).data('jbmplayer');
                        });
                    } else {
                        list[i] = $child.data('jbmplayer');
                    }
                });
                o.list = list;
            },
            _save : function() {
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),
                    Itemid = $('input#Itemid').val(),
                    id = $('input#id').val();
                methods._update();
                methods._request('save', { content: o.list, id: id, Itemid: Itemid }, function(r) {
                    if (r.result && r.result.saved) {
                        methods._popup('Everything saved');
                    } else {
                        var errmsg = '';
                        if (r.error) { var errmsg = r.error.message; }
                        log.error('Failed to save: ' + errmsg);
                        methods._popup('Saving failed, please try it again.', 'error');
                        return;
                    } 
                });
            },
            _savePluginSettings : function() {
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),
                    $settings = $('.settings', $this),
                    args = {};
                
                $('.form', $settings).each(function(){
                    args[$(this).attr('plugin')] = $(this).serialize();
                });
                methods._request('savePluginSettings', args, function(r) {
                    if (r.error) {
                        log.error('Saving plugin settings failed');
                        return;
                    }
                    if (r.result) {
                        $.each(o.plugins, function(name, plugin) {
                            plugin.params = r.result[name].params;
                        });
                        methods._popup('Settings saved');
                    }
                });
            },
            /* 
            * function to show popup message
            * @text ... text to show in popup
            * @type ... class name, can be success or error
            */
            _popup : function(text, type) {
                if (!type) type = 'success';
                $('<div id="popup" class="popup-message ui-corner-all '+ type +'" />')
                    .html(text)
                    .hide()
                    .prependTo($('body'))
                    .fadeIn('slow', function(){ $(this).delay(3000).fadeOut('slow', function() { $(this).remove() }) });
            },
            _delete : function($item) {
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),
                    player = o.player,
                    r = false;
                r = confirm('Are you sure you want to delete the item?');
                if (r) {
                    var isCurrent = $item.hasClass('current');
                    $item.remove();
                    // have we deleted current or last track?
                    if (isCurrent) {
                        $(o.trackSelector, $(o.contentSelector, $this)).eq(0).addClass('current');
                    }
                }
            },
            _reset : function() {
                var $this = methods.$this,
                    o = $this.data('jbmplayer');
                
                // remove temporary tracks
                $('.newtrack', $this).remove();
                
                // remove temporary artwork class
                $('.albumartwork.change').removeClass('change');
            },
            _addControls : function($els) {
                var $this = methods.$this,
                    o = $this.data('jbmplayer');
                $els.each(function() {
                    var $el = $(this);
                    // add delete button
                    $el.append(function() {
                            var x = $('<a href="#" class="delete-button">X</a>')
                                        .click(function(e) { 
                                            e.preventDefault(); 
                                            methods._delete($(this).parent()); 
                                        }
                                    );
                            methods.gc.add(x);
                            return x;
                    });                    
                    // add upload artwork buttons
                    $el.find(o.albumArtworkSelector).after(function() {
                            var $img = $(this),
                                b = $('<a href="#" class="change-artwork-button button" />').text('change artwork')
                                    .click(function(e) { 
                                        e.preventDefault();
                                        $img.addClass('change');
                                        methods._loadArtworks();
                                    })
                                    .after($('<a href="#" class="remove-artwork-button button" />').text('remove')
                                        .click(function(e) { 
                                            e.preventDefault();
                                            $img.attr('src', o.pluginUrl + '/images/blank.gif');
                                        })
                                    );
                            methods.gc.add(b);
                            return b;
                    });
                    // insert add track button for albums
                    $el.find('.tracks').after(function(){
                            var b =$('<a href="#" class="add-track-button button">add album track</a>')
                                .click(function(e){
                                    e.preventDefault();
                                    methods._addTrack($el);
                                });
                            methods.gc.add(b);
                            return b;
                    });
                    
                    /* add edit event for album description, name and price */
                    $el.find([o.albumDescriptionSelector, o.albumNameSelector, o.albumPriceSelector].join(','), $this).each(function() {
                        var $e = $(this);

                        if($e.text().trim() == '') $e.text('click to insert text').addClass('empty');
                        $e.click(function() {
                            var text = $.trim($e.html().replace(/<br\s?\/?>/g,"\n")),
                                height = [$e.width(), $e.height()*1.5],
                                $textarea = $('<textarea />')
                                    .val(text)
                                    .height($e.height()*1.5)
                                    .css('width','90%');
                            $e.after($textarea).hide();
                            $textarea.after(
                                $('<a href="#" class="close-edit-button button">save</a>').click(function(e) {
                                        e.preventDefault();
                                        $(this).remove();
                                        if ($textarea.val().trim() == '') $e.addClass('empty'); else $e.removeClass('empty');
                                        $e.html($textarea.val() != '' ? $textarea.val().replace(/\r\n|\r|\n/g,"<br />") : 'click to insert text').show();
                                        $textarea.remove();
                                    })
                            ).focus();
                        });
                    });
                    
                    /* add other album settings functionality */
                    if ($el.hasClass(o.albumSelector.replace(/(\.|\#)/,''))) {
                        var $sett = $el.find('.album-settings');
                        methods.gc.add($sett);
                        $sett
                            .wrapInner('<div class="inner" />')
                            .prepend($('<a href="#" class="album-settings-button button" />').text('More settings')
                                .click(function(e) {
                                        e.preventDefault();
                                        $(this).next().toggle('fast');
                                    }
                                )
                            )
                            .find('.inner').hide();
                        $sett.find('.description-articles li').each(function() {
                            $(this).append($('<a href="#">remove</a>').click(function(e) {e.preventDefault(); $(this).parent().remove() }))
                        });
                        $sett.find('.select-description-article-button').click(function(e) {
                            $('.description-articles', $this).removeClass('select');
                            $(this).parent().find('.description-articles').addClass('select');
                        });
                    }
                });
                // set action upon selecting description article
                window.jSelectArticle = function(id, title, access, cat, link, lang, n) {
                    $('.description-articles.select', $this)
                        .append($('<li />')
                            .append($('<span class="description_article_language_lable" />').text(' ['+lang+'] '))
                            .append($('<span class="description_article_title_lable" />').text(title + ' '))
                            .append($('<a href="#">remove</a>').click(function(e) {e.preventDefault(); $(this).parent().remove() }))
                            .append($('<input type="hidden" class="description_article_id" value="'+id+'">'))
                        )
                }
                return $els;
            },
            _addAlbum : function() {
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),            
                    $template = methods._getTemplate(o.albumSelector);
                    if ($template) {
                        $(o.contentSelector,$this).append(methods._addControls($template));
                        // remove the initial track from album template
                        $template.find(o.trackSelector).remove();
                    } else {
                        log.error('No "album" template found');
                    }
            },
            _addTrack : function($album) {
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),
                    $target = $album ? $album.find('.tracks') : $(o.contentSelector, $this),
                    $template = methods._getTemplate($album ? [o.albumSelector,o.trackSelector].join(' ') : '> ' + o.trackSelector);
                    
                    if ($template) {
                        $target.append($template.addClass('newtrack'));
                        methods._loadAvailableTracks();
                    } else {
                        log.error('No template found');
                    }            
            },
            _insertArtwork : function($img) {
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),
                    $browser = $('.jbmplayer-file-browser', $this),
                    $target = $('.albumartwork.change', $this);
                $target.attr({'src': $img.attr('src'), 'path' : $img.attr('path')}).removeClass('change').show();
                $browser.hide('slow');
            },
            _loadArtworks : function() {
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),
                    $browser = $('<div class="jbmplayer-file-browser" />').append($('<div class="filelist" />')),
                    $list = $('.filelist', $browser),
                    settings = $.extend({}, {
                            plugin : '',
                            label : 'Select artwork',
                            clickfn : function() { log.info('No clickfn assigned') },
                            mapfn : function(item) { return $('<img />').attr('src', item.url) },
                            folder : 'artworks',
                            controls : true,
                            filter : '.jpg|.jpeg|.png|.gif|.JPG|.JPEG|.PNG|.GIF',
                            offset: 0, 
                            limit: methods.get('availableTracksLimit') 
                        }, typeof options === 'object' ? options : (o.browser_settings ? o.browser_settings : {}));
                
                //save browser settings
                o.browser_settings = settings;
                
                $list.load('index.php?option=com_jbmplayer&view=artworks #jbmplayer-artworks', function(response) {
                    $list.find('img').each(function() {
                        var path = $(this).attr('path');
                        $(this).click(function() { methods._insertArtwork($(this)); methods.dialog.close(); });
                        $(this).parent()
                            .append(
                                $('<a href="#" class="artwork-delete-button delete-button">X</a>').click(function(e){ 
                                        e.preventDefault();
                                        var r = false, 
                                            $item = $(this).parent(),
                                            path = $item.find('img').attr('path');
                                            
                                        r = confirm('Are you sure you want to delete the item?');
                                        if (r) {
                                            methods._request('deleteFiles', [path], function(r) {
                                                if (r.error) { 
                                                    log.error(['Failed to delete file', path]);
                                                } else {
                                                    $item.hide('slow', function() {$(this).remove()});
                                                    $(o.contentSelector, $this).find('img[path="'+path+'"]').hide('fast').attr({src:'', path: ''});
                                                }
                                            });
                                        }
                                    })
                            );
                    });
                    methods.dialog.open({
                        label : settings.label,
                        uploadButton : true,
                        uploadDir : settings.folder,
                        content : $browser
                    });
                });
            },
            _insertTracks : function($tracks) { 
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),
                    player = o.player;
                    $tracklist = $('.tracklist', $this);
                
                $tracks.each(function() {
                    var $track = $(this),
                        $new = $('.newtrack', $this)
                                    .clone()
                                    .removeClass('newtrack')
                                    .insertAfter($('.newtrack', $this))
                                    .data('jbmplayer', $track.data('jbmplayer'));
                    player._updateTrackData($new, $track.data('jbmplayer').update);
                    // add delete button
                    methods._addControls($new);
                });
                $tracklist.hide('fast');
                $('.newtrack', $this).remove();
                
                // if this is the first track ever, let's start the player
                // or if there is no current track, let's make it the first one.
                if (!player.started) { 
                    player._start();
                } else if (!$(o.trackSelector + '.current', $(o.contentSelector, $this)).length) {
                    $(o.trackSelector, $(o.contentSelector,$this)).eq(0).addClass('current');
                }
            },
            _loadAvailableTracks : function(params, callback) {
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),
                    player = o.player;
                    $tracklist = $('<div class="tracklist"><div class="tracklist-filter" /><div class="tracklist-content" /></div>'),
                    $tracklistContent = $('.tracklist-content', $tracklist),
                    params = (params && typeof params === 'object') ? $.extend({}, params, {limit: methods.get('availableTracksLimit',10,'int')}) : {limit: methods.get('availableTracksLimit',10,'int')},
                    settings = $.extend({}, {
                            plugin : '',
                            label : 'Select track(s)',
                            clickfn : function() { log.info('No clickfn assigned') },
                            mapfn : function(item) { return $('<img />').attr('src', item.url) },
                            folder : 'images',
                            controls : true,
                            filter : '.jpg|.jpeg|.png|.gif|.JPG|.JPEG|.PNG|.GIF',
                            offset: 0, 
                            limit: methods.get('availableTracksLimit') 
                        }, typeof options === 'object' ? options : (o.browser_settings ? o.browser_settings : {}));
                
                //save browser settings
                o.browser_settings = settings;
                                
                // get tracks from all plugins
                var pluginsCount = 0,
                    result = { 
                        add: function(tracks) { 
                            $.each(tracks, function(i,v) { result.tracks.push(v) } ) 
                            return result;
                        },
                        get : function(tracks) {
                            return result.tracks;
                        },
                        tracks : []
                    };
                $.each(o.plugins, function(pluginName, plugin) {
                    pluginsCount++;
                    player._triggerPlugin(pluginName, 'getAvailableTracks', [plugin.params, params, function(tracks) {
                        if (!tracks || tracks === null) { 
                            $tracklistContent.text('No tracks found...');
                            return;
                        }
                        
                        // add into result
                        result.add(tracks);
                        
                        // if last plugin is processed reveal tracklist and pass tracks
                        if (pluginsCount == Object.keys(o.plugins).length) {  
                            if (callback) callback(result.get());
                        }
                        
                        // update retrieved tracks and push one by one into tracklist
                        $.each(tracks, function(i, track) {
                            player._triggerPlugin(pluginName, 'getTrackData',[track], function(update) {
                                t = {type: "track", plugin: pluginName, update: update, data: track };
                                $tracklistContent.append(
                                    $('<div />').addClass(o.trackSelector.replace('.','')).data('jbmplayer', t)
                                        .append($('<input type="checkbox" />'))
                                        .append($('<span class="playbutton" />'))
                                        .append($('<span class="plugin" />').text(t.plugin))
                                        .append($('<a href="#" />')
                                                    .addClass(o.trackLinkSelector.replace('.',''))
                                                    .text(t.update.name)
                                                    .click(function(e) {
                                                        e.preventDefault();
                                                        methods._insertTracks($(this).parent());
                                                        methods.dialog.close();
                                                    })
                                        )
                                        .append($('<span class="length" />').text(player._getHMS(t.update.duration)))
                                );
                            });
                        });
                    }]); 
                });
                methods.dialog.open({
                        label : settings.label,
                        width : 600,
                        content : $tracklist,
                        buttons : { 
                                    insert : {
                                        label: 'insert all selected',
                                        fn: function(){
                                            methods._insertTracks($('input[type="checkbox"]:checked', $tracklistContent).parent());
                                            $('input[type="checkbox"]:checked', $tracklistContent).attr('checked',false);
                                            methods.dialog.close();
                                        }
                                    },
                                    unsellect : {
                                        label: 'unselect all',
                                        fn: function(){
                                                $('input[type="checkbox"]:checked', $tracklistContent).attr('checked', false);
                                            }
                                    },
                                    select : {
                                        label: 'select all',
                                        fn: function(){
                                            $('input[type="checkbox"]', $tracklistContent).not(':hidden').attr('checked',true);
                                        }
                                    },
                                    separator : {},
                                    next : {
                                        label: 'next page >>',
                                        attr: 'id="jbmplayer-dialog-pagination-next"',
                                        fn: function(){
                                            var $next = $(this),
                                                params = { 
                                                    offset: o.browser_settings.offset + o.browser_settings.limit, 
                                                    //q: $('input.tracklist-filter').val()
                                                };
                                            methods._loadAvailableTracks(params, function(tracks){
                                                if (o.browser_settings.offset >= o.browser_settings.limit) {
                                                    $('#jbmplayer-dialog-pagination-prev').show('fast');
                                                }
                                                if (tracks.length < o.browser_settings.limit) {
                                                    $next.hide('fast');
                                                }
                                            });
                                            o.browser_settings.offset = o.browser_settings.offset + o.browser_settings.limit;
                                        }
                                    },
                                    prev : {
                                        label: '<< prev page',
                                        attr: 'style="display:none" id="jbmplayer-dialog-pagination-prev"',
                                        fn: function(){
                                            var $prev = $(this),
                                                params = { 
                                                    offset: o.browser_settings.offset - o.browser_settings.limit, 
                                                    //q: $('input.tracklist-filter').val()
                                                };
                                            methods._loadAvailableTracks(params, function(tracks){
                                                if (o.browser_settings.offset < o.browser_settings.limit) {
                                                    $prev.hide('fast');
                                                }
                                                $('#jbmplayer-dialog-pagination-next').show('fast');
                                            });
                                            o.browser_settings.offset = o.browser_settings.offset - o.browser_settings.limit;
                                        }
                                    }
                        }
                });

            },
            dialog : {
                init : function() {
                    $('body')
                        .append($('<div id="jbmplayer-dialog" />').hide()
                            .append($('<div id="jbmplayer-dialog-background" />'))
                            .append($('<div id="jbmplayer-dialog-container"/>')
                                    .append($('<div id="jbmplayer-uploader"/>'))
                                    .append($('<div class="label" />'))
                                    .append($('<div class="message" />'))
                                    .append($('<div class="content"><div class="wrapper" /></div>'))
                                    .append($('<div class="buttons" />'))
                            )
                        );
                    this.$dialog = $('#jbmplayer-dialog');
                    this.$dialogContainer = $('#jbmplayer-dialog-container');
                    this.$dialogLabel = $('#jbmplayer-dialog .label');
                    this.$dialogMessage = $('#jbmplayer-dialog .message');
                    this.$dialogContent = $('#jbmplayer-dialog .content .wrapper');
                    this.$dialogButtons = $('#jbmplayer-dialog .buttons')
                                            .append($('<a href="#" id="jbmplayer-upload-button" />')
                                                    .addClass('button')
                                                    .text('upload')
                                            );
                    this.$uploader = $('#jbmplayer-uploader');
                    this.$uploadButton = $('#jbmplayer-upload-button');
                    
                    uploader.init();
                    // bind uploader events
                    uploader.bind('beforeUpload', function(up, file) {
                        up.settings.multipart_params = {'upload_dir' : up.settings.upload_dir }
                    });
                    uploader.bind('FilesAdded', function(up, files) {
                        up.start();
                        up.refresh(); // Reposition Flash/Silverlight
                    });
                    uploader.bind('UploadProgress', function(up, file) {
                        methods.dialog.message(file.percent + "%");
                        up.refresh(); // Reposition Flash/Silverlight
                    });
                    uploader.bind('Error', function(up, err) {
                        methods.dialog.message('File ' + err.file.name + ": " + err.message);
                        log.error(err.file.name + ": " + err.message);
                        up.refresh(); // Reposition Flash/Silverlight
                    });
                    uploader.bind('UploadComplete', function(up, files) {
                        methods.dialog.message('Upload complete');
                        methods._loadArtworks();
                        up.refresh(); // Reposition Flash/Silverlight
                    });
                    uploader.bind('FileUploaded', function(up, file, response) {
                        var response = jQuery.parseJSON(response.response);
                        if(response.error) {
                            methods.dialog.message('File "' + file.name + '" could not be uploaded. Try it again.');
                            log.error('Upload failed: ' + file.name + ':' + response.error.message);
                        } 
                    });
                },
                message : function (msg) {
                    if (typeof msg !== 'string') return;
                    this.$dialogMessage
                            .stop()
                            .empty()
                            .text(msg)
                            .show()
                            .delay(3000)
                            .hide('slow', function() {this.empty()});
                },
                open : function(options) { 
                    var _this = this, left, s = {},
                        defaults = {
                            width: 500,
                            height: 500,
                            label: '',
                            overflow: true,
                            buttons: { close : _this.close },
                            uploadButton: false,
                            uploadDir: 'artworks',
                            content: $('<div />')
                        };
                    s = $.extend(true, {}, defaults, options);
                    if (this.isOpen()) { this.$dialogContent.hide('fast').empty().append(s.content).show('fast'); return }
                    left = Math.floor((($('body').width() - s.width) / 2) / $('body').width() * 100);
                    if (s.uploadButton) {
                        this.$uploader.show();
                        this.$uploadButton.show();
                        if (typeof s.uploadDir === 'string') uploader.settings.upload_dir = s.uploadDir;
                    } else {
                        this.$uploader.hide();
                        this.$uploadButton.hide();
                    }
                    
                    this.$dialogContainer.css({width: s.width, left: left + '%', height: s.height});
                    this.$dialogContent.css({overflow: s.overflow ? 'auto' : 'hidden'});
                    this.$dialogLabel.empty().text(s.label);
                    this.$dialogMessage.empty().append(s.message);
                    this.$dialogContent.empty().append(s.content);
                    
                    $.each(s.buttons, function(label, settings) {
                        var fn = function(){}, attr = '';
                        if (typeof settings === 'function') fn = settings;
                        if (typeof settings === 'object') { 
                            fn = settings.fn ? settings.fn : fn;
                            label = settings.label ? settings.label : label;
                            attr = settings.attr ? settings.attr : attr;
                        }
                        if (label === 'separator') {
                            _this.$dialogButtons.prepend($('<div class="buttons-separator" />'))
                        } else {
                                _this.$dialogButtons.prepend(
                                    $('<a href="#" '+attr+' >')
                                        .addClass('button')
                                        .text(label)
                                        .click(function(e){ 
                                            e.preventDefault(); 
                                            fn.call(this, methods); 
                                            //methods._reset();
                                        })
                                    );
                        }
                    });
                    if (s.uploadButton) uploader.refresh(); 
                    this.$dialog.fadeIn();
                },
                close : function() {
                    methods.dialog.$dialog.fadeOut();
                    methods.dialog.$dialogLabel.empty();
                    methods.dialog.$dialogContent.empty();
                    methods.dialog.$dialogButtons.children().not($('#jbmplayer-upload-button')).remove();
                },
                isOpen : function() {
                    return methods.dialog.$dialog.is(':hidden') ? false : true;
                }
            },
            _close : function() {
                var $this = methods.$this,
                    o = $this.data('jbmplayer');
                methods.gc.collection.hide('slow');
                $('.settings, .tracklist', $this).hide('slow');
            },
            _open : function() {
                var $this = methods.$this,
                    o = $this.data('jbmplayer');
                methods.gc.collection.show('slow');
            },
            _parseNewTrackData : function(data) {
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),
                    $newtrack = $('.newtrack', $this);
            },
            _getTemplate : function(selector) {
                var $this = methods.$this,
                    o = $this.data('jbmplayer'),
                    $templates = $this.find(o.templatesSelector);

                return $(selector, $templates).length > 0 ? $(selector, $templates).first().clone() : false;
            }
        }

        $.fn.jbmplayerManager = function( method ) {
            var public = 'destroy',
                isPublic = false;
            
            if (typeof method === 'string') {
                var r = new RegExp(method, 'i');
                isPublic = r.test(public);
            }
            
            // Method calling logic
            if (typeof method ==='string' && !isPublic) {
                log.error( method + ' is a protected method on jQuery.JbmplayerManager' );
            } else if ( methods[method] ) {
                return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
            } else if ( typeof method === 'object' || ! method ) {
                return methods.init.apply( this, arguments );
            } else {
                log.error( 'Method ' +  method + ' does not exist on jQuery.JbmplayerManager' );
            } 
        };
        
	});
} (this.jQuery.noConflict(), this, this.document));