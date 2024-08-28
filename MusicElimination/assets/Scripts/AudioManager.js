cc.Class({
    extends: cc.Component,
    properties: {
        backGroupSound: {
            default: null,
            type: cc.AudioClip
        },

        loop: true,

        soundVolume: {
            default: 1,
            range: [0,1,0.01],
            notify: function() {
                this.setSoundVolume();
            }
        },

        audioClipPool: {
            default: [],
            type: cc.AudioClip
        },

        _isPlaying: false,
        _audioId: null,
        _effectId: null,
    },

    onLoad(){
        config.audioManager = this;
        cc.game.addPersistRootNode(this.node);
        let self = this;
        // let self = this;
        cc.game.on(cc.game.EVENT_HIDE, function () {
            if(config.channel == "vivo" && config.homeController && config.innerAudioContext){
                config.innerAudioContext.pause();
            }
        }.bind(this));
        // // 游戏进入前台时触发
        cc.game.on(cc.game.EVENT_SHOW, function () {
            // console.log("1111111111111111111111:"+config.isWatchingVideo);
            if(config.channel == "vivo" && config.homeController && config.innerAudioContext){
                config.innerAudioContext.play();
                if(config.isWatchingVideo){
                    // console.log("22222222222222222");
                    self.scheduleOnce(function(){
                        // console.log("33333333333333333");
                        config.innerAudioContext.pause();
                    },0.3);
                }
            }
        }.bind(this));
    },

    playBackGroupSound (loop) {
        if (this.backGroupSound && config.homeController) {
            this.stopAll();
            this._audioId = cc.audioEngine.play(this.backGroupSound, loop, 0.5);
        }
        // else {
        //     let that = this;
        //     cc.loader.load(config.url + "music/Unity.mp3", function (err, res) {
        //         if(err!=null) {
        //             console.log("mp3 load failed..." + err);
        //             return;
        //         }
        //         that.stopAll();
        //         that.backGroupSound = res;
        //         that._audioId = cc.audioEngine.play(that.backGroupSound, loop, 0.3);
        //     });
        // }
    },

    playEffectSound (command, loop, callback) {
        // cc.log(command);
        if (loop === null && loop === undefined) {
            var loop = this.loop;
        }
        if (command !== null && command !== undefined || this.audioClipPool.length > 0) {
            switch (command) {
                case "btn":
                    this._effectId = cc.audioEngine.playEffect(this.audioClipPool[0], loop);
                    break;
                case "star1":
                    this._effectId = cc.audioEngine.playEffect(this.audioClipPool[1], loop);
                    break;
                case "star2":
                    this._effectId = cc.audioEngine.playEffect(this.audioClipPool[2], loop);
                    break;
                case "star3":
                    this._effectId = cc.audioEngine.playEffect(this.audioClipPool[3], loop);
                    break;
                default:
                    console.error("无此音频");
            }
        }
        if (typeof callback === "function") {
            cc.audioEngine.setFinishCallback(this._effectId, callback);
        }
    },

    pauseMusic () {
        cc.audioEngine.pauseAll();
    },

    resumeMusic () {
        cc.audioEngine.resumeAll();
    },

    setSoundVolume() {
        if (this._audioId) {
            cc.audioEngine.setVolume(this.soundVolume);
        }
    },

    stopAll() {
        cc.audioEngine.stopAll();
        this._audioId = null;
        this._effectId = null;
    },
});
