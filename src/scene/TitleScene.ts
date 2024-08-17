export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  preload() {
    // this.load.image('robot', 'assets/robot.png');
    // this.load.image('logo', 'assets/phaser3-logo.png');
    this.load.image('solo', 'assets/solo.png');
    this.load.image('duo', 'assets/duo.png');
  }

  create() {
    const { width, height } = this.game.canvas;

    // 一人で遊ぶモード
    const soloMode = this.add
    .image(width/2+150, height/2, 'solo')
    .setDisplaySize(300, 300);
    soloMode.on('pointerdown', () => {
      this.scene.start('selectDifficulty');
    }).setInteractive({
      useHandCursor: true
    });

    // 二人で遊ぶモード
    const duoMode = this.add
    .image(width/2-150, height/2, 'duo')
    .setDisplaySize(300, 300);
    duoMode.on('pointerdown', () => {
      this.scene.start('main', { gameMode: 'duo' });
    }).setInteractive({
      useHandCursor: true
    });
    
  }
}
