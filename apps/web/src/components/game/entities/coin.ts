import type { CoinType } from '~/lib/helpers/game';

import type { Room } from '@mikewesthad/dungeon';

import { gameState } from '../state';

type SoundTypes = 'pickup';
export class Coin {
  public scene: Phaser.Scene;
  public sprite: Phaser.Types.Physics.Arcade.SpriteWithStaticBody;
  public type: CoinType;
  public room: Room;
  public sounds: Record<SoundTypes, Phaser.Sound.BaseSound>;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: CoinType,
    room: Room
  ) {
    this.type = type;
    this.scene = scene;
    this.room = room;

    this.sprite = scene.physics.add.staticSprite(x, y, type.key);
    this.sprite.setScale(2);
    this.sprite.play(`coin-${type.key}`);
    this.sprite.body.setSize(32, 32);

    const pickupSound = scene.sound.add('coinPickupSound');
    this.sounds = {
      pickup: pickupSound,
    };
  }

  pickup() {
    this.sprite.destroy();
    gameState.addCoin(this.type);
    this.sounds.pickup.play();
    gameState.incrementHealth(this.type.healthRegeneration);
  }

  update(activeRoom: Room) {
    if (activeRoom === this.room) {
      this.sprite.setVisible(true);
    } else {
      this.sprite.setVisible(false);
    }
  }
}
