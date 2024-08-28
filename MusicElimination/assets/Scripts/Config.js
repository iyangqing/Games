window.config = {
    channel:"web",//改OPPO记得把互推的预制体拉上去,vivo要把原生插屏底图拉上去
    packName:"com/melestudio/DancingBlade/AppActivity",
    isHasAd:true,
    pickId:1,
    recorderFlag:false,
    startRecordTime:null,
    startTime:-1,
    AdsManager:null,
    isShowAppBox:false,
    unlockAll:false,

    isLoadFinish:false,
    isMatInit:false,
   
    url:"",//"https://beat.obs.cn-east-3.myhuaweicloud.com/DancingBlade/",
    audioManager:null,
    songName:null,
    urlName:null,
    songItemController:null,
    musicDuration:120,
    tMiss:3.5,
    difficulty:0,
    homeController:null,
    gameController:null,
    videoType:-1,
    bgType:1,
    // particleIndex:14,
    bladeIndex:14,
    blockIndex:1,
    isIOS:false,
    isTouched:false,
    skinItem:null,
    curBladeItem:null,
    curBlockItem:null,
    songNameByPlaying:null,

    isWatchingVideo:false,
    isOldAd:true,
    isOPPOFirstInit:true,
    isOPPOPush:false,
    innerAudioContext:null,//vivo音频

    isShowNative:true,
    isShowNativeItem:false,
    nativeAdid:{
        icon:null,
        banner:null,
        inter:null,
        item:null,
        blade:null,
        block:null,
    },
    isFirstPlayGame:true,
    isSecondPlayGame:true,

    getReward(){
        //看广告成就
        let achievement = config.getAchievement("Achievement");
        achievement.watchAD = parseInt(achievement.watchAD) + 1;
        config.setAchievement("Achievement",achievement);

        if(this.videoType == 0){
            this.homeController.getDailyReward(2);
        }
        else if(this.videoType == 1){
            //解锁歌曲成就
            console.log("看广告解锁");
            let achievement = config.getAchievement("Achievement");
            achievement.unLockSong = parseInt(achievement.unLockSong) + 1;
            config.setAchievement("Achievement",achievement);

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

            if(this.audioManager)
                this.audioManager.stopAll();
            this.homeController.playGame();
            // this.homeController.loading.active = true;
            // if(this.audioManager)
            //     this.audioManager.stopAll();
            // cc.director.loadScene("GameScene");
        }
        else if(this.videoType == 2){
            if(this.skinItem)
                this.skinItem.onReward();
        }
    },

    random(min,max,maxNum){
        let num = Math.floor(Math.random()*(max+1-min))+min;

        var arr = new Array();
        for(var i = 0; i < num; i++) {
            var n = parseInt(Math.random()*maxNum+0);//随机生成整形数
            if(arr.length == 0) {
                arr.push(n);    //从末尾插入数组
            } else {
                //indexOf判断数组中是否有元素n,如果没有输出-1，如果有输出位置
                if(arr.indexOf(n) < 0) {
                    arr.push(n);
                } else {
                    i--;
                }
            }
        }
        return arr;
    },

    vectorsToDegress: function (dirVec) {
        var angle = Math.atan2((dirVec.y), (dirVec.x));//弧度
        var theta = angle * (180 / Math.PI); //角度

        return theta;
    },

    getlocalStorageNum(name){
        let value = cc.sys.localStorage.getItem(name);
        if (value === null || value === undefined || value === ''){
            value = 0;
            if(name == "RewardTime")
                value = new Date().getTime();
            else if(name == "RewardIndex")
                value = -1;
            cc.sys.localStorage.setItem(name,parseInt(value));
        }

        return parseInt(value);
    },

    setlocalStorageNum(name,value){
        cc.sys.localStorage.setItem(name,parseInt(value));
    },

    getAchievement(name){
        let value = cc.sys.localStorage.getItem(name);
        if (value === null || value === undefined || value === ''){
            let obj = {
                complete:0,
                watchAD:0,
                unLockSong:0,
                score:0,
                combo:0,
                bomb:0
            };
            if(name == "AchievementMax"){
                obj = {
                    complete:1,
                    watchAD:1,
                    unLockSong:3,
                    score:5000000,
                    combo:50,
                    bomb:1
                };
            }
            cc.sys.localStorage.setItem(name,JSON.stringify(obj));
            value = JSON.stringify(obj);
        }
        value = JSON.parse(value);

        return value;
    },

    setAchievement(name,value){
        // console.log(value);
        cc.sys.localStorage.setItem(name,JSON.stringify(value));
        if(this.homeController)
            this.homeController.checkAchievement();
    },

    getSkin(name){
        let value = cc.sys.localStorage.getItem(name);
        if (value === null || value === undefined || value === ''){
            let arr = [0];
            cc.sys.localStorage.setItem(name,JSON.stringify(arr));
            value = arr;
        }
        else {
            value = JSON.parse(value);
        }
        // console.log(value);
        return value;
    },

    setSkin(name,value){
        // console.log(value);
        cc.sys.localStorage.setItem(name,JSON.stringify(value));
    },

    checkSkin(name,ix){
        let arr = this.getSkin(name);
        let isHasKey = false;
        for(let item of arr){
            if(parseInt(item) == parseInt(ix)){
                isHasKey = true;
                break;
            }
        }
        return isHasKey;
    },

    addSkin(name,ix){
        let arr = this.getSkin(name);
        arr.push(parseInt(ix));
        cc.sys.localStorage.setItem(name,JSON.stringify(arr));
    },

    GetNowTime: function GetNowTime() {
        var now = new Date();
        now = now.getTime();
        return now; //ms为单位
    },


    GetBannerCloseTimes:function()
    {
        return cc.sys.localStorage.getItem("BannerCloseTimes");
    },
    SetBannerCloseTimes:function(value)
    {
        cc.sys.localStorage.setItem("BannerCloseTimes", value);
    },
    GetInsertShowTimes:function()
    {
        return cc.sys.localStorage.getItem("InsertShowTimes");
    },
    SetInsertShowTimes:function(value)
    {
        cc.sys.localStorage.setItem("InsertShowTimes", value);
    },
    GetSignInDate:function(){//获取已有的签到日期
        return cc.sys.localStorage.getItem("SignInDate");
    },
    SetSignInDate:function(){
        cc.sys.localStorage.setItem("SignInDate",this.GetCurrentDate());
    },
    GetIsSigIn:function(){
        let date=this.GetSignInDate();
        if (date==null||date==='') return false;
        return date===this.GetCurrentDate();
    },
    GetCurrentDate:function () {//获取当前日期
        let date=new Date();
        let year=date.getFullYear().toString();
        let month=(date.getMonth()+1).toString();
        let day=date.getDate().toString();
        return year + '-' + month + '-' + day;
    },
    GetDateSeparatedDays:function (date1,date2) {
        let dateStrs1=date1.split('-');
        let dateStrs2=date2.split('-');
        let time1=new Date(parseInt(dateStrs1[0]),parseInt(dateStrs1[1])-1,parseInt(dateStrs1[2])).getTime();
        let time2=new Date(parseInt(dateStrs2[0]),parseInt(dateStrs2[1])-1,parseInt(dateStrs2[2])).getTime();
        return Math.abs(time1-time2)/1000/60/60/24;
    },
    GetContinuousSignInDays:function(){
        let date1=this.GetSignInDate();
        if (date1===''||date1==null) return 0;
        let date2=this.GetCurrentDate();
        let separatedDays=this.GetDateSeparatedDays(date1,date2);
        return separatedDays;
    },


    /***************/
    //TODO:根据当前版本判断不同功能是否支持
    /**
     * flag:用于区别不同功能的最低版本判断
     * 0banner 1、插屏 2激励视频 10头条更多游戏 11小程序跳转 12游戏盒子 13微信推荐组件 14插屏的load方法（针对微信）
     */
    IsCanSupportFunc: function(flag) {
        if(cc.sys.platform == cc.sys.DESKTOP_BROWSER)
            return false;
        let current_version = "";
        let minVersion = "";
        var ret = false;
        if(this.systemInfo == null)
        {
            this.GetSystemInfo();
        }
        if(this.channel == "wx")
        {
            current_version = this.systemInfo.SDKVersion;
            if(flag == 0)
            {
                minVersion = "2.0.4";
            }
            else if(flag == 1)
            {
                minVersion = "2.6.0";
            }
            else if(flag == 2)
            {
                minVersion = "2.0.4";
            }
            else if(flag == 10)//头条更多游戏
            {
                return false;
            }
            else if(flag == 11)//小游戏跳转
            {
                minVersion = "2.2.0";
            }
            else if(flag == 12)//游戏盒子
            {
                return false;
            }
            else if(flag == 13)//微信推荐组件
            {
                minVersion = "2.8.3";
            }
            else if(flag == 14)//微信插屏load方法
            {
                minVersion = "2.8.0";
            }
        }
        else if(this.channel == "tt")
        {
            if(flag == 0)
            {
                return true;
            }
            else if(flag == 1)
            {
                current_version = this.systemInfo.version;
                minVersion = "7.6.6";//插屏广告支持的最低平台
                if(this.systemInfo.appName != "Toutiao" || this.GetIsPhone())//暂时只有头条安卓支持插屏
                    return false;
            }
            else if(flag == 2)
            {
                current_version = this.systemInfo.SDKVersion;
                minVersion = "1.3.0";
            }
            else if(flag == 10)
            {
                current_version = this.systemInfo.SDKVersion;
                minVersion = "1.23.0";//更多游戏支持的最低平台
            }
            else if(flag == 11)//小游戏跳转
            {
                return false;
            }
            else if(flag == 12)//游戏盒子
            {
                return false;
            }
            else if(flag == 13)//微信推荐组件
            {
                return false;
            }
        }
        else if(this.channel == "qq")
        {
            if(flag == 0)
            {
                return true;
            }
            else if(flag == 1)
            {
                current_version = this.systemInfo.SDKVersion;
                minVersion = "1.12.0";//插屏广告支持的最低平台
            }
            else if(flag == 2)
            {
                return true;
            }
            else if(flag == 10)
            {
                return false;
            }
            else if(flag == 11)//小游戏跳转
            {
                return false;
            }
            else if(flag == 12)//游戏盒子
            {
                current_version = this.systemInfo.SDKVersion;
                minVersion = "1.7.1";//插屏广告支持的最低平台
            }
            else if(flag == 13)//微信推荐组件
            {
                return false;
            }
        }
        else if(this.channel == "vivo" || this.channel == "oppo" || this.channel == "mi"  || this.channel == "apk")
        {
            if(flag < 3)//rpk支持广告
                return true;
            else
                return false;
        }
        if(this.channel == "wx" || this.channel == "qq" || this.channel == "tt" || this.channel == "swan")
        {
            if (this.compareVersion(current_version, minVersion) === -1){
                console.log('版本太低不支持该功能');
                ret = false;
            }else{
                ret = true;
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
    /****************/

    /*******************/
    //TODO:微信图标，用于推微信自己的游戏，来进行导量
    gameIcon:null,
    CreateGameIcon:function (top) {
        if(this.IsCanSupportFunc(13) == false)
            return;
        top = parseInt(top) - 180;
        this.gameIcon = wx.createGameIcon({
            adUnitId:"PBgAAt8WIoCy3JtI",
            count:4,
            style:[{
                left:40,
                top:top,
                appNameHidden:true,
                color:"#000000",
                size:50,
                borderWidth:1,
                border:"#FFFFFF"
            },{
                left:110,
                top:top,
                appNameHidden:true,
                color:"#000000",
                size:50,
                borderWidth:1,
                border:"#FFFFFF"
            },{
                left:180,
                top:top,
                appNameHidden:true,
                color:"#000000",
                size:50,
                borderWidth:1,
                border:"#FFFFFF"
            },{
                left:250,
                top:top,
                appNameHidden:true,
                color:"#000000",
                size:50,
                borderWidth:1,
                border:"#FFFFFF"
            }]
        }, {
            left:0,
            top:100,
            appNameHidden:true,
            color:"#000000",
            size:50,
            borderWidth:0,
            border:"#000000"
        });
        this.gameIcon.onError(function (res) {
            console.log(res);
        });
        this.gameIcon.show();
    },

    //通用部分
    systemInfo:null,
    //TODO:获取手机的设备信息
    GetSystemInfo()
    {
        if(cc.sys.platform == cc.sys.DESKTOP_BROWSER)
            return null;
        if(this.systemInfo)
            return;
        let info = null;
        if(this.channel == "wx")
        {
            info = wx.getSystemInfoSync();
        }
        else if(this.channel == "tt")
        {
            info = tt.getSystemInfoSync();
        }
        else if(this.channel == "qq")
        {
            info = qq.getSystemInfoSync();
        }
        else if(this.channel == "swan")
        {
            info = swan.getSystemInfoSync();
        }
        else if(this.channel == "oppo")
        {
            info = qg.getSystemInfoSync();
        }
        this.systemInfo = info;
    },
    //TODO:判断是不是苹果手机
    GetIsPhone()
    {
        let flag = false;
        this.GetSystemInfo();
        if(this.systemInfo == null)
            return false;
        if(this.systemInfo.brand == "iPhone")
            flag = true;
        return flag;
    },
};