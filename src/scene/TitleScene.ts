import { GameState } from "../type/GameState";

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

    const title = this.add.text(width/2, 100, '超三目並べ', {fontSize: 50, fontFamily: "meiryo UI", color: "#000"}).setOrigin(0.5);
    
    // 一人で遊ぶモード
    const soloMode = this.add
    .image(width/2-150, height/2, 'solo')
    .setDisplaySize(300, 300);
    soloMode.on('pointerdown', () => {
      this.scene.start('selectDifficulty');
    }).setInteractive({
      useHandCursor: true
    });
    const soloText = this.add.text(width/2-150, height/2+200, '一人で遊ぶ', {fontSize: 30, fontFamily: "meiryo UI", color: "#000"}).setOrigin(0.5);

    // 二人で遊ぶモード
    const gameState:GameState = {
      player: "0",
      gameMode: "duo",
      difficulty: null,
      boadState: Array(3).fill(Array(3).fill(Array(3).fill(Array(3).fill("-")))),
      metaBoadState: Array(3).fill(Array(3).fill("-"))
    };

    const duoMode = this.add
    .image(width/2+150, height/2, 'duo')
    .setDisplaySize(300, 300);
    duoMode.on('pointerdown', () => {
      this.scene.start('main', gameState);
    }).setInteractive({
      useHandCursor: true
    });
    const duoText = this.add.text(width/2+150, height/2+200, '二人で遊ぶ', {fontSize: 30, fontFamily: "meiryo UI", color: "#000"}).setOrigin(0.5);
    
  }
}
