import * as Phaser from 'phaser';
import { GAME_WIDTH } from '../config';
import { textStyle } from '../fx/effects';
import type { MinerGame } from '../model/game';

/** Tableau de bord, dans sa propre scène pour ne pas trembler avec la caméra du jeu. */
export class HudScene extends Phaser.Scene {
  private picks!: Phaser.GameObjects.Text;
  private depth!: Phaser.GameObjects.Text;
  private score!: Phaser.GameObjects.Text;
  private lastPicks = -1;
  private warning?: Phaser.Tweens.Tween;

  constructor() {
    super('hud');
  }

  create(): void {
    this.lastPicks = -1;
    this.warning = undefined;
    this.add.rectangle(0, 0, GAME_WIDTH, 44, 0x000000, 0.45).setOrigin(0);
    this.add.image(22, 22, 'pioche').setScale(0.6);
    this.picks = this.add.text(44, 22, '', textStyle(16)).setOrigin(0, 0.5);
    this.score = this.add.text(GAME_WIDTH / 2 + 20, 22, '', textStyle(12, '#ffd84a')).setOrigin(0.5);
    this.depth = this.add.text(GAME_WIDTH - 12, 22, '', textStyle(16)).setOrigin(1, 0.5);

    const game = this.scene.get('game');
    game.events.on('state', this.refresh, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => game.events.off('state', this.refresh, this));
    this.refresh((game as unknown as { model: MinerGame }).model);
  }

  private refresh(model: MinerGame): void {
    this.picks.setText(String(model.picks));
    this.depth.setText(`${model.depth} m`);
    this.score.setText(`${model.score} pts`);

    if (this.lastPicks >= 0 && model.picks > this.lastPicks) {
      this.tweens.add({ targets: this.picks, scale: 1.6, duration: 140, yoyo: true, ease: 'Back.easeOut' });
    }
    this.lastPicks = model.picks;

    const low = model.picks <= 10;
    this.picks.setColor(low ? '#ff5a4a' : '#ffffff');
    if (low && !this.warning) {
      this.warning = this.tweens.add({ targets: this.picks, alpha: 0.35, duration: 380, yoyo: true, repeat: -1 });
    } else if (!low && this.warning) {
      this.warning.stop();
      this.warning = undefined;
      this.picks.setAlpha(1);
    }
  }
}
