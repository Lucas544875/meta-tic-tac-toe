import * as Phaser from 'phaser';
import { Scenes } from './scene';  // 追加
import * as ModalPlugin from 'phaser3-rex-plugins/plugins/modal.js';

// MySceneはもう使わないので削除

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#FFFFFF',
  parent: 'game-app',
  scene: Scenes,  // 変更
  plugins: {
    global: [{
        key: 'rexModal',
        plugin: ModalPlugin,
        start: true
    }]
}
};

new Phaser.Game(config);
