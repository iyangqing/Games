let BeatGameController = require('BeatGameController');
cc.Class({
    extends: cc.Component,

    properties: {
        gameController:BeatGameController,
        dx0:0,
        dy0:0,
        dir:0,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // start () {
    //
    // },

    init(script){
        this.gameController = script;
    },

    // update (dt) {},
    onCollisionEnter: function (other, self) {
        if(this.gameController)
            this.gameController.Remove(other.node, this.dir);
    },


    onCollisionStay(other, self){
        if(this.gameController)
            this.gameController.Remove(other.node, this.dir);
    },

    onCollisionExit: function (other, self) {

    }
});
