import Phaser from 'phaser';

import { type DungeonGameScene } from '../scenes';
import { gameState } from '../state';
import { type Enemy } from './enemy';

type SoundTypes = 'walk' | 'attack' | 'dead';

export class Player {
  public scene: Phaser.Scene;
  public sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  public attackCooldown: number;
  public lastAttackTime: number;
  public sounds: Record<SoundTypes, Phaser.Sound.BaseSound>;
  public isWalking: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.attackCooldown = 2000; // Attack cooldown in milliseconds
    this.lastAttackTime = 0;

    this.scene = scene;

    this.createAnimations();

    this.sprite = scene.physics.add.sprite(x, y, 'Soldier-Idle', 0).setScale(3);
    this.sprite.body.setSize(12, 12);

    const walkSound = scene.sound.add('walkSound', { loop: true });
    const attackSound = scene.sound.add('playerAttackSound');
    const deadSound = scene.sound.add('playerDeadSound');

    this.sounds = {
      walk: walkSound,
      attack: attackSound,
      dead: deadSound,
    };

    this.isWalking = false;

    this.scene.input.keyboard?.createCursorKeys();
  }

  createAnimations() {
    const anims = this.scene.anims;

    // Idle Animation
    anims.create({
      key: 'idle',
      frames: anims.generateFrameNumbers('Soldier-Idle', { start: 0, end: 5 }),
      frameRate: 6,
      repeat: -1,
    });

    // Walk Animation
    anims.create({
      key: 'walk',
      frames: anims.generateFrameNumbers('Soldier-Walk', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });

    // Attack Animation
    anims.create({
      key: 'attack',
      frames: anims.generateFrameNumbers('Soldier-Attack', {
        start: 0,
        end: 5,
      }),
      frameRate: 6,
      repeat: 0,
    });

    // Hurt Animation
    anims.create({
      key: 'hurt',
      frames: anims.generateFrameNumbers('Soldier-Hurt', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0,
    });

    // Death Animation
    anims.create({
      key: 'death',
      frames: anims.generateFrameNumbers('Soldier-Death', { start: 0, end: 3 }),
      frameRate: 4,
      repeat: 0,
    });
  }

  freeze() {
    this.sprite.body.moves = false;
  }

  public attack(enemies: Enemy[], currentTime: number): void {
    for (const enemy of enemies) {
      if (!enemy.sprite) continue;
      if (currentTime - this.lastAttackTime > this.attackCooldown) {
        const distance = Phaser.Math.Distance.Between(
          this.sprite.x,
          this.sprite.y,
          enemy.sprite.x,
          enemy.sprite.y
        );
        if (distance < 50) {
          gameState.setAttacking(true);
          this.lastAttackTime = currentTime;
          this.sounds.attack.play();

          this.scene.time.delayedCall(1000, () => {
            gameState.setAttacking(false);
            enemy.onHitByPlayer(this.scene);
          });
        }
      }
    }
  }

  update(scene: DungeonGameScene) {
    // Priority => Death > Attack > Hurt > Walk > Idle
    if (gameState.isDying) {
      this.sprite.anims.play('death', true);
      return;
    }

    if (gameState.isAttacking) {
      this.sprite.body.setVelocity(0, 0);
      this.sprite.anims.play('attack', true);
      return;
    }

    if (gameState.isHurting) {
      this.sprite.anims.play('hurt', true);
      return;
    }

    const keys = this.scene.input.keyboard?.createCursorKeys();
    const wasd = this.scene.input.keyboard?.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
    }) as {
      w: Phaser.Input.Keyboard.Key;
      s: Phaser.Input.Keyboard.Key;
      a: Phaser.Input.Keyboard.Key;
      d: Phaser.Input.Keyboard.Key;
    };
    const spaceKey = this.scene.input.keyboard?.addKeys({
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    }) as {
      space: Phaser.Input.Keyboard.Key;
    };
    const speed = 300;

    let moving = false;

    if (!keys) return;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- could be
    if (!this.sprite.body) return;

    if (spaceKey.space.isDown) {
      this.attack(scene.enemies, scene.time.now);
    }

    this.sprite.body.setVelocity(0);

    const walkAnim = () => {
      scene.startRound();
      this.sprite.anims.play('walk', true);
      moving = true;
    };

    // Horizontal movement
    if (keys.left.isDown || wasd.a.isDown) {
      this.sprite.body.setVelocityX(-speed);
      this.sprite.setFlipX(true);
      walkAnim();
    } else if (keys.right.isDown || wasd.d.isDown) {
      this.sprite.body.setVelocityX(speed);
      this.sprite.setFlipX(false);
      walkAnim();
    }

    // Vertical movement
    if (keys.up.isDown || wasd.w.isDown) {
      this.sprite.body.setVelocityY(-speed);
      walkAnim();
    } else if (keys.down.isDown || wasd.s.isDown) {
      this.sprite.body.setVelocityY(speed);
      walkAnim();
    }

    // Normalize and scale the velocity so that sprite can't move faster along a diagonal
    this.sprite.body.velocity.normalize().scale(speed);

    // Update the animation last and give left/right animations precedence over up/down animations
    if (
      keys.left.isDown ||
      keys.right.isDown ||
      keys.down.isDown ||
      wasd.a.isDown ||
      wasd.d.isDown ||
      wasd.s.isDown
    ) {
      scene.startRound();
      walkAnim();
    } else if (keys.up.isDown || wasd.w.isDown) {
      walkAnim();
    } else {
      this.sprite.anims.stop();
      this.sprite.anims.play('idle', true);
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- not falsy
    if (moving && !this.isWalking) {
      this.sounds.walk.play();
      this.isWalking = true;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- not truthy
    } else if (!moving && this.isWalking) {
      this.sounds.walk.stop();
      this.isWalking = false;
    }
  }

  onHitByEnemy(scene: DungeonGameScene, dps: number) {
    const isDead = gameState.getHealth() - dps <= 0;
    if (isDead) {
      this.sounds.dead.play();
      gameState.setDying(true);
      this.scene.time.delayedCall(1000, () => {
        gameState.setDying(false);
        gameState.decreaseLives();
        if (gameState.totalLives <= 0) {
          scene.coins = [];
          scene.enemies = [];
          gameState.activeScene = 'game-over';
          scene.scene.start('GameOverScene');
        } else {
          gameState.incrementHealth(100);
          scene.player.sprite.anims.play('idle', true);
          const x = scene.tilemap.tileToWorldX(scene.startRoom.centerX);
          const y = scene.tilemap.tileToWorldY(scene.startRoom.centerY);
          if (!x || !y) return;
          scene.player.sprite.setPosition(x, y);
        }
      });
    } else {
      gameState.setHurting(true);
      this.scene.time.delayedCall(1000, () => {
        gameState.setHurting(false);
      });
    }

    gameState.decrementHealth(dps);
  }

  destroy() {
    this.sprite.destroy();
  }
}
