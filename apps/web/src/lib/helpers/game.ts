import Dungeon from '@mikewesthad/dungeon';

const mapWidth = (level: number) => 50 + level ** 2 + 10 * level; // 50 61 74 89 106 125
const mapHeight = (level: number) => 50 + level ** 2 + 10 * level; // 50 61 74 89 106 125
const doorPadding = 4;
const roomConfig = () => {
  return {
    width: { min: 7, max: 15, onlyOdd: true },
    height: { min: 7, max: 15, onlyOdd: true },
  };
};

export const generateDungeon = (level: number): Dungeon => {
  return new Dungeon({
    width: mapWidth(level),
    height: mapHeight(level),
    doorPadding,
    rooms: roomConfig(),
  });
};

export interface CoinType {
  key: string;
  weight: number;
  points: number;
  healthRegeneration: number;
}

export const coins: CoinType[] = [
  {
    key: 'diamond',
    weight: 2,
    points: 100,
    healthRegeneration: 40,
  },
  {
    key: 'emerald',
    weight: 4,
    points: 50,
    healthRegeneration: 20,
  },
  {
    key: 'ruby',
    weight: 4,
    points: 50,
    healthRegeneration: 20,
  },
  {
    key: 'gold',
    weight: 10,
    points: 10,
    healthRegeneration: 10,
  },
  {
    key: 'silver',
    weight: 20,
    points: 5,
    healthRegeneration: 5,
  },
];

export const pickRandomCoin = () => {
  // Pick random coin based on weight, more weight = more likely to be picked
  const totalWeight = coins.reduce((acc, coin) => acc + coin.weight, 0);
  const rand = Math.random() * totalWeight;
  let runningWeight = 0;
  for (const coin of coins) {
    runningWeight += coin.weight;
    if (rand < runningWeight) {
      return coin;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- will not occur
  return coins[0]!;
};

export interface EnemyType {
  weight: number;
  key: string;
  maxHealth: number;
  dps: number;
  movementSpeed: number;
  attackCooldown: number;
  pointsOnKill: number;
  maxDistance: number;
  minDistance: number;
}

export const enemies: EnemyType[] = [
  {
    key: 'skeleton',
    weight: 30,
    maxHealth: 50,
    dps: 1,
    movementSpeed: 100,
    attackCooldown: 2000,
    pointsOnKill: 100,
    maxDistance: 200,
    minDistance: 50,
  },
  {
    key: 'archer',
    weight: 10,
    maxHealth: 100,
    dps: 5,
    movementSpeed: 70,
    attackCooldown: 3000,
    pointsOnKill: 150,
    maxDistance: 300,
    minDistance: 200,
  },
];

export const pickRandomEnemy = (): EnemyType => {
  // Pick random enemy based on weight, more weight = more likely to be picked
  const totalWeight = enemies.reduce((acc, enemy) => acc + enemy.weight, 0);
  const rand = Math.random() * totalWeight;
  let runningWeight = 0;
  for (const enemy of enemies) {
    runningWeight += enemy.weight;
    if (rand < runningWeight) {
      return enemy;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- will not occur
  return enemies[0]!;
};
