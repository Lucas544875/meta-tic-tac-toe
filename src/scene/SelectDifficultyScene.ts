import { GameState } from "../type/GameState";
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
    const gameState:GameState = {
      player: "0",
      gameMode: "solo",
      difficulty: mode,
      boadState: Array(3).fill(Array(3).fill(Array(3).fill(Array(3).fill("-")))),
      metaBoadState: Array(3).fill(Array(3).fill("-"))
    };
    return this.add.image(width/2 + x, height/2 + y, mode)
    .setDisplaySize(300, 300)
    .setInteractive({
      useHandCursor: true
    })
    .on('pointerdown', () => {
      this.scene.start('main', gameState);
    });
  }

  create() {
    this.addMode(0, 200, "easy");
    this.addMode(0, 0, "hard");
    this.addMode(0, -200, "veryhard");
  }
}