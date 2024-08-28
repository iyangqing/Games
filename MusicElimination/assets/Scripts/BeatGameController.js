let flashLightJS = require('FlashLight');
let mta = require('mta_analysis');
let self = null;

let GameState = {
    ready : 0,
    playing:1,
    pause:2,
    finished:3
};

var BlockController = require('BlockController');
var cutController = require('CutParticle');

cc.Class({
    extends: cc.Component,

    properties: {
        nativeInerSprite:cc.SpriteFrame,
        pushPrefab:cc.Prefab,
        adBoxBtn:cc.Node,
        messagePop:cc.Node,
        shakeNode:cc.Node,
        countDownNode:cc.Node,
        bgSprite:cc.Sprite,
        bgSpriteFrame:[cc.SpriteFrame],
        slicingline:cc.Node,
        audioSoure:cc.AudioSource,
        loading:cc.Node,
        PausePanel:cc.Node,
        FinishPanel:cc.Node,
        blockPrefab:cc.Prefab,
        blockParent:cc.Node,
        bombPrefab:cc.Prefab,
        glowCircles:[cc.Node],
        flashLightNode:cc.Node,
        flashLightLeft:null,
        flashLightRight:null,
        blockBornEffect:cc.Prefab,
        // cutBlockMaterial:cc.Material,
        // cutBlockSprite:cc.SpriteFrame,

        t:0, //记录音乐开始播放的时间

        yMiss : -600,  //方块消失时候的一些参数
        xMiss : 280,
        scaleMiss : 1.2,
        beatsInfo:null, //网上读取的csv信息
        nextBeatIndex:0,
        firstBeatIndex:0,

        bgMusic: {
            type: cc.AudioClip, // use 'type:' to define an array of Texture2D objects
            default: null
        },
        gameState:GameState.ready,


        pre_t:0,

        tLife:5,// 每个节拍方块出现到消失的时间
        tMiss:4,
        tHit:3, //每个方块出后这个时间是最佳的消除时间
        bpm:120, //beat per second 不一定有用


        x0:60,
        y0:460,
        scale0:0.3, //方块的初始值
        hCam:100, //摄像头的高度
        minD:0,
        maxD:0, //有待计算
        maxScale : 1.2,

        //这些参数在最新算法中没有用到
        kx:0,
        ky:0,
        kScale:0,  //方块的斜率，  方块的位置 x = x0 + kx * t;

        canvas:cc.Node,
        touchCollider:cc.Collider,
        mtId:[],

        missAnim:cc.Animation,
        greatAnim:cc.Animation,
        perfectAnim:cc.Animation,

        comboLabel:cc.Label,
        combo: {
            default: 0,
            type: cc.Integer,
            notify: function () {
                this.setComboLabel(this.combo);
            }
        },
        scoreLabel:cc.Label,
        score: {
            default: 0,
            type: cc.Integer,
            notify: function () {
                this.setScoreLabel(this.score);
            }
        },
        multipleSlider:cc.Sprite,
        multipleLabel:cc.Label,
        multiple: {
            default: 0,
            type: cc.Integer,
        },
        stars:cc.Node,
        cutBlockCount: {
            default: 0,
            type: cc.Integer,
            notify: function () {
                this.setStars(this.cutBlockCount);
            }
        },
        particles:[cc.Node],
        particlesParent:cc.Node,
        particlesPrefabs:[cc.Prefab],

        cutPrefabs:[cc.Prefab],
        cutPrefabs2:[cc.Prefab],
        cutParticlePrefab:cc.Prefab,
        cutParticlePrefab2:cc.Prefab,
        cutParticleParent:cc.Node,

        _maxCombo:0,
        _bombCount:0,
        _starCount:0,
        _isAnimPlaying:false,
        TTPlayBtn:cc.Node,
        recordSprite:cc.Sprite,
        recording:cc.SpriteFrame,
        recordStop:cc.SpriteFrame,

        nativeIcon:cc.Node,
        nativeBanner:cc.Node,
        nativeInter:cc.Node,
    },

    onLoad(){
        self = this;
        config.isWatchingVideo = false;
        this.isOPPOLoadSong = false;
        config.gameController = this;
        config.songItemController = null;
        config.songNameByPlaying = null;
        this.loading.active = true;
        this.FinishPanel.active = false;
        this.PausePanel.active = false;
        this.countDownNode.active = true;
        this.messagePop.active = false;
        this.wOffset = (cc.winSize.height/cc.winSize.width) / (1920/1080);
        // cc.log(this.wOffset);
        this.glowCircles[0].parent.scale = this.glowCircles[0].parent.scale / this.wOffset;
        cc.game.on(cc.game.EVENT_HIDE, function () {
            if(config.gameController != null && self.gameState == GameState.playing)
                self.onPauseEvent(null,9);
        }.bind(this));
        // 游戏进入前台时触发
        cc.game.on(cc.game.EVENT_SHOW, function () {
            if(config.gameController != null && self.gameState == GameState.pause)
                self.onPauseEvent(null,9);
        }.bind(this));

        if(config.AdsManager){
            if(config.channel == "oppo"){
                config.AdsManager.ShowNativeIcon(this.nativeIcon);
                config.AdsManager.ShowNativeBanner(this.nativeBanner);
            }
            else if(config.channel == "vivo"){
                config.AdsManager.ShowNativeBanner(this.nativeBanner);
            }
                config.AdsManager.HideBanner();
        }
        if(config.audioManager){
            if(config.innerAudioContext)
                config.innerAudioContext.stop();
            config.audioManager.stopAll();
        }

        self.messageType = 0;
        if(config.channel == "wx" && cc.sys.platform != cc.sys.DESKTOP_BROWSER){
            wx.showShareMenu({
                withShareTicket: true
            });
            wx.onShareAppMessage(function () {
                return {
                    title: '精选原创音乐，唯美的游戏场景，为你带来独一无二的游戏体验！',
                    imageUrl:"https://pixel-12oud.com/share/DancingBlade.png"
                }
            });
        }
        if(cc.sys.platform != cc.sys.DESKTOP_BROWSER && config.channel == "tt"){
            this.recordSprite.node.active = false;
            this.TTPlayBtn.active = true;
            this.FinishPanel.getChildByName("BackBtn").active = true;
            this.FinishPanel.getChildByName("btnline").active = false;
            this.recorder = tt.getGameRecorderManager();
            this.recorder.stop();
            if(config.recorderFlag)
                this.recordSprite.spriteFrame = this.recording;
            else
                this.recordSprite.spriteFrame = this.recordStop;
            this.recorder.onStart(function (res) {
            });
            this.recorder.onError(function (res) {
                // console.log(res);
            });
            this.recorder.onStop(function (res) {
                if(config.pickId == 1)
                {
                    self.ttVideoPath = res.videoPath;
                    // self.messageType = 2;
                    // self.showMessagePop("是否播放录制视频？");
                }
                config.recorderFlag = false;
                try {
                    this.recordSprite.spriteFrame = this.recordStop;
                }
                catch (e) {

                }
            }.bind(this));
        }
        else {
            this.recordSprite.node.active = false;
            this.TTPlayBtn.active = false;
            this.FinishPanel.getChildByName("BackBtn").active = false;
            this.FinishPanel.getChildByName("btnline").active = true;
            if(config.channel == "vivo" || config.channel == "oppo")
                this.FinishPanel.getChildByName("btnline").getChildByName("ShareBtn").active = false;
        }
        if(config.channel == "qq")
            this.adBoxBtn.active = true;

        if(config.channel == "oppo" && config.isOPPOPush){
            if(this.pushPrefab){
                let push1 = cc.instantiate(this.pushPrefab);
                push1.parent =  this.PausePanel.children[1];
                push1.position = cc.v3(0,380);
                let push2 = cc.instantiate(this.pushPrefab);
                push2.parent =  this.messagePop.children[1];
                push2.position = cc.v3(0,380);
            }
        }

        if(config.channel == "vivo"){
            config.AdsManager.HideBanner();
            if(this.nativeInerSprite)
                this.nativeInter.getChildByName("bg").getComponent(cc.Sprite).spriteFrame = this.nativeInerSprite;
        }
    },

    onDestroy(){
        config.gameController = null;
    },

    start () {
        //初始化
        this.randomBG();
        this.beatsInfo = new Array();
        this.combo = 0;
        this.score = 0;
        this.cutBlockCount = 0;
        this._maxCombo = 0;
        this._bombCount = 0;
        this._starCount = 0;
        this.musicDuration = 120;
        for(let item of this.stars.children){
            item.active = false;
        }

        // this.cutBlockMaterial.setProperty("diffuseTexture",this.cutBlockSprite.getTexture());

        this.gameState = GameState.ready;
        this.t = 0;

        this.tMiss = config.tMiss * this.wOffset;
        this.tLife = this.tMiss + 0.5; //miss显示的时间是0.5秒
        this.tHit = this.tMiss * 0.86; //精确点击是在方块生命周期中的位置
        this.hitOffest = this.tMiss * 0.04;

        this.x0 = 56 / this.wOffset;// 如果背景图变化，这个需要跟着变化
        this.y0 = 590;
        this.scale0 = 0.23 / this.wOffset;
        this.maxScale = 1.25 / this.wOffset;

        let x = Math.pow(this.maxScale / this.scale0,2);
        this.hCam = 0;
        this.minD = 400;
        this.maxD = Math.sqrt((this.hCam * this.hCam + this.minD * this.minD) * x - this.hCam * this.hCam);
        // console.log("d = [" + this.minD + "..." + this.maxD + "]");

        this.yMiss = -600;  //方块消失时候的一些参数
        this.xMiss = 350 / this.wOffset;
        this.yMiss = - (cc.winSize.height / 2);
        this.scaleMiss = 1.3;

        //计算出变化的斜率。没有用到
        this.kx = (this.xMiss - this.x0) / this.tMiss;
        this.ky = (this.yMiss - this.y0) / this.tMiss;
        this.kScale = (this.scaleMiss - this.scale0) / this.tMiss;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnded, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnded, this);
        this.InitFlashLight();
        this.showFlashLight();
        this.showGlow();
        this.InitParticles();
        if(config.isMatInit){
            mta.Event.stat(config.urlName.toLowerCase() + "event", {});
        }
        if(config.channel == "apk" || config.channel == "ios" || CC_JSB){
            /*let url = config.url + "csv/" + config.urlName + ".csv";
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                    let response = xhr.responseText;
                    self.InitBeatsInfo(response);
                }
                else if (xhr.readyState == 4){
                    self.messageType = 1;
                    self.showMessagePop("加载失败\n请检查网络或重试");
                }
            };
            xhr.open("GET", url, true);
            xhr.send();
            cc.loader.loadRes(config.url + "music/" + config.urlName + ".mp3", function (err, res) {
                if(err!=null)
                {
                    self.messageType = 1;
                    self.showMessagePop("加载失败\n请检查网络或重试");
                    console.log("mp3 load failed..." + err);
                    return;
                }
                self.InitMusic(res);
            });*/
        }
        else {
            cc.loader.loadRes(config.url + "csv/" + config.urlName + "", function (err,file) {
                if(err!=null)
                {
                    console.log("CSV load failed..." + err);
                    self.messageType = 1;
                    self.showMessagePop("加载失败\n请检查网络或重试");
                    return;
                }
			
                self.InitBeatsInfo(file.text);
                cc.loader.loadRes(config.url + "music/" + config.urlName + "", function (err, res) {
                    if(err!=null)
                    {
                        self.messageType = 1;
                        self.showMessagePop("加载失败\n请检查网络或重试");
                        console.log("mp3 load failed..." + err);
                        return;
                    }
                    self.InitMusic(res);
                });

            });
        }
    },

    InitParticles(){
        this.particles.length = 2;
        // cc.log(config.bladeIndex);
        for(let i = 0; i < this.particles.length; i++){
            let newNode = cc.instantiate(this.particlesPrefabs[config.bladeIndex]);
            newNode.parent = this.particlesParent;
            newNode.getComponent("TouchController").init(this);
            this.particles[i] = newNode;
        }

        this.cutParticlePrefab = this.cutPrefabs[config.blockIndex];
        this.cutParticlePrefab2 = this.cutPrefabs2[config.blockIndex];
    },

    randomBG(){
        config.bgType = parseInt(Math.random()*2);
        this.bgSprite.spriteFrame = this.bgSpriteFrame[config.bgType];
        if(config.bgType == 0)
            this.slicingline.color = cc.color("#422BBB");
        else if(config.bgType == 1)
            this.slicingline.color = cc.color("#448FFF");

        this.slicingline.scaleX = 1.5 / this.wOffset;
    },

    InitBeatsInfo(file,isFromRes) {
        this.beatsInfo = new Array();
        this.allBlockCount = 0;
        let lines = null;
        // console.log(file);
        if(isFromRes)
            lines = file.text.split("\n");
        else
            lines = file.split("\n");
        for(let ixLine = 0; ixLine < lines.length; ixLine++)
        {
            let line = lines[ixLine];
            let strs = line.split(",");

            if(strs.length >= 3)
            {
                let beat = new Object();
                // beat.timeStamp = parseFloat(strs[0]) / 30;
                beat.timeStamp = parseFloat(strs[0]);
                beat.track = parseInt(strs[1]);
                beat.direction = parseInt(strs[2]);

                if(beat.direction != 9)
                    this.allBlockCount++;

                this.beatsInfo.push(beat);
            }

        }

    },

    InitMusic(audio) {
        //游戏开始
        this.bgMusic = audio;
        this.audioSoure.clip = this.bgMusic;
        this.audioSoure.play();

        this.callback = function () {
            if (self.audioSoure.isPlaying && self.audioSoure.getCurrentTime() > 0) {
                if(config.channel == "wx" && self.audioSoure.getDuration() <= 0)
                    return;
                // self.musicDuration = self.audioSoure.getDuration();//改为直接从JSON获取
                // console.log("cur:"+self.audioSoure.getCurrentTime());
                // console.log("duration:"+this.musicDuration);
                self.audioSoure.pause();
                self.countDownNode.active = true;
                self.loading.active = false;
                config.audioManager.backGroupSound = this.bgMusic;
                self.countDownNode.getComponent(cc.Animation).play();
                self._isAnimPlaying = true;
                self.unschedule(self.callback);
            }
        };
        this.musicDuration = config.musicDuration;
        this.schedule(this.callback, 0.05);
        let manager = cc.director.getCollisionManager();
        manager.enabled = true;

        if(config.audioManager && config.channel != "qq" && config.channel != "oppo" && config.channel != "apk"){
            config.audioManager.stopAll();
        }
    },

    startGame(){
        if(this._isAnimPlaying) return;
        if(this.gameState == GameState.ready){
            this.t = 0;
            this.gameState = GameState.playing;
            this.audioSoure.setCurrentTime(this.t);
            this.audioSoure.resume();
            this.nextBeatIndex = 0;
            if(config.channel == "tt" && !config.recorderFlag){
                this.RecorderClick();
            }
            if(config.audioManager && config.channel != "qq" && config.channel != "oppo" && config.channel != "apk"){
                config.audioManager.stopAll();
            }
        }
        else if(this.gameState == GameState.pause){
            this.PausePanel.active = false;
            if(config.channel == "qq"){
                let res = qq.getSystemInfoSync().system.toLowerCase();
                if(res.indexOf("ios") != -1)
                    self.audioSoure.mute = false;
            }
            if(config.channel == "vivo" || config.channel == "oppo")
                self.audioSoure.mute = false;
            this.audioSoure.setCurrentTime(this.t);
            this.audioSoure.resume();
            self.gameState = GameState.playing;
            for(let item of self.blockParent.children){
                if(item.name == "block"){
                    item.getComponent(BlockController).Anim.resume();
                }
            }
        }
    },

    onMusicFinishEvent(){
        // console.log("游戏结束");
        if(config.isMatInit){
            mta.Event.stat(config.urlName.toLowerCase() + "finish",{});
            mta.Event.stat(config.urlName.toLowerCase() + "star" + this._starCount.toString(),{});
        }
        this.gameState = GameState.finished;
        this.saveHistory();
        this.FinishPanel.getChildByName("score").getChildByName("value").getComponent(cc.Label).string = this.scoreLabel.string;
        this.FinishPanel.getChildByName("combo").getChildByName("value").getComponent(cc.Label).string = "Combo x" + this._maxCombo;

        //成就累计完成关卡数、连击、分数、炸弹
        let achievement = config.getAchievement("Achievement");
        achievement.complete = parseInt(achievement.complete) + 1;
        achievement.score = parseInt(achievement.score) + parseInt(this.score);
        achievement.bomb = parseInt(achievement.bomb) + parseInt(this._bombCount);
        if(parseInt(this._maxCombo) > parseInt(achievement.combo))
            achievement.combo = parseInt(this._maxCombo);
        config.setAchievement("Achievement",achievement);

        this.FinishPanel.active = true;
        if(config.isHasAd){
            if(config.channel != "oppo" && config.channel != "vivo")
                config.AdsManager.ShowBanner();
        }
        let nodes = this.FinishPanel.getChildByName("stars").children;
        for(let i = 0; i < this._starCount; i++){
            let node = nodes[i];
            cc.tween(node)
                .delay(0.5 + i * 0.3)
                .call(() => {
                    node.getComponent(cc.Animation).play();
                    if(config.audioManager)
                        config.audioManager.playEffectSound("star"+(i+1),false);
                })
                .start();
        }

        if(config.isHasAd)
            config.AdsManager.ShowInterstitial();
        if(config.channel == "vivo"){
            config.AdsManager.ShowNativeIcon(this.nativeIcon);
        }
        if(config.channel == "tt"){
            this.scheduleOnce(function () {
                if(config.recorderFlag){
                    self.recordSprite.spriteFrame = self.recordStop;
                    if (cc.sys.platform != cc.sys.DESKTOP_BROWSER)
                        self.recorder.stop();
                    config.recorderFlag = false;
                    if(config.GetNowTime() - config.startRecordTime < 3000)
                    {
                        //录屏失败：录屏时长低于3秒
                        config.pickId = 0;
                        self.messageType = 0;
                        self.showMessagePop("录屏失败\n录屏时长低于3秒\n无法调起分享\n请重新录制");
                    }
                }
            },(1 + (self._starCount * 0.3)));
        }
    },

    onBackBtnEvent(){
        // cc.audioEngine.stopAll();
        if(config.audioManager)
            config.audioManager.playEffectSound("btn",false);
        this.audioSoure.stop();
        if(this.gameState == GameState.pause && config.isMatInit)
            mta.Event.stat(config.urlName.toLowerCase() + "exit",{});
        cc.director.loadScene("HomeScene");
    },

    onRePlayBtnEvent(){
        // cc.audioEngine.stopAll();
        if(config.audioManager){
            config.audioManager.playEffectSound("btn",false);
        }
        if(this.gameState == GameState.pause && config.isMatInit){
            mta.Event.stat(config.urlName.toLowerCase() + "exit",{});
        }
        this.loading.active = true;
        this.audioSoure.stop();
        cc.director.loadScene("GameScene");
    },

    onPauseEvent(event,data){
        if(this.gameState == GameState.playing){
            if(parseInt(data) != 9 && config.AdsManager){
                if(config.channel == "vivo" || config.channel == "oppo"){
                    config.AdsManager.ShowNativeInter(this.nativeInter);
                }
            }
            this.audioSoure.pause();
            this.gameState = GameState.pause;
            for(let item of this.blockParent.children){
                if(item.name == "block"){
                    item.getComponent(BlockController).Anim.pause();
                }
            }
            this._isAnimPlaying = false;
            this.countDownNode.getComponent(cc.Animation).stop();
            this.PausePanel.active = true;
        }
        else if(this.gameState == GameState.pause){
            if(this._isAnimPlaying) return;
            // console.log("恢复");
            if(config.channel == "qq"){
                let res = qq.getSystemInfoSync().system.toLowerCase();
                if(res.indexOf("ios") != -1){
                    this.scheduleOnce(function () {
                        self.audioSoure.mute = true;
                    },0.2);
                }
            }
            if(config.channel == "vivo" || config.channel == "oppo")
                self.audioSoure.mute = true;
            this.PausePanel.active = false;
            this.countDownNode.active = true;
            this.countDownNode.getComponent(cc.Animation).play();
            this._isAnimPlaying = true;
        }
    },

    saveHistory(){
        let obj = {
            name:config.songName,
            star:self._starCount,
            bestScore:self.score,
        };
        let history = new Array();
        let hasKey = false;
        let historyValue = cc.sys.localStorage.getItem("History");
        if (historyValue != null && historyValue !== undefined && historyValue !== ''){
            history = JSON.parse(historyValue);

            for(let item of history){
                if(item.name == obj.name){
                    if(item.star < obj.star){
                        item.star = obj.star;
                        let num = config.getlocalStorageNum("StarCount") + (obj.star - item.star);
                        config.setlocalStorageNum("StarCount",num);
                    }
                    if(item.bestScore < obj.bestScore) item.bestScore = obj.bestScore;
                    hasKey = true;
                    break;
                }
            }
        }
        if(!hasKey){
            history.unshift(obj);
            let num = config.getlocalStorageNum("StarCount") + obj.star;
            config.setlocalStorageNum("StarCount",num);
        }
        cc.sys.localStorage.setItem("History", JSON.stringify(history));

        //加金币
        let coin = config.getlocalStorageNum("Coin");
        let x = 1;
        if(config.difficulty == 1)
            x = 1.2;
        else if(config.difficulty == 2)
            x = 1.5;
        if(self._starCount == 1){
            coin += (30 * x);
            this.FinishPanel.getChildByName("coin").getComponentInChildren(cc.Label).string = (30 * x).toString();
        }
        else if(self._starCount == 2){
            coin += (60 * x);
            this.FinishPanel.getChildByName("coin").getComponentInChildren(cc.Label).string = (60 * x).toString();
        }
        else if(self._starCount == 3){
            coin += (100 * x);
            this.FinishPanel.getChildByName("coin").getComponentInChildren(cc.Label).string = (100 * x).toString();
        }
        else {
            this.FinishPanel.getChildByName("coin").getComponentInChildren(cc.Label).string = "0";
        }

        config.setlocalStorageNum("Coin",coin);
    },

    update (ddt) {
        if(this.gameState == GameState.playing) {
            let t0 = this.t;
            this.t += ddt;
            // console.log(this.audioSoure.getCurrentTime() + "     "+ this.t);
            if(config.channel == "vivo" || config.channel == "oppo"){
                if(Math.abs(this.t - this.audioSoure.getCurrentTime()) > 0.2)
                    this.audioSoure.setCurrentTime(this.t);
            }
            //更新当前的block
            for(let ixBeat = this.firstBeatIndex; ixBeat < this.nextBeatIndex; ixBeat++)
            {
                let beat = this.beatsInfo[ixBeat];
                let dt = this.t - beat.timeStamp + this.tHit;

                let block = beat.node;

                if(block == null || block == undefined || block.active == false){
                    continue;
                }

                if(dt > 0 && dt < this.tMiss)
                {
                    let d = this.maxD + (this.minD - this.maxD)/this.tMiss * dt;

                    let scale = this.scale0 * Math.sqrt(this.maxD * this.maxD + this.hCam * this.hCam) / Math.sqrt(d*d + this.hCam * this.hCam);

                    let xx = (this.x0 + (this.xMiss - this.x0) * (scale - this.scale0) / (this.maxScale - this.scale0)) * (beat.track - 1);
                    let yy = this.y0 + (this.yMiss - this.y0) * (scale - this.scale0) / (this.maxScale - this.scale0);
                    let yyShadow = -180 + (-140 - -180) * (scale - this.scale0) / (this.maxScale - this.scale0);
                    block.position = new cc.Vec3(xx, yy, 0);
                    block.scale = scale;
                    block.getChildByName("Shadow").scaleY = scale;
                    block.getChildByName("Shadow").position = cc.v3(0,yyShadow,0);
                    if(dt >= this.tHit - 1)
                        block.getComponent(BlockController).setHitLight();

                    if(dt >= this.tHit - this.hitOffest && dt <= this.tHit + this.hitOffest){
                        block.getComponent(BlockController).isPerfect = true;
                    }else {
                        block.getComponent(BlockController).isPerfect = false;
                    }
                }
                else if(dt > this.tMiss && dt - ddt < this.tMiss && beat.miss == false)
                {
                    //显示为miss
                    if(block.scaleX < 0)
                        block.scaleX = -block.scaleX;
                    block.getComponent(BlockController).isCanTouch = false;
                    block.getComponent(BlockController).pic.spriteFrame = null;
                    block.getChildByName("Shadow").opacity = 0;
                    if(!block.getComponent(BlockController).isBomb){
                        this.combo = 0;
                        self.missAnim.play();
                    }
                }
                else if(dt > this.tLife)
                {
                    this._blockPool.put(block);
                    beat.node = null;
                    this.firstBeatIndex++; //消失
                    // console.log("方块消失" + this.firstBeatIndex);
                }
            }

            //如果需要，增加新的block
            if(this.nextBeatIndex < this.beatsInfo.length && this.t + this.tHit + 0.1> this.beatsInfo[this.nextBeatIndex].timeStamp + 0.1)
            {
                let beat = this.beatsInfo[this.nextBeatIndex];
                let effect = cc.instantiate(this.blockBornEffect);
                effect.parent = this.blockParent;
                effect.position = new cc.Vec3(this.x0 * (beat.track - 1), this.y0, 0);
            }
            if(this.nextBeatIndex < this.beatsInfo.length && this.t + this.tHit > this.beatsInfo[this.nextBeatIndex].timeStamp)
            {
                let beat = this.beatsInfo[this.nextBeatIndex];
                let pos = cc.v3(this.x0 * (beat.track - 1), this.y0, 0);
                let dirIndex = beat.direction;
                let block = this.newBlockNode(pos,this.scale0,dirIndex);
                block.zIndex = this.beatsInfo.length - this.nextBeatIndex;
                beat.node = block;
                beat.miss = false;

                this.nextBeatIndex++;
            }

            //游戏结束
            // console.log(this.musicDuration);

            if(this.t > this.musicDuration + 1)
                this.onMusicFinishEvent();
        }
    },

    newBlockNode(pos,scale,dir){
        let newNode = null;
        if (!this._blockPool) {
            this._blockPool = new cc.NodePool(BlockController);
        }
        if (this._blockPool.size() > 0) {
            newNode = this._blockPool.get(this.blockParent,pos,scale,dir);
        } else {
            newNode = cc.instantiate(this.blockPrefab);
            newNode.parent = this.blockParent;
            newNode.getComponent(BlockController).init(this.blockParent,pos,scale,dir);
        }
        return newNode;
    },

    onTouchBegan:function(event) {
        if(this.gameState == GameState.finished) return;
        if (event == null || event.touch == null)
            return;
        if (this.mtId.indexOf(event.getID()) == -1 && this.mtId.length < this.particles.length) {
            this.mtId.push(event.getID());
        }
        let touchIdIndex = this.mtId.indexOf(event.getID());
        if(touchIdIndex === -1) return;
        this.particles[touchIdIndex].getComponent("TouchController").dir = 0;
        this.particles[touchIdIndex].position = this.node.parent.convertToNodeSpaceAR(event.touch.getLocation());
        this.particles[touchIdIndex].getComponent(cc.MotionStreak).enabled = true;
    },

    onTouchMoved:function(event) {
        if(this.gameState == GameState.finished) return;
        if (event == null || event.touch == null)
            return;
        let touchIdIndex = this.mtId.indexOf(event.getID());
        if(touchIdIndex === -1) return;
        this.setTouchDir(touchIdIndex,config.vectorsToDegress(event.touch.getDelta()));
        this.particles[touchIdIndex].getComponent(cc.MotionStreak).enabled = true;
        this.particles[touchIdIndex].position = this.node.parent.convertToNodeSpaceAR(event.touch.getLocation());
    },

    onTouchEnded:function(event) {
        let touchIdIndex = this.mtId.indexOf(event.getID());
        if(touchIdIndex === -1) return;
        if(touchIdIndex != -1) {
            this.mtId.splice(touchIdIndex, 1);
        }
        for (let ix = 0; ix < this.particles.length; ix++){
            this.particles[ix].getComponent("TouchController").dir = 0;
            this.particles[ix].getComponent(cc.MotionStreak).enabled = false;
            this.particles[ix].position = new cc.Vec3(-2000, -5000, 0);
        }
    },

    setTouchDir(ix,angle){
        if(angle <= 10 && angle >= -10){
            this.particles[ix].getComponent("TouchController").dir = 7;
        }
        else if (angle >= 80 && angle <= 100){
            this.particles[ix].getComponent("TouchController").dir = 5;
        }
        else if (angle <= -80 && angle >= -100){
            this.particles[ix].getComponent("TouchController").dir = 1;
        }
        else if (angle > 30 && angle < 60){
            this.particles[ix].getComponent("TouchController").dir = 6;
        }
        else if (angle < -30 && angle > -60){
            this.particles[ix].getComponent("TouchController").dir = 8;
        }
        else if (angle > 120 && angle < 150){
            this.particles[ix].getComponent("TouchController").dir = 4;
        }
        else if (angle < -120 && angle > -150){
            this.particles[ix].getComponent("TouchController").dir = 2;
        }
        else if (angle >= 170 || angle <= -170){
            this.particles[ix].getComponent("TouchController").dir = 3;
        }
    },

    Remove:function(block, direction) {
        if(this.gameState != GameState.playing) return;
        for(let ixBeat = this.firstBeatIndex; ixBeat < this.nextBeatIndex; ixBeat++) {
            let beat = this.beatsInfo[ixBeat];
            let block0 = beat.node;

            if(block == block0) {
                if(!block.getComponent(BlockController).isCanTouch) return;
                if(block.getComponent(BlockController).isBomb){
                    let newNode = cc.instantiate(this.bombPrefab);
                    newNode.parent = this.cutParticleParent;
                    newNode.position = block.position;
                    this._bombCount++;
                    this.shakeEffect();
                    this.combo = 0;
                    this._blockPool.put(block);
                    beat.node = null;
                    if(this.firstBeatIndex == ixBeat)
                        this.firstBeatIndex++;
                }
                else {
                    if(beat.direction == 0 || beat.direction == direction) {
                        this.combo++;
                        this.cutBlockCount++;
                        this.showGrade(block);
                        this.newCutParticle(block.position,this.cutParticleParent,direction);
                        this.showFlashLight();
                        this.showGlow();
                        this._blockPool.put(block);
                        // if(cc.sys.platform != cc.sys.DESKTOP_BROWSER && config.channel == "wx"){
                        //     wx.vibrateShort();
                        // }
                        beat.node = null;
                        if(this.firstBeatIndex == ixBeat)
                            this.firstBeatIndex++;
                        // block.destroy();
                        // block.removeFromParent(true);
                    }
                }
            }
        }
    },

    showGrade(block){
        if(block.getComponent(BlockController).isPerfect){
            this.score += 3000 * this.multiple;
            this.perfectAnim.play();
        }
        else{
            this.score += 1000 * this.multiple;
            this.greatAnim.play();
        }
    },

    showGlow(){
        cc.tween(this.node).stop();
        cc.tween(self.node)
            .call(() => { self.glowCircles[0].getComponent("Glow").Show(); })
            .delay(0.05)
            .call(() => {
                self.glowCircles[1].getComponent("Glow").Show();
                self.glowCircles[2].getComponent("Glow").Show(); })
            .delay(0.05)
            .call(() => { self.glowCircles[3].getComponent("Glow").Show(); })
            .start();
    },

    newCutParticle(pos,parent,direction){
        if (!this._cutParticlePool2)
            this._cutParticlePool2 = new cc.NodePool(cutController);
        if (!this._cutParticlePool)
            this._cutParticlePool = new cc.NodePool(cutController);
        let newNode = null;
        if(direction == 1 || direction == 5 || direction == 0){
            if (this._cutParticlePool2.size() > 0) {
                newNode = this._cutParticlePool2.get(pos,parent,direction,2);
            } else {
                newNode = cc.instantiate(this.cutParticlePrefab2);
                newNode.getComponent(cutController).init(pos,parent,direction,2);
            }
        }
        else{
            if (this._cutParticlePool.size() > 0) {
                newNode = this._cutParticlePool.get(pos,parent,direction,1);
            } else {
                newNode = cc.instantiate(this.cutParticlePrefab);
                newNode.getComponent(cutController).init(pos,parent,direction,1);
            }
        }
        // if(direction == 2 || direction == 6){
        //     let x = Math.floor(Math.random()*(35+1-25))+25;
        //     newNode.angle = x;
        // }
        // else if(direction == 4 || direction == 8){
        //     let x = Math.floor(Math.random()*(35+1-25))+25;
        //     newNode.angle = -x;
        // }
        // else if(direction == 3 || direction == 7){
        //     let x = Math.floor(Math.random()*(3+1+3))-3;
        //     newNode.angle = x;
        // }
        // newNode.getComponent("CutParticle").init(pos,parent);
    },

    InitFlashLight(){
        let left = this.flashLightNode.getChildByName("left");
        let right = this.flashLightNode.getChildByName("right");
        let angle0 = left.getChildByName("mask").angle / this.wOffset;
        let pos0 = left.getChildByName("mask").position;
        left.getChildByName("mask").angle = angle0;
        left.getChildByName("mask").position = cc.v3(pos0.x / this.wOffset, pos0.y,0);
        let angle1 = right.getChildByName("mask").angle  / this.wOffset;
        let pos1 = right.getChildByName("mask").position;
        right.getChildByName("mask").angle = angle1;
        right.getChildByName("mask").position = cc.v3(pos1.x / this.wOffset, pos1.y,0);
        this.flashLightLeft = new Array();
        this.flashLightRight = new Array();
        this.flashLightLeft = left.getComponentsInChildren(flashLightJS);
        this.flashLightRight = right.getComponentsInChildren(flashLightJS);
        for(let item of this.flashLightLeft){
            item.node.angle = -angle0;
            if(config.bgType == 0)
                item.node.color = cc.color(187,88,218,255);
            else if(config.bgType == 1)
                item.node.color = cc.color(68,143,255,255);
        }
        for(let item of this.flashLightRight){
            item.node.angle = -angle1;
            if(config.bgType == 0)
                item.node.color = cc.color(187,88,218,255);
            else if(config.bgType == 1)
                item.node.color = cc.color(68,143,255,255);
        }
    },

    showFlashLight(){
        let arrLeft = config.random(2,4,this.flashLightLeft.length);
        let arrRight = config.random(2,4,this.flashLightRight.length);
        for(let ix of arrLeft){
            this.flashLightLeft[ix].Show();
        }
        for(let ix of arrRight){
            this.flashLightRight[ix].Show();
        }
    },

    Clear:function () {

    },

    setComboLabel(i){
        this.comboLabel.string = i;
        if(i != 0){
            if(this.multiple < 32)
                this.EXP++;
            this.comboLabel.node.parent.getComponent(cc.Animation).play();
        }else {
            this.EXP = 0;
            this.maxEXP = 10;
        }

        // cc.log(this.EXP +"  "+ this.maxEXP);
        let value = this.EXP / this.maxEXP;
        if(this.multiple == 32)
            value = 0;
        if(value == 1){
            this.EXP = 0;
            value = 0;
            this.multipleLabel.node.parent.getComponent(cc.Animation).play();
        }
        this.multipleSlider.fillRange = -value;

        let lv = parseInt(i/10);
        if(lv == 0){
            this.multiple = 1;
        }
        else if (lv > 0 && lv < 3) {
            this.maxEXP = 20;
            this.multiple = 2;
        }
        else if (lv >= 3 && lv < 6) {
            this.maxEXP = 30;
            this.multiple = 4;
        }
        else if (lv >= 6 && lv < 10) {
            this.maxEXP = 40;
            this.multiple = 8;
        }
        else if (lv >= 10 && lv < 15) {
            this.maxEXP = 50;
            this.multiple = 12;
        }
        else if (lv >= 15 && lv < 21) {
            this.maxEXP = 60;
            this.multiple = 16;
        }
        else if (lv >= 21 && lv < 27) {
            this.maxEXP = 70;
            this.multiple = 24;
        }
        else
            this.multiple = 32;

        this.multipleLabel.string = "x" + this.multiple;
        if(this._maxCombo < i)
            this._maxCombo = i;
    },

    setScoreLabel(i){
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
        this.scoreLabel.node.parent.getComponent(cc.Animation).play();
    },

    setStars(i){
        if(this.beatsInfo.length <= 0)  return;
        if(i >= this.allBlockCount * 0.3){
            this._starCount = 1;
            this.stars.children[2].active = true;
        }
        if(i >= this.allBlockCount * 0.7){
            this._starCount = 2;
            this.stars.children[1].active = true;
        }
        if(i >= this.allBlockCount * 0.95){
            this._starCount = 3;
            this.stars.children[0].active = true;
        }
    },

    shakeEffect() {
        var shakeY = 23;//初始震动距离
        var sv = cc.v2(0,shakeY);
        this.shakeNode.stopAllActions();
        cc.tween(this.shakeNode)
            .to(0.02,{position:sv.rotate(Math.PI / 4 * (0 * 3) % 8)})
            .to(0.02,{position:sv.rotate(Math.PI / 4 * (1 * 3) % 8)})
            .to(0.02,{position:sv.rotate(Math.PI / 4 * (2 * 3) % 8)})
            .to(0.02,{position:sv.rotate(Math.PI / 4 * (3 * 3) % 8)})
            .to(0.02,{position:sv.rotate(Math.PI / 4 * (4 * 3) % 8)})
            .to(0.02,{position:sv.rotate(Math.PI / 4 * (5 * 3) % 8)})
            .to(0.02,{position:sv.rotate(Math.PI / 4 * (6 * 3) % 8)})
            .to(0.02,{position:sv.rotate(Math.PI / 4 * (7 * 3) % 8)})
            .to(0.02,{position:cc.v3(0,0,0)})
            .start();

        setTimeout(() => {
            // cc.tween(this.shakeNode).stop();
            this.shakeNode.stopAllActions();
            this.shakeNode.position = cc.v3(0,0,0);
        }, 0.2*1000);
    },


    Share(){
        if(config.audioManager)
            config.audioManager.playEffectSound("btn",false);
        console.log("分享");
        if(config.channel == "baidu" && cc.sys.platform == cc.sys.BAIDU_GAME){
            swan.openShare({
                title: "精选原创音乐，唯美的游戏场景，为你带来独一无二的游戏体验！",
                imageUrl:"https://pixeld.com/share/DancingBlade.png",
                success: res => {
                    swan.showToast({
                        title: '分享成功'
                    });
                    // console.log('openShare success', res);
                },
                fail: err => {
                    // console.log('openShare fail', err);
                }
            });
        }
        if (cc.sys.platform!==cc.sys.WECHAT_GAME) return;
        if(config.channel == "wx")
        {
            wx.shareAppMessage({
                title: "精选原创音乐，唯美的游戏场景，为你带来独一无二的游戏体验！",
                imageUrl:"https://zhou.myqcloud.com/share/DancingBlade.png"
            });
        }
        else if(config.channel == "tt"){
            tt.shareAppMessage({
                success() {
                    // console.log('分享视频成功');
                },
                fail(e) {
                    // console.log('分享视频失败');
                }
            })
        }
        else if(config.channel == "qq")
        {
            qq.shareAppMessage({
                title: "精选原创音乐，唯美的游戏场景，为你带来独一无二的游戏体验！",
                imageUrl:"https://pixhou.myqcloud.com/share/DancingBlade.png"
            });
        }
    },

    showMessagePop(msg,callback){
        this.messagePop.getChildByName("pop").getComponentInChildren(cc.Label).string = msg;

        if(config.gameController != null && self.gameState == GameState.playing)
            self.onPauseEvent(null,9);

        this.messagePop.active = true;
        if(config.channel == "tt")
            config.AdsManager.ShowBanner();
        if (callback && typeof callback === "function")
            callback();
    },

    hideMessagePop(event,data){
        if(config.audioManager){config.audioManager.playEffectSound("btn",false);}
        if(config.channel == "tt")
            config.AdsManager.HideBanner();
        this.messagePop.active = false;

        if(self.messageType == 1){
            this.audioSoure.stop();
            if(this.gameState == GameState.pause && config.isMatInit){mta.Event.stat(config.urlName.toLowerCase() + "exit",{});} 
            cc.director.loadScene("HomeScene");
        }
        self.messageType = 0;
    },

    RecorderClick:function() {
        config.pickId = 1;
        if(config.recorderFlag == false)
        {
            this.recordSprite.spriteFrame = this.recording;
            if (cc.sys.platform != cc.sys.DESKTOP_BROWSER)
                this.recorder.start({
                    duration: 30,
                });
            config.recorderFlag = true;
            config.startRecordTime = config.GetNowTime();
        }
        else
        {
            this.recordSprite.spriteFrame = this.recordStop;
            if (cc.sys.platform != cc.sys.DESKTOP_BROWSER)
                this.recorder.stop();
            config.recorderFlag = false;
            if(config.GetNowTime() - config.startRecordTime < 3000)
            {
                //录屏失败：录屏时长低于3秒
                config.pickId = 0;
                self.messageType = 0;
                self.showMessagePop("录屏失败\n录屏时长低于3秒\n无法调起分享\n请重新录制");
            }
        }
    },

    playTTVideo(){
        if(cc.sys.platform != cc.sys.DESKTOP_BROWSER && config.channel == "tt" && self.ttVideoPath != null){
            tt.shareVideo({
                videoPath: self.ttVideoPath,
                success () {
                    let coin = config.getlocalStorageNum("Coin");
                    coin += 100;
                    config.setlocalStorageNum("Coin",coin);
                    self.showMessagePop("获得100金币");
                    self.TTPlayBtn.active = false;
                },
                fail (e) {
                    self.showMessagePop("分享失败\n无奖励");
                }
            });
        }
    },

    adBoxBtnClick:function () {
        if(config.channel == "qq") {
            config.AdsManager.ShowAppBox();
        }
    },

    ChangeParticleIndex(event,data){
        config.bladeIndex = parseInt(data);
        this.onRePlayBtnEvent();
    },

    ChangeBlockIndex(event,data){
        config.blockIndex = parseInt(data);
        this.onRePlayBtnEvent();
    },

    ClickNative(event,type){
        if(config.AdsManager){
            config.AdsManager.ClickNative(event.currentTarget,type);
        }
    },

    HideNative(event,type){
        if(config.AdsManager){
            config.AdsManager.HideNative(event.currentTarget.parent,type);
        }
    },
});
