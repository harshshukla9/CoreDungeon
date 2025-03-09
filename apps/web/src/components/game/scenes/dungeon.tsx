import { generateDungeon } from '~/lib/helpers/game';

import * as Actions from '~/lib/game/actions';

import type Dungeon from '@mikewesthad/dungeon';
import type { Room } from '@mikewesthad/dungeon';
import Phaser from 'phaser';

import { type Coin, type Enemy, Player } from '../entities';
import { gameState } from '../state';
import type { TilemapVisibility } from '../tilemap-visibility';

type SoundTypes = 'soundtrack';

export class DungeonGameScene extends Phaser.Scene {
  public dungeon!: Dungeon;
  public startRoom!: Room;
  public player!: Player;
  public tilemap!: Phaser.Tilemaps.Tilemap;
  public groundLayer!: Phaser.Tilemaps.TilemapLayer;
  public stuffLayer!: Phaser.Tilemaps.TilemapLayer;
  public tilemapVisibility!: TilemapVisibility;
  public coins: Coin[] = [];
  public enemies: Enemy[] = [];
  public sounds!: Record<SoundTypes, Phaser.Sound.BaseSound>;

  constructor() {
    super({ key: 'GameScene' });
  }

  init() {
    const level = gameState.level;
    this.dungeon = generateDungeon(level);
  }

  preload() {
    Actions.preload(this);
  }

  create() {
    this.sounds = {
      soundtrack: this.sound.add('soundtrack', { loop: true }),
    };

    this.sounds.soundtrack.play({ volume: 0.4 });
    Actions.createAnimations(this);
    const args = Actions.createMap(this);
    this.player = new Player(this, args.startX, args.startY);

    this.physics.add.collider(this.player.sprite, args.groundLayer);
    this.physics.add.collider(this.player.sprite, args.stuffLayer);

    const coins = Actions.placeCoins.call(this, args.map, args.stuffLayer);
    this.coins.push(...coins);

    coins.forEach((coin) => {
      this.physics.add.overlap(this.player.sprite, coin.sprite, () => {
        coin.pickup();
      });
    });

    const enemies = Actions.placeEnemies.call(
      this,
      args.otherRooms,
      args.map,
      args.stuffLayer
    );
    this.enemies.push(...enemies);

    for (const enemy of this.enemies) {
      if (!enemy.sprite) continue;
      this.physics.add.collider(
        this.player.sprite,
        enemy.sprite,
        () => this.onPlayerEnemyCollision(this.player, enemy),
        undefined,
        this
      );
    }

    const camera = this.cameras.main;

    camera.setBounds(0, 0, args.mapWidth, args.mapHeight);
    camera.startFollow(this.player.sprite);

    this.input.keyboard?.on('keydown-ESC', () => {
      this.coins = [];
      this.enemies = [];
      gameState.activeScene = 'game-over';
      this.scene.start('GameOverScene');
    });
  }

  private onPlayerEnemyCollision(player: Player, enemy: Enemy) {
    // Enemy Attacks Player
    enemy.attack(this);
  }

  startRound() {
    const existing = gameState.times.find((t) => t.round === gameState.level);
    if (existing) return;
    gameState.times.push({ round: gameState.level, start: Date.now() });
  }

  endRound() {
    const existing = gameState.times.find((t) => t.round === gameState.level);
    if (existing) {
      existing.end = Date.now();
    }
  }

  update() {
    this.player.update(this);
    const playerTileX = this.groundLayer.worldToTileX(this.player.sprite.x);
    const playerTileY = this.groundLayer.worldToTileY(this.player.sprite.y);
    const playerRoom = this.dungeon.getRoomAt(playerTileX, playerTileY);
    if (playerRoom) {
      this.tilemapVisibility.setActiveRoom(playerRoom);
      this.coins.forEach((coin) => {
        coin.update(playerRoom);
      });
      this.enemies.forEach((enemy) => {
        enemy.update(this, playerRoom);
      });
    }
  }
}
