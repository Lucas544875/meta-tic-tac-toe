import * as Phaser from 'phaser';
import { Scenes } from './scene';  // 追加

// MySceneはもう使わないので削除

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-app',
  scene: Scenes  // 変更
};

new Phaser.Game(config);
