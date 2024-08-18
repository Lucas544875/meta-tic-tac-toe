import { GameState } from "../type/GameState";
import { copyBoadState, copyMetaBoadState } from "../data/util";

export class MainScene extends Phaser.Scene {
  private player?: "0" | "1";
  private gameMode?: "solo" | "duo";
  private difficulty?: "easy" | "hard" | "veryhard" | null;
  private boadState?: ("0" | "1" | "-")[][][][];
  private metaBoadState?: ("0" | "1" | "-")[][];
  private pointedCell?: {k:number, l:number};

  constructor() {
    super('main');
  }
  
  preload() {
    this.load.image("maru", "assets/maru.png");
    this.load.image("batsu", "assets/batsu.png");
    this.load.image("boad", "assets/boad.png");
  }

  init(data: GameState) {
    // this.scene.restart()の第1引数もしくは
    // this.scene.start()の第2引数に指定されたオブジェクトがdataに渡される
    // const timelineID = data.timelineID || 'start';
    this.player = data.player || '0';
    this.gameMode = data.gameMode || 'duo';
    this.difficulty = data.difficulty || null;
    this.boadState = data.boadState || Array(3).fill(Array(3).fill(Array(3).fill(Array(3).fill("-"))));
    this.metaBoadState = data.metaBoadState || Array(3).fill(Array(3).fill("-"));
    this.pointedCell = data.pointedCell || undefined;
    // if (!(timelineID in timelineData)) {
    //   console.error(`[ERROR] タイムラインID[${timelineID}]は登録されていません`);
    //   // 登録されていないタイムラインIDが指定されていたらタイトルシーンに遷移する
    //   this.scene.start('title');
    //   return;
    // }

    // this.timeline = timelineData[timelineID];
  }

  private checkWin(b:("0"|"1"|"-")[][]): "0"|"1"|"-" {
    for (let i = 0; i < 3; i++) {
      if (b[i][0] !== "-" && b[i][0] === b[i][1] && b[i][1] === b[i][2]) {
        return b[i][0];
      }
      if (b[0][i] !== "-" && b[0][i] === b[1][i] && b[1][i] === b[2][i]) {
        return b[0][i];
      }
    }
    if (b[0][0] !== "-" && b[0][0] === b[1][1] && b[1][1] === b[2][2]) {
      return b[0][0];
    }
    if (b[0][2] !== "-" && b[0][2] === b[1][1] && b[1][1] === b[2][0]) {
      return b[0][2];
    }
    return "-";
  }

  private availableCell(i:number, j:number, k:number, l:number) {
    if (!this.metaBoadState || !this.boadState) {
      return false;
    }
    const isPointed = !this.pointedCell || (this.pointedCell.k === i && this.pointedCell.l === j);
    const isSettled = this.pointedCell && this.metaBoadState[this.pointedCell.k][this.pointedCell.l] !== "-"
    return isSettled || (isPointed && this.metaBoadState[i][j] === "-" && this.boadState[i][j][k][l] === "-");
  }

  private updateState (i:number, j:number, k:number, l:number):GameState {
    const nextplayer = this.player === "0" ? "1" : "0";
    const nextBoadState = copyBoadState(this.boadState!)
    nextBoadState![i][j][k][l] = this.player!;
    const nextMetaBoadState = copyMetaBoadState(this.metaBoadState!)
    if (this.checkWin(nextBoadState![i][j]) === this.player) {
      nextMetaBoadState![i][j] = this.player!;
    }
    
    const nextPointedCell = {k, l};
    return {
      player: nextplayer,
      gameMode: this.gameMode!,
      difficulty: this.difficulty!,
      boadState: nextBoadState!,
      metaBoadState: nextMetaBoadState!,
      pointedCell: nextPointedCell
    };
  }

  private createBoad() {
    if (!this.boadState) {
      return;
    }

    const { width, height } = this.game.canvas;
    const boadWidth = Math.min(width, height);

    const boadFrame = this.add.image(width / 2, height / 2, "boad").setDisplaySize(height, height);

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
            if (this.boadState[i][j][k][l] === "0") {
              const cell = this.add.image(x, y, "maru").setDisplaySize(boadWidth/10, boadWidth/10);
              subBoad.add(cell);
            }else if (this.boadState[i][j][k][l] === "1") {
              const cell = this.add.image(x, y, "batsu").setDisplaySize(boadWidth/10, boadWidth/10);
              subBoad.add(cell);
            }else{
              if (this.availableCell(i, j, k, l)) {
                const cell = this.add.zone(x, y, boadWidth/10, boadWidth/10).setInteractive({
                  useHandCursor: true
                })
                .on('pointerdown', () => {
                  this.scene.start('main', this.updateState(i, j, k, l));
                });
                const r = this.add.rectangle(x, y, boadWidth/10, boadWidth/10, 0x9966ff, 0.5);
                subBoad.add(cell);
                subBoad.add(r);
              }
            }
          }
        }
      }
    }
  }
  
  create() {
    if (!this.gameMode) {
      return;
    }
    const { width, height } = this.game.canvas;

    // this.add.text(width / 2, height / 2, 'gameMode:'+this.gameMode+", difficulty:"+ this.difficulty, { fontSize: '32px' }).setOrigin(0.5);
    this.createBoad();
  }
}
