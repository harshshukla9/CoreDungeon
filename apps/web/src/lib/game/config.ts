import Phaser from 'phaser';

export const config = (
  init: (this: Phaser.Scene, data: object) => void,
  preload: (this: Phaser.Scene) => void,
  create: (this: Phaser.Scene) => void,
  update: (this: Phaser.Scene) => void,
  parentRef?: string
): Phaser.Types.Core.GameConfig => {
  return {
    width: 800,
    height: 600,
    type: Phaser.AUTO,
    scene: {
      preload,
      create,
      update,
    },
    scale: {
      width: '100%',
      height: '100%',
    },
    parent: parentRef,
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0, x: 1 },
      },
    },
  };
};
