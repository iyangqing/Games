let flashLightJS = require('FlashLight');
let self = null;

let GameState = {
    ready : 0,
    playing:1,
    pause:2,
    finished:3
};

var BlockController = require('BlockController');

cc.Class({
    extends: cc.Component,

    properties: {
        slicingline:cc.Node,
        guideNode:cc.Node,
        messagePop:cc.Node,
        anim:cc.Animation,
        helpLabel:cc.Label,
        shakeNode:cc.Node,
        audioSoure:cc.AudioSource,
        blockPrefab:cc.Prefab,
        blockParent:cc.Node,
        bombPrefab:cc.Prefab,
        cutParticlePrefab:cc.Prefab,
        cutParticlePrefab2:cc.Prefab,
        cutParticleParent:cc.Node,
        glowCircles:[cc.Node],
        flashLightNode:cc.Node,
        flashLightLeft:null,
        flashLightRight:null,
        blockBornEffect:cc.Prefab,

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

        particles:[cc.Node],

        mtId:[],

        missAnim:cc.Animation,
        greatAnim:cc.Animation,
        perfectAnim:cc.Animation,

        _isAnimPlaying:false,
    },

    onLoad(){
        cc.director.loadScene("HomeScene");
        self = this;
        // this.messagePop.active = false;
        // this.wOffset = (cc.winSize.height/cc.winSize.width) / (1920/1080);
        // this.glowCircles[0].parent.scale = this.glowCircles[0].parent.scale / this.wOffset;
        // this.animName = "step1";
        // this.slicingline.scaleX = 1.5 / this.wOffset;
    },

    // start () {
    //     //初始化
    //     if(config.getlocalStorageNum("Guide") > 0){
    //         cc.director.loadScene("HomeScene");
    //         return;
    //     }
    //     else
    //         this.guideNode.active = true;
    //     this.beatsInfo = new Array();
    //     this._isAnimPlaying = false;
    //     this.gameState = GameState.ready;
    //     this.t = 0;
    //
    //     this.tMiss = 3 * this.wOffset;
    //     this.tLife = this.tMiss + 0.5; //miss显示的时间是0.5秒
    //     this.tHit = this.tMiss * 0.86; //精确点击是在方块生命周期中的位置
    //     this.hitOffest = this.tMiss * 0.04;
    //
    //     this.x0 = 56 / this.wOffset;// 如果背景图变化，这个需要跟着变化
    //     this.y0 = 590;
    //     this.scale0 = 0.23 / this.wOffset;
    //     this.maxScale = 1.25 / this.wOffset;
    //
    //     let x = Math.pow(this.maxScale / this.scale0,2);
    //     this.hCam = 0;
    //     this.minD = 400;
    //     this.maxD = Math.sqrt((this.hCam * this.hCam + this.minD * this.minD) * x - this.hCam * this.hCam);
    //     // console.log("d = [" + this.minD + "..." + this.maxD + "]");
    //
    //     this.yMiss = -600;  //方块消失时候的一些参数
    //     this.xMiss = 350 / this.wOffset;
    //     this.yMiss = - (cc.winSize.height / 2);
    //     this.scaleMiss = 1.3;
    //
    //     this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
    //     this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved, this);
    //     this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnded, this);
    //     this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnded, this);
    //     this.InitFlashLight();
    //     this.showFlashLight();
    //     this.showGlow();
    //     this.InitBeatsInfo();
    // },
    //
    // InitBeatsInfo() {
    //     this.beatsInfo = new Array();
    //     let beat = new Object();
    //     beat.timeStamp = parseFloat(5);
    //     beat.track = parseInt(1);
    //     beat.direction = parseInt(0);
    //     this.beatsInfo.push(beat);
    //     this.InitMusic();
    // },
    //
    // InitMusic() {
    //     //游戏开始
    //     this.t = 0;
    //     this.gameState = GameState.playing;
    //     this.nextBeatIndex = 0;
    //     let manager = cc.director.getCollisionManager();
    //     manager.enabled = true;
    //     this.helpLabel.string = "滑动消除方块";
    // },
    //
    // onMusicFinishEvent(){
    //     // console.log("onMusicFinishEvent");
    //     this.anim.stop();
    //     for(let item of this.anim.node.children){
    //         item.opacity = 0;
    //     }
    //     this.helpLabel.node.opacity = 255;
    //     this.helpLabel.string = "";
    //     this.showMessagePop("太棒了！！\n教程结束，游戏正式开始！");
    //     // this.helpLabel.string = "太棒了！！\n教程结束，游戏正式开始！";
    //     config.setlocalStorageNum("Guide",1);
    //     this.scheduleOnce(function () {
    //         cc.director.loadScene("HomeScene");
    //     },3);
    // },
    //
    // showMessagePop(msg,callback){
    //     this.messagePop.getChildByName("pop").getComponentInChildren(cc.Label).string = msg;
    //     this.messagePop.active = true;
    //     if (callback && typeof callback === "function")
    //         callback();
    // },
    //
    // hideMessagePop(){
    //     cc.director.loadScene("HomeScene");
    //     // this.messagePop.active = false;
    // },
    //
    // onSkipBtnEvent(){
    //     if(config.audioManager)
    //         config.audioManager.playEffectSound("btn",false);
    //     this.gameState = GameState.pause;
    //     this._isAnimPlaying = false;
    //     this.anim.stop();
    //     config.setlocalStorageNum("Guide",1);
    //     cc.director.loadScene("HomeScene");
    // },
    //
    // update (ddt) {
    //     if(this.gameState == GameState.playing) {
    //         let t0 = this.t;
    //         this.t += ddt;
    //         //更新当前的block
    //         for(let ixBeat = this.firstBeatIndex; ixBeat < this.nextBeatIndex; ixBeat++)
    //         {
    //             let beat = this.beatsInfo[ixBeat];
    //             let dt = this.t - beat.timeStamp + this.tHit;
    //             let block = beat.node;
    //
    //             if(block == null || block == undefined || block.active == false){
    //                 continue;
    //             }
    //
    //             if(dt > 0 && dt < this.tMiss)
    //             {
    //                 let d = this.maxD + (this.minD - this.maxD)/this.tMiss * dt;
    //
    //                 let scale = this.scale0 * Math.sqrt(this.maxD * this.maxD + this.hCam * this.hCam) / Math.sqrt(d*d + this.hCam * this.hCam);
    //
    //                 let xx = (this.x0 + (this.xMiss - this.x0) * (scale - this.scale0) / (this.maxScale - this.scale0)) * (beat.track - 1);
    //                 let yy = this.y0 + (this.yMiss - this.y0) * (scale - this.scale0) / (this.maxScale - this.scale0);
    //                 let yyShadow = -180 + (-140 - -180) * (scale - this.scale0) / (this.maxScale - this.scale0);
    //                 block.position = new cc.Vec3(xx, yy, 0);
    //                 block.scale = scale;
    //                 block.getChildByName("Shadow").scaleY = scale;
    //                 block.getChildByName("Shadow").position = cc.v3(0,yyShadow,0);
    //                 if(dt >= (this.tHit - this.tMiss + 1) && !this._isAnimPlaying){
    //                     this.anim.play(this.animName);
    //                     this._isAnimPlaying = true;
    //                 }
    //                 if(dt >= this.tHit - 1)
    //                     block.getComponent(BlockController).setHitLight();
    //
    //                 if(dt >= this.tHit - this.hitOffest && dt <= this.tHit + this.hitOffest){
    //                     block.getComponent(BlockController).isPerfect = true;
    //                 }else {
    //                     block.getComponent(BlockController).isPerfect = false;
    //                 }
    //             }
    //             else if(dt > this.tMiss && dt - ddt < this.tMiss && beat.miss == false)
    //             {
    //                 //显示为miss
    //                 if(block.scaleX < 0)
    //                     block.scaleX = -block.scaleX;
    //                 block.getComponent(BlockController).isCanTouch = false;
    //                 block.getComponent(BlockController).pic.spriteFrame = null;
    //                 block.getChildByName("Shadow").opacity = 0;
    //             }
    //             else if(dt > this.tLife)
    //             {
    //                 this._blockPool.put(block);
    //                 beat.node = null;
    //
    //                 if(this.firstBeatIndex == 0){
    //                     let beat = new Object();
    //                     beat.timeStamp = parseFloat(this.t+this.tMiss);
    //                     beat.track = parseInt(1);
    //                     beat.direction = parseInt(0);
    //                     this.beatsInfo.push(beat);
    //                 }
    //                 else if(this.firstBeatIndex == 1){
    //                     let beat = new Object();
    //                     beat.timeStamp = parseFloat(this.t+this.tMiss);
    //                     beat.track = parseInt(1);
    //                     beat.direction = parseInt(3);
    //                     this.beatsInfo.push(beat);
    //                 }
    //                 else if(this.firstBeatIndex == 2){
    //                     let beat = new Object();
    //                     beat.timeStamp = parseFloat(this.t+this.tMiss);
    //                     beat.track = parseInt(1);
    //                     beat.direction = parseInt(7);
    //                     this.beatsInfo.push(beat);
    //                 }
    //                 else if(this.firstBeatIndex == 3){
    //                     this.gameState = GameState.finished;
    //                     this.onMusicFinishEvent();
    //                 }
    //             }
    //         }
    //
    //         //如果需要，增加新的block
    //         if(this.nextBeatIndex < this.beatsInfo.length && this.t + this.tHit + 0.1> this.beatsInfo[this.nextBeatIndex].timeStamp + 0.1)
    //         {
    //             let beat = this.beatsInfo[this.nextBeatIndex];
    //             let effect = cc.instantiate(this.blockBornEffect);
    //             effect.parent = this.blockParent;
    //             effect.position = new cc.Vec3(this.x0 * (beat.track - 1), this.y0, 0);
    //         }
    //         if(this.nextBeatIndex < this.beatsInfo.length && this.t + this.tHit > this.beatsInfo[this.nextBeatIndex].timeStamp)
    //         {
    //             let beat = this.beatsInfo[this.nextBeatIndex];
    //             let pos = cc.v3(this.x0 * (beat.track - 1), this.y0, 0);
    //             let dirIndex = beat.direction;
    //             let block = this.newBlockNode(pos,this.scale0,dirIndex);
    //             block.zIndex = this.beatsInfo.length - this.nextBeatIndex;
    //             beat.node = block;
    //             beat.miss = false;
    //
    //             this.nextBeatIndex++;
    //         }
    //     }
    // },
    //
    // newBlockNode(pos,scale,dir){
    //     let newNode = null;
    //     if (!this._blockPool) {
    //         this._blockPool = new cc.NodePool(BlockController);
    //     }
    //     if (this._blockPool.size() > 0) {
    //         newNode = this._blockPool.get(this.blockParent,pos,scale,dir);
    //     } else {
    //         newNode = cc.instantiate(this.blockPrefab);
    //         newNode.parent = this.blockParent;
    //         newNode.getComponent(BlockController).init(this.blockParent,pos,scale,dir);
    //     }
    //     return newNode;
    // },
    //
    // onTouchBegan:function(event) {
    //     if(this.gameState == GameState.finished) return;
    //     if (event == null || event.touch == null)
    //         return;
    //     if (this.mtId.indexOf(event.getID()) == -1 && this.mtId.length < this.particles.length) {
    //         this.mtId.push(event.getID());
    //     }
    //     let touchIdIndex = this.mtId.indexOf(event.getID());
    //     if(touchIdIndex === -1) return;
    //     this.particles[touchIdIndex].getComponent("TouchController").dir = 0;
    //     this.particles[touchIdIndex].position = this.node.parent.convertToNodeSpaceAR(event.touch.getLocation());
    //     this.particles[touchIdIndex].getComponent(cc.MotionStreak).enabled = true;
    // },
    //
    // onTouchMoved:function(event) {
    //     if(this.gameState == GameState.finished) return;
    //     if (event == null || event.touch == null)
    //         return;
    //     let touchIdIndex = this.mtId.indexOf(event.getID());
    //     if(touchIdIndex === -1) return;
    //     this.setTouchDir(touchIdIndex,config.vectorsToDegress(event.touch.getDelta()));
    //     this.particles[touchIdIndex].getComponent(cc.MotionStreak).enabled = true;
    //     this.particles[touchIdIndex].position = this.node.parent.convertToNodeSpaceAR(event.touch.getLocation());
    // },
    //
    // onTouchEnded:function(event) {
    //     let touchIdIndex = this.mtId.indexOf(event.getID());
    //     if(touchIdIndex === -1) return;
    //     if(touchIdIndex != -1) {
    //         this.mtId.splice(touchIdIndex, 1);
    //     }
    //     for (let ix = 0; ix < this.particles.length; ix++){
    //         this.particles[ix].getComponent("TouchController").dir = 0;
    //         this.particles[ix].getComponent(cc.MotionStreak).enabled = false;
    //         this.particles[ix].position = new cc.Vec3(-2000, -5000, 0);
    //     }
    // },
    //
    // setTouchDir(ix,angle){
    //     if(angle <= 10 && angle >= -10){
    //         this.particles[ix].getComponent("TouchController").dir = 7;
    //     }
    //     else if (angle >= 80 && angle <= 100){
    //         this.particles[ix].getComponent("TouchController").dir = 5;
    //     }
    //     else if (angle <= -80 && angle >= -100){
    //         this.particles[ix].getComponent("TouchController").dir = 1;
    //     }
    //     else if (angle > 30 && angle < 60){
    //         this.particles[ix].getComponent("TouchController").dir = 6;
    //     }
    //     else if (angle < -30 && angle > -60){
    //         this.particles[ix].getComponent("TouchController").dir = 8;
    //     }
    //     else if (angle > 120 && angle < 150){
    //         this.particles[ix].getComponent("TouchController").dir = 4;
    //     }
    //     else if (angle < -120 && angle > -150){
    //         this.particles[ix].getComponent("TouchController").dir = 2;
    //     }
    //     else if (angle >= 170 || angle <= -170){
    //         this.particles[ix].getComponent("TouchController").dir = 3;
    //     }
    // },
    //
    // Remove:function(block, direction) {
    //     if(this.gameState != GameState.playing) return;
    //     for(let ixBeat = this.firstBeatIndex; ixBeat < this.nextBeatIndex; ixBeat++) {
    //         let beat = this.beatsInfo[ixBeat];
    //         let block0 = beat.node;
    //
    //         if(block == block0) {
    //             if(!block.getComponent(BlockController).isCanTouch) return;
    //             if(block.getComponent(BlockController).isBomb){
    //                 let newNode = cc.instantiate(this.bombPrefab);
    //                 newNode.parent = this.cutParticleParent;
    //                 newNode.position = block.position;
    //                 this.shakeEffect();
    //                 this._blockPool.put(block);
    //                 beat.node = null;
    //                 if(this.firstBeatIndex == 3){
    //                     let beat = new Object();
    //                     beat.timeStamp = parseFloat(this.t+this.tMiss);
    //                     beat.track = parseInt(1);
    //                     beat.direction = parseInt(9);
    //                     this.beatsInfo.push(beat);
    //                 }
    //             }
    //             else {
    //                 if(beat.direction == 0 || beat.direction == direction) {
    //                     this.showGrade(block);
    //                     this.newCutParticle(block.position,this.cutParticleParent,direction);
    //                     this.showFlashLight();
    //                     this.showGlow();
    //                     this._blockPool.put(block);
    //                     beat.node = null;
    //                     this.firstBeatIndex++;
    //
    //                     if(this.firstBeatIndex == 1){
    //                         let beat = new Object();
    //                         beat.timeStamp = parseFloat(this.t+this.tMiss);
    //                         beat.track = parseInt(1);
    //                         beat.direction = parseInt(3);
    //                         this.beatsInfo.push(beat);
    //                         this._isAnimPlaying = false;
    //                         this.anim.stop();
    //                         for(let item of this.anim.node.children){
    //                             item.opacity = 0;
    //                         }
    //                         this.helpLabel.node.opacity = 0;
    //                         this.helpLabel.string = "向左切";
    //                         this.animName = "step2"
    //                     }
    //                     else if(this.firstBeatIndex == 2){
    //                         let beat = new Object();
    //                         beat.timeStamp = parseFloat(this.t+this.tMiss);
    //                         beat.track = parseInt(1);
    //                         beat.direction = parseInt(7);
    //                         this.beatsInfo.push(beat);
    //                         this._isAnimPlaying = false;
    //                         this.anim.stop();
    //                         for(let item of this.anim.node.children){
    //                             item.opacity = 0;
    //                         }
    //                         this.helpLabel.node.opacity = 0;
    //                         this.helpLabel.string = "向右切";
    //                         this.animName = "step1"
    //                     }
    //                     else if(this.firstBeatIndex == 3){
    //                         let beat = new Object();
    //                         beat.timeStamp = parseFloat(this.t+this.tMiss);
    //                         beat.track = parseInt(1);
    //                         beat.direction = parseInt(9);
    //                         this.beatsInfo.push(beat);
    //                         this._isAnimPlaying = false;
    //                         this.anim.stop();
    //                         for(let item of this.anim.node.children){
    //                             item.opacity = 0;
    //                         }
    //                         this.helpLabel.node.opacity = 0;
    //                         this.helpLabel.string = "不要切！！";
    //                         this.animName = "step3"
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // },
    //
    // showGrade(block){
    //     if(block.getComponent(BlockController).isPerfect){
    //         this.perfectAnim.play();
    //     }
    //     else{
    //         this.greatAnim.play();
    //     }
    // },
    //
    // showGlow(){
    //     cc.tween(this.node).stop();
    //     cc.tween(self.node)
    //         .call(() => { self.glowCircles[0].getComponent("Glow").Show(); })
    //         .delay(0.05)
    //         .call(() => {
    //             self.glowCircles[1].getComponent("Glow").Show();
    //             self.glowCircles[2].getComponent("Glow").Show(); })
    //         .delay(0.05)
    //         .call(() => { self.glowCircles[3].getComponent("Glow").Show(); })
    //         .start();
    // },
    //
    // newCutParticle(pos,parent,direction){
    //     let newNode = null;
    //     if(direction == 1 || direction == 5 || direction == 0)
    //         newNode = cc.instantiate(this.cutParticlePrefab2);
    //     else
    //         newNode = cc.instantiate(this.cutParticlePrefab);
    //     if(direction == 2 || direction == 6){
    //         let x = Math.floor(Math.random()*(35+1-25))+25;
    //         newNode.angle = x;
    //     }
    //     else if(direction == 4 || direction == 8){
    //         let x = Math.floor(Math.random()*(35+1-25))+25;
    //         newNode.angle = -x;
    //     }
    //     else if(direction == 3 || direction == 7){
    //         let x = Math.floor(Math.random()*(3+1+3))-3;
    //         newNode.angle = x;
    //     }
    //     newNode.getComponent("CutParticle").init(pos,parent);
    // },
    //
    // InitFlashLight(){
    //     let offset = cc.winSize.width/1080;
    //     let left = this.flashLightNode.getChildByName("left");
    //     let right = this.flashLightNode.getChildByName("right");
    //     let angle0 = left.getChildByName("mask").angle / this.wOffset;
    //     let pos0 = left.getChildByName("mask").position;
    //     left.getChildByName("mask").angle = angle0;
    //     left.getChildByName("mask").position = cc.v3(pos0.x * offset, pos0.y,0);
    //     let angle1 = right.getChildByName("mask").angle  / this.wOffset;
    //     let pos1 = right.getChildByName("mask").position;
    //     right.getChildByName("mask").angle = angle1;
    //     right.getChildByName("mask").position = cc.v3(pos1.x * offset, pos1.y,0);
    //     this.flashLightLeft = new Array();
    //     this.flashLightRight = new Array();
    //     this.flashLightLeft = left.getComponentsInChildren(flashLightJS);
    //     this.flashLightRight = right.getComponentsInChildren(flashLightJS);
    //     for(let item of this.flashLightLeft){
    //         item.node.angle = -angle0;
    //     }
    //     for(let item of this.flashLightRight){
    //         item.node.angle = -angle1;
    //     }
    // },
    //
    // showFlashLight(){
    //     let arrLeft = config.random(2,4,this.flashLightLeft.length);
    //     let arrRight = config.random(2,4,this.flashLightRight.length);
    //     for(let ix of arrLeft){
    //         this.flashLightLeft[ix].Show();
    //     }
    //     for(let ix of arrRight){
    //         this.flashLightRight[ix].Show();
    //     }
    // },
    //
    // shakeEffect() {
    //     var shakeY = 20;//初始震动距离
    //     var sv = cc.v2(0,shakeY);
    //     this.shakeNode.stopAllActions();
    //     cc.tween(this.shakeNode)
    //         .to(0.02,{position:sv.rotate(Math.PI / 4 * (0 * 3) % 8)})
    //         .to(0.02,{position:sv.rotate(Math.PI / 4 * (1 * 3) % 8)})
    //         .to(0.02,{position:sv.rotate(Math.PI / 4 * (2 * 3) % 8)})
    //         .to(0.02,{position:sv.rotate(Math.PI / 4 * (3 * 3) % 8)})
    //         .to(0.02,{position:sv.rotate(Math.PI / 4 * (4 * 3) % 8)})
    //         .to(0.02,{position:sv.rotate(Math.PI / 4 * (5 * 3) % 8)})
    //         .to(0.02,{position:sv.rotate(Math.PI / 4 * (6 * 3) % 8)})
    //         .to(0.02,{position:sv.rotate(Math.PI / 4 * (7 * 3) % 8)})
    //         .to(0.02,{position:cc.v3(0,0,0)})
    //         .start();
    //
    //     setTimeout(() => {
    //         // cc.tween(this.shakeNode).stop();
    //         this.shakeNode.stopAllActions();
    //         this.shakeNode.position = cc.v3(0,0,0);
    //     }, 0.2*1000);
    // },
});
