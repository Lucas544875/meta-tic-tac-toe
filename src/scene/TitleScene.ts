import { GameState } from "../type/GameState";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  // preload() {
  //   this.load.image('gamemode', 'assets/gamemode.png');
  //   this.load.image('background', 'assets/background.png');
  // }

  create() {
    const { width, height } = this.game.canvas;
    const background = this.add.image(width/2, height/2, 'background').setDisplaySize(width, height);
    const logo = this.add.image(width/2, 230, 'logo').setDisplaySize(980*0.5, 800*0.5);
    
    const baseLine = height*4/5
    // 一人で遊ぶモード
    const soloMode = this.add
    .image(width/2-150, baseLine, 'gamemode')
    .setDisplaySize(350, 350*166/512);
    soloMode.on('pointerdown', () => {
      this.scene.start('selectDifficulty');
    }).setInteractive({
      useHandCursor: true
    });
    const soloText = this.add.text(width/2-150, baseLine+2, 'CPUと対戦', {fontSize: 30, fontFamily: "Zen Maru Gothic", color: "#FFF"}).setOrigin(0.5);

    // 二人で遊ぶモード
    const gameState:GameState = {
      player: "0",
      gameMode: "duo",
      difficulty: null,
      boadState: Array(3).fill(Array(3).fill(Array(3).fill(Array(3).fill("-")))),
      metaBoadState: Array(3).fill(Array(3).fill("-"))
    };

    const duoMode = this.add
    .image(width/2+150, baseLine, 'gamemode')
    .setDisplaySize(350, 350*166/512);
    duoMode.on('pointerdown', () => {
      this.scene.start('main', gameState);
    }).setInteractive({
      useHandCursor: true
    });
    const duoText = this.add.text(width/2+150, baseLine+2, '二人で対戦', {fontSize: 30, fontFamily: "Zen Maru Gothic", color: "#FFF"}).setOrigin(0.5);
    
  }
}
