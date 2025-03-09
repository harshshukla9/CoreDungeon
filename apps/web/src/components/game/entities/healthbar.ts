import type Phaser from 'phaser';

export class HealthBar {
  private scene: Phaser.Scene;
  private enemy: Phaser.Physics.Arcade.Sprite;

  private healthBarForeground: Phaser.GameObjects.Graphics;
  private healthBarBackground: Phaser.GameObjects.Graphics;
  private totalHealth: number;
  private currentHealth: number;

  constructor(
    scene: Phaser.Scene,
    enemy: Phaser.Physics.Arcade.Sprite,
    totalHealth: number
  ) {
    this.scene = scene;
    this.enemy = enemy;
    this.totalHealth = totalHealth;
    this.currentHealth = totalHealth;

    this.healthBarBackground = this.scene.add.graphics();
    this.healthBarBackground.fillStyle(0x000000, 1);
    this.healthBarBackground.fillRect(0, 0, 64, 8);

    this.healthBarForeground = this.scene.add.graphics();
    this.healthBarForeground.fillStyle(0xff0000, 1);
    this.healthBarForeground.fillRect(0, 0, 58, 4);

    this.updateHealthBar();
  }

  updateHealthBar() {
    const percentHealth = this.currentHealth / this.totalHealth;

    this.healthBarForeground.clear();
    this.healthBarForeground.fillStyle(0xff0000, 1);
    this.healthBarForeground.fillRect(0, 0, 58 * percentHealth, 4);
    this.healthBarForeground.fillStyle(0xffffff, 1);
  }

  updateHealthBarPosition() {
    const x = this.enemy.x - 32;
    const y = this.enemy.y - 40;
    this.healthBarForeground.setPosition(x, y);
    this.healthBarBackground.setPosition(x - 3, y - 2);
  }

  takeDamage(amount: number) {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.updateHealthBar();
  }

  heal(amount: number) {
    this.currentHealth = Math.min(
      this.totalHealth,
      this.currentHealth + amount
    );
    this.updateHealthBar();
  }

  setVisible(visible: boolean) {
    this.healthBarBackground.setVisible(visible);
    this.healthBarForeground.setVisible(visible);
  }

  destroy() {
    this.healthBarBackground.destroy();
    this.healthBarForeground.destroy();
  }
}
