/*
*   SoundCloud Player jQuery API plugin
*/

            
        // Soundcloud API
        var soundcloud = {
            track : false,
            init : function(player) {
                soundcloud.player = player;
                SC.initialize({
                    client_id: 'YOUR_CLIENT_ID'
                });
            },
            _getTrack : function(player, data, callback) {
                if(!data.id) {
                        player.log.error('Track not found on soundcloud. May be an invalid id was supplied?');
                        return;
                    }
                    SC.stream(
                            "/tracks/"+data.id, 
                            {
                                onfinish: function(){ player._loop(); },
                                onplay: function(){ this.setVolume(player._getVolume()) },
                                whileplaying: function() { player._setPosition(this.position, this.duration); }
                            },
                            function(track){ if (callback) callback(track) }
                        );
            },
            getAvailableTracks : function(data, optionalParams, callback) {
                var player = this, params;

                // make params optional
                if (!callback || typeof params === 'function') { var callback = params }
                
                params = optionalParams ? player.$.extend({}, optionalParams, {format: 'json', filter:'public'}) : {format: 'json', filter:'public'};
                
                if (!data.user) return null;
                var options = {url:'http://soundcloud.com/' + data.user, client_id:'YOUR_CLIENT_ID' };
                
                SC.get('/resolve', options, function(data, error){
                    if (error) {                         
                        if (callback) callback(null); 
                        return;
                    } 
                    SC.get(
                        "/users/"+data.id+"/tracks", 
                        params,
                        function(tracks, error) { 
                            if (error) { 
                                player.log.error('Error getting tracks from soundcloud: ' + error.message ); 
                                if (callback) callback(false); 
                                return;
                            } 
                            if (callback) callback(tracks);
                        }
                    ); 
                });
            },
            load : function(data) {
                var player = this;
                soundcloud._getTrack(player, data, function(track) {
                    soundcloud.track = track.load();
                    track.setVolume(player._getVolume());
                    player._setPosition(0, data.duration);
                });
            },
            play : function(data, next) {
                var player = this;
                if (!soundcloud.track || next) {
                    SC.streamStopAll();
                    soundcloud._getTrack(player, data, function(track) { soundcloud.track = track.play(); });
                } else {
                    soundcloud.track.play();
                }
            },
            pause : function() {
                var player = this;
                if (soundcloud.track) {
                    soundcloud.track.pause();
                } 
            },
            stopAll : function() {
                SC.streamStopAll();
            },
            stop : function(){
                var player = this;
                SC.streamStopAll();
            },
            getTrackData : function(data) {
                var player = this, 
                    update = {};

                update.duration = data.duration;
                update.name = data.title;
                update.artwork = data.artwork_url;
                update.info = '<a href="'+data.permalink_url+'" target="_blank" title="listen on soundcloud"><img width="25px" src="'+player.get('pluginUrl')+'/plugins/soundcloud/images/logo_soundcloud.png" alt="listen on soundcloud" /></a>';
                
                return update;
            },
            setVolume : function(value){
                var player = this;
                if (soundcloud.track && value >= 0) {
                    soundcloud.track.setVolume(value);
                }
            },
            setPosition : function(value) {
                var player = this;
                if (soundcloud.track && value > 0) {
                    soundcloud.track.setPosition(value * soundcloud.track.duration);
                }
                return {position: soundcloud.track.position, duration: soundcloud.track.duration }
            }
        } // end of var soundcloud
        var JbmplayerPlugin = {};
        JbmplayerPlugin.soundcloud = soundcloud;
