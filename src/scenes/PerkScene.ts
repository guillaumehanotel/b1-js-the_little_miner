import * as Phaser from 'phaser';
import { GAME_WIDTH, LEVEL_EVERY_METERS, VIEW_HEIGHT } from '../config';
import { playSfx } from '../fx/audio';
import { perkCard, pickaxeCursor, textStyle } from '../fx/effects';
import type { GameScene } from './GameScene';

/** Choix d'une carte parmi 3, par-dessus la partie mise en pause. */
export class PerkScene extends Phaser.Scene {
  private chosen = false;

  constructor() {
    super('perk');
  }

  create(): void {
    this.chosen = false;
    const game = this.scene.get('game') as GameScene;
    const model = game.model;
    const offer = model.offer;
    const cx = GAME_WIDTH / 2;

    this.add.rectangle(0, 0, GAME_WIDTH, VIEW_HEIGHT, 0x000000, 0.72).setOrigin(0);
    const meters = (model.level - model.pendingChoices + 1) * LEVEL_EVERY_METERS;
    this.add.text(cx, 140, `${meters} m`, textStyle(28, '#ffd84a')).setOrigin(0.5);

    offer.forEach((perk, i) => {
      const y = 250 + i * 124;
      const card = perkCard(this, cx, y, perk);
      card.setInteractive({ useHandCursor: false });
      card.on('pointerover', () => this.tweens.add({ targets: card, scale: 1.04, duration: 100 }));
      card.on('pointerout', () => this.tweens.add({ targets: card, scale: 1, duration: 100 }));
      card.on('pointerdown', () => this.choose(i, card));
      this.tweens.add({ targets: card, y: { from: y + 60, to: y }, alpha: { from: 0, to: 1 }, delay: i * 90, duration: 280, ease: 'Back.easeOut' });
      this.input.keyboard?.once(`keydown-${['ONE', 'TWO', 'THREE'][i]}`, () => this.choose(i, card));
    });

    playSfx(this, 'bonus');
    pickaxeCursor(this);
  }

  private choose(index: number, card: Phaser.GameObjects.Container): void {
    if (this.chosen) return;
    this.chosen = true;
    playSfx(this, 'break');
    this.tweens.add({ targets: card, scale: 1.12, duration: 120, yoyo: true });

    this.time.delayedCall(260, () => {
      const game = this.scene.get('game') as GameScene;
      game.model.choose(index);
      if (game.model.awaitingChoice) {
        this.scene.restart(); // un autre palier franchi d'un coup : nouveau tirage
      } else {
        this.scene.stop();
        this.scene.resume('game');
      }
    });
  }
}
