let songItemController = require('SongItem');
let self = null;
let mta = require('mta_analysis');
var AdsManager = require("AdsManager");
cc.Class({
    extends: cc.Component,

    properties: {
        nativeInerSprite:cc.SpriteFrame,
        pushPrefab:cc.Prefab,
        canvas:cc.Node,
        loading:cc.Node,
        messagePop:cc.Node,
        songScorllView:cc.ScrollView,
        songItemPrefab:cc.Prefab,
        shareBtn:cc.Node,
        achievementBtn:cc.Node,
        rewardBtn:cc.Node,
        rewardPanel:cc.Node,
        rewardSprite:cc.SpriteFrame,
        coinLabel:cc.Label,
        coinLabel2:cc.Label,
        coinLabel3:cc.Label,
        coin: {
            default: 0,
            type: cc.Integer,
            notify: function () {
                this.setCoinLabel(this.coin);
            }
        },
        _isPanelActive:false,
        achievementPanel:cc.Node,
        skinPanel:cc.Node,
        bladeBtn:cc.Node,
        blockBtn:cc.Node,
        bladeScroll:cc.ScrollView,
        blockScroll:cc.ScrollView,
        achievementScroll:cc.ScrollView,

        adBoxBtn:cc.Node,
        recordSprite:cc.Sprite,
        recording:cc.SpriteFrame,
        recordStop:cc.SpriteFrame,

        nativeIcon:cc.Node,
        nativeBanner:cc.Node,
        nativeInter:cc.Node,
        nativeItem:cc.Node,
        nativeBlade:cc.Node,
        nativeBlock:cc.Node,
    },

    onLoad () {
        self = this;
        config.isWatchingVideo = false;
        config.homeController = this;
        this.loading.active = true;
        this.messagePop.active = false;
        this._isPanelActive = false;
        this.songArray = new Array();
        this.rewardIndex = -1;
        this.isRewardDouble = true;
        this.coin = config.getlocalStorageNum("Coin");
        // this.coin = 10000;//测试用
        this.messageType = 0;
        if(cc.sys.platform != cc.sys.DESKTOP_BROWSER && config.channel == "tt"){
            if(config.AdsManager)
                config.AdsManager.HideBanner();
            this.recordSprite.node.active = true;
        }
        else {
            this.recordSprite.node.active = false;
        }
        if(config.channel == "qq"){
            this.adBoxBtn.active = true;
        }

        if(cc.sys.platform != cc.sys.DESKTOP_BROWSER && config.channel == "wx"){
            let sys = wx.getSystemInfoSync().system.toLowerCase();
            if(sys.indexOf("ios") != -1)
                config.isIOS = true;
            wx.showShareMenu({
                withShareTicket: true
            });
            wx.onShareAppMessage(function () {
                return {
                    title: '精选原创音乐，唯美的游戏场景，为你带来独一无二的游戏体验！',
                    imageUrl:"https://pou.myqcloud.com/share/DancingBlade.png"
                }
            });
        }
        if(config.channel == "vivo" || config.channel == "oppo")
            this.shareBtn.active = false;

        //region 分包
        if(cc.sys.platform != cc.sys.DESKTOP_BROWSER && config.channel == "wx") {
            if(config.isLoadFinish == false)
            {
                cc.loader.downloader.loadSubpackage('general', function (err) {
                    if (err) {
                        return console.error(err);
                    }
                    config.isLoadFinish = true;
                    //  console.log('load subpackage successfully.');
                }.bind(this));
            }
        }
        else if(cc.sys.platform != cc.sys.DESKTOP_BROWSER && config.channel == "qq") {
            const loadTask = qq.loadSubpackage({
                name: 'general', // name 可以填 name 或者 root
                success(res) {
                    // 分包加载成功后通过 success 回调
                    config.isLoadFinish = true;
                },
                fail(res) {
                    // 分包加载失败通过 fail 回调
                    console.log("loadSubpackage resources fail"+res);
                }
            });
        }
        else if(cc.sys.platform != cc.sys.DESKTOP_BROWSER && config.channel == "baidu") {
            swan.loadSubpackage({
                name: 'general', // name 可以填 name 或者 root
                success(res) {
                    // 分包加载成功后通过 success 回
                    config.isLoadFinish = true;
                    console.log("resources Subpackage success.")
                },
                fail(res) {
                    // 分包加载失败通过 fail 回调
                    console.log("resources Subpackage fail.")
                }
            });
        }
        else {
            config.isLoadFinish = true;
        }
        //endregion
    },

    onDestroy(){
        config.homeController = null;
    },

    start () {
        this.nativeItemSize = 0;
        if(config.channel == "oppo" || config.channel == "vivo")
            this.nativeItemSize = 250;
        if(cc.sys.platform != cc.sys.DESKTOP_BROWSER && !config.isMatInit){
            config.isMatInit = true;
            mta.App.init({
                "appID":"500718831",
                "eventID":"500718832",
            });
            // console.log("MTA初始化完成");
            mta.Page.init();
            mta.Event.stat("InitGame_" + config.channel, {});
            mta.Event.stat("InitGameAll", {});
        }
        if(config.channel == "tt" || config.channel == "qq" || config.channel == "wx" || config.channel == "oppo" || config.channel == "vivo"){
            config.isHasAd = true;
        }else {
            config.isHasAd = false;
        }
        config.unlockAll = !config.isHasAd;

        //region OPPO调试
        if(cc.sys.platform != cc.sys.DESKTOP_BROWSER && config.channel == "oppo"){
            qg.setEnableDebug({
                enableDebug: false, // true 为打开，false 为关闭
                // enableDebug: true, // true 为打开，false 为关闭
                success: function () {
                    // 以下语句将会在 vConsole 面板输出
                    console.log("oppo调试开启");
                },
                complete: function () {
                },
                fail: function () {
                }
            });

            if (qg.getSystemInfoSync().platformVersion < 1051) {
                // 旧版本广告
                config.isOldAd = true;
                config.isShowNative = false;
            }
            else {
                // 新版本广告
                config.isOldAd = false;
                config.isShowNative = true;
            }
            if (qg.getSystemInfoSync().platformVersion < 1044) {
                // 不支持互推
                config.isOPPOPush = false;
            }
            else {
                // 支持互推
                config.isOPPOPush = true;
            }
            // console.log("config.isOldAd=" + config.isOldAd);
            // console.log("config.isShowNative=" + config.isShowNative);
        }
        //endregion

        if(cc.sys.platform != cc.sys.DESKTOP_BROWSER && config.channel == "vivo"){
            if (qg.getSystemInfoSync().platformVersionCode < 1053) {
                config.isShowNative = false;
            }
            else {
                config.isShowNative = true;
            }
        }

        if(config.AdsManager == null && config.isHasAd){
            if(cc.sys.platform != cc.sys.DESKTOP_BROWSER && config.channel == "oppo"){
                if (cc.sys.platform != cc.sys.DESKTOP_BROWSER && qg.getSystemInfoSync().platformVersion >= 1060)
                    qg.reportMonitor('game_scene', 0);

                //第二天清除banner和插屏的数据
                if(config.GetContinuousSignInDays() > 0){
                    config.SetBannerCloseTimes(0);
                    config.SetInsertShowTimes(0);
                }
                if(!config.GetIsSigIn())
                    config.SetSignInDate();
                config.AdsManager = new AdsManager();
                let str = config.GetBannerCloseTimes();
                if(str == null || str == "")
                    str = 0;
                config.AdsManager.bannerCloseTimes = parseInt(str);
                str = config.GetInsertShowTimes();
                if(str == null || str == "")
                    str = 0;
                config.AdsManager.insertShowTimes = parseInt(str);

                if(config.isOldAd){
                    qg.initAdService({
                        appId:"30271536",
                        isDebug:false,
                        success: function(res) {
                            // console.log("oppo:success");
                            config.AdsManager.InitVideo();
                            config.AdsManager.InitInterstitial();
                        },
                        fail: function(res) {
                            console.log("jswrapper:fail:" + res.code + res.msg);
                        },
                    });
                }
                else {
                    config.AdsManager.InitVideo();
                    config.AdsManager.InitInterstitial();
                }
            }
            else {
                config.AdsManager = new AdsManager();
                config.AdsManager.InitVideo();
                config.AdsManager.InitInterstitial();
                if(config.channel == "qq") {
                    config.isShowAppBox = config.AdsManager.isCanShowAppBox();
                    config.AdsManager.InitAppBox();
                }
            }
        }


        this.onBladeOrBlockBtnEvent(null,0);
        this.achievementPanel.active = false;
        this.skinPanel.active = false;
        config.bladeIndex = config.getlocalStorageNum("bladeIndex");
        config.blockIndex = config.getlocalStorageNum("blockIndex");
        this.loadDailyReward();
        this.loadSongItems();
        config.isOPPOPush  = true;
        // if(config.channel == "vivo" && !config.isHasAd){
        //     let url = config.url + "isShowAD.json";
        //     let xhr = new XMLHttpRequest();
        //     xhr.onreadystatechange = function () {
        //         if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
        //             let response = xhr.responseText;
        //             let res = JSON.parse(response);
        //             config.isHasAd = res.isVivoShowAD;
        //             config.vivoBannerID = res.vivoBannerID;
        //             config.vivoInterID = res.vivoInterID;
        //             config.vivoVideoID = res.vivoVideoID;
        //             config.unlockAll = !config.isHasAd;
        //             if(config.AdsManager == null && config.isHasAd){
        //                 config.AdsManager = new AdsManager();
        //                 config.AdsManager.InitVideo();
        //                 config.AdsManager.InitInterstitial();
        //                 self.loadDailyReward();
        //                 self.updateSongItem();
        //             }
        //         }
        //     };
        //     xhr.open("GET", url, true);
        //     xhr.send();
        // }
        if(cc.sys.platform != cc.sys.DESKTOP_BROWSER && config.channel == "tt") {

            if(config.recorderFlag)
                this.recordSprite.spriteFrame = this.recording;
            else
                this.recordSprite.spriteFrame = this.recordStop;

            this.recorder = tt.getGameRecorderManager();
            this.recorder.onStart(function (res) {
            });
            this.recorder.onError(function (res) {
                // console.log(res);
            });
            this.recorder.onStop(function (res) {
                if(config.pickId == 1)
                {
                    self.ttVideoPath = res.videoPath;
                    self.messageType = 1;
                    self.showMessagePop("是否播放录制视频？");
                }
                config.recorderFlag = false;
                try {
                    this.recordSprite.spriteFrame = this.recordStop;
                }
                catch (e) {

                }
            }.bind(this));
        }
        if(config.channel == "oppo" && config.isOPPOPush){
            let push2 = cc.instantiate(this.pushPrefab);
            push2.parent =  this.messagePop.children[1];
            push2.position = cc.v3(0,380);
        }
    },

    RecorderClick:function() {
        config.isTouched = true;
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

    adBoxBtnClick:function () {
        config.isTouched = true;
        if(config.channel == "qq") {
            config.AdsManager.ShowAppBox();
        }
    },

    playTTVideo(){
        if(cc.sys.platform != cc.sys.DESKTOP_BROWSER && config.channel == "tt" && self.ttVideoPath != null){
            tt.shareVideo({
                videoPath: self.ttVideoPath,
                success () {
                    //    console.log('分享成功！');
                },
                fail (e) {
                    console.log('分享失败！');
                }
            });
        }
    },

    loadSongItems(){
        this.songItemPool = new cc.NodePool(songItemController);
        let url = config.url + "Song.json";
        // url = config.url + "SongTest.json";//测试用
        self.isLoadSongs = false;
        // if(config.channel == "apk" || config.channel == "vivo" || config.channel == "oppo" || config.channel == "ios" || CC_JSB){
          /*  let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                    if(!self.isLoadSongs){
                        self.isLoadSongs = true;
                        let response = xhr.responseText;
                        let res = JSON.parse(response);

                        let ix = 0;
                        for (let json of res.Music) {
                            let obj ={
                                name:json.name,
                                urlName:json.urlName,
                                musicDuration:json.duration,
                                tMiss:json.tMiss,
                                difficulty:json.difficulty,
                                type:json.type,
                                coin:json.coin,
                                isNew:json.isNew,
                            };
                            self.songArray.push(obj);
                            if(config.urlName && config.urlName == json.urlName)
                                ix = self.songArray.indexOf(obj);
                        }
                        if(!config.urlName){
                            ix = 0;
                            config.urlName = self.songArray[0].urlName;
                        }

                        self.songScorllView.content.height = (250 * self.songArray.length) + 200 + 50 + self.nativeItemSize;
                        // self.initSongItem(cc.v3(0,ix * 250 - 50,0),self.songScorllView);
                        // self.songScorllView.setContentPosition(cc.v2(0,ix * 250));
                        self.songScorllView.scrollTo(cc.v2(0, 1 - (ix/(self.songArray.length - 1))), 1);
                        self.loading.active = false;
                    }
                }
                else if (xhr.readyState == 4){
                    // console.log("请求失败");
                    self.schedule(self.ReloadSongs, 0.5);
                }
            };
            xhr.open("GET", url, true);
            xhr.send();
			*/
			
			
		  cc.loader.loadRes(url,function (err,json) {
                    if(err)
                    {
                        console.log(err);
                        return;
                    }
                    //gameManager.otherGirlMsg = json.json;
					let res = json.json;
					let ix = 0;
                        for (let json of res.Music) {
                            let obj ={
                                name:json.name,
                                urlName:json.urlName,
                                musicDuration:json.duration,
                                tMiss:json.tMiss,
                                difficulty:json.difficulty,
                                type:json.type,
                                coin:json.coin,
                                isNew:json.isNew,
                            };
                            self.songArray.push(obj);
                            if(config.urlName && config.urlName == json.urlName)
                                ix = self.songArray.indexOf(obj);
                        }
                        if(!config.urlName){
                            ix = 0;
                            config.urlName = self.songArray[0].urlName;
                        }

                        self.songScorllView.content.height = (250 * self.songArray.length) + 200 + 50 + self.nativeItemSize;
                        // self.initSongItem(cc.v3(0,ix * 250 - 50,0),self.songScorllView);
                        // self.songScorllView.setContentPosition(cc.v2(0,ix * 250));
                        self.songScorllView.scrollTo(cc.v2(0, 1 - (ix/(self.songArray.length - 1))), 1);
                        self.loading.active = false;
					
					
					
                }.bind(this))	
			
			
			
			
			
        // }
        // else {
        //     cc.loader.load(url, (err, res) => {
        //         if (err != null) {
        //             console.log(err);
        //             return;
        //         }

        //         let ix = 0;
        //         for (let json of res.Music) {
        //             let obj ={
        //                 name:json.name,
        //                 urlName:json.urlName,
        //                 musicDuration:json.duration,
        //                 tMiss:json.tMiss,
        //                 difficulty:json.difficulty,
        //                 type:json.type,
        //                 coin:json.coin,
        //                 isNew:json.isNew,
        //             };
        //             self.songArray.push(obj);
        //             if(config.urlName && config.urlName == json.urlName)
        //                 ix = self.songArray.indexOf(obj);
        //         }
        //         if(!config.urlName){
        //             ix = 0;
        //             config.urlName = self.songArray[0].urlName;
        //         }

        //         self.songScorllView.content.height = (250 * self.songArray.length) + 150 + 50;
        //         if(config.channel == "wx")
        //             self.songScorllView.content.height += 350;

        //         // self.initSongItem(cc.v3(0,ix * 250 - 50,0),self.songScorllView);
        //         // self.songScorllView.setContentPosition(cc.v2(0,ix * 250));
        //         self.songScorllView.scrollTo(cc.v2(0, 1 - (ix/(self.songArray.length - 1))), 1);
        //         self.loading.active = false;
        //     });
        // }
    },

    ReloadSongs(){
        let url = config.url + "Song.json";
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                if(!self.isLoadSongs){
                    let response = xhr.responseText;
                    let res = JSON.parse(response);

                    let ix = 0;
                    for (let json of res.Music) {
                        let obj ={
                            name:json.name,
                            urlName:json.urlName,
                            musicDuration:json.duration,
                            tMiss:json.tMiss,
                            difficulty:json.difficulty,
                            type:json.type,
                            coin:json.coin,
                            isNew:json.isNew,
                        };
                        self.songArray.push(obj);
                        if(config.urlName && config.urlName == json.urlName)
                            ix = self.songArray.indexOf(obj);

                    }
                    if(!config.urlName){
                        ix = 0;
                        config.urlName = self.songArray[0].urlName;
                    }

                    self.songScorllView.content.height = (250 * self.songArray.length) + 200 + 50;
                    // self.initSongItem(cc.v3(0,ix * 250 - 50,0),self.songScorllView);
                    // self.songScorllView.setContentPosition(cc.v2(0,ix * 250));
                    self.songScorllView.scrollTo(cc.v2(0, 1 - (ix/(self.songArray.length - 1))), 1);
                    self.loading.active = false;

                    self.isLoadSongs = true;
                    self.unschedule(self.ReloadSongs);
                }
            }
            // else if (xhr.readyState == 4){
            //     console.log("请求失败");
            // }
        };
        xhr.open("GET", url, true);
        xhr.send();
    },

    updateSongItem(){
        for(let i = 0; i < self.songScorllView.content.children.length; i++){
            let item = self.songScorllView.content.children[i];
            let js = item.getComponent(songItemController);
            js.init(js.index,self.songArray[js.index]);
        }
    },

    loadDailyReward(){
        if(config.isHasAd){
            if(config.channel == "vivo" || config.channel == "oppo" || config.channel == "qq"){
                self.songScorllView.content.height += 250;
                self.bladeScroll.content.getComponent(cc.Layout).paddingBottom += 250;
                self.blockScroll.content.getComponent(cc.Layout).paddingBottom += 250;
                self.achievementScroll.content.getComponent(cc.Layout).paddingBottom += 250;
            }
            else if(config.channel == "tt"){
                self.songScorllView.content.height += 0;
                self.bladeScroll.content.getComponent(cc.Layout).paddingBottom += 0;
                self.blockScroll.content.getComponent(cc.Layout).paddingBottom += 0;
                self.achievementScroll.content.getComponent(cc.Layout).paddingBottom += 0;
            }
            else{
                self.songScorllView.content.height += 350;
                self.bladeScroll.content.getComponent(cc.Layout).paddingBottom += 350;
                self.blockScroll.content.getComponent(cc.Layout).paddingBottom += 350;
                self.achievementScroll.content.getComponent(cc.Layout).paddingBottom += 350;
            }
        }
        this.checkAchievement();
        let lastTime = config.getlocalStorageNum("RewardTime");
        let t0 = new Date(lastTime);
        let t1 = new Date();
        this.rewardIndex = config.getlocalStorageNum("RewardIndex");
        if(config.isHasAd){
            // this.rewardPanel.getChildByName("items").getChildByName("btns").active = true;
            // this.rewardPanel.getChildByName("items").getChildByName("rewardBtn").active = false;
            if(config.channel != "tt" && config.channel != "oppo"){
                if(config.channel == "vivo"){
                    if(this.nativeInerSprite)
                        this.nativeInter.getChildByName("bg").getComponent(cc.Sprite).spriteFrame = this.nativeInerSprite;
                    config.AdsManager.ShowBanner();
                    config.AdsManager.ShowNativeIcon(this.nativeIcon);
                    config.AdsManager.ShowNativeItem(this.nativeItem);
                }
                else
                    config.AdsManager.ShowBanner();
            }

            if(config.channel == "oppo"){
                config.AdsManager.ShowNativeIcon(this.nativeIcon);
                config.AdsManager.ShowNativeItem(this.nativeItem);
                if(!config.isOPPOFirstInit)
                    config.AdsManager.ShowNativeBanner();
                else
                    config.isOPPOFirstInit = false;
            }
            // if(config.channel == "wx"){
            //     this.rewardPanel.getChildByName("items").getComponent(cc.Widget).verticalCenter += 100;
            //     this.rewardPanel.getChildByName("items").getChildByName("btns").getComponent(cc.Layout).spacingY = 60;
            // }
        }else {
            // this.rewardPanel.getChildByName("items").getChildByName("btns").active = false;
            // this.rewardPanel.getChildByName("items").getChildByName("rewardBtn").active = true;
        }

        if(t1.getTime() >= t0.getTime()){
            // console.log("下一个");
            this.rewardBtn.children[0].active = true;
            this.rewardIndex++;
            for(let i = 0; i < 7; i++){
                if(i < this.rewardIndex){
                    this.rewardPanel.getChildByName("items").children[i].opacity = 100;
                }
                else if(i == this.rewardIndex){
                    this.rewardPanel.getChildByName("items").children[i].getComponent(cc.Sprite).spriteFrame = this.rewardSprite;
                }
            }
            if(config.channel == "apk" && !config.isHasAd){
                this.isRewardDouble = false;
                this.rewardPanel.getChildByName("items").getChildByName("checkRewardDouble").active = this.isRewardDouble;
            }
            this.rewardPanel.getComponent(cc.Animation).play("showPanel");
        }
        else {
            for(let i = 0; i < 7; i++){
                if(i <= this.rewardIndex){
                    this.rewardPanel.getChildByName("items").children[i].opacity = 100;
                }
            }
        }
    },

    onRewardBtnEvent(event,value){
        config.isTouched = true;
        if(config.audioManager)
            config.audioManager.playEffectSound("btn",false);

        if(this.rewardIndex <= config.getlocalStorageNum("RewardIndex")){
            self.messageType = 0;
            this.showMessagePop("暂无奖励");
            return;
        }

        if(!this.isRewardDouble)
            this.getDailyReward();
        else{
            console.log("看视频双倍领取");
            config.videoType = 0;
            config.AdsManager.ShowVideo();
        }
    },

    setRewardDouble(){
        this.isRewardDouble = !this.isRewardDouble;
        this.rewardPanel.getChildByName("items").getChildByName("checkRewardDouble").children[0].active = this.isRewardDouble;
    },

    getDailyReward(type){
        let x = 1;
        if(type != undefined || type != null)
            x = 2;
        let num = 0;
        if(this.rewardIndex <= 2)
            num = 200;
        else if(this.rewardIndex <= 4)
            num = 300;
        else if(this.rewardIndex <= 5)
            num = 500;
        else if(this.rewardIndex == 6)
            num = 700;
        this.coin += num * x;
        let  msg = "恭喜获得" + num * x + "金币！！";
        self.messageType = 0;
        this.showMessagePop(msg);
        this.rewardBtn.children[0].active = false;
        for(let i = 0; i < 7; i++){
            if(i <= this.rewardIndex){
                this.rewardPanel.getChildByName("items").children[i].opacity = 100;
            }
        }

        if(this.rewardIndex >= 6)
            this.rewardIndex = -1;
        config.setlocalStorageNum("RewardIndex",this.rewardIndex);
        let t1 = new Date().getTime()+86400000-(new Date().getHours()*60*60+new Date().getMinutes()*60+new Date().getSeconds())*1000;
        config.setlocalStorageNum("RewardTime",t1);

        // this.hideRewardPanel();
    },

    showRewardPanel(){
        if(this._isPanelActive) return;
        config.isTouched = true;
        if(config.audioManager)
            config.audioManager.playEffectSound("btn",false);
        if(config.isHasAd){
            if(config.channel == "vivo" || config.channel == "oppo")
                config.AdsManager.ShowNativeInter(this.nativeInter);
            else
                config.AdsManager.ShowInterstitial();
        }
        this._isPanelActive = true;
        this.rewardPanel.getComponent(cc.Animation).play("showPanel");
        this.isRewardDouble = true;
        if(config.channel == "oppo") this.isRewardDouble = false;
        this.rewardPanel.getChildByName("items").getChildByName("checkRewardDouble").children[0].active = this.isRewardDouble;

        if(config.channel == "apk" && !config.isHasAd){
            this.isRewardDouble = false;
            this.rewardPanel.getChildByName("items").getChildByName("checkRewardDouble").active = this.isRewardDouble;
        }
    },

    hideRewardPanel(){
        if(config.audioManager)
            config.audioManager.playEffectSound("btn",false);
        this._isPanelActive = false;
        this.rewardPanel.getComponent(cc.Animation).play("hidePanel");
    },

    setCoinLabel(coin){
        this.coinLabel.string = coin;
        this.coinLabel2.string = coin;
        this.coinLabel3.string = coin;
        config.setlocalStorageNum("Coin",coin);
    },

    showMessagePop(msg,callback){
        config.isTouched = true;
        this.messagePop.getChildByName("pop").getComponentInChildren(cc.Label).string = msg;
        if(self.messageType == 1)
            this.messagePop.getChildByName("pop").getChildByName("btns").getChildByName("no").active = true;
        else
            this.messagePop.getChildByName("pop").getChildByName("btns").getChildByName("no").active = false;
        this.messagePop.active = true;
        if(config.channel == "tt")
            config.AdsManager.ShowBanner();

        if(cc.sys.platform != cc.sys.DESKTOP_BROWSER && config.channel == "wx"){
            let top = wx.getSystemInfoSync().screenHeight / 2;
            config.CreateGameIcon(top);
        }

        if(msg.indexOf("视频加载失败") != -1)
            config.isWatchingVideo = false;

        if (callback && typeof callback === "function")
            callback();
    },

    hideMessagePop(event,data){
        if(self.messageType == 1 && data == 1)
            self.playTTVideo();
        if(config.channel == "tt")
            config.AdsManager.HideBanner();

        if(cc.sys.platform != cc.sys.DESKTOP_BROWSER && config.channel == "wx"){
            config.gameIcon.hide();
        }

        this.messagePop.active = false;
        self.messageType = 0;
    },

    Share(){
        if(config.audioManager)
            config.audioManager.playEffectSound("btn",false);
        console.log("分享");
        if(config.channel == "baidu" && cc.sys.platform == cc.sys.BAIDU_GAME){
            swan.openShare({
                title: "精选原创音乐，唯美的游戏场景，为你带来独一无二的游戏体验！",
                imageUrl:"https://ploud.com/share/DancingBlade.png",
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
                imageUrl:"https://piqcloud.com/share/DancingBlade.png"
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
                imageUrl:"https://piyqcloud.com/share/DancingBlade.png"
            });
        }
    },

    ChangeParticleIndex(event,data){
        config.particleIndex = parseInt(data);
    },

    ChangeBlockIndex(event,data){
        config.blockIndex = parseInt(data);
    },

    playGame(){
        if(config.isWatchingVideo) return;
        config.homeController.loading.active = true;
        if(!config.isFirstPlayGame && config.isSecondPlayGame){
            mta.Event.stat("playGameSecond", {"songname":config.urlName});
            config.isSecondPlayGame = false;
        }
        if(config.isFirstPlayGame){
            mta.Event.stat("playGameFirst", {"songname":config.urlName});
            config.isFirstPlayGame = false;
        }

        if(cc.sys.platform == cc.sys.DESKTOP_BROWSER)
            cc.director.loadScene("GameScene");
        else
            this.schedule(this.toGameScene,0.3);
    },

    toGameScene(){
        if(config.isLoadFinish) {
            this.unschedule(this.toGameScene);
            cc.director.loadScene("GameScene");
        }
    },

    onBladeOrBlockBtnEvent(event,data){
        if(config.audioManager && event)
            config.audioManager.playEffectSound("btn",false);
        if(parseInt(data) == 0){
            this.bladeBtn.opacity = 255;
            this.blockBtn.opacity = 100;
            this.bladeScroll.node.active = true;
            this.blockScroll.node.active = false;
            if(config.channel == "oppo"){
                this.nativeBlade.active = false;
                if(config.AdsManager){
                    config.AdsManager.ShowNativeBlade(this.nativeBlade);
                }
            }
        }
        else {
            this.bladeBtn.opacity = 100;
            this.blockBtn.opacity = 255;
            this.bladeScroll.node.active = false;
            this.blockScroll.node.active = true;
            if(config.channel == "oppo"){
                this.nativeBlock.active = false;
                if(config.AdsManager){
                    config.AdsManager.ShowNativeBlock(this.nativeBlock);
                }
            }
        }
    },

    showSkinPanel(){
        if(this._isPanelActive) return;
        if(config.audioManager)
            config.audioManager.playEffectSound("btn",false);
        if(config.isHasAd){
            if(config.channel == "vivo" || config.channel == "oppo")
                config.AdsManager.ShowNativeInter(this.nativeInter);
            else
                config.AdsManager.ShowInterstitial();
        }
        this._isPanelActive = true;
        this.skinPanel.active = true;
    },

    hideSkinPanel(){
        if(config.audioManager)
            config.audioManager.playEffectSound("btn",false);
        this._isPanelActive = false;
        this.skinPanel.active = false;
    },

    showAchievementPanel(){
        if(this._isPanelActive) return;
        if(config.audioManager)
            config.audioManager.playEffectSound("btn",false);
        if(config.isHasAd){
            if(config.channel == "vivo" || config.channel == "oppo")
                config.AdsManager.ShowNativeInter(this.nativeInter);
            else
                config.AdsManager.ShowInterstitial();
        }
        this._isPanelActive = true;
        this.achievementPanel.active = true;
    },

    hideAchievementPanel(){
        if(config.audioManager)
            config.audioManager.playEffectSound("btn",false);
        this._isPanelActive = false;
        this.checkAchievement();
        this.achievementPanel.active = false;
    },

    onSongScrollEvent(scrollView, eventType, customEventData){
        this.initSongItem(scrollView.getContentPosition(),scrollView);
    },

    initSongItem(contentPos,scrollView,clear){
        let index = -1;
        let posY = 0;
        if (contentPos.y == 0){
            index = 0;
        }
        else{
            posY = contentPos.y;
            index = Math.floor(posY / (200 + 50));
        }

        let num = Math.floor(this.songScorllView.node.height / 250) + 1;
        let startIndex = (index - 2)<=0 ? 0:(index - 2);
        let endIndex = (index + num) >= this.songArray.length - 1 ? this.songArray.length - 1:(index + num);
        var itemScripts = scrollView.getComponentsInChildren(songItemController);
        if(clear == true){
            for (let s of itemScripts) {
                this.songItemPool.put(s.node);
            }
        }
        for (let ix = startIndex; ix <= endIndex ;ix++){
            let hasItem = false;
            for (let s of itemScripts) {
                if (s.index == ix){
                    hasItem = true;
                    continue;
                }
            }
            if (hasItem) continue;
            if (this.songItemPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
                let item = this.songItemPool.get(ix,self.songArray[ix]);
                item.parent = scrollView.content;
                let pos = cc.v3(0, -250 * ix - 50 - this.nativeItemSize, 0);
                item.position = pos;
            }else {
                let item = cc.instantiate(this.songItemPrefab);
                item.getComponent(songItemController).init(ix,self.songArray[ix]);
                item.parent = scrollView.content;
                let pos = cc.v3(0, -250 * ix - 50 - this.nativeItemSize, 0);
                item.position = pos;
            }
        }

        for (let s of itemScripts) {
            if (s.index < startIndex || s.index > endIndex){
                this.songItemPool.put(s.node);
            }
        }
    },

    checkAchievement(){
        let value = config.getAchievement("Achievement");
        let max = config.getAchievement("AchievementMax");
        this.achievementBtn.children[0].active = false;
        if((parseInt(value.bomb) >= parseInt(max.bomb) && parseInt(max.bomb) != 0) || (parseInt(value.combo) >= parseInt(max.combo)  && parseInt(max.combo) != 0)
            || (parseInt(value.complete) >= parseInt(max.complete) && parseInt(max.complete) != 0) || (parseInt(value.score) >= parseInt(max.score) && parseInt(max.score) != 0)
            || (parseInt(value.unLockSong) >= parseInt(max.unLockSong) && parseInt(max.unLockSong) != 0) || (parseInt(value.watchAD) >= parseInt(max.watchAD) && parseInt(max.watchAD) != 0))
            this.achievementBtn.children[0].active = true;
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
