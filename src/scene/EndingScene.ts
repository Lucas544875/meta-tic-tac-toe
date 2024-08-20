import { GameState } from "../type/GameState";
import { BoadManager } from "../class/BoadManager";

export class EndingScene extends Phaser.Scene {

  private gameState?: GameState;
  private winner?: "0" | "1"| "-";
  private boadState?: ("0" | "1" | "-")[][][][];
  private metaBoadState?: ("0" | "1" | "-")[][];
  private gameMode?: "solo" | "duo";
  private difficulty?: "easy" | "hard" | "veryhard" | null;
  
  constructor() {
    super('ending');
  }

  preload() {
    this.load.image("maru", "assets/maru.png");
    this.load.image("batsu", "assets/batsu.png");
    this.load.image("boad", "assets/boad.png");
    this.load.image("retry", "assets/retry.png");
  }

  init(data: GameState) {
    this.gameState = data;
    this.winner = BoadManager.checkWinner(data.metaBoadState);
    this.boadState = data.boadState || Array(3).fill(Array(3).fill(Array(3).fill(Array(3).fill("-"))));
    this.gameMode = data.gameMode || 'duo';
    this.difficulty = data.difficulty || null;
    this.metaBoadState = data.metaBoadState || Array(3).fill(Array(3).fill("-"));
  }

  private createBoad() {
    if (!this.boadState) {
      return;
    }

    const { width, height } = this.game.canvas;
    const boadWidth = Math.min(width, height);
    
    // 盤面の枠
    const boadFrame = this.add.image(width / 2, height / 2, "boad").setDisplaySize(height, height);

    // 駒の配置
    const boadOffsetx = 35;
    const boadOffsety = 35;
    const boad = this.add.container(width/2 - boadWidth/2 + boadOffsetx, height/2 - boadWidth/2 + boadOffsety);

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const subBoadOffsetx = 0;
        const subBoadOffsety = 0;
        const subBoad = this.add.container((boadWidth/3 + subBoadOffsetx)*i, (boadWidth/3 + subBoadOffsety)*j);
        boad.add(subBoad);
        for (let k = 0; k < 3; k++) {
          for (let l = 0; l < 3; l++) {
            const x = boadWidth*k/9;
            const y = boadWidth*l/9;
            if (this.boadState[i][j][k][l] === "0") { // 〇の配置
              const cell = this.add.image(x, y, "maru").setDisplaySize(boadWidth/10, boadWidth/10);
              subBoad.add(cell);
            }else if (this.boadState[i][j][k][l] === "1") { // ×の配置
              const cell = this.add.image(x, y, "batsu").setDisplaySize(boadWidth/10, boadWidth/10);
              subBoad.add(cell);
            }
          }
        }
        // メタ盤面の齣を表示
        if (!this.metaBoadState){
          // 何もしない
        }else if(this.metaBoadState[i][j] === "0") { // 〇の配置
          const cell = this.add.image(boadWidth/9, boadWidth/9, "maru").setDisplaySize(boadWidth/4, boadWidth/4);
          subBoad.add(cell);
        }else if(this.metaBoadState[i][j] === "1") { // ×の配置
          const cell = this.add.image(boadWidth/9, boadWidth/9, "batsu").setDisplaySize(boadWidth/4, boadWidth/4);
          subBoad.add(cell);
        }
      }
    }
  }

  create() {
    const { width, height } = this.game.canvas;

    this.createBoad();

    this.add.rectangle(width/2, height/2-100, width-100, 200, 0x000000, 0.5).setOrigin(0.5);

    if (this.gameMode === "solo" && this.difficulty) {
      if (this.winner === "-") {
        this.add.text(width/2, height/2-100, `難易度:${this.difficulty}に引き分け`, {fontSize: 30, fontFamily: "meiryo UI"}).setOrigin(0.5);
      }else if (this.winner === "1") {
        this.add.text(width/2, height/2-100, `難易度:${this.difficulty}に敗北`, {fontSize: 30, fontFamily: "meiryo UI"}).setOrigin(0.5);
      }else if (this.winner === "0") {
        this.add.text(width/2, height/2-100, `難易度:${this.difficulty}に勝利`, {fontSize: 30, fontFamily: "meiryo UI"}).setOrigin(0.5);
      }
    }else if (this.gameMode === "duo") {
      if (this.winner === "-") {
        this.add.text(width/2, height/2-100, `引き分け`, {fontSize: 30, fontFamily: "meiryo UI"}).setOrigin(0.5);
      }else if (this.winner === "0") {
        this.add.text(width/2, height/2-100, `〇の勝ち`, {fontSize: 30, fontFamily: "meiryo UI"}).setOrigin(0.5);
      }else if (this.winner === "1") {
        this.add.text(width/2, height/2-100, `×の勝ち`, {fontSize: 30, fontFamily: "meiryo UI"}).setOrigin(0.5);
      }
    }

    const retry = this.add.image(width/2, height/2+100, "retry").setDisplaySize(150, 150)
    .setInteractive({
      useHandCursor: true
    })
    .on('pointerdown', () => {
      this.scene.start('title');  // TitleSceneに遷移
    });
  }
}
