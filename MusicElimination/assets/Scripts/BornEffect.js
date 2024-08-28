
cc.Class({
    extends: cc.Component,

    // properties: {
    //     anim:cc.Animation,
    //     particle:cc.ParticleSystem,
    // },
    //
    // unuse() {
    //     this.pool = null;
    //     this.node.parent = null;
    //     this.node.position = cc.v3(-2000,-2000,0);
    // },
    //
    // reuse(parent,pos,pool) {
    //     this.init(parent,pos,pool);
    // },
    //
    // init(parent,pos,pool){
    //     this.pool = pool;
    //     this.node.parent = parent;
    //     this.node.position = pos;
    //     this.anim.play();
    // },

    DestorySelf(){
        this.node.destroy();
        // this.pool.put(this.node);
    },
});
