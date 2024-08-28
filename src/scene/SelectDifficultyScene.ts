import { GameState } from "../type/GameState";
export class SelectDifficultyScene extends Phaser.Scene {
  constructor() {
    super("selectDifficulty");
  }

  preload() {
    this.load.image('easy', 'assets/easy.png');
    this.load.image('hard', 'assets/hard.png');
    this.load.image('veryhard', 'assets/veryhard.png');
  }

  private addMode(x:number, y:number, imgWidth:number, imgHeight:number,  mode:"easy"|"hard"|"veryhard") {
    const { width, height } = this.game.canvas;
    const gameState:GameState = {
      player: "0",
      gameMode: "solo",
      difficulty: mode,
      boadState: Array(3).fill(Array(3).fill(Array(3).fill(Array(3).fill("-")))),
      metaBoadState: Array(3).fill(Array(3).fill("-"))
    };
    return this.add.image(width/2 + x, height/2 + y, mode)
    .setDisplaySize(imgWidth, imgHeight)
    .setInteractive({
      useHandCursor: true
    })
    .on('pointerdown', () => {
      this.scene.start('main', gameState);
    });
  }

  create() {
    const { width, height } = this.game.canvas;
    const background = this.add.image(width/2, height/2, 'background').setDisplaySize(width, height);

    this.addMode(0, 170, 450*0.8, 200*0.8, "easy");
    this.add.text(this.game.canvas.width/2, this.game.canvas.height/2 + 182, 'EASY', {fontSize: 30, fontFamily: "Zen Maru Gothic", color: "#000"}).setOrigin(0.5);

    this.addMode(0, 0, 512*0.8, 200*0.8, "hard");
    this.add.text(this.game.canvas.width/2, this.game.canvas.height/2+4 , 'HARD', {fontSize: 30, fontFamily: "Zen Maru Gothic", color: "#000"}).setOrigin(0.5);

    this.addMode(0, -170, 512*0.8, 210*0.8, "veryhard");
    this.add.text(this.game.canvas.width/2, this.game.canvas.height/2 - 161, 'VERYHARD', {fontSize: 30, fontFamily: "Zen Maru Gothic", color: "#000"}).setOrigin(0.5);

  }
}