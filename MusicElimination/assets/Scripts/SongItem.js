cc.Class({
    extends: cc.Component,

    properties: {
        outLight:cc.Node,
        album:cc.Node,
        albumSprite:cc.SpriteFrame,
        nameLabel:cc.Label,
        scoreLabel:cc.Label,
        typeLabel:cc.Label,

        newSprite:cc.Node,
        difficultSprite:cc.Sprite,
        bgSprite:cc.Sprite,
        btnNode:cc.Node,

        difficultSpriteFrames:[cc.SpriteFrame],
        bgSpriteFrames:[cc.SpriteFrame],
        playSpriteFrames:[cc.SpriteFrame],
        videoSpriteFrames:[cc.SpriteFrame],
        starSpriteFrames:[cc.SpriteFrame],
        starSpriteFrames2:[cc.SpriteFrame],

        starNodes:[cc.Node],
        _isMusicPlaying:false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    unuse() {
        this.songName = null;
        this.urlName = null;
        this.musicDuration = null;
        this.nameLabel.string = null;
        this.outLight.active = false;
        this.index = -1;
        this._isMusicPlaying = false;
        this.outLight.active = false;
        this.tMiss = null;
        this.coin = 0;
        this.type = 0;
        this.newSprite.active = false;
        this.album.getComponent(cc.Sprite).spriteFrame = null;
        this.album.getComponent(cc.Animation).stop();
        this.album.angle = 0;
        for(let item of this.starNodes)
            item.active = false;
        if(config.songItemController == this)
            config.songItemController = null;
    },

    reuse(ix,obj) {
        this.init(ix,obj);
    },


    init(ix,obj){
        this.index = ix;
        this._isMusicPlaying = false;
        this.outLight.active = false;
        this.songName = obj.name;
        this.urlName = obj.urlName;
        this.musicDuration = obj.musicDuration;
        this.nameLabel.string = obj.name;
        this.tMiss = obj.tMiss;
        this.coin = parseInt(obj.coin);
        this.type = obj.type;
        this.difficulty = obj.difficulty;
        this.typeLabel.string = obj.type;
        this.scoreLabel.string = 0;
        this.star = 0;
        this.isNew = obj.isNew;
        this.newSprite.active = this.isNew;
        this.album.getComponent(cc.Animation).stop();
        this.album.angle = 0;
        this.CheckHistory(this.songName);
        if(this.difficulty == 2){
            this.outLight.color = cc.color("#f858e0");
            this.nameLabel.node.color = cc.color("#f858e0");
            this.scoreLabel.node.color = cc.color("#f4a1ef");
            this.scoreLabel.node.parent.children[0].getComponent(cc.Sprite).spriteFrame = this.starSpriteFrames2[2];
            this.difficultSprite.spriteFrame = this.difficultSpriteFrames[2];
            this.bgSprite.spriteFrame = this.bgSpriteFrames[2];
            this.setBtnSprite(2);

        }
        else if(this.difficulty == 1){
            this.outLight.color = cc.color("#81da30");
            this.nameLabel.node.color = cc.color("#81da30");
            this.scoreLabel.node.color = cc.color("#adee30");
            this.scoreLabel.node.parent.children[0].getComponent(cc.Sprite).spriteFrame = this.starSpriteFrames2[1];
            this.difficultSprite.spriteFrame = this.difficultSpriteFrames[1];
            this.bgSprite.spriteFrame = this.bgSpriteFrames[1];
            this.setBtnSprite(1);
        }
        else{
            this.outLight.color = cc.color("#39e6e3");
            this.nameLabel.node.color = cc.color("#39e6e3");
            this.scoreLabel.node.color = cc.color("#7df7b9");
            this.scoreLabel.node.parent.children[0].getComponent(cc.Sprite).spriteFrame = this.starSpriteFrames2[0];
            this.difficultSprite.spriteFrame = this.difficultSpriteFrames[0];
            this.bgSprite.spriteFrame = this.bgSpriteFrames[0];
            this.setBtnSprite(0);
        }
        // cc.log(this.star);
        for(let i = 0; i < this.star; i++){
            this.starNodes[i].getComponent(cc.Sprite).spriteFrame = this.starSpriteFrames[this.difficulty];
            this.starNodes[i].active = true;
        }

        if(config.channel == "tt"){
            this.album.width = this.album.height = 165;
            this.album.getComponent(cc.Sprite).spriteFrame = this.albumSprite;
        }
        else{
            let url = config.url + "pic/" + this.urlName + "";
            let self = this;
            cc.loader.loadRes(url, (err, texture) => {
                if (err) {
                    return;
                }
                self.album.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            });
        }


        if(!config.songNameByPlaying){
            if(config.urlName == this.urlName){
                if(config.isIOS && !config.isTouched) return;
                this.onMusicPlay(null,9);
            }
        }
        else if(config.songNameByPlaying && config.songNameByPlaying == this.urlName){
            config.songItemController = this;
            this._isMusicPlaying = true;
            this.outLight.active = true;
            this.album.getComponent(cc.Animation).play();
        }
    },

    CheckHistory(name){
        let history = new Array();
        let hasKey = false;
        let historyValue = cc.sys.localStorage.getItem("History");
        if (historyValue != null && historyValue !== undefined && historyValue !== ''){
            history = JSON.parse(historyValue);
            for(let item of history){
                if(item.name == name){
                    let i = item.bestScore;
                    if(i >= 1000000){
                        let m = parseInt(i / 1000000);
                        let t = parseInt((i % 1000000) / 1000);
                        if(t >= 100)
                            this.scoreLabel.string = m + "," + t + ",000";
                        else if(t >= 10)
                            this.scoreLabel.string = m + ",0" + t + ",000";
                        else
                            this.scoreLabel.string = m + ",00" + t + ",000";
                    }
                    else if(i >= 1000){
                        let t = parseInt(i / 1000);
                        this.scoreLabel.string = t +",000";
                    }
                    else
                        this.scoreLabel.string = i;

                    this.star = item.star;
                    this.coin = 0;
                    break;
                }
            }
        }
    },

    setBtnSprite(ix){
        if(config.unlockAll && this.coin < 0)
            this.coin = 0;
        if(this.coin < 0){
            this.btnNode.children[0].getComponent(cc.Sprite).spriteFrame = this.videoSpriteFrames[ix];
            this.btnNode.children[0].active = true;
            this.btnNode.children[1].active = false;
        }
        else if(this.coin == 0){
            this.btnNode.children[0].getComponent(cc.Sprite).spriteFrame = this.playSpriteFrames[ix];
            this.btnNode.children[0].active = true;
            this.btnNode.children[1].active = false;
        }
        else if(this.coin > 0){
            this.btnNode.children[1].getComponentInChildren(cc.Label).string = this.coin;
            this.btnNode.children[1].active = true;
            this.btnNode.children[0].active = false;
        }
    },

    onBtnEvent(){
        config.isTouched = true;
        config.songName = this.songName;
        config.urlName = this.urlName;
        config.musicDuration = this.musicDuration;
        config.tMiss = this.tMiss;
        config.difficulty = this.difficulty;
        if(this.coin < 0){
            if(config.audioManager)
                config.audioManager.playEffectSound("btn",false);
            // console.log("看广告");
            config.videoType = 1;
            config.AdsManager.ShowVideo();
        }
        else if(this.coin > 0){
            if(config.audioManager)
                config.audioManager.playEffectSound("btn",false);
            let coin = config.getlocalStorageNum("Coin") - this.coin;
            if(coin >= 0){
                let self = this;
                config.homeController.showMessagePop("购买成功");
                self.payForSong(coin);
            }
            else {
                config.homeController.showMessagePop("金币不足");
            }
        }
        else {
            if(config.audioManager){
                config.audioManager.stopAll();
                config.audioManager.playEffectSound("btn",false);
            }
            config.homeController.playGame();
            // config.homeController.loading.active = true;
            // if(config.audioManager){
            //     config.audioManager.stopAll();
            //     config.audioManager.playEffectSound("btn",false);
            // }
            // cc.director.loadScene("GameScene");
        }
    },

    payForSong(){
        //解锁歌曲成就
        let achievement = config.getAchievement("Achievement");
        achievement.unLockSong = parseInt(achievement.unLockSong) + 1;
        config.setAchievement("Achievement",achievement);

        let coin = config.getlocalStorageNum("Coin") - this.coin;
        config.setlocalStorageNum("Coin",coin);
        config.homeController.coin = coin;
        let obj = {
            name:config.songName,
            star:0,
            bestScore:0,
        };
        let history = new Array();
        let historyValue = cc.sys.localStorage.getItem("History");
        if (historyValue != null && historyValue !== undefined && historyValue !== '')
            history = JSON.parse(historyValue);
        history.unshift(obj);
        cc.sys.localStorage.setItem("History", JSON.stringify(history));

        this.coin = 0;
        this.setBtnSprite(this.difficulty);
        this.btnNode.children[1].active = false;
        // config.homeController.loading.active = true;
        // cc.director.loadScene("GameScene");
    },

    onMusicPlay(event,data){
        config.isTouched = true;
        if(this._isMusicPlaying){
            this.onBtnEvent();
            return;
        }
        let that = this;
        if(this.urlName){
            if(config.songItemController){
                config.songItemController.outLight.active = false;
                config.songItemController._isMusicPlaying = false;
                config.songItemController.album.getComponent(cc.Animation).stop();
                config.songItemController.album.angle = 0;
            }
            if(config.songNameByPlaying && config.songNameByPlaying == this.urlName) return;

            config.songNameByPlaying = that.urlName;

            if(cc.sys.platform != cc.sys.DESKTOP_BROWSER && config.channel == "vivo"){
                if(!config.innerAudioContext)
                    config.innerAudioContext = qg.createInnerAudioContext();
                config.innerAudioContext.stop();
                config.innerAudioContext.src = config.url + "music_preview/" + this.urlName + "";
                config.innerAudioContext.loop = true;
                config.innerAudioContext.volume = 1;
                config.innerAudioContext.play();
                if(config.songNameByPlaying == that.urlName){
                    config.songItemController = that;
                    that._isMusicPlaying = true;
                    that.outLight.active = true;
                    that.album.getComponent(cc.Animation).play();
                }
            }
            else {
                cc.loader.loadRes(config.url + "music_preview/" + this.urlName + "", function (err, res) {
                    if(err!=null) {
                        if(data != 9)
                            config.homeController.showMessagePop("加载失败\n请检查网络或重试");
                        return;
                    }
                    if(config.audioManager){
                        if(config.homeController){
                            config.audioManager.backGroupSound = res;
                            config.audioManager.playBackGroupSound(true);
                        }
                        if(config.songNameByPlaying == that.urlName){
                            config.songItemController = that;
                            that._isMusicPlaying = true;
                            that.outLight.active = true;
                            that.album.getComponent(cc.Animation).play();
                        }
                    }
                });
            }
        }
    },

});
