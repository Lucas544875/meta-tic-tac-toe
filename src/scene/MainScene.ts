import { ModalBehavoir } from 'phaser3-rex-plugins/plugins/modal.js';
import { GameState } from "../type/GameState";
import { BoadManager } from "../class/BoadManager";
import { Agent } from "../class/agent";

export class MainScene extends Phaser.Scene {
  private gameState?: GameState;
  private player?: "0" | "1";
  private gameMode?: "solo" | "duo";
  private difficulty?: "easy" | "hard" | "veryhard" | null;
  private boadState?: ("0" | "1" | "-")[][][][];
  private metaBoadState?: ("0" | "1" | "-")[][];
  private pointedCell?: {i:number, j:number, k:number, l:number};
  private agent?: Agent;
  private progressBar?: Phaser.GameObjects.Graphics;

  constructor() {
    super('main');
  }
  
  preload() {
    this.load.image("maru", "assets/maru.png");
    this.load.image("batsu", "assets/batsu.png");
    this.load.image("boad", "assets/boad.png");
    this.load.image("howToPlay", "assets/howtoplay.png");
    this.load.image("background", "assets/background.png");
  }

  init(data: GameState) {
    this.gameState = data;
    this.player = data.player || '0';
    this.gameMode = data.gameMode || 'duo';
    this.difficulty = data.difficulty || null;
    this.boadState = data.boadState || Array(3).fill(Array(3).fill(Array(3).fill(Array(3).fill("-"))));
    this.metaBoadState = data.metaBoadState || Array(3).fill(Array(3).fill("-"));
    this.pointedCell = data.pointedCell || undefined;
    if (this.difficulty !== null) {
      this.agent = Agent.getInstance(this.difficulty);
    }
  }

  private createBoad() {
    if (!this.boadState) {
      return;
    }

    const { width, height } = this.game.canvas;
    const boadWidth = Math.min(width, height)*(1/1.1);
    
    const background = this.add.image(width/2, height/2, 'background').setDisplaySize(width, height).setAlpha(0.7);
    // 盤面の枠
    const boadFrame = this.add.image(width / 2, height / 2, "boad").setDisplaySize(boadWidth*1.1, boadWidth*1.1);

    // 駒の配置
    const boadOffsetx = 31;
    const boadOffsety = 31;
    const boad = this.add.container(width/2 - boadWidth/2 + boadOffsetx, height/2 - boadWidth/2 + boadOffsety);

    const availableCells = BoadManager.availableCells(this.gameState!);

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const subBoadOffsetx = 3;
        const subBoadOffsety = 3;
        const subBoad = this.add.container(
          boadWidth/3 * i - subBoadOffsetx*(i-1),
          boadWidth/3 * j - subBoadOffsety*(j-1));
        boad.add(subBoad);
        for (let k = 0; k < 3; k++) {
          for (let l = 0; l < 3; l++) {
            const cellOffsetx = 5;
            const cellOffsety = 5;
            const x = boadWidth*k/9 - cellOffsetx*(k-1);
            const y = boadWidth*l/9 - cellOffsety*(l-1);
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
              const cell = this.add.image(x, y, "maru").setDisplaySize(boadWidth/12, boadWidth/12);
              subBoad.add(cell);
            }else if (this.boadState[i][j][k][l] === "1") { // ×の配置
              const cell = this.add.image(x, y, "batsu").setDisplaySize(boadWidth/12, boadWidth/12);
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
                const r = this.add.rectangle(x, y, boadWidth/12, boadWidth/12, 0x9966ff, 0.5);
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

  private createHowToPlayButton() {
    const { width, height } = this.game.canvas;

    this.add.image(width-50, height-50, "howToPlay").setDisplaySize(130, 130)
    .setInteractive({
      useHandCursor: true
    })
    .on('pointerdown',  () => {
      // Create modal game object after click basePanel
      let modalGameObject = this.add.container(0, 0);
      const a = this.add.rectangle(400, 300, 550, 500, 0xffffff)
      const b = this.add.text(400, 100, 'ルール説明', {fontSize: 30, fontFamily: "meiryo UI", color: "#000"}).setOrigin(0.5);
      const rule = `
ルール説明
三目並べをしながら三目並べができるゲームです。
三目並べの盤面が9つあり、それぞれの盤面で三目並べを行います。
一つの盤面で同じ齣を3つ並べるとその盤面を取ることができます。
取った盤面が3つ並ぶと勝利です。
ただし、自分が置くことができる盤面は
前の手番で置かれた駒の方向にある盤面に限られます。
盤面がすでに取られている場合、盤面が埋まっている場合、
初手は好きな場所に置くことができます。
      `
      const c = this.add.text(400, 300, rule, {fontSize: 20, fontFamily: "meiryo UI", color: "#000", align:"center"}).setOrigin(0.5);
      modalGameObject.add([a,b,c]);
      // button will be destroyed after modal closing

      const modelBehavior = new ModalBehavoir(modalGameObject, {
        touchOutsideClose: true,
        duration: {
          in: 100,
          out: 100
        },
        transitIn: 1,
        transitOut: 1
      })
    }, this)
  }

  private async playAI(callback: (p: number) => void) {
    this.updateProgressBar(0.5);
    try{
      await new Promise<void>(resolve => setTimeout(resolve, 1))
      const cell = await this.agent!.play!(this.gameState!, callback);
      return cell;
    } catch(e) {
      console.error("Error during AI play:", e);
      throw e;
    }
  }

  updateProgressBar = (p: number):void =>{
    const { width, height } = this.game.canvas;
    console.log("Progress:", p);
    let progressBar = this.add.graphics();
    progressBar.fillStyle(0xFFFFFF, 1);
    progressBar.slice(width-50, 50, 30, -Math.PI*1/2, Math.PI*(-1/2 + 2*p), false);
    progressBar.fillPath();
    this.progressBar = progressBar;
    return;
  }

  create() {
    if (!this.gameMode) {
      return;
    }
    // 盤面の作成
    this.createBoad();
    
    // ルール説明ボタンの作成
    this.createHowToPlayButton();

    // 勝敗が決まったら終了画面に遷移
    if (BoadManager.isHalt(this.gameState!)) {
      this.scene.start('ending', this.gameState);
    }

    // AIの手番
    if (this.gameMode === "solo" && this.player === "1") {
      // プログレスバーの作成
      this.playAI(this.updateProgressBar).then((cell) => {
        this.scene.start('main', BoadManager.updateState(this.gameState!, cell.i, cell.j, cell.k, cell.l))
      });
    }
  }
}
