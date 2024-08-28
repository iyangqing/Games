
cc.Class({
    extends: cc.Component,

    properties: {
        isGlowing:false,
        glowMaterial:cc.Material,
        materialAlpha:0,
        times:6,
        r:1,
        g:1,
        b:1,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.r = (255 / 255);
        this.g = (255 / 255);
        this.b = (255 / 255);
        this.times = 5;
        this.node.opacity = 0;
        this.materialAlpha = 0;
        this.materialAlphaEnd = 1;
        this.glowMaterial = this.node.getComponent(cc.RenderComponent).getMaterial(0);
        this.glowMaterial.setProperty("glowColorSize",0.002);
        this.glowMaterial.setProperty("glowColor",cc.v4(this.r,this.g,this.b,this.materialAlpha));
        this.glowMaterial.setProperty("glowThreshold",1);
    },

    start () {

    },

    Show(){
        this.node.opacity = 0;
        this.materialAlpha = 0;
        this.materialAlphaEnd = 1;
        this.glowMaterial.setProperty("glowColor",cc.v4(this.r,this.g,this.b,this.materialAlpha));
        this.isGlowing = true;
    },

    update (dt) {
        if(this.isGlowing){
            if(this.materialAlpha < 1){
                this.materialAlpha += dt * this.times;
                this.node.opacity += dt * this.times * 255;
                this.glowMaterial.setProperty("glowColor",cc.v4(this.r,this.g,this.b,this.materialAlpha));
            }
            else {
                this.materialAlpha = 1;
                this.materialAlphaEnd -= dt * this.times;
                this.node.opacity -= dt * this.times * 255;
                this.glowMaterial.setProperty("glowColor",cc.v4(this.r,this.g,this.b,this.materialAlphaEnd));
                // this.node.opacity --;
                // console.log(this.node.opacity);
                if(this.node.opacity < 30){
                    this.isGlowing = false;
                    this.node.opacity = 0;
                }
            }
        }
        // if(!this.isGlowing){
        //     this.materialAlpha += dt * 1.5;
        //     if(this.materialAlpha < 1){
        //         // console.log("透明度："+this.materialAlpha);
        //         this.glowMaterial.setProperty("glowColor",cc.v4(0.28,0.77,1,this.materialAlpha));
        //     }
        //     else {
        //         this.materialAlpha = 1;
        //         this.glowMaterial.setProperty("glowColor",cc.v4(0.28,0.77,1,this.materialAlpha));
        //         this.isGlowing = true;
        //     }
        // }
        // else {
        //     this.materialAlpha -= dt * 1.5;
        //     if(this.materialAlpha > 0){
        //         // console.log("透明度："+this.materialAlpha);
        //         this.glowMaterial.setProperty("glowColor",cc.v4(0.28,0.77,1,this.materialAlpha));
        //     }
        //     else {
        //         this.materialAlpha = 0;
        //         this.glowMaterial.setProperty("glowColor",cc.v4(0.28,0.77,1,this.materialAlpha));
        //         this.isGlowing = false;
        //     }
        // }
    },
});
