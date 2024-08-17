export class MainScene extends Phaser.Scene {
  private gameMode?: "solo" | "duo";
  private difficulty?: "easy" | "hard" | "veryhard" | null;

  constructor() {
    super('main');
  }

  init(data: any) {
    // this.scene.restart()の第1引数もしくは
    // this.scene.start()の第2引数に指定されたオブジェクトがdataに渡される
    // const timelineID = data.timelineID || 'start';
    this.gameMode = data.gameMode || 'solo';
    this.difficulty = data.difficulty || null;

    // if (!(timelineID in timelineData)) {
    //   console.error(`[ERROR] タイムラインID[${timelineID}]は登録されていません`);
    //   // 登録されていないタイムラインIDが指定されていたらタイトルシーンに遷移する
    //   this.scene.start('title');
    //   return;
    // }

    // this.timeline = timelineData[timelineID];
  }

  create() {
    if (!this.gameMode) {
      return;
    }

    const { width, height } = this.game.canvas;
    this.add.text(width / 2, height / 2, 'gameMode:'+this.gameMode+", difficulty:"+ this.difficulty, { fontSize: '32px' }).setOrigin(0.5);
  }
}
