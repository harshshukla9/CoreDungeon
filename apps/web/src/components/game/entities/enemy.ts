import type { EnemyType } from '~/lib/helpers/game';

import type { Room } from '@mikewesthad/dungeon';
import Phaser from 'phaser';

import type { DungeonGameScene } from '../scenes';
import { gameState } from '../state';
import { HealthBar } from './healthbar';

type SoundTypes = 'dead' | 'attack';

export class Enemy {
  public sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | undefined;
  public health: number;
  public lastAttackTime: number;
  private healthBar: HealthBar;
  public enemyType: EnemyType;
  public room: Room;
  public isHidden: boolean;
  public sounds: Record<SoundTypes, Phaser.Sound.BaseSound>;

  constructor(
    scene: DungeonGameScene,
    x: number,
    y: number,
    type: EnemyType,
    room: Room
  ) {
    this.isHidden = true;
    this.room = room;
    this.health = type.maxHealth;
    this.lastAttackTime = 0;
    this.enemyType = type;

    this.sprite = scene.physics.add.sprite(x, y, this.enemyType.key, 0);
    this.sprite.setScale(3);

    this.healthBar = new HealthBar(scene, this.sprite, 100);
    this.healthBar.updateHealthBar();

    this.sprite.setVisible(false);
    this.healthBar.setVisible(false);

    const deadSound = scene.sound.add('enemyDeadSound');
    const attackSound = scene.sound.add('enemyAttackSound');

    this.sounds = {
      dead: deadSound,
      attack: attackSound,
    };
  }

  freeze() {
    if (!this.sprite) return;
    this.sprite.body.moves = false;
  }

  public moveTowardPlayer(scene: DungeonGameScene): void {
    if (!this.sprite) return;

    const distance = Phaser.Math.Distance.Between(
      scene.player.sprite.x,
      scene.player.sprite.y,
      this.sprite.x,
      this.sprite.y
    );

    if (
      distance < this.enemyType.maxDistance &&
      distance > this.enemyType.minDistance
    ) {
      scene.physics.moveToObject(
        this.sprite,
        scene.player.sprite,
        this.enemyType.movementSpeed
      );
    } else {
      this.sprite.setVelocity(0, 0);
    }
  }

  public attack(scene: DungeonGameScene): void {
    if (!this.sprite) return;
    const player = scene.player;
    if (scene.time.now - this.lastAttackTime > this.enemyType.attackCooldown) {
      const distance = Phaser.Math.Distance.Between(
        this.sprite.x,
        this.sprite.y,
        player.sprite.x,
        player.sprite.y
      );
      if (distance < this.enemyType.minDistance) {
        if (this.hasLineOfSightToPlayer(player.sprite, scene.groundLayer)) {
          this.sounds.attack.play();
          player.onHitByEnemy(scene, this.enemyType.dps);
          this.lastAttackTime = scene.time.now;
        }
      }
    }
  }

  public onHitByPlayer(scene: Phaser.Scene): void {
    this.health -= 30;
    this.lastAttackTime = scene.time.now;
    this.healthBar.takeDamage(30);
    if (this.health <= 0) {
      this.sounds.dead.play();
      this.destroy();
    }
  }

  hasLineOfSightToPlayer(
    player: Phaser.Physics.Arcade.Sprite,
    tilemapLayer: Phaser.Tilemaps.TilemapLayer
  ): boolean {
    if (!this.sprite) return false;
    const enemyX = this.sprite.x;
    const enemyY = this.sprite.y;
    const playerX = player.x;
    const playerY = player.y;

    const line = new Phaser.Geom.Line(enemyX, enemyY, playerX, playerY);

    const tiles = tilemapLayer.getTilesWithinShape(line, { isColliding: true });

    return tiles.length === 0;
  }

  update(scene: DungeonGameScene, activeRoom: Room) {
    if (!this.sprite) return;
    const enemyTileX = scene.groundLayer.worldToTileX(this.sprite.x);
    const enemyTileY = scene.groundLayer.worldToTileY(this.sprite.y);
    const enemyRoom = scene.dungeon.getRoomAt(enemyTileX, enemyTileY);

    if (enemyRoom && enemyRoom !== this.room) {
      this.room = enemyRoom;
    }

    if (this.isHidden && enemyRoom) {
      if (activeRoom === enemyRoom) {
        this.sprite.setVisible(true);
        this.healthBar.setVisible(true);
        this.isHidden = false;
      }
    }

    this.moveTowardPlayer(scene);
    this.attack(scene);
    this.healthBar.updateHealthBarPosition();

    const velocityX = this.sprite.body.velocity.x;
    const velocityY = this.sprite.body.velocity.y;

    if (velocityX < 0) {
      // Moving left
      this.sprite.anims.play(`move-left-${this.enemyType.key}`, true);
    } else if (velocityX > 0) {
      // Moving right
      this.sprite.anims.play(`move-right-${this.enemyType.key}`, true);
    } else if (velocityY < 0) {
      // Moving up
      this.sprite.anims.play(`move-up-${this.enemyType.key}`, true);
    } else if (velocityY > 0) {
      // Moving down
      this.sprite.anims.play(`move-down-${this.enemyType.key}`, true);
    } else {
      // If not moving, stop the animation
      this.sprite.anims.stop();
    }
  }

  destroy() {
    this.sprite?.destroy();
    gameState.incrementScore(this.enemyType.pointsOnKill);
    this.sprite = undefined;
    this.healthBar.destroy();
  }
}
