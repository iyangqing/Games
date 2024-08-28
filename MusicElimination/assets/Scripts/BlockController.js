cc.Class({
    extends: cc.Component,

    properties: {
        pic:cc.Sprite,
        bombSprite:cc.SpriteFrame,
        dirSprite0:[cc.SpriteFrame],
        dirSprite1:[cc.SpriteFrame],
        dirSprite2:[cc.SpriteFrame],
        dirSprite3:[cc.SpriteFrame],
        dirSprite4:[cc.SpriteFrame],
        dirSprite5:[cc.SpriteFrame],
        dirSprite6:[cc.SpriteFrame],
        dirSprite7:[cc.SpriteFrame],
        dirSprite8:[cc.SpriteFrame],
        dirSprite9:[cc.SpriteFrame],
        dirSprite10:[cc.SpriteFrame],
        isCanTouch:false,
        isPerfect:false,
        isBomb:false,
        shadow:cc.Node,
        Anim:cc.Animation,
        curSprite:null,
        // blockSpriteFrame:[cc.SpriteFrame],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // this.pic.spriteFrame = this.blockSpriteFrame[config.getlocalStorageNum("blockIndex")];
    },

    // start () {
    //     this.isCanTouch = false;
    // },

    unuse() {
        // console.log("回收block");
        // this.Anim.sample("HitSign");
        this.curSprite = null;
        this.Anim.setCurrentTime(0);
        this.Anim.stop();
        this.shadow.opacity = 255;
        this.isCanTouch = false;
        this.isPerfect = false;
        this.isBomb = false;
        // this.node.parent = null;
        this.node.position = cc.v3(-2000,-2000,0);
        this.node.scale = 0.2;
        this.pic.spriteFrame = null;
        this.setFlip(false);
    },

    reuse(parent,pos,scale,dir) {
        // cc.log(this.pic.spriteFrame);
        this.init(parent,pos,scale,dir);
    },

    init(parent,pos,scale,dir){
        // console.log("生成block");
        // this.missPic.spriteFrame = null;
        this.node.name = "block";
        this.pic.spriteFrame = null;
        this.isCanTouch = false;
        this.isPerfect = false;
        this.isBomb = false;
        this.node.parent = parent;
        this.node.position = pos;
        this.node.scale = scale;
        this.shadow.scaleY = scale;
        this.shadow.pos = cc.v3(0,-160,0);
        this.shadow.opacity = 255;

        if(config.blockIndex == 0)
            this.curSprite = this.dirSprite0;
        else if(config.blockIndex == 1)
            this.curSprite = this.dirSprite1;
        else if(config.blockIndex == 2)
            this.curSprite = this.dirSprite2;
        else if(config.blockIndex == 3)
            this.curSprite = this.dirSprite3;
        else if(config.blockIndex == 4)
            this.curSprite = this.dirSprite4;
        else if(config.blockIndex == 5)
            this.curSprite = this.dirSprite5;
        else if(config.blockIndex == 6)
            this.curSprite = this.dirSprite6;
        else if(config.blockIndex == 7)
            this.curSprite = this.dirSprite7;
        else if(config.blockIndex == 8)
            this.curSprite = this.dirSprite8;
        else if(config.blockIndex == 9)
            this.curSprite = this.dirSprite9;
        else if(config.blockIndex == 10)
            this.curSprite = this.dirSprite10;

        // dir = 9;
        if(dir == 9){
            this.isBomb = true;
            this.pic.spriteFrame = this.bombSprite;
            // this.isCanTouch = true;
        }else {
            if(dir < 5 && dir > 1)
                this.setFlip(true);

            if(dir > 5)
                this.pic.spriteFrame = this.curSprite[10 - dir];
            else
                this.pic.spriteFrame = this.curSprite[dir];
            // if(config.blockIndex == 0)
            //     this.pic.spriteFrame = this.dirSprite0[dir];
            // else if(config.blockIndex == 1)
            //     this.pic.spriteFrame = this.dirSprite1[dir];
            // else if(config.blockIndex == 2)
            //     this.pic.spriteFrame = this.dirSprite2[dir];
            // else if(config.blockIndex == 3)
            //     this.pic.spriteFrame = this.dirSprite3[dir];
            // else if(config.blockIndex == 4)
            //     this.pic.spriteFrame = this.dirSprite4[dir];
            // else if(config.blockIndex == 5)
            //     this.pic.spriteFrame = this.dirSprite5[dir];
            // else if(config.blockIndex == 6)
            //     this.pic.spriteFrame = this.dirSprite6[dir];
            // else if(config.blockIndex == 7)
            //     this.pic.spriteFrame = this.dirSprite7[dir];
            // else if(config.blockIndex == 8)
            //     this.pic.spriteFrame = this.dirSprite8[dir];
            // else if(config.blockIndex == 9)
            //     this.pic.spriteFrame = this.dirSprite9[dir];
            // else if(config.blockIndex == 10)
            //     this.pic.spriteFrame = this.dirSprite10[dir];

        }

        // let self = this;
        // this.scheduleOnce(function () {
        //     self.isCanTouch = true;
        //     self.Anim.play();
        // },2);
    },

    setFlip(flip) {
        this.pic.node.scaleX = flip ? -2 : 2;
    },

    setHitLight(){
        if(this.isCanTouch) return;
        if(!this.isBomb)
            this.Anim.play();
        this.isCanTouch = true;
    },

    // update (dt) {},
});
