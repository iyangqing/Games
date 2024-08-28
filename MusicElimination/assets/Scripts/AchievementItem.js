cc.Class({
    extends: cc.Component,

    properties: {
        index:0,//0完成关卡1看广告2解锁歌曲3得分4连击5炸弹
        value:0,
        max:0,
        coinLabel:cc.Label,
        valueLabel:cc.Label,
        introduceLabel:cc.Label,
        btnNode:cc.Node,
        doneNode:cc.Node,
        coinNode:cc.Node,
        blueBladeNode:cc.Node,
        pianoBladeNode:cc.Node,
    },

//     start(){
//         this.init();
//     },

    onEnable(){
        this.init();
    },

    init(){
        this.achievement = config.getAchievement("Achievement");
        this.achievementMax = config.getAchievement("AchievementMax");
        if(this.index == 0){
            this.value = parseInt(this.achievement.complete);
            this.max = parseInt(this.achievementMax.complete);
            this.introduceLabel.string = "完成" + this.max + "首歌曲";

            if(this.max == 1){
                this.coinNode.active = false;
                this.blueBladeNode.active = true;
            }
            else if(this.max == 5){
                this.blueBladeNode.active = false;
                this.coinNode.active = true;
                this.coinLabel.string = 50
            }
            else if(this.max == 10){
                this.blueBladeNode.active = false;
                this.coinNode.active = true;
                this.coinLabel.string = 100;
            }
            else if(this.max == 20){
                this.blueBladeNode.active = false;
                this.coinNode.active = true;
                this.coinLabel.string = 200;
            }
            else if(this.max == 30){
                this.blueBladeNode.active = false;
                this.coinNode.active = true;
                this.coinLabel.string = 300;
            }
            else if(this.max == 50){
                this.blueBladeNode.active = false;
                this.coinNode.active = true;
                this.coinLabel.string = 500;
            }
            else if(this.max == 100){
                this.blueBladeNode.active = false;
                this.coinNode.active = true;
                this.coinLabel.string = 1000;
            }
            else {
                this.introduceLabel.string = "完成100首歌曲";
                this.blueBladeNode.active = false;
                this.coinNode.active = true;
                this.coinLabel.string = 1000;
            }

        }
        else if(this.index == 1){
            this.value = parseInt(this.achievement.watchAD);
            this.max = parseInt(this.achievementMax.watchAD);
            this.introduceLabel.string = "观看" + this.max + "次广告";

            if(this.max == 1)
                this.coinLabel.string = 100;
            else if(this.max == 3)
                this.coinLabel.string = 150;
            else if(this.max == 5)
                this.coinLabel.string = 200;
            else if(this.max == 10)
                this.coinLabel.string = 250;
            else if(this.max == 20)
                this.coinLabel.string = 300;
            else if(this.max == 30)
                this.coinLabel.string = 350;
            else {
                this.introduceLabel.string = "观看30次广告";
                this.coinLabel.string = 350;
            }

        }
        else if(this.index == 2){
            this.value = parseInt(this.achievement.unLockSong);
            this.max = parseInt(this.achievementMax.unLockSong);
            this.introduceLabel.string = "解锁" + this.max + "首歌曲";

            if(this.max == 3)
                this.coinLabel.string = 50;
            else if(this.max == 5)
                this.coinLabel.string = 50;
            else if(this.max == 10)
                this.coinLabel.string = 100;
            else if(this.max == 15)
                this.coinLabel.string = 100;
            else if(this.max == 20)
                this.coinLabel.string = 200;
            else if(this.max == 25)
                this.coinLabel.string = 200;
            else if(this.max == 30)
                this.coinLabel.string = 300;
            else if(this.max == 35)
                this.coinLabel.string = 300;
            else {
                this.introduceLabel.string = "解锁35首歌曲";
                this.coinLabel.string = 300;
            }

        }
        else if(this.index == 3){
            this.value = parseInt(this.achievement.score);
            this.max = parseInt(this.achievementMax.score);
            this.introduceLabel.string = "累计获得" + this.max + "分";

            if(this.max == 5000000)
                this.coinLabel.string = 50;
            else if(this.max == 10000000)
                this.coinLabel.string = 100;
            else if(this.max == 30000000)
                this.coinLabel.string = 200;
            else if(this.max == 50000000)
                this.coinLabel.string = 500;
            else if(this.max == 100000000)
                this.coinLabel.string = 1000;
            else if(this.max == 200000000){
                this.coinNode.active = false;
                this.pianoBladeNode.active = true;
            }else {
                this.introduceLabel.string = "累计获得200000000分";
                this.coinNode.active = false;
                this.pianoBladeNode.active = true;
            }

        }
        else if(this.index == 4){
            this.value = parseInt(this.achievement.combo);
            this.max = parseInt(this.achievementMax.combo);
            this.introduceLabel.string = "达成" + this.max + "次连击";

            if(this.max == 50)
                this.coinLabel.string = 100;
            else if(this.max == 100)
                this.coinLabel.string = 200;
            else if(this.max == 150)
                this.coinLabel.string = 300;
            else if(this.max == 200)
                this.coinLabel.string = 400;
            else if(this.max == 250)
                this.coinLabel.string = 500;
            else {
                this.introduceLabel.string = "达成250次连击";
                this.coinLabel.string = 500;
            }

        }
        else if(this.index == 5){
            this.value = parseInt(this.achievement.bomb);
            this.max = parseInt(this.achievementMax.bomb);
            this.introduceLabel.string = "触发" + this.max + "次炸弹";

            if(this.max == 1)
                this.coinLabel.string = 50;
            else if(this.max == 5)
                this.coinLabel.string = 100;
            else if(this.max == 10)
                this.coinLabel.string = 150;
            else if(this.max == 20)
                this.coinLabel.string = 200;
            else if(this.max == 50)
                this.coinLabel.string = 250;
            else {
                this.introduceLabel.string = "触发50次炸弹";
                this.coinLabel.string = 250;
            }
        }

        this.valueLabel.string = this.value + "/" + this.max;
        if(this.max <= this.value && this.max != 0){
            this.doneNode.active = false;
            this.btnNode.active = true;
            this.btnNode.color = cc.color("#FFFFFF");
        }
        else if(this.max > this.value && this.max != 0){
            this.doneNode.active = false;
            this.btnNode.active = true;
            this.btnNode.color = cc.color("#303030");
        }
        else if(this.max == 0){
            this.valueLabel.string = "";
            this.btnNode.active = false;
            this.doneNode.active = true;
        }
    },

    onBtnEvent(){
        if(config.audioManager)
            config.audioManager.playEffectSound("btn",false);
        if(this.max > this.value || this.max == 0) return;
        let name = null;
        if(this.index == 0){
            if(this.max == 1){
                config.addSkin("Blade",4);//解锁蓝色刀锋
                config.homeController.bladeScroll.content.children[4].getComponent("SkinItem").init();
                this.max = 5;
                name = "蓝色刀锋";
            }
            else if(this.max == 5){
                config.homeController.coin += 50;
                this.max = 10;
                name = "50金币";
            }
            else if(this.max == 10){
                config.homeController.coin += 100;
                this.max = 20;
                name  = "100金币";
            }
            else if(this.max == 20){
                config.homeController.coin += 200;
                this.max = 30;
                name  = "200金币";
            }
            else if(this.max == 30){
                config.homeController.coin += 300;
                this.max = 50;
                name  = "300金币";
            }
            else if(this.max == 50){
                config.homeController.coin += 500;
                this.max = 100;
                name  = "500金币";
            }
            else if(this.max == 100){
                config.homeController.coin += 1000;
                this.max = 0;
                name  = "1000金币";
            }
            this.achievementMax = config.getAchievement("AchievementMax");
            this.achievementMax.complete = parseInt(this.max);
            config.setAchievement("AchievementMax",this.achievementMax);
            this.init();
        }
        else if(this.index == 1){
            if(this.max == 1){
                config.homeController.coin += 100;
                this.max = 3;
                name  = "100金币";
            }
            else if(this.max == 3){
                config.homeController.coin += 150;
                this.max = 5;
                name  = "150金币";
            }
            else if(this.max == 5){
                config.homeController.coin += 200;
                this.max = 10;
                name  = "200金币";
            }
            else if(this.max == 10){
                config.homeController.coin += 250;
                this.max = 20;
                name  = "250金币";
            }
            else if(this.max == 20){
                config.homeController.coin += 300;
                this.max = 30;
                name  = "300金币";
            }
            else if(this.max == 30){
                config.homeController.coin += 350;
                this.max = 0;
                name  = "350金币";
            }
            this.achievementMax = config.getAchievement("AchievementMax");
            this.achievementMax.watchAD = parseInt(this.max);
            config.setAchievement("AchievementMax",this.achievementMax);
            this.init();
        }
        else if(this.index == 2){
            if(this.max == 3){
                config.homeController.coin += 50;
                this.max = 5;
                name  = "50金币";
            }
            else if(this.max == 5){
                config.homeController.coin += 50;
                this.max = 10;
                name  = "50金币";
            }
            else if(this.max == 10){
                config.homeController.coin += 100;
                this.max = 15;
                name  = "100金币";
            }
            else if(this.max == 15){
                config.homeController.coin += 100;
                this.max = 20;
                name  = "100金币";
            }
            else if(this.max == 20){
                config.homeController.coin += 200;
                this.max = 25;
                name  = "200金币";
            }
            else if(this.max == 25){
                config.homeController.coin += 200;
                this.max = 30;
                name  = "200金币";
            }
            else if(this.max == 30){
                config.homeController.coin += 300;
                this.max = 35;
                name  = "300金币";
            }
            else if(this.max == 35){
                config.homeController.coin += 300;
                this.max = 0;
                name  = "300金币";
            }
            this.achievementMax = config.getAchievement("AchievementMax");
            this.achievementMax.unLockSong = parseInt(this.max);
            config.setAchievement("AchievementMax",this.achievementMax);
            this.init();
        }
        else if(this.index == 3){
            if(this.max == 5000000){
                config.homeController.coin += 50;
                this.max = 10000000;
                name  = "50金币";
            }
            else if(this.max == 10000000){
                config.homeController.coin += 100;
                this.max = 30000000;
                name  = "100金币";
            }
            else if(this.max == 30000000){
                config.homeController.coin += 200;
                this.max = 50000000;
                name  = "200金币";
            }
            else if(this.max == 50000000){
                config.homeController.coin += 500;
                this.max = 100000000;
                name  = "500金币";
            }
            else if(this.max == 100000000){
                config.homeController.coin += 1000;
                this.max = 200000000;
                name  = "1000金币";
            }
            else if(this.max == 200000000){
                config.addSkin("Blade",10);//解锁钢琴师
                config.homeController.bladeScroll.content.children[10].getComponent("SkinItem").init();
                this.max = 0;
                name  = "钢琴师";
            }
            this.achievementMax = config.getAchievement("AchievementMax");
            this.achievementMax.score = parseInt(this.max);
            config.setAchievement("AchievementMax",this.achievementMax);
            this.init();
        }
        else if(this.index == 4){
            if(this.max == 50){
                config.homeController.coin += 100;
                this.max = 100;
                name  = "100金币";
            }
            else if(this.max == 100){
                config.homeController.coin += 200;
                this.max = 150;
                name  = "200金币";
            }
            else if(this.max == 150){
                config.homeController.coin += 300;
                this.max = 200;
                name  = "300金币";
            }
            else if(this.max == 200){
                config.homeController.coin += 400;
                this.max = 250;
                name  = "400金币";
            }
            else if(this.max == 250){
                config.homeController.coin += 500;
                this.max = 0;
                name  = "500金币";
            }
            this.achievementMax = config.getAchievement("AchievementMax");
            this.achievementMax.combo = parseInt(this.max);
            config.setAchievement("AchievementMax",this.achievementMax);
            this.init();
        }
        else if(this.index == 5){
            if(this.max == 1){
                config.homeController.coin += 50;
                this.max = 5;
                name  = "50金币";
            }
            else if(this.max == 5){
                config.homeController.coin += 100;
                this.max = 10;
                name  = "100金币";
            }
            else if(this.max == 10){
                config.homeController.coin += 150;
                this.max = 20;
                name  = "150金币";
            }
            else if(this.max == 20){
                config.homeController.coin += 200;
                this.max = 50;
                name  = "200金币";
            }
            else if(this.max == 50){
                config.homeController.coin += 250;
                this.max = 0;
                name  = "250金币";
            }
            this.achievementMax = config.getAchievement("AchievementMax");
            this.achievementMax.bomb = parseInt(this.max);
            config.setAchievement("AchievementMax",this.achievementMax);
            this.init();
        }

        config.homeController.messageType = 0;
        let msg = "获得" + name;
        config.homeController.showMessagePop(msg);
    },

});
