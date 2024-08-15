export class SelectDifficultyScene extends Phaser.Scene {
  constructor() {
    super("selectDifficulty");
  }
  preload() {
  }

  create() {
    const { width, height } = this.game.canvas;
    function addmode(this:Phaser.Scene, mode:string) {
      this.add.image(width/2, height/2, )
      .setDisplaySize(300, 300);
    }
    const easyMode = this.add
  }
}