/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair -- safe */

/* eslint-disable @typescript-eslint/no-non-null-assertion -- safe */
import { type Room } from '@mikewesthad/dungeon';
import Phaser from 'phaser';

import { Coin, Enemy } from '~/components/game/entities';
import { type DungeonGameScene } from '~/components/game/scenes';
import { gameState } from '~/components/game/state';
import { TilemapVisibility } from '~/components/game/tilemap-visibility';

import {
  coins,
  enemies,
  pickRandomCoin,
  pickRandomEnemy,
} from '../helpers/game';
import { TILES } from './tile-mappings';

export const preload = (scene: Phaser.Scene) => {
  scene.load.image('tiles', '/dungeon/dungeon-tileset.png');
  scene.load.spritesheet('characters', '/dungeon/character.png', {
    frameWidth: 64,
    frameHeight: 64,
    margin: 1,
    spacing: 2,
  });

  const characterSize = 100;

  scene.load.spritesheet(
    'Soldier-Idle',
    '/dungeon/character/Soldier-Idle.png',
    {
      frameWidth: characterSize,
      frameHeight: characterSize,
    }
  );
  scene.load.spritesheet('Soldier-Walk', 'dungeon/character/Soldier-Walk.png', {
    frameWidth: characterSize,
    frameHeight: characterSize,
  });
  scene.load.spritesheet(
    'Soldier-Attack',
    'dungeon/character/Soldier-Attack.png',
    { frameWidth: characterSize, frameHeight: characterSize }
  );
  scene.load.spritesheet('Soldier-Hurt', 'dungeon/character/Soldier-Hurt.png', {
    frameWidth: characterSize,
    frameHeight: characterSize,
  });
  scene.load.spritesheet(
    'Soldier-Death',
    'dungeon/character/Soldier-Death.png',
    { frameWidth: characterSize, frameHeight: characterSize }
  );

  scene.load.spritesheet('chest', '/dungeon/chest.png', {
    frameWidth: 16,
    frameHeight: 16,
  });

  enemies.forEach((enemy) => {
    scene.load.spritesheet(enemy.key, `/dungeon/enemies/${enemy.key}.png`, {
      frameWidth: 16,
      frameHeight: 16,
    });
  });

  for (const coin of coins) {
    scene.load.spritesheet(coin.key, `/dungeon/coins/${coin.key}.png`, {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  scene.load.audio('walkSound', '/dungeon/sounds/walk.wav');
  scene.load.audio('playerAttackSound', '/dungeon/sounds/player-attack.wav');
  scene.load.audio('enemyDeadSound', '/dungeon/sounds/enemy-dead.wav');
  scene.load.audio('enemyAttackSound', '/dungeon/sounds/enemy-attack.wav');
  scene.load.audio('playerDeadSound', '/dungeon/sounds/player-dead.wav');
  scene.load.audio('coinPickupSound', '/dungeon/sounds/coin.ogg');

  scene.load.audio('soundtrack', '/dungeon/sounds/soundtrack.wav');
};

export const createMap = (scene: DungeonGameScene) => {
  const dungeon = scene.dungeon;

  scene.add.image(0, 0, 'tiles');

  const map = scene.make.tilemap({
    tileWidth: 48,
    tileHeight: 48,
    width: dungeon.width,
    height: dungeon.height,
  });
  const tileset = map.addTilesetImage('tileset', 'tiles', 48, 48, 1, 2); // 1px margin, 2px spacing
  if (!tileset) {
    throw new Error('Tileset not found');
  }
  const groundLayer = map
    .createBlankLayer('Ground', tileset)
    ?.fill(TILES.BLANK);

  const stuffLayer = map.createBlankLayer('Stuff', tileset);
  // const shadowLayer = map
  //   .createBlankLayer('Shadow', tileset)
  //   ?.fill(TILES.BLANK);

  const shadowLayer = map
    .createBlankLayer('Shadow', tileset)
    ?.fill(TILES.BLANK);

  if (!shadowLayer) {
    throw new Error('Shadow layer not found');
  }

  scene.tilemapVisibility = new TilemapVisibility(shadowLayer);

  if (!groundLayer) {
    throw new Error('Ground layer not found');
  }
  if (!stuffLayer) {
    throw new Error('Stuff layer not found');
  }

  scene.tilemap = map;
  scene.groundLayer = groundLayer;
  scene.stuffLayer = stuffLayer;

  dungeon.rooms.forEach((room) => {
    const { x, y, width, height, left, right, top, bottom } = room;
    // Fill the floor with mostly clean tiles
    groundLayer.weightedRandomize(
      TILES.FLOOR,
      x + 1,
      y + 1,
      width - 2,
      height - 2
    );
    // Place the room corners tiles
    groundLayer.putTileAt(TILES.WALL.TOP_LEFT, left, top);
    groundLayer.putTileAt(TILES.WALL.TOP_RIGHT, right, top);
    groundLayer.putTileAt(TILES.WALL.BOTTOM_RIGHT, right, bottom);
    groundLayer.putTileAt(TILES.WALL.BOTTOM_LEFT, left, bottom);
    // Fill the walls with mostly clean tiles
    groundLayer.weightedRandomize(TILES.WALL.TOP, left + 1, top, width - 2, 1);
    groundLayer.weightedRandomize(
      TILES.WALL.BOTTOM,
      left + 1,
      bottom,
      width - 2,
      1
    );
    groundLayer.weightedRandomize(
      TILES.WALL.LEFT,
      left,
      top + 1,
      1,
      height - 2
    );
    groundLayer.weightedRandomize(
      TILES.WALL.RIGHT,
      right,
      top + 1,
      1,
      height - 2
    );
    // Dungeons have rooms that are connected with doors. Each door has an x & y relative to the
    // room's location. Each direction has a different door to tile mapping.
    const doors = room.getDoorLocations(); // → Returns an array of {x, y} objects
    for (const door of doors) {
      if (door.y === 0) {
        groundLayer.putTilesAt(TILES.DOOR.TOP, x + door.x - 1, y + door.y);
      } else if (door.y === room.height - 1) {
        groundLayer.putTilesAt(TILES.DOOR.BOTTOM, x + door.x - 1, y + door.y);
      } else if (door.x === 0) {
        groundLayer.putTilesAt(TILES.DOOR.LEFT, x + door.x, y + door.y - 1);
      } else if (door.x === room.width - 1) {
        groundLayer.putTilesAt(TILES.DOOR.RIGHT, x + door.x, y + door.y - 1);
      }
    }
  });

  // Separate out the rooms into:
  //  - The starting room (index = 0)
  //  - A random room to be designated as the end room (with stairs and nothing else)
  //  - An array of 90% of the remaining rooms, for placing random stuff (leaving 10% empty)
  const rooms = dungeon.rooms.slice();
  const startRoom = rooms.shift();
  const endRoom = Phaser.Utils.Array.RemoveRandomElement(rooms) as Room;
  const otherRooms = Phaser.Utils.Array.Shuffle(rooms).slice(
    0,
    rooms.length * 0.9
  );

  // Place the stairs
  stuffLayer.putTileAt(TILES.STAIRS, endRoom.centerX, endRoom.centerY);

  // Place stuff in the 90% "otherRooms"
  otherRooms.forEach((room) => {
    const rand = Math.random();
    if (rand <= 0.25) {
      // 25% chance of chest
      stuffLayer.putTileAt(TILES.CHEST, room.centerX, room.centerY);
    } else if (rand <= 0.5) {
      // 50% chance of a pot anywhere in the room... except don't block a door!
      const x = Phaser.Math.Between(room.left + 2, room.right - 2);
      const y = Phaser.Math.Between(room.top + 2, room.bottom - 2);
      stuffLayer.weightedRandomize(TILES.POT, x, y, 1, 1);
    } else {
      // 25% of either 2 or 4 towers, depending on the room size
      // eslint-disable-next-line no-lonely-if -- safe
      if (room.height >= 9) {
        stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY + 1);
        stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY + 1);
        stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY - 2);
        stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY - 2);
      } else {
        stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY - 1);
        stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY - 1);
      }
    }
  });

  groundLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);
  stuffLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);

  stuffLayer.setTileIndexCallback(
    TILES.STAIRS,
    () => {
      stuffLayer.setTileIndexCallback(TILES.STAIRS, () => true, {});
      scene.endRound();
      scene.player.freeze();
      const cam = scene.cameras.main;
      cam.fade(250, 0, 0, 0);
      cam.once('camerafadeoutcomplete', () => {
        gameState.incrementLevel();
        scene.player.destroy();
        scene.enemies = [];
        scene.coins = [];

        scene.scene.restart();
      });
    },
    {}
  );

  if (!startRoom) {
    throw new Error('Start room not found');
  }

  scene.startRoom = startRoom;

  const x = map.tileToWorldX(startRoom.centerX)!;
  const y = map.tileToWorldY(startRoom.centerY)!;

  return {
    map,
    otherRooms,
    tileset,
    startX: x,
    startY: y,
    groundLayer,
    stuffLayer,
    mapHeight: map.heightInPixels,
    mapWidth: map.widthInPixels,
  };
};

export function placeCoins(
  this: DungeonGameScene,
  map: Phaser.Tilemaps.Tilemap,
  stuffLayer: Phaser.Tilemaps.TilemapLayer
) {
  // Place Coins
  const coins: Coin[] = [];
  this.dungeon.rooms.forEach((room) => {
    const maxCoinsPerRoom = (room.width * room.height) / 50; // 1% of the tiles in the room
    const coinsInRoom = Phaser.Math.Between(1, maxCoinsPerRoom);
    for (let i = 0; i < coinsInRoom; i++) {
      const x = Phaser.Math.Between(room.left + 2, room.right - 2);
      const y = Phaser.Math.Between(room.top + 2, room.bottom - 2);
      const xWorld = map.tileToWorldX(x)!;
      const yWorld = map.tileToWorldY(y)!;
      const existing = stuffLayer.getTileAtWorldXY(
        xWorld,
        yWorld
      ) as Phaser.Tilemaps.Tile | null;
      const c = pickRandomCoin();
      if (!existing) {
        const coin = new Coin(this, xWorld, yWorld, c, room);
        coins.push(coin);
      }
    }
  });

  return coins;
}

export function placeEnemies(
  this: DungeonGameScene,
  rooms: Room[],
  map: Phaser.Tilemaps.Tilemap,
  stuffLayer: Phaser.Tilemaps.TilemapLayer
) {
  // Place enemies
  const enemies: Enemy[] = [];
  rooms.forEach((room) => {
    const totalTiles = room.width * room.height;
    // TODO: make this more interesting like boss enemies on higher levels...

    const maxEnemiesPerRoom = totalTiles / 100; // 1% of the tiles in the room
    const enemiesInRoom = Phaser.Math.Between(1, maxEnemiesPerRoom);
    for (let i = 0; i < enemiesInRoom; i++) {
      const x = Phaser.Math.Between(room.left + 2, room.right - 2);
      const y = Phaser.Math.Between(room.top + 2, room.bottom - 2);
      const xWorld = map.tileToWorldX(x)!;
      const yWorld = map.tileToWorldY(y)!;
      const existing = stuffLayer.getTileAtWorldXY(
        xWorld,
        yWorld
      ) as Phaser.Tilemaps.Tile | null;
      const c = pickRandomEnemy();
      if (!existing) {
        const enemy = new Enemy(this, xWorld, yWorld, c, room);
        enemies.push(enemy);
      }
    }
  });

  return enemies;
}

export function createAnimations(scene: DungeonGameScene) {
  const anims = scene.anims;
  enemies.forEach((enemy) => {
    scene.anims.create({
      key: `move-left-${enemy.key}`,
      frames: anims.generateFrameNames(enemy.key, {
        start: 0,
        end: 0,
      }),
      frameRate: 10,
      repeat: -1,
    });

    scene.anims.create({
      key: `move-right-${enemy.key}`,
      frames: anims.generateFrameNames(enemy.key, {
        start: 1,
        end: 1,
      }), // 1st frame (right)
      frameRate: 10,
      repeat: -1,
    });

    scene.anims.create({
      key: `move-up-${enemy.key}`,
      frames: anims.generateFrameNames(enemy.key, {
        start: 2,
        end: 2,
      }), // 2nd frame (up)
      frameRate: 10,
      repeat: -1,
    });

    scene.anims.create({
      key: `move-down-${enemy.key}`,
      frames: anims.generateFrameNames(enemy.key, {
        start: 3,
        end: 3,
      }), // 3rd frame (down)
      frameRate: 10,
      repeat: -1,
    });
  });

  coins.forEach((coin) => {
    scene.anims.create({
      key: `coin-${coin.key}`,
      frames: anims.generateFrameNumbers(coin.key, { start: 0, end: 3 }),
      frameRate: 4,
      repeat: -1,
    });
  });
}
