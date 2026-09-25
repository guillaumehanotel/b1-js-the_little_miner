import * as Phaser from 'phaser';
import { GAME_WIDTH, VIEW_HEIGHT } from '../config';
import { imageButton, pickaxeCursor, textStyle } from '../fx/effects';
import { BLOCK_TYPES, ORE_KINDS, ORE_POINTS } from '../model/blockTypes';
import type { GameOverData } from './GameScene';

const REASONS = {
  picks: 'Plus de coups de pioche !',
  scroll: 'Tu as été distancé…',
};

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('gameover');
  }

  create(data: GameOverData): void {
    const cx = GAME_WIDTH / 2;
    this.add.image(0, 0, 'ground').setOrigin(0);
    this.add.rectangle(0, 0, GAME_WIDTH, VIEW_HEIGHT, 0x000000, 0.6).setOrigin(0);

    this.add.image(cx, 90, 'gameover').setScale(0.9);
    this.add.text(cx, 170, REASONS[data.reason], textStyle(10, '#e8d5b0')).setOrigin(0.5);

    // Le score défile de 0 à sa valeur.
    const score = this.add.text(cx, 225, '0', textStyle(40, '#ffffff')).setOrigin(0.5);
    this.tweens.addCounter({
      from: 0,
      to: data.score,
      duration: Math.min(1500, 300 + data.score * 15),
      ease: 'Cubic.easeOut',
      onUpdate: (tween) => score.setText(String(Math.round(tween.getValue() ?? 0))),
      onComplete: () => this.showBest(data),
    });

    // Détail : profondeur puis chaque minerai, qui apparaissent l'un après l'autre.
    const lines: { icon?: string; label: string; points: number }[] = [
      { label: `Profondeur  ${data.depth} m`, points: data.depth },
      ...ORE_KINDS.map((ore) => ({
        icon: BLOCK_TYPES[ore].texture,
        label: `× ${data.ores[ore]}`,
        points: data.ores[ore] * ORE_POINTS[ore],
      })),
    ];
    lines.forEach((line, i) => {
      const y = 290 + i * 38;
      const row = this.add.container(0, y).setAlpha(0);
      if (line.icon) row.add(this.add.image(110, 0, line.icon).setScale(0.45));
      row.add(this.add.text(line.icon ? 135 : 90, 0, line.label, textStyle(12)).setOrigin(0, 0.5));
      row.add(this.add.text(340, 0, `+${line.points}`, textStyle(12, '#ffd84a')).setOrigin(1, 0.5));
      this.tweens.add({ targets: row, alpha: 1, x: { from: -20, to: 0 }, delay: 200 + i * 120, duration: 250 });
    });

    const replay = () => this.scene.start('game');
    imageButton(this, cx, 540, 'play', replay).setScale(0.8);
    this.input.keyboard?.once('keydown-SPACE', replay);
    this.input.keyboard?.once('keydown-ENTER', replay);

    this.add.text(cx, VIEW_HEIGHT - 20, 'Musique : Fairy Tail, version 8-bit', textStyle(8, '#8a7658')).setOrigin(0.5);
    pickaxeCursor(this);
    this.cameras.main.fadeIn(400);
  }

  private showBest(data: GameOverData): void {
    const cx = GAME_WIDTH / 2;
    if (data.record) {
      const banner = this.add.text(cx, 262, 'Nouveau record !', textStyle(12, '#8cff6b')).setOrigin(0.5);
      this.tweens.add({ targets: banner, scale: { from: 0, to: 1 }, duration: 400, ease: 'Back.easeOut' });
      this.tweens.add({ targets: banner, alpha: 0.5, duration: 500, yoyo: true, repeat: -1, delay: 400 });
    } else {
      this.add.text(cx, 262, `Record : ${data.best}`, textStyle(10, '#c9a36b')).setOrigin(0.5);
    }
  }
}
