export class SelectDifficultyScene extends Phaser.Scene {
  constructor() {
    super("selectDifficulty");
  }

  preload() {
    this.load.image('easy', 'assets/solo.png');
    this.load.image('hard', 'assets/solo.png');
    this.load.image('veryhard', 'assets/solo.png');
  }

  private addMode(x:number, y:number, mode:"easy"|"hard"|"veryhard") {
    const { width, height } = this.game.canvas;
    return this.add.image(width/2 + x, height/2 + y, mode)
    .setDisplaySize(300, 300)
    .setInteractive({
      useHandCursor: true
    })
    .on('pointerdown', () => {
      this.scene.start('main', { gameMode: 'solo' , difficulty: mode});
    });
  }

  create() {
    this.addMode(0, 200, "easy");
    this.addMode(0, 0, "hard");
    this.addMode(0, -200, "veryhard");
  }
}