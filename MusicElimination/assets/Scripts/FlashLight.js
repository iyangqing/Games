
cc.Class({
    extends: cc.Component,

    properties: {
        isGlowing:false,
        // lightMaterial:cc.Material,
        times:2,
        lightWidth:0,
        r:1,
        g:1,
        b:1,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.r = (84 / 255);
        this.g = (104 / 255);
        this.b = (255 / 255);
        this.times = 3.5;
        this.node.opacity = 180;
        this.lightWidth = 0.1;
        this.lightMaterial = this.node.getComponent(cc.RenderComponent).getMaterial(0);
        this.lightMaterial.setProperty("lightWidth",0);
        this.lightMaterial.setProperty("lightColor",cc.v4(this.r,this.g,this.b,1));
        this.lightMaterial.setProperty("lightCenterPoint",cc.v2(0.5,1.0));
        this.lightMaterial.setProperty("lightAngle",0.82);
    },

    Show(){
        if(this.isGlowing)
            return;
        let range = Math.random()*0.6;
        if(config.bgType == 0){
            this.b = (255 / 255);
            this.g = (50+(255-50)*range)/255;
            this.r = (180+(255-180)*range)/255;
        }
        else if(config.bgType == 1){
            this.b = (255 / 255);
            this.g = (104+(255-84)*range)/255;
            this.r = (84+(255-104)*range)/255;
        }

        this.lightMaterial.setProperty("lightColor",cc.v4(this.r,this.g,this.b,1));
        this.lightWidth = 0;
        this.node.opacity = 180;
        this.lightMaterial.setProperty("lightWidth",this.lightWidth);
        this.isGlowing = true;
    },

    update (dt) {
        if(this.isGlowing){
            if(this.lightWidth < 1){
                this.lightWidth += dt * this.times * 1;
                this.lightMaterial.setProperty("lightWidth",this.lightWidth);
            }
            else {
                this.lightWidth = 1;
                this.node.opacity -= dt * (this.times * 1.5) * 180;
                if(this.node.opacity < 30){
                    this.node.opacity = 0;
                    this.isGlowing = false;
                }
            }
        }
    },
});
