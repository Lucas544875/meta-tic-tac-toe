export class LoadingScene extends Phaser.Scene {
  constructor() {
    // シーンのkeyを指定
    super('loading');
  }

  // preload()はシーンが呼び出されたら実行される
  preload() {
    // ロゴ画像だけは最初から表示したいので予めロード
    // Phaser3のロゴをlabs.phaser.ioから取得しているので、もし公開する際はこの部分は消してください
    this.load.image("loading", "assets/loading.png");
  }

  // create()はpreload内のアセットのロードが完了したら実行される
  create() {
    // 描画領域のサイズを取得
    const { width, height } = this.game.canvas;

    // ロゴ画像を中央に表示
    const logo = this.add.image(width/2, 230, 'loading').setDisplaySize(1280*0.6, 720*0.6);

    const baseLine = height*4/5

    // テキストをロゴの下に表示
    this.add.text(width/2, baseLine, 'Loading...',  {fontSize: 30, fontFamily: "Zen Maru Gothic", color: "#000"}).setOrigin(0.5);

    // アセットをロード（一度ロードしたアセットは他のシーンでも使用可）
    this.load.image("logo", "assets/Logo_blur.png");
    this.load.image('gamemode', 'assets/gamemode.png');
    this.load.image('background', 'assets/background.png');
    this.load.image("maru", "assets/maru.png");
    this.load.image("batsu", "assets/batsu.png");
    this.load.image("boad", "assets/boad.png");
    this.load.image("retry", "assets/retry.png");
    this.load.image("howToPlay", "assets/howtoplay.png");
    this.load.image('easy', 'assets/easy.png');
    this.load.image('hard', 'assets/hard.png');
    this.load.image('veryhard', 'assets/veryhard.png');

    // アセットのロードが完了したらTitleSceneに遷移
    this.load.on('complete', () => {
      this.scene.start('title');
    });

    // アセットのロードを開始（preload外でロードを行う場合はこのメソッドを呼ぶ必要がある）
    this.load.start();
  }
}
