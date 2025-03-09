import Phaser from 'phaser';
import { type StoreArgs } from '~/hooks';

import { gameState } from '../state';

export class GameOverScene extends Phaser.Scene {
  private storeFn: (args: StoreArgs) => Promise<string>;

  constructor(storeFn: (args: StoreArgs) => Promise<string>) {
    super({ key: 'GameOverScene' });
    this.storeFn = storeFn;
  }

  preload() {
    this.load.image('background', '/background.png');
    this.load.image('logo', '/logo.png');
    this.load.image('storeButton', '/store-button.png');
    this.load.image('restartButton', '/restart-button.png');
    this.load.image('gameOverText', '/game-over-text.png');
    this.load.image('quitButton', '/quit-button.png');
  }

  create() {
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, 'background').setScale(1);

    this.add
      .image(width / 2, height / 4, 'gameOverText')
      .setScale(1)
      .setDepth(1);

    const storeButton = this.add
      .image(width / 2, height / 2, 'storeButton')
      .setInteractive()
      .setScale(1)
      .setDepth(1);
    const restartButton = this.add
      .image(width / 2, height / 2 + 100, 'restartButton')
      .setInteractive()
      .setScale(1)
      .setDepth(1);

    const quitButton = this.add
      .image(width / 2, height / 2 + 200, 'quitButton')
      .setInteractive()
      .setScale(1)
      .setDepth(1);

    restartButton.on('pointerdown', () => {
      gameState.reset();
      this.scene.start('HomeScene');
    });

    storeButton.on('pointerdown', async () => {
      try {
        storeButton.setTint(0x808080);
        const id = crypto.randomUUID();
        const times = gameState.times.map((time, index) => ({
          startTime: BigInt(time.start),
          endTime: BigInt(time.end ?? 0),
          round: BigInt(index),
        }));
        await this.storeFn({
          id,
          totalScore: BigInt(gameState.score),
          times,
        });
        const text = this.add.text(
          width / 2,
          height / 2 + 400,
          `Congrats!!! You Got  ${gameState.score} DGN Token Result Stored Successfully`,
          {
            fontSize: '24px',
            color: '#fff',
          }
        );
        text.setOrigin(0.5, 0.5);
        this.time.delayedCall(3000, () => {
          text.destroy();
        });
        storeButton.clearTint();
        gameState.reset();
      } catch (error) {
        console.error('storeError', error);

        const text = this.add.text(
          width / 2,
          height / 2 + 400,
          'Please connect to Metamask to store the points and collect reward',
          {
            fontSize: '24px',
            color: '#fff',
          }
        );
        text.setOrigin(0.5, 0.5);
        this.time.delayedCall(3000, () => {
          text.destroy();
        });
        storeButton.clearTint();
      }
    });

    quitButton.on('pointerdown', () => {
      gameState.reset();
      window.location.href = '/';
    });
  }
}
