export class SelectDifficultyScene extends Phaser.Scene {
  constructor() {
    super("selectDifficulty");
  }
  preload() {
    this.load.image('easy', 'assets/solo.png');
    this.load.image('hard', 'assets/solo.png');
    this.load.image('veryhard', 'assets/solo.png');
  }

  create() {
    const { width, height } = this.game.canvas;

    function addMode(scene:Phaser.Scene,x:integer, y:integer,  mode:"easy"|"hard"|"veryhard") {
      return scene.add.image(width/2 + x, height/2 + y, mode)
      .setDisplaySize(300, 300)
      .setInteractive({
        useHandCursor: true
      })
      .on('pointerdown', () => {
        scene.scene.start('main', { gameMode: 'solo' , difficulty: mode});
      });
    }
    
    const easyMode = addMode(this, 0, 200, "easy");

    const hardMode = addMode(this, 0, 0, "hard");

    const veryhardMode = addMode(this, 0, -200, "veryhard");

  }
}