import type { CoinType } from '~/lib/helpers/game';

import { makeAutoObservable } from 'mobx';

export class GameState {
  public level = 1;
  public score = 0;
  public playerHealth = 100;
  public isAttacking = false;
  public isHurting = false;
  public isDying = false;
  public totalLives = 3;
  public times: { round: number; start: number; end?: number }[] = [];
  public activeScene: 'home' | 'game' | 'game-over';

  constructor() {
    makeAutoObservable(this);
    this.activeScene = 'home';
  }

  public incrementLevel() {
    this.level++;
  }

  public decreaseLives() {
    this.totalLives--;
  }

  public increaseLives() {
    this.totalLives++;
  }

  public setAttacking(isAttacking: boolean) {
    this.isAttacking = isAttacking;
  }

  public setHurting(isHurting: boolean) {
    this.isHurting = isHurting;
  }

  public setDying(isDying: boolean) {
    this.isDying = isDying;
  }

  public getHealth() {
    return this.playerHealth;
  }

  decrementHealth(amount: number) {
    this.playerHealth = Math.max(this.playerHealth - amount, 0);
  }

  incrementHealth(amount: number) {
    this.playerHealth = Math.min(this.playerHealth + amount, 100);
  }

  public addCoin(type: CoinType) {
    this.score += type.points;
  }

  public incrementScore(points: number) {
    this.score += points;
  }

  public reset() {
    this.level = 1;
    this.score = 0;
    this.playerHealth = 100;
    this.isAttacking = false;
    this.isHurting = false;
    this.isDying = false;
    this.totalLives = 3;
    this.times = [];
    this.activeScene = 'home';
  }
}

export const gameState = new GameState();
