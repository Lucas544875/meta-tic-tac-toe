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

    const soloMode = this.add
    .image(width/2-150, height/2, 'solo')
    .setDisplaySize(300, 300);
    soloMode.on('pointerdown', () => {
      this.scene.start('main', { timelineID: 'start' });
    }).setInteractive({
      useHandCursor: true
    });

    const duoMode = this.add
    .image(width/2+150, height/2, 'duo')
    .setDisplaySize(300, 300);
    duoMode.on('pointerdown', () => {
      this.scene.start('main', { timelineID: 'start' });
    }).setInteractive({
      useHandCursor: true
    });
    
  }
}
