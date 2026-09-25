import * as Phaser from 'phaser';
import { GAME_WIDTH, VIEW_HEIGHT } from '../config';
import { playSfx } from '../fx/audio';
import { buildStrip, perkCard, pickaxeCursor, textStyle } from '../fx/effects';
import { MAX_SLOTS } from '../model/perks';
import { SKIP_PICKS, levelMeters } from '../model/game';
import type { GameScene } from './GameScene';

/** Choix d'une carte parmi 3, par-dessus la partie mise en pause. */
export class PerkScene extends Phaser.Scene {
  private busy = false;
  private banishing = false;
  private title!: Phaser.GameObjects.Text;
  private cards: Phaser.GameObjects.Container[] = [];

  constructor() {
    super('perk');
  }

  private get play(): GameScene {
    return this.scene.get('game') as GameScene;
  }

  create(): void {
    this.busy = false;
    this.banishing = false;
    const model = this.play.model;
    const cx = GAME_WIDTH / 2;

    this.add.rectangle(0, 0, GAME_WIDTH, VIEW_HEIGHT, 0x000000, 0.72).setOrigin(0);
    const meters = levelMeters(model.level - model.pendingChoices + 1);
    this.title = this.add.text(cx, 66, `${meters} m`, textStyle(28, '#ffd84a')).setOrigin(0.5);
    // Rappel de ce qu'on possède déjà, pour choisir en connaissance de cause.
    const stripWidth = MAX_SLOTS * 38 - 12;
    buildStrip(this, (GAME_WIDTH - stripWidth) / 2, 118, model.owned);

    this.cards = model.offer.map((perk, i) => {
      const y = 216 + i * 126;
      const from = perk.instant ? undefined : model.levelOf(perk.id);
      const card = perkCard(this, cx, y, perk, { level: (from ?? -1) + 1, from });
      card.setInteractive({ useHandCursor: false });
      card.on('pointerover', () => this.tweens.add({ targets: card, scale: 1.04, duration: 100 }));
      card.on('pointerout', () => this.tweens.add({ targets: card, scale: 1, duration: 100 }));
      card.on('pointerdown', () => this.pick(i, card));
      this.tweens.add({
        targets: card,
        y: { from: y + 60, to: y },
        alpha: { from: 0, to: 1 },
        delay: i * 90,
        duration: 280,
        ease: 'Back.easeOut',
      });
      this.input.keyboard?.once(`keydown-${['ONE', 'TWO', 'THREE'][i]}`, () => this.pick(i, card));
      return card;
    });

    this.button(80, `Relancer ${model.rerolls}`, model.rerolls > 0, 'R', () => this.reroll());
    this.button(210, `Passer +${SKIP_PICKS}`, true, 'P', () => this.skip());
    this.button(340, `Bannir ${model.banishes}`, model.banishes > 0, 'B', () => this.toggleBanish());

    playSfx(this, 'bonus');
    pickaxeCursor(this);
  }

  private button(x: number, label: string, enabled: boolean, key: string, action: () => void): void {
    const y = 586;
    const box = this.add
      .rectangle(x, y, 120, 40, 0x1f1610, 0.95)
      .setStrokeStyle(2, 0xc9a36b, enabled ? 1 : 0.3);
    const text = this.add.text(x, y, label, textStyle(8, enabled ? '#ffffff' : '#6b5a44')).setOrigin(0.5);
    if (!enabled) return;
    box.setInteractive();
    box.on('pointerover', () => text.setColor('#ffd84a'));
    box.on('pointerout', () => text.setColor('#ffffff'));
    box.on('pointerdown', action);
    this.input.keyboard?.on(`keydown-${key}`, action);
  }

  private pick(index: number, card: Phaser.GameObjects.Container): void {
    if (this.busy) return;
    if (this.banishing) {
      this.banish(index, card);
      return;
    }
    this.busy = true;
    playSfx(this, 'break');
    this.tweens.add({ targets: card, scale: 1.12, duration: 120, yoyo: true });
    this.time.delayedCall(260, () => {
      this.play.model.choose(index);
      this.next();
    });
  }

  private reroll(): void {
    if (this.busy || !this.play.model.reroll()) return;
    this.busy = true;
    playSfx(this, 'hit');
    this.tweens.add({
      targets: this.cards,
      scaleX: 0,
      duration: 140,
      onComplete: () => this.scene.restart(),
    });
  }

  private skip(): void {
    if (this.busy || !this.play.model.skip()) return;
    this.busy = true;
    playSfx(this, 'bonus');
    this.next();
  }

  /** Mode bannissement : la prochaine carte touchée est retirée pour toute la partie. */
  private toggleBanish(): void {
    if (this.busy) return;
    if (this.banishing) {
      this.scene.restart(); // annuler
      return;
    }
    this.banishing = true;
    this.title.setText('Bannir laquelle ?').setColor('#ff5a4a');
    this.play.model.offer.forEach((perk, i) => {
      const card = this.cards[i];
      // Évolutions et Casse-croûte ne se bannissent pas : grisées.
      if (perk.evolves || perk.instant) card.setAlpha(0.35);
      else (card.list[0] as Phaser.GameObjects.Rectangle).setStrokeStyle(3, 0xff5a4a);
    });
  }

  private banish(index: number, card: Phaser.GameObjects.Container): void {
    if (!this.play.model.banish(index)) {
      playSfx(this, 'bump');
      this.tweens.add({ targets: card, x: card.x + 8, duration: 50, yoyo: true, repeat: 2 });
      return;
    }
    this.busy = true;
    playSfx(this, 'boom', 0.5);
    this.tweens.add({
      targets: card,
      alpha: 0,
      angle: 12,
      y: card.y + 40,
      duration: 260,
      onComplete: () => this.scene.restart(),
    });
  }

  /** Un autre palier attend (franchi d'un coup) : nouveau tirage ; sinon retour au jeu. */
  private next(): void {
    if (this.play.model.awaitingChoice) {
      this.scene.restart();
    } else {
      this.scene.stop();
      this.scene.resume('game');
    }
  }
}
