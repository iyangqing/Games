cc.Class({
    extends: cc.Component,

    properties: {
        bannerAd:{default:null,visible:false},
        videoAd:{default:null,visible:false},
        screenWidth:{default:0,visible:false},
        screenHeight:{default:0,visible:false},
        isLoad:false,
        isShow:false,
        bannerCloseTimes:0,
        insertCloseTimes:0,
        insertShowTimes:0,//插屏显示的次数
        isUserClose:true,
        unLockByInter:false,
    },
    ShowBanner:function () {
        if(config.isHasAd && config.channel == "apk"){
            if(cc.sys.platform == cc.sys.DESKTOP_BROWSER) return;
            jsb.reflection.callStaticMethod(config.packName,"AddBannerAds","()V");
            return;
        }
        if (cc.sys.platform == cc.sys.DESKTOP_BROWSER) return;

        if(config.channel == "oppo"){
            let that = this;
            if(config.isOldAd){
                this.bannerAd = qg.createBannerAd({
                    posId: '187179'
                });
                this.bannerAd && this.bannerAd.show();
            }
            else {
                if(this.isShow)
                    return;
                // if (this.bannerCloseTimes >= 5)
                //     return;
                // that.isUserClose = true;
                this.bannerAd = qg.createBannerAd({
                    adUnitId: '187179'
                });
                this.bannerAd && this.bannerAd.show();
                this.bannerAd && this.bannerAd.onError(function (err) {
                    console.log("oppo banner onError:" + err.code + " "+ err.msg);
                    that.isShow = false;
                });
                this.bannerAd && this.bannerAd.onShow(function() {
                    that.isShow = true;
                });
                this.bannerAd && this.bannerAd.onHide(function () {
                    // console.log("oppo banner hide:" + that.isUserClose + " "+ that.bannerCloseTimes);
                    // if(that.isUserClose) {
                    //     that.bannerCloseTimes++;
                    //     config.SetBannerCloseTimes(that.bannerCloseTimes);
                    //     that.isUserClose = false;
                    // }
                    that.isShow = false;
                });
            }
            return;
        }
        else if(config.channel == "vivo") {
            let that = this;
            if(this.isShow)//如果广告会自动刷新，就没必要在banner显示的情况下去再重新调用
                return;
            // console.log("jswrapperBanner:来了老弟");
            this.bannerAd = qg.createBannerAd({
                posId: '8d0c415cabef4ba1bd6a2bc17a98b80a',
                style: {}
            });
            let adshow =  this.bannerAd.show();
            adshow && adshow.then(() => {
                // console.log("jswrapper:banner广告展示成功");
                that.isShow = true;
            }).catch((err) => {
                switch (err.code) {
                    case 30003:
                        console.log("jswrapperBanner:新用户7天内不能曝光Banner，请将手机时间调整为7天后，退出游戏重新进入");
                        break;
                    case 30009:
                        console.log("jswrapperBanner:10秒内调用广告次数超过1次，10秒后再调用");
                        // setTimeout(() => {
                        //     that.ShowBanner();
                        // }, 10000);
                        break;
                    case 30002:
                        console.log("jswrapperBanner:加载广告失败，重新加载广告");
                        // setTimeout(() => {
                        //     that.ShowBanner();
                        // }, 10000);
                        break;
                    default:
                        // 参考 https://minigame.vivo.com.cn/documents/#/lesson/open-ability/ad?id=广告错误码信息 对错误码做分类处理
                        console.log("jswrapperBanner:banner广告展示失败："+err);
                        console.log("jswrapperBanner:" + JSON.stringify(err));
                        break;
                }
                that.isShow = false;
            });
            return;
        }

        if (this.bannerAd!= null){
            if(config.channel == "qq")
            {
                this.bannerAd.offLoad();
                this.bannerAd.offError();
                this.bannerAd.offResize();
            }
            this.bannerAd.destroy();
        }

        let that = this;
        // console.log(config.channel);

        if(config.channel == "wx" || config.channel == "tt" || config.channel == "qq") {
            if(config.channel == "wx") {
                let phone = wx.getSystemInfoSync();
                let w = phone.screenWidth / 2;
                let h = phone.screenHeight;
                this.bannerAd = wx.createBannerAd({
                    adUnitId: 'adunit-9c49927afb57a20b',
                    style: {
                        width: 300,
                        top: 0,
                        left: 0
                    }
                });
                this.bannerAd.onResize(function() {
                    that.bannerAd.style.left = w - that.bannerAd.style.realWidth / 2 + 0.1;
                    that.bannerAd.style.top = h - that.bannerAd.style.realHeight + 0.1;
                })
            }
            else if(config.channel == "tt") {
                const {
                    windowWidth,
                    windowHeight,
                    appName,
                } = tt.getSystemInfoSync();
                var targetBannerAdWidth = 200;

                // 创建一个居于屏幕底部正中的广告
                this.bannerAd = tt.createBannerAd({
                    adUnitId: '46cgh8e9g67jp48kbb',
                    style: {
                        width: targetBannerAdWidth,
                        top: windowHeight - (targetBannerAdWidth / 16 * 9), // 根据系统约定尺寸计算出广告高度
                    },
                });
                // 也可以手动修改属性以调整广告尺寸
                this.bannerAd.style.left = (windowWidth - targetBannerAdWidth) / 2;

                // 尺寸调整时会触发回调
                // 注意：如果在回调里再次调整尺寸，要确保不要触发死循环！！！

                this.bannerAd.onResize(size => {
                    // console.log(size.width, size.height);
                    // 如果一开始设置的 banner 宽度超过了系统限制，可以在此处加以调整
                    if (targetBannerAdWidth != size.width) {
                        targetBannerAdWidth = size.width;
                        if(appName == "Xigua")
                            that.bannerAd.style.top = windowHeight - (targetBannerAdWidth / 16 * 9);
                        else
                            that.bannerAd.style.top = windowHeight - size.height;
                        that.bannerAd.style.left = (windowWidth - size.width) / 2;
                    }
                });
            }
            else if(config.channel == "qq"){
                let phone = qq.getSystemInfoSync();
                let w = phone.screenWidth;
                let h = phone.screenHeight;
                this.bannerAd = qq.createBannerAd({
                    adUnitId: '1065ac37f9ff9317daea223924bfb12d',
                    style: {
                        width: 320,
                        top: 0,
                        left: 0
                    }
                });

                // 尺寸调整时会触发回调
                // 注意：如果在回调里再次调整尺寸，要确保不要触发死循环！！！
                this.bannerAd && this.bannerAd.onResize(size => {
                    // console.log('Resize后正式宽高:',size.width, size.height);

                    // 在这里可以根据banner宽高进行定位
                    // this.bannerAd.style.top = 76;
                    // this.bannerAd.style.left = 320;
                    if(that && that.bannerAd)
                    {
                        that.bannerAd.style.top = h - size.height;
                        that.bannerAd.style.left = (w - size.width) / 2;
                    }
                });

            }

            this.bannerAd.onLoad(function () {
                that.bannerAd.show();
            });

            this.bannerAd.onError(err => {
                console.log(err);
            })
        }
        else if(config.channel == "swan"){
            if(config.isShowBanner == false)
                return;
            if(config.GetNowTime() - config.startTime < 5000)//百度刚进游戏5秒不能显示
                return;
            if(this.isShow)
                return;
            if (this.bannerAd!=null){
                this.bannerAd.destroy();
            }
            const {
                windowWidth,
                windowHeight,
            } = swan.getSystemInfoSync();
            var targetBannerAdWidth = 300;
            this.bannerAd = swan.createBannerAd({
                adUnitId: '6552759',
                appSid: 'de24049b',
                style: {
                    width: targetBannerAdWidth,
                    top: windowHeight - (targetBannerAdWidth / 3), // 根据系统约定尺寸计算出广告高度
                },
            });
            this.bannerAd.style.left = (windowWidth - targetBannerAdWidth) / 2;
            this.bannerAd.onLoad(function () {
                    that.bannerAd.show();
                    that.isShow = true;
                    that.times = 0;
                    that.scheduleOnce(function () {
                        that.isShow = false;
                        that.ShowBanner();
                    },30);
            });

            this.bannerAd.onError(err => {
                console.log("banner onError"+err.errCode);
                if(that.times < 5)
                {
                    that.scheduleOnce(function () {
                        that.times++;
                        that.ShowBanner();
                    },5);
                }
            });
        }
    },

    HideBanner:function () {
        if(config.isHasAd && config.channel == "apk"){
            if(cc.sys.platform == cc.sys.DESKTOP_BROWSER) return;
            jsb.reflection.callStaticMethod(config.packName,"DestoryAds","()V");
            return;
        }
        if (cc.sys.platform == cc.sys.DESKTOP_BROWSER) return;
        if (this.bannerAd != null){

            if(config.channel == "oppo"){
                if(config.isOldAd) {
                    this.bannerAd.hide();
                }
                else {
                    this.isShow = false;
                    this.isUserClose = false;
                    this.bannerAd.destroy();
                    this.bannerAd = null;
                }
                return;
            }
            else if(config.channel == "qq") {
                this.bannerAd.offLoad();
                this.bannerAd.offError();
                this.bannerAd.offResize();
            }
            this.bannerAd.destroy();
            this.bannerAd = null;
            this.isShow = false;
            this.isUserClose = false;
        }
    },
    IsCanShowVideo: function(){
        var ret = false;
        if(cc.sys.platform === cc.sys.WECHAT_GAME){
            var current_version = wx.getSystemInfoSync().SDKVersion;
            if (this.compareVersion(current_version, "2.0.4") === -1){
                console.log('=====版本不够2.0.4，视频广告不能用')
            }else{
                ret = true;
            }
        }
        return ret;
    },
    IsCanShowInterstitial: function(){
        var ret = false;
        if(cc.sys.platform === cc.sys.WECHAT_GAME){
            var current_version = "0.0.0";
            if(config.channel == "wx"){
                current_version = wx.getSystemInfoSync().SDKVersion;
                if (this.compareVersion(current_version, "2.6.0") === -1){
                    console.log('=====版本不够2.6.0，插屏广告不能用')
                }else{
                    ret = true;
                }
            }
            else if(config.channel == "qq")
            {
                var current_version = qq.getSystemInfoSync().SDKVersion;
                if (this.compareVersion(current_version, "1.12.0") === -1){
                    console.log('=====版本不够1.12.0，插屏不能用')
                }else{
                    ret = true;
                }
            }
            else if(config.channel == "tt"){
                current_version = tt.getSystemInfoSync().version;
                let appName = tt.getSystemInfoSync().appName;
                let platform = tt.getSystemInfoSync().platform;
                // console.log("app名字："+appName+" 版本："+current_version);
                if(appName != "Toutiao")
                    return false;
                if (this.compareVersion(current_version, "7.6.6") === -1 || platform == "ios"){
                    console.log('=====版本不够7.6.6，插屏广告不能用')
                }else{
                    ret = true;
                }
            }
        }
        return ret;
    },
    compareVersion: function (v1, v2) {//比较版本
        v1 = v1.split('.');
        v2 = v2.split('.');
        var len = Math.max(v1.length, v2.length);
        while (v1.length < len) {
            v1.push('0');
        }
        while (v2.length < len) {
            v2.push('0');
        }
        for (var i = 0; i < len; i++) {
            var num1 = parseInt(v1[i]);
            var num2 = parseInt(v2[i]);
            if (num1 > num2) {
                return 1;
            } else if (num1 < num2) {
                return -1;
            }
        }
        return 0;
    },
    InitInterstitial:function () {
        if(config.isHasAd && config.channel == "apk"){
            if(cc.sys.platform == cc.sys.DESKTOP_BROWSER) return;
            jsb.reflection.callStaticMethod(config.packName,"InitIntAds","()V");
            return;
        }
        if(cc.sys.platform == cc.sys.DESKTOP_BROWSER)return;

        if(config.channel == "oppo"){
            let that = this;
            if(config.isOldAd)
            {
                this.interstitialAd = qg.createInsertAd({
                    posId: '187180'
                });
                this.interstitialAd && this.interstitialAd.load();
                this.interstitialAd && this.interstitialAd.onError(function (res) {
                    that.isLoad = false;//失败
                    console.log("oppo InsertAd:" + res.code + " "+ res.msg);
                });
                this.interstitialAd && this.interstitialAd.onLoad(function () {
                    console.log("oppo InsertAd:load finish");
                    that.isLoad = true;
                })
            }
            else
            {
                this.interstitialAd = qg.createInsertAd({
                    adUnitId: '187180'
                });
                this.interstitialAd && this.interstitialAd.load();
                this.interstitialAd && this.interstitialAd.onError(function (res) {
                    that.isLoad = false;//失败
                    console.log("oppo InsertAd onError:" + res.code + " "+ res.msg);
                });
                this.interstitialAd && this.interstitialAd.onLoad(function () {
                    // console.log("oppo InsertAd:load finish");
                    that.isLoad = true;
                });
                this.interstitialAd && this.interstitialAd.onClose(function () {
                    // console.log("oppo InsertAd:onClose finish");
                    // that.ShowBanner();
                    if(config.homeController && config.channel != "vivo")
                        that.ShowNativeBanner(config.homeController.nativeBanner);
                    if(config.gameController && config.channel != "vivo")
                        that.ShowNativeBanner(config.gameController.nativeBanner);
                    that.insertCloseTimes = config.GetNowTime();
                    that.interstitialAd && that.interstitialAd.load();
                })
            }
            return;
        }
        else if(config.channel == "vivo") return;

        if(!this.IsCanShowInterstitial()) return;
        if(config.channel == "qq"){
            let that = this;
            this.interstitialAd = qq.createInterstitialAd({
                adUnitId: "1d436d46e18216d8a73561ff2d8fbc80"
            });//创建完会自动触发load
            // this.interstitialAd.load().catch((err) => {
            //     console.error('load',err)
            // });
            this.interstitialAd.onLoad(() => {
                // console.log('qq插屏onLoad');
                that.isInitLoadFail = false;
            });
            this.interstitialAd.onClose(() => {
                // console.log('qq插屏onClose');
                that.isInitLoadFail = true;
            });
            this.interstitialAd.onError((e) => {
                // console.log('qq插屏onError', e);
                that.isInitLoadFail = true;
            });
            return;
        }

        if(config.channel == "tt"){
            if(this.interstitialAd){
                this.interstitialAd.destroy();
                this.interstitialAd = null;
            }
            console.log("初始化插屏");
            this.interstitialAd = tt.createInterstitialAd({
                adUnitId: "4g49cfi4l24852agb2"
            });
            // this.interstitialAd.load();
            let that = this;
            this.interstitialAd.onError(err => {
                console.log("插屏onError:"+ err);
                that.isInitLoadFail = true;
            });
            this.interstitialAd.onLoad(function () {
                console.log("插屏onLoad");
                that.isInitLoadFail = false;
            });
            this.interstitialAd.onClose(function () {
                console.log("插屏onClose");
                that.isInitLoadFail = true;
                that.InitInterstitial();
            });
            return;
        }

        // 创建插屏广告实例，提前初始化
        if (wx.createInterstitialAd){
            this.interstitialAd = wx.createInterstitialAd({
                adUnitId: 'adunit-90f6b75cc4dbcacb'
            });
            let that = this;
            this.interstitialAd.onError(err => {
                // console.log("显示插屏onError");
                // console.log(err);
                that.isInitLoadFail = true;
            });
            this.interstitialAd.onLoad(function () {
                // console.log("显示插屏onLoad");
                that.isInitLoadFail = false;
            });
            this.interstitialAd.onClose(function () {
                // console.log("显示插屏onClose");
                that.isInitLoadFail = true;
                that.interstitialAd.load();
            });
        }
    },
    ShowInterstitial:function (type) {
        if(config.isHasAd && config.channel == "apk"){
            if(cc.sys.platform == cc.sys.DESKTOP_BROWSER) return;
            jsb.reflection.callStaticMethod(config.packName,"ShowInt","(I)V",parseInt(type));
            return;
        }
        if(cc.sys.platform == cc.sys.DESKTOP_BROWSER)return;
        if(config.channel == "qq"){
            let that = this;
            if(this.isInitLoadFail == false)
            {
                this.interstitialAd.show().catch((err) => {
                    console.error('qq插屏show失败',err);
                    let res = qq.getSystemInfoSync().system.toLowerCase();
                    if(res.indexOf("ios") != -1){
                        this.interstitialAd.destroy();
                        this.interstitialAd = null;
                        this.InitInterstitial();
                    }
                });
            }
            else
            {
                if(this.interstitialAd)
                {
                    // console.log("qq显示插屏22222222222222");
                    this.interstitialAd.load().catch((err) => {
                        console.error('qq插屏show失败',err)
                    });
                }
                else {
                    // console.log("qq显示插屏33333333333333");
                    this.InitInterstitial();
                }
            }
            return;
        }

        if(config.channel == "oppo"){
            if(this.isLoad  == false)
            {
                if(this.interstitialAd == null)
                    this.InitInterstitial();
                else
                    this.interstitialAd.load();
                return;
            }
            if(config.GetNowTime() - this.insertCloseTimes < 60000)//小于一分钟不显示插屏
                return;

            if(this.insertShowTimes > 8)
                return;

            this.insertShowTimes++;
            config.SetInsertShowTimes(this.insertShowTimes);

            this.HideBanner();
            if(config.homeController)
                this.HideNative(config.homeController.nativeBanner,1);
            if(config.gameController)
                this.HideNative(config.gameController.nativeBanner,1);
            this.interstitialAd && this.interstitialAd.show();
            if(config.isOldAd) {
                this.insertCloseTimes = config.GetNowTime();
            }
            return;
        }
        else if(config.channel == "vivo") {
            console.log("jswrapper:ShowInterstitial");
            this.interstitialAd = qg.createInterstitialAd({
                posId:'ebcd5333f61b4127a816b4c38bc9626c',
                style:{}
            });
            let adShow =  this.interstitialAd.show();
            // 调用then和catch之前需要对show的结果做下判空处理，防止出错（如果没有判空，在平台版本为1052以及以下的手机上将会出现错误）
            adShow && adShow.then(() => {
                // console.log("插屏广告展示成功");

            }).catch((err) => {
                switch (err.code) {
                    case 30003:
                        console.log("jswrapper:新用户7天内不能曝光插屏，请将手机时间调整为7天后，退出游戏重新进入");
                        break;
                    case 30009:
                        console.log("jswrapper:10秒内调用广告次数超过1次，10秒后再调用");
                        break;
                    case 30002:
                        console.log("jswrapper:load广告失败，重新加载广告");
                        break;
                    default:
                        // 参考 https://minigame.vivo.com.cn/documents/#/lesson/open-ability/ad?id=广告错误码信息 对错误码做分类处理
                        console.log("jswrapper:插屏广告展示失败");
                        console.log("jswrapper:" + JSON.stringify(err));
                        break;
                }
            });
            return;
        }

        if(config.channel == "tt"){
            let that = this;
            if(this.interstitialAd)
            {
                this.interstitialAd.show()
                    .then(() => {
                        // console.log('广告显示成功');
                    })
                    .catch(err => {
                        console.log('广告组件出现问题');
                        console.log(err);
                        // 可以手动加载一次
                        that.interstitialAd.load()
                            .then(() => {
                                // console.log('手动加载');
                            });
                    });
            }
            else {
                this.InitInterstitial();
            }
            return;
        }

        if(this.IsCanShowInterstitial() == false && config.channel == "wx") return;

        let that = this;
        if(this.interstitialAd) {
            this.interstitialAd.show()
                .then(() => {
                    // console.log('广告显示成功');
                })
                .catch(err => {
                    console.log('广告组件出现问题', err);
                    // 可以手动加载一次
                    that.interstitialAd.load()
                        .then(() => {
                            // console.log('手动加载成功');
                        });
                });
        }
        else {
            this.InitInterstitial();
        }
    },
    InitVideo:function () {
        if(config.isHasAd && config.channel == "apk"){
            if(cc.sys.platform == cc.sys.DESKTOP_BROWSER) return;
            jsb.reflection.callStaticMethod(config.packName,"InitRewardVideo","()V");
            return;
        }
        if (cc.sys.platform == cc.sys.DESKTOP_BROWSER){return;}

        if(config.channel == "oppo"){

            if(this.videoAd){
                this.videoAd.destroy();
                this.videoAd = null;
            }

            let that = this;
            if(config.isOldAd)
                this.videoAd = qg.createRewardedVideoAd({posId: '187182'});
            else
                this.videoAd = qg.createRewardedVideoAd({adUnitId: '187182'});

            this.videoAd && this.videoAd.onError(function (err) {
                config.isWatchingVideo = false;
                console.log("oppo videoError:" + err.code + " "+ err.msg);
                that.isVideoLoad = false;
            });
            this.videoAd && this.videoAd.load();
            this.videoAd && this.videoAd.onLoad(function () {
                that.isVideoLoad = true;
            });
            this.videoAd && this.videoAd.onClose(res => {
                config.isWatchingVideo = false;
                that.isVideoLoad = false;
                if (res.isEnded) {
                    // 给予奖励
                    config.getReward();
                }
                else {
                    // 播放中途退出，不下发游戏奖励
                    console.log('中途退出');
                }
                that.videoAd && that.videoAd.load();
            });
        }
        else if(config.channel == "vivo") {
            let that = this;
            this.videoAd = qg.createRewardedVideoAd({
                posId: 'a9a70e38e1204f65b672c96f08a29696'
            });
            this.videoAd.onError(err => {
                config.isWatchingVideo = false;
                switch (err.errCode) {
                    case -3:
                        console.log("jswrapper:激励广告加载失败---调用太频繁", JSON.stringify(err));
                        break;
                    case -4:
                        console.log("jswrapper:激励广告加载失败--- 一分钟内不能重复加载", JSON.stringify(err));
                        break;
                    case 30008:
                        // 当前启动来源不支持激励视频广告，请选择其他激励策略
                        break;
                    default:
                        // 参考 https://minigame.vivo.com.cn/documents/#/lesson/open-ability/ad?id=广告错误码信息 对错误码做分类处理
                        console.log("jswrapper:激励广告展示失败")
                        console.log("jswrapper:" + JSON.stringify(err))

                        break;
                }
                that.isVideoLoad = false;
                that.scheduleOnce(function () {
                    that.videoAd.load();
                }, 15);
            });
            this.videoAd.onLoad(() => {
                that.isVideoLoad = true;
                // console.log("jswrapper video onLoad");
            });
            this.videoAd.onClose(res=> {
                config.isWatchingVideo = false;
                that.isVideoLoad = false;
                // that.VideoClose();
                if(config.innerAudioContext){
                    config.innerAudioContext.play();
                    config.innerAudioContext.volume = 1;
                }

                if (res && res.isEnded) {
                    config.getReward();
                } else {
                    // 播放中途退出，不下发游戏奖励
                    console.log('中途退出');
                }
                that.videoAd.load();
            });
            return;
        }
        if (this.videoAd!=null) return;
        if(config.channel == "wx" || config.channel == "tt" || config.channel == "qq")
        {
            if(config.channel == "wx")
            {
                if(this.IsCanShowVideo() == false)
                    return;
                this.videoAd = wx.createRewardedVideoAd({adUnitId: 'adunit-7d0208de7e14ad20'});
            }
            else if(config.channel == "tt") {
                this.videoAd = tt.createRewardedVideoAd({adUnitId: 'iqof2agqaemalt3b8j'});
            }
            else if(config.channel == "qq") {
                this.videoAd = qq.createRewardedVideoAd({
                    adUnitId: 'c6a4442ec9041666f98439d66318b774'
                });
                this.videoAd && this.videoAd.load();
            }
            let that = this;
            this.videoAd.onError(function (err) {
                config.isWatchingVideo = false;
                console.log("视频onError",err);
                that.isVideoLoad = false;
            });
            this.videoAd.onLoad(function (err) {
                that.isVideoLoad = true;
            });
            this.videoAd.onClose(function (res) {
                config.isWatchingVideo = false;
                that.isVideoLoad = false;
                if (res && res.isEnded || res === undefined) {
                    // 给予奖励
                    config.getReward();
                }
                else {
                    // 播放中途退出，不下发游戏奖励
                    console.log('中途退出');
                }
            }.bind(this));
        }
        else if(config.channel == "swan") {
            // console.log("InitVideo");
            this.videoAd = swan.createRewardedVideoAd(
                {
                    adUnitId: '6552760',
                    appSid:'de24049b'
                });
            let that = this;
            this.videoAd.onError(function (err) {
                console.log('激励视频错误'+err.errCode + err.errMsg);
                that.isLoad = false;
            });
            this.videoAd.onLoad(() => {
                // console.log("onload");
                that.isLoad = true;
            });
            this.videoAd.onClose(function (res) {
                that.isLoad = false;
                if (res && res.isEnded || res === undefined) {
                    // 正常播放结束，可以下发游戏奖励
                    config.GetReward(1);
                }
                else {
                    // 播放中途退出，不下发游戏奖励
                    console.log('中途退出');
                }
            }.bind(this));
        }
    },

    ShowVideo:function () {
        if(cc.sys.platform == cc.sys.DESKTOP_BROWSER){
            config.getReward();
            return;
        }
        config.isWatchingVideo = false;
        if(config.isHasAd && config.channel == "apk"){
            jsb.reflection.callStaticMethod(config.packName,"ShowRewardVideo","(I)V",config.videoType);
            return;
        }

        if(config.channel == "oppo"){
            if(this.isVideoLoad == false)
            {
                config.isWatchingVideo = false;
                // if(this.videoAd == null)
                config.homeController.showMessagePop("视频加载失败\n请检查网络或重试");
                    this.InitVideo();
                // else
                //     this.videoAd.load();
                // return;
            }
            this.isVideoLoad = false;
            this.videoAd && this.videoAd.show();
            config.isWatchingVideo = true;
        }
        else if(config.channel == "vivo") {
            this.videoAd.show()
                .then(() => {
                    // console.log('广告显示成功');
                    // that.VideoShow();
                    config.isWatchingVideo = true;
                    if(config.innerAudioContext)
                        config.innerAudioContext.pause();
                })
                .catch(err => {
                    config.isWatchingVideo = false;
                    console.log("jswrapper:激励广告load失败"+JSON.stringify(err));
                    // that.VideoShowFail();
                    config.homeController.showMessagePop("视频加载失败\n请检查网络或重试");
                    // 可以手动加载一次
                    that.videoAd.load()
                        .then(() => {
                            // console.log('手动加载成功');
                        });
                });
        }

        let that = this;
        if(config.channel == "wx" || config.channel == "tt" || config.channel == "qq") {
            if(config.channel == "wx") {
                if(!this.IsCanShowVideo()) {
                    config.isWatchingVideo = false;
                    config.getReward();
                    return;
                }
            }
            if(this.videoAd == null) {
                config.isWatchingVideo = false;
                console.log("广告空");
                this.InitVideo();
                return;
            }
            this.videoAd.show()
                .then(() => {
                    // console.log('广告显示成功');
                    config.isWatchingVideo = true;
                })
                .catch(err => {
                    config.isWatchingVideo = false;
                    console.log('广告组件出现问题', err);
                    // 可以手动加载一次
                    config.homeController.showMessagePop("视频加载失败\n请检查网络或重试");
                    that.videoAd.load()
                        .then(() => {
                            console.log('手动加载成功');
                        });
                });
        }
        else if(config.channel == "swan") {
            if(this.videoAd == null)
            {
                this.InitVideo();
                return;
            }
            this.videoAd.show()
                .then(() => {
                    // console.log('广告显示成功');
                })
                .catch(err => {
                    console.log('广告组件出现问题', err);
                    // 可以手动加载一次
                    that.videoAd.load()
                        .then(() => {
                            console.log('手动加载成功');
                        });
                });
        }
    },

    InitAppBox:function(){
        if(cc.sys.platform === cc.sys.DESKTOP_BROWSER)
            return;
        if(config.isShowAppBox == false)
            return;
        this.appbox = qq.createAppBox({
            adUnitId: "82a2160aef953d369c270f3da6477ca4"
        });
        let that = this;
        this.appbox && this.appbox.load();
        this.appbox.onClose(function () {
            that.appbox && that.appbox.load();
        });
    },
    ShowAppBox:function(){
        if(cc.sys.platform === cc.sys.DESKTOP_BROWSER)
            return;
        console.log(config.isShowAppBox);
        if(config.isShowAppBox == false)
            return;
        if(this.appbox == null) {
            this.InitAppBox();
            return;
        }
        let that = this;
        this.appbox && this.appbox.show().catch(err => {
            that.appbox.load();
        });
    },
    isCanShowAppBox: function(){
        if(cc.sys.platform === cc.sys.DESKTOP_BROWSER)
            return;
        var ret = false;
        if(cc.sys.platform === cc.sys.WECHAT_GAME){
            var current_version = qq.getSystemInfoSync().SDKVersion;
            if (this.compareVersion(current_version, "1.7.0") === -1){
                console.log('=====版本不够1.7.0，AppBox不能用')
            }else{
                ret = true;
            }
        }
        return ret;
    },

    ShowNativeIcon(node){
        if(cc.sys.platform == cc.sys.DESKTOP_BROWSER) return;
        if(config.isShowNative == false) return;
        let that = this;
        if(config.channel == "oppo")
        {
            if(this.nativeIcon)
            {
                this.nativeIcon.destroy();
                this.nativeIcon = null;
            }
            if(config.isOldAd)
            {
                this.nativeIcon = qg.createNativeAd({
                    posId: "192444"
                });
            }
            else {
                this.nativeIcon = qg.createNativeAd({
                    adUnitId: "192444"
                });
            }
        }
        else if(config.channel == "vivo")
        {
            this.nativeIcon = qg.createNativeAd({
                posId: "d8b2f58bc444426ba2787c4bbdd3007a"
            });
        }

        this.nativeIcon.onLoad(function(res) {
            if (res && res.adList){
                let nativeCurrentAd = res.adList.pop();
                config.nativeAdid.icon = nativeCurrentAd.adId;
                cc.loader.load(nativeCurrentAd.icon,function (err,texture) {
                    if(err)
                    {
                        console.log(err);
                        return;
                    }
                    node.active = true;
                    node.getChildByName('icon').getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                });
                that.nativeIcon.reportAdShow({
                    adId: nativeCurrentAd.adId.toString()
                });
            }
        });
        this.nativeIcon.onError(function(err) {
            console.log("onerror");
            console.log(err.errMsg)
            node.active = false;
            node.getChildByName('icon').getComponent(cc.Sprite).spriteFrame = null;
        });
        this.nativeIcon.load();
    },
    ShowNativeBanner(node){
        if(cc.sys.platform == cc.sys.DESKTOP_BROWSER) return;
        if(config.isShowNative == false) return;
        let that = this;
        if(config.channel == "oppo")
        {
            if(this.nativeBanner)
            {
                this.nativeBanner.destroy();
                this.nativeBanner = null;
            }
            if(config.isOldAd)
            {
                this.nativeBanner = qg.createNativeAd({
                    posId: "192446"
                });
            }
            else {
                this.nativeBanner = qg.createNativeAd({
                    adUnitId: "192446"
                });
            }
        }
        else if(config.channel == "vivo")
        {
            this.nativeBanner = qg.createNativeAd({
                posId: "4811774a81b14fa1b53b94559a99dbf7"
            });
        }

        this.nativeBanner.onLoad(function(res) {
            if (res && res.adList){
                let nativeCurrentAd = res.adList.pop();
                // func(nativeCurrentAd.adId,nativeCurrentAd.icon);
                config.nativeAdid.banner = nativeCurrentAd.adId;
                cc.loader.load(nativeCurrentAd.icon,function (err,texture) {
                    if(err)
                    {
                        console.log(err);
                        return;
                    }
                    node.active = true;
                    node.getChildByName('icon').getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                    node.getChildByName('title').getComponent(cc.Label).string = nativeCurrentAd.title;
                    node.getChildByName('desc').getComponent(cc.Label).string = nativeCurrentAd.desc;
                });
                that.nativeBanner.reportAdShow({
                    adId: nativeCurrentAd.adId.toString()
                });
            }
        });
        this.nativeBanner.onError(function(err) {
            console.log("onerror");
            console.log(err.errMsg);
            node.active = false;
            node.getChildByName('icon').getComponent(cc.Sprite).spriteFrame = null;
            node.getChildByName('title').getComponent(cc.Label).string = "";
            node.getChildByName('desc').getComponent(cc.Label).string = "";
            if(config.channel != "vivo")
                that.ShowBanner();
        });
        this.nativeBanner.load();
    },
    ShowNativeInter(node){
        if(cc.sys.platform == cc.sys.DESKTOP_BROWSER) return;
        if(config.isShowNative == false) return;
        if(config.channel == "oppo"){
            this.ShowInterstitial();
            return;
        }
        let that = this;
        if(config.channel == "vivo")
        {
            this.nativeInter = qg.createNativeAd({
                posId: "646c042558bd4652b30bba6e4e2e1581"
            });
        }

        this.nativeInter.onLoad(function(res) {
            if (res && res.adList){
                let nativeCurrentAd = res.adList.pop();
                config.nativeAdid.inter = nativeCurrentAd.adId;
                node.getChildByName('title').getComponent(cc.Label).string = nativeCurrentAd.title;
                node.getChildByName('desc').getComponent(cc.Label).string = nativeCurrentAd.desc;
                node.active = true;
                that.nativeInter.reportAdShow({
                    adId: nativeCurrentAd.adId.toString()
                });
            }
        });
        this.nativeInter.onError(function(err) {
            console.log("onerror");
            console.log(err.errMsg)
            that.ShowInterstitial();
        });
        this.nativeInter.load();
    },
    ShowNativeItem(node){
        if(cc.sys.platform == cc.sys.DESKTOP_BROWSER) return;
        if(config.isShowNative == false) return;
        let that = this;
        if(config.channel == "oppo")
        {
            if(this.nativeItem)
            {
                this.nativeItem.destroy();
                this.nativeItem = null;
            }
            if(config.isOldAd)
            {
                this.nativeItem = qg.createNativeAd({
                    posId: "192699"
                });
            }
            else {
                this.nativeItem = qg.createNativeAd({
                    adUnitId: "192699"
                });
            }
        }
        else if(config.channel == "vivo")
        {
            this.nativeItem = qg.createNativeAd({
                posId: "566f7097a5634b50880d4506f40554e4"
            });
        }

        this.nativeItem.onLoad(function(res) {
            if (res && res.adList){
                let nativeCurrentAd = res.adList.pop();
                // func(nativeCurrentAd.adId,nativeCurrentAd.icon);
                config.nativeAdid.item = nativeCurrentAd.adId;
                cc.loader.load(nativeCurrentAd.icon,function (err,texture) {
                    if(err)
                    {
                        console.log(err);
                        return;
                    }
                    if(config.homeController){
                        config.homeController.nativeItemSize = 250;
                        config.homeController.songScorllView.content.height = (250 * config.homeController.songArray.length) + 200 + 50 + config.homeController.nativeItemSize;
                        config.homeController.initSongItem(config.homeController.songScorllView.getContentPosition(),config.homeController.songScorllView);
                    }
                    node.active = true;
                    node.getChildByName('mask').getChildByName('icon').getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                    node.getChildByName('title').getComponent(cc.Label).string = nativeCurrentAd.title;
                    node.getChildByName('desc').getComponent(cc.Label).string = nativeCurrentAd.desc;
                });
                that.nativeItem.reportAdShow({
                    adId: nativeCurrentAd.adId.toString()
                });
            }
        });
        this.nativeItem.onError(function(err) {
            console.log("onerror");
            console.log(err.errMsg);
            if(config.homeController){
                config.homeController.nativeItemSize = 0;
                config.homeController.songScorllView.content.height = (250 * config.homeController.songArray.length) + 200 + 50 + config.homeController.nativeItemSize;
                config.homeController.initSongItem(config.homeController.songScorllView.getContentPosition(),config.homeController.songScorllView,true);
            }
            node.active = false;
            node.getChildByName('mask').getChildByName('icon').getComponent(cc.Sprite).spriteFrame = null;
            node.getChildByName('title').getComponent(cc.Label).string = "";
            node.getChildByName('desc').getComponent(cc.Label).string = "";
            that.ShowBanner();
        });
        this.nativeItem.load();
    },
    ShowNativeBlade(node){
        if(cc.sys.platform == cc.sys.DESKTOP_BROWSER) return;
        if(config.isShowNative == false) return;
        let that = this;
        if(config.channel == "oppo")
        {
            if(this.nativeBlade)
            {
                this.nativeBlade.destroy();
                this.nativeBlade = null;
            }
            if(config.isOldAd)
            {
                this.nativeBlade = qg.createNativeAd({
                    posId: "192715"
                });
            }
            else {
                this.nativeBlade = qg.createNativeAd({
                    adUnitId: "192715"
                });
            }
        }
        else if(config.channel == "vivo")
        {
            this.nativeBlade = qg.createNativeAd({
                posId: "4811774a81b14fa1b53b94559a99dbf7"
            });
        }

        this.nativeBlade.onLoad(function(res) {
            if (res && res.adList){
                let nativeCurrentAd = res.adList.pop();
                config.nativeAdid.blade = nativeCurrentAd.adId;
                cc.loader.load(nativeCurrentAd.icon,function (err,texture) {
                    if(err)
                    {
                        console.log(err);
                        return;
                    }
                    node.active = true;
                    node.getChildByName('icon').getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                    node.getChildByName('title').getComponent(cc.Label).string = nativeCurrentAd.title;
                    node.getChildByName('desc').getComponent(cc.Label).string = nativeCurrentAd.desc;
                });
                that.nativeBlade.reportAdShow({
                    adId: nativeCurrentAd.adId.toString()
                });
            }
        });
        this.nativeBlade.onError(function(err) {
            console.log("onerror");
            console.log(err.errMsg);
            node.active = false;
            node.getChildByName('icon').getComponent(cc.Sprite).spriteFrame = null;
            node.getChildByName('title').getComponent(cc.Label).string = "";
            node.getChildByName('desc').getComponent(cc.Label).string = "";
        });
        this.nativeBlade.load();
    },
    ShowNativeBlock(node){
        if(cc.sys.platform == cc.sys.DESKTOP_BROWSER) return;
        if(config.isShowNative == false) return;
        let that = this;
        if(config.channel == "oppo")
        {
            if(this.nativeBlock)
            {
                this.nativeBlock.destroy();
                this.nativeBlock = null;
            }
            if(config.isOldAd)
            {
                this.nativeBlock = qg.createNativeAd({
                    posId: "192701"
                });
            }
            else {
                this.nativeBlock = qg.createNativeAd({
                    adUnitId: "192701"
                });
            }
        }
        else if(config.channel == "vivo")
        {
            this.nativeBlock = qg.createNativeAd({
                posId: "4811774a81b14fa1b53b94559a99dbf7"
            });
        }

        this.nativeBlock.onLoad(function(res) {
            if (res && res.adList){
                let nativeCurrentAd = res.adList.pop();
                // func(nativeCurrentAd.adId,nativeCurrentAd.icon);
                config.nativeAdid.block = nativeCurrentAd.adId;
                cc.loader.load(nativeCurrentAd.icon,function (err,texture) {
                    if(err)
                    {
                        console.log(err);
                        return;
                    }
                    node.active = true;
                    node.getChildByName('icon').getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                    node.getChildByName('title').getComponent(cc.Label).string = nativeCurrentAd.title;
                    node.getChildByName('desc').getComponent(cc.Label).string = nativeCurrentAd.desc;
                });
                that.nativeBlock.reportAdShow({
                    adId: nativeCurrentAd.adId.toString()
                });
            }
        });
        this.nativeBlock.onError(function(err) {
            console.log("onerror");
            console.log(err.errMsg);
            node.active = false;
            node.getChildByName('icon').getComponent(cc.Sprite).spriteFrame = null;
            node.getChildByName('title').getComponent(cc.Label).string = "";
            node.getChildByName('desc').getComponent(cc.Label).string = "";
        });
        this.nativeBlock.load();
    },
    HideNative(node,type){
        if(cc.sys.platform == cc.sys.DESKTOP_BROWSER) return;
        if(config.isShowNative == false) return;
        node.active = false;
        if(type == 0){
            if(this.nativeIcon)
            {
                if(config.channel == "oppo")
                    this.nativeIcon.destroy();
                this.nativeIcon = null;
            }
        }
        else if(type == 1){
            if(this.nativeBanner)
            {
                if(config.channel == "oppo")
                    this.nativeBanner.destroy();
                this.nativeBanner = null;
            }
        }
        else if(type == 2){
            if(this.nativeInter)
            {
                if(config.channel == "oppo")
                    this.nativeInter.destroy();
                this.nativeInter = null;
            }
        }
        else if(type == 3){
            if(this.nativeItem)
            {
                if(config.channel == "oppo")
                    this.nativeItem.destroy();
                this.nativeItem = null;
            }
        }
        else if(type == 4){
            if(this.nativeBlade)
            {
                if(config.channel == "oppo")
                    this.nativeBlade.destroy();
                this.nativeBlade = null;
            }
        }
        else if(type == 5){
            if(this.nativeBlock)
            {
                if(config.channel == "oppo")
                    this.nativeBlock.destroy();
                this.nativeBlock = null;
            }
        }
    },
    ClickNative(node,type){
        if(cc.sys.platform == cc.sys.DESKTOP_BROWSER) return;
        if(config.isShowNative == false) return;
        if(parseInt(type) == 0){
            if(this.nativeIcon)
            {
                this.nativeIcon.reportAdClick({
                    adId: config.nativeAdid.icon
                });
                this.ShowNativeIcon(node);
            }
        }
        else if(parseInt(type) == 1){
            if(this.nativeBanner)
            {
                this.nativeBanner.reportAdClick({
                    adId: config.nativeAdid.banner
                });
                this.ShowNativeBanner(node);
            }
        }
        else if(parseInt(type) == 2){
            if(this.nativeInter)
            {
                this.nativeInter.reportAdClick({
                    adId: config.nativeAdid.inter
                });
                this.ShowNativeInter(node);
            }
        }
        else if(parseInt(type) == 3){
            if(this.nativeItem)
            {
                this.nativeItem.reportAdClick({
                    adId: config.nativeAdid.item
                });
                this.ShowNativeItem(node);
            }
        }
        else if(parseInt(type) == 4){
            if(this.nativeBlade)
            {
                this.nativeBlade.reportAdClick({
                    adId: config.nativeAdid.blade
                });
                this.ShowNativeBlade(node);
            }
        }
        else if(parseInt(type) == 5){
            if(this.nativeBlock)
            {
                this.nativeBlock.reportAdClick({
                    adId: config.nativeAdid.block
                });
                this.ShowNativeBlock(node);
            }
        }
    },

});
