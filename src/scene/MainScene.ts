import { GameState } from "../type/GameState";
import { BoadManager } from "../class/BoadManager";

export class MainScene extends Phaser.Scene {
  private gameState?: GameState;
  private player?: "0" | "1";
  private gameMode?: "solo" | "duo";
  private difficulty?: "easy" | "hard" | "veryhard" | null;
  private boadState?: ("0" | "1" | "-")[][][][];
  private metaBoadState?: ("0" | "1" | "-")[][];
  private pointedCell?: {i:number, j:number, k:number, l:number};

  constructor() {
    super('main');
  }
  
  preload() {
    this.load.image("maru", "assets/maru.png");
    this.load.image("batsu", "assets/batsu.png");
    this.load.image("boad", "assets/boad.png");
  }

  init(data: GameState) {
    this.gameState = data;
    this.player = data.player || '0';
    this.gameMode = data.gameMode || 'duo';
    this.difficulty = data.difficulty || null;
    this.boadState = data.boadState || Array(3).fill(Array(3).fill(Array(3).fill(Array(3).fill("-"))));
    this.metaBoadState = data.metaBoadState || Array(3).fill(Array(3).fill("-"));
    this.pointedCell = data.pointedCell || undefined;
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

    const availableCells = BoadManager.availableCells(this.gameState!);

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
            // 前の手番で置かれた駒の表示
            if (this.pointedCell 
              && this.pointedCell.i === i 
              && this.pointedCell.j === j 
              && this.pointedCell.k === k 
              && this.pointedCell.l === l) {
                const r = this.add.rectangle(x, y, boadWidth/10, boadWidth/10, 0x86A1EB, 0.5);
                subBoad.add(r);
            }
            if (this.boadState[i][j][k][l] === "0") { // 〇の配置
              const cell = this.add.image(x, y, "maru").setDisplaySize(boadWidth/10, boadWidth/10);
              subBoad.add(cell);
            }else if (this.boadState[i][j][k][l] === "1") { // ×の配置
              const cell = this.add.image(x, y, "batsu").setDisplaySize(boadWidth/10, boadWidth/10);
              subBoad.add(cell);
            }else{
              // 配置可能なマスの表示
              if (availableCells.some(e => e.i === i && e.j === j && e.k === k && e.l === l)) {
                const cell = this.add.zone(x, y, boadWidth/10, boadWidth/10)
                if (this.gameMode === "duo" || this.player === "0") {
                  cell.setInteractive({
                    useHandCursor: true
                  }).on('pointerdown', () => {
                    this.scene.start('main', BoadManager.updateState(this.gameState!, i, j, k, l));
                  });
                }
                const r = this.add.rectangle(x, y, boadWidth/10, boadWidth/10, 0x9966ff, 0.5);
                subBoad.add(cell);
                subBoad.add(r);
              }
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
    if (!this.gameMode) {
      return;
    }
    const { width, height } = this.game.canvas;

    this.createBoad();
    if (BoadManager.isHalt(this.gameState!)) {
      this.scene.start('ending', this.gameState);
    }

    // if (this.gameMode === "solo" && this.player === "1") {
    //   // AIの手番
    // }
  }
}
