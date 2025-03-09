import Phaser from 'phaser';

import { gameState } from '../state';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HomeScene' });
  }

  preload() {
    this.load.image('background', '/background.png');
    this.load.image('logo', '/logo.png');
    this.load.image('button', '/button.png');
  }

  create() {
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, 'background').setScale(1);

    this.add
      .image(width / 2, height / 4, 'logo')
      .setScale(0.1)
      .setDepth(1);

    const descriptionText = `
Welcome to the Dungeon Game!
  
Explore a randomly generated dungeon with multiple rooms.
Find loot and battle monsters like archers and skeletons.

Your goal is to find the stairs to the next level!
Each level gets harder with bigger dungeons and stronger monsters.

You have three lives. Survive as long as you can!
Good luck!
`;

    this.add
      .text(width / 2, height / 2, descriptionText, {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Arial',
        align: 'center',
        wordWrap: { width: width * 0.8 },
      })
      .setOrigin(0.5)
      .setDepth(1);

    // Add Start Game Button
    const startButton = this.add
      .image(width / 2, (height / 3) * 2, 'button')
      .setInteractive()
      .setScale(1)
      .setDepth(1);

    // Add button functionality
    startButton.on('pointerdown', () => {
      gameState.activeScene = 'game';
      this.scene.start('GameScene');
    });
  }
}
