
cc.Class({
    extends: cc.Component,

    properties: {
        Anim:cc.Animation,
        particleGroup:[cc.ParticleSystem],
        // meshes:[cc.Mesh],
        // materials:[cc.Material],
        // meshRenderer:[cc.MeshRenderer],
    },

    // onLoad(){
    //     // for(let i = 0; i < this.meshRenderer.length; i++){
    //     //     this.meshRenderer[i].setMaterial(0,this.materials[config.blockIndex]);
    //     //     this.meshRenderer[i].mesh =  this.meshes[config.blockIndex];
    //     // }
    // },


    unuse() {
        // console.log("回收block");
        // this.Anim.sample("HitSign");
        this.Anim.setCurrentTime(0);
        this.Anim.stop();
        this.node.angle = 0;
    },

    reuse(pos,parent,direction,ix) {
        // cc.log(this.pic.spriteFrame);
        this.init(pos,parent,direction,ix);
    },


    init(pos,parent,direction,ix){

        if(direction == 2 || direction == 6){
            let x = Math.floor(Math.random()*(35+1-25))+25;
            this.node.angle = x;
        }
        else if(direction == 4 || direction == 8){
            let x = Math.floor(Math.random()*(35+1-25))+25;
            this.node.angle = -x;
        }
        else if(direction == 3 || direction == 7){
            let x = Math.floor(Math.random()*(3+1+3))-3;
            this.node.angle = x;
        }

        this.name = "cutParticle";
        this.node.parent = parent;
        this.node.position = pos;
        this.Anim.play();
        for (let p of this.particleGroup) {
            p.resetSystem();
        }

        let self = this;
        if(ix == 1){
            this.scheduleOnce(function () {
                config.gameController._cutParticlePool.put(self.node);
            },0.45);
        }
        else {
            this.scheduleOnce(function () {
                config.gameController._cutParticlePool2.put(self.node);
            },0.25);
        }
    },

    // update (dt) {},
});
