let that;
//let gameBoxAppId='wx58a797c282ee15f8';
cc.Class({
    extends: cc.Component,

    properties: {
        tryButtonSprite:{default:null,type:cc.Sprite},
        tryBtnImage:{default:[],type:cc.SpriteFrame},
        appName:{
            default:[],
            type:cc.String,
        },
        num:2,
    },
    onLoad(){
        that=this;

        this.curTimes = 0;
        this.targetTime = 60;
        this.single = 1/this.num;
        this.GenerateRandNum();
    },
    GenerateRandNum:function()
    {
        this.randRum = Math.random();
        for(let i=0;i<this.num;i++)
        {
            let max = this.single * (i+ 1);
            if(i == (this.num - 1))
            {
                max = 1;
            }
            //   console.log(this.randRum,this.max);
            if(this.randRum < max)
            {
                this.currentName = this.appName[i];
                this.tryButtonSprite.spriteFrame = this.tryBtnImage[i];
                break;
            }
        }
    },
    RandomJumpApplet:function () {
        let that = this;
        qg.navigateToMiniGame({
            pkgName: that.currentName,
            success: function(){
            },
            fail: function(res){
                console.log(JSON.stringify(res));
            }
        });
    },
    update:function(dt)
    {
        this.curTimes += dt;
        if(this.curTimes > this.targetTime)
        {
            this.GenerateRandNum();
            this.targetTime += 60;
        }
    }
});
