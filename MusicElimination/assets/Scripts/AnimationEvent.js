
let GameState = {
    ready : 0,
    playing:1,
    pause:2,
    finished:3
};

cc.Class({
    extends: cc.Component,

    onCountDownEnd(){
        if(config.gameController != null){
            this.node.active = false;
            config.gameController._isAnimPlaying = false;
            config.gameController.startGame();
        }
    },

    destroyNode(){
        this.node.destroy();
    },

    stopMusic(){
      if(config.audioManager && config.channel != "oppo"  && config.channel != "apk"){
          if(config.innerAudioContext)
              config.innerAudioContext.stop();
          config.audioManager.stopAll();
      }
    },
});
