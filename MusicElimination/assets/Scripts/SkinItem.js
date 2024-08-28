let SkinType={
    blade:0,
    block:1,
};
let mta = require('mta_analysis');
cc.Class({
    extends: cc.Component,

    properties: {
        skinType:{
            default: SkinType.blade,
            type: cc.Enum(SkinType)
        },
        isHasSkin:false,
        index:0,
        coin:0,
        btnNode:cc.Node,
        selectOn:cc.SpriteFrame,
        selectOff:cc.SpriteFrame,
        unlockNode:cc.Node,

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    onEnable(){
        this.init();
    },

    start () {
        if (this.skinType == SkinType.blade && config.channel == "tt" && this.index == 14){
            this.node.active = false;
        }
    },

    // update (dt) {},

    init() {
        if (this.skinType == SkinType.blade) {
            this.isHasSkin = config.checkSkin("Blade", parseInt(this.index));
            if (config.bladeIndex == this.index){
                this.btnNode.getComponent(cc.Sprite).spriteFrame = this.selectOn;
                config.curBladeItem = this;
            }
            else
                this.btnNode.getComponent(cc.Sprite).spriteFrame = this.selectOff;
        }
        else {
            this.isHasSkin = config.checkSkin("Block", parseInt(this.index));
            if (config.blockIndex == this.index){
                this.btnNode.getComponent(cc.Sprite).spriteFrame = this.selectOn;
                config.curBlockItem = this;
            }
            else
                this.btnNode.getComponent(cc.Sprite).spriteFrame = this.selectOff;
        }
        this.btnNode.active = this.isHasSkin;
        this.unlockNode.active = !this.isHasSkin;
        if(!this.isHasSkin){
            if(this.coin == 0){
                //看广告
                if(config.isHasAd)
                    this.unlockNode.children[0].active = true;
                else {
                    this.coin = 200;
                    this.unlockNode.children[1].active = true;
                    this.unlockNode.children[1].getComponentInChildren(cc.Label).string = this.coin;
                }
            }
            else if(this.coin > 0) {
                this.unlockNode.children[1].active = true;
                this.unlockNode.children[1].getComponentInChildren(cc.Label).string = this.coin;
            }
            else {
                //成就
                this.btnNode.active = false;
                this.unlockNode.active = false;
            }
        }

    },

    onSelect(){
        if(config.audioManager)
            config.audioManager.playEffectSound("btn",false);
        if(!this.isHasSkin){
            if(this.coin == 0){
                if(config.isHasAd){
                    config.skinItem = this;
                    config.videoType = 2;
                    config.AdsManager.ShowVideo();
                }
            }
            else if(this.coin > 0){
                let coin = config.getlocalStorageNum("Coin") - this.coin;
                if(coin >= 0){
                    config.homeController.coin = coin;
                    config.homeController.showMessagePop("购买成功");
                    this.onReward();
                }
                else {
                    config.homeController.showMessagePop("金币不足");
                }
            }
            return;
        }


        if(this.skinType == SkinType.blade){
            if(config.bladeIndex == this.index) return;
            config.curBladeItem.btnNode.getComponent(cc.Sprite).spriteFrame = this.selectOff;
            config.bladeIndex = this.index;
            config.setlocalStorageNum("bladeIndex",config.bladeIndex);
            this.btnNode.getComponent(cc.Sprite).spriteFrame = this.selectOn;
            config.curBladeItem = this;
            if(config.isMatInit){
                mta.Event.stat("onskinsclect", {"blade":this.index.toString()});
            }
        }
        else{
            if(config.blockIndex == this.index) return;
            config.curBlockItem.btnNode.getComponent(cc.Sprite).spriteFrame = this.selectOff;
            config.blockIndex = this.index;
            config.setlocalStorageNum("blockIndex",config.blockIndex);
            this.btnNode.getComponent(cc.Sprite).spriteFrame = this.selectOn;
            config.curBlockItem = this;
            if(config.isMatInit){
                mta.Event.stat("onskinsclect", {"block":this.index.toString()});
            }
        }
    },

    onReward(){
        this.isHasSkin = true;
        this.btnNode.active = this.isHasSkin;
        this.unlockNode.active = false;

        if(this.skinType == SkinType.blade){
            config.addSkin("Blade",this.index);
            config.curBladeItem.btnNode.getComponent(cc.Sprite).spriteFrame = this.selectOff;
            config.bladeIndex = this.index;
            config.setlocalStorageNum("bladeIndex",config.bladeIndex);
            this.btnNode.getComponent(cc.Sprite).spriteFrame = this.selectOn;
            config.curBladeItem = this;
            if(config.isMatInit){
                mta.Event.stat("onskinsclect", {"blade":this.index.toString()});
            }
        }
        else{
            config.addSkin("Block",this.index);
            config.curBlockItem.btnNode.getComponent(cc.Sprite).spriteFrame = this.selectOff;
            config.blockIndex = this.index;
            config.setlocalStorageNum("blockIndex",config.blockIndex);
            this.btnNode.getComponent(cc.Sprite).spriteFrame = this.selectOn;
            config.curBlockItem = this;
            if(config.isMatInit){
                mta.Event.stat("onskinsclect", {"block":this.index.toString()});
            }
        }
    },
});
