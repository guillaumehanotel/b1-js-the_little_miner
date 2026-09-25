import * as Phaser from 'phaser';
import { GAME_WIDTH, VIEW_HEIGHT } from '../config';
import { playSfx } from '../fx/audio';
import { perkCard, pickaxeCursor, textStyle } from '../fx/effects';
import { PERKS, type Perk } from '../model/perks';
import type { GameScene } from './GameScene';

/** Délai avant que la première case s'arrête, puis entre deux cases. */
const FIRST_STOP_MS = 700;
const NEXT_STOP_MS = 420;
const SPIN_TICK_MS = 70;

interface Slot {
  perk: Perk;
  /** Niveau atteint à ce moment du coffre (une même carte peut sortir deux fois). */
  level: number;
  y: number;
  spinner: Phaser.GameObjects.Container;
  landed: boolean;
}

/**
 * Roulette d'un coffre, façon machine à sous de Vampire Survivors.
 * Les améliorations sont déjà appliquées par le modèle : cette scène ne fait que les révéler.
 */
export class ChestScene extends Phaser.Scene {
  private slots: Slot[] = [];
  private done = false;

  constructor() {
    super('chest');
  }

  create({ perks }: { perks: Perk[] }): void {
    this.done = false;
    const cx = GAME_WIDTH / 2;
    this.add.rectangle(0, 0, GAME_WIDTH, VIEW_HEIGHT, 0x000000, 0.75).setOrigin(0);
    const chest = this.add.image(cx, 130, 'chest_block').setScale(1.6);
    this.tweens.add({ targets: chest, angle: { from: -8, to: 8 }, duration: 90, yoyo: true, repeat: 5 });
    this.add
      .text(cx, 200, perks.length > 1 ? `${perks.length} améliorations` : '1 amélioration', textStyle(14, '#ffd84a'))
      .setOrigin(0.5);

    // Le modèle a déjà tout appliqué : on reconstitue le niveau de chaque case en remontant le temps.
    const model = (this.scene.get('game') as GameScene).model;
    const top = 260;
    this.slots = perks.map((perk, i) => {
      const y = top + i * 64;
      const later = perks.slice(i + 1).filter((p) => p.id === perk.id).length;
      const level = perk.instant ? 0 : Math.max(1, model.levelOf(perk.id) - later);
      const spinner = this.spinner(cx, y);
      this.time.delayedCall(FIRST_STOP_MS + i * NEXT_STOP_MS, () => this.land(this.slots[i]));
      return { perk, level, y, spinner, landed: false };
    });

    this.input.on(Phaser.Input.Events.POINTER_DOWN, () => this.advance());
    this.input.keyboard?.on('keydown-SPACE', () => this.advance());
    this.input.keyboard?.on('keydown-ENTER', () => this.advance());
    playSfx(this, 'boom', 0.4);
    pickaxeCursor(this);
  }

  /** Case qui fait défiler des cartes au hasard jusqu'à son arrêt. */
  private spinner(x: number, y: number): Phaser.GameObjects.Container {
    const box = this.add.container(x, y);
    box.add(this.add.rectangle(0, 0, 330, 54, 0x1f1610, 0.95).setStrokeStyle(3, 0x6b5a44));
    const icon = this.add.image(-137, 0, 'pioche');
    const name = this.add.text(-107, 0, '', textStyle(10, '#8a7658')).setOrigin(0, 0.5);
    box.add([icon, name]);
    const spin = () => {
      const perk = PERKS[Math.floor(Math.random() * PERKS.length)];
      icon.setTexture(perk.icon, 0);
      icon.setScale(34 / Math.max(icon.width, icon.height));
      name.setText(perk.name);
    };
    spin();
    const timer = this.time.addEvent({ delay: SPIN_TICK_MS, loop: true, callback: spin });
    box.once(Phaser.GameObjects.Events.DESTROY, () => timer.remove());
    return box;
  }

  private land(slot: Slot | undefined): void {
    if (!slot || slot.landed) return;
    slot.landed = true;
    slot.spinner.destroy();
    const card = perkCard(this, GAME_WIDTH / 2, slot.y, slot.perk, {
      width: 330,
      height: 54,
      compact: true,
      level: slot.level,
    });
    this.tweens.add({ targets: card, scale: { from: 1.25, to: 1 }, duration: 220, ease: 'Back.easeOut' });
    playSfx(this, slot.perk.rarity === 'evolution' ? 'boom' : 'break', 0.8);
    if (this.slots.every((s) => s.landed)) this.finish();
  }

  private finish(): void {
    if (this.done) return;
    this.done = true;
    const label = this.add.text(GAME_WIDTH / 2, VIEW_HEIGHT - 50, 'Continuer', textStyle(14)).setOrigin(0.5);
    this.tweens.add({ targets: label, alpha: 0.4, duration: 500, yoyo: true, repeat: -1 });
  }

  /** Premier clic : tout s'arrête d'un coup. Clic suivant : retour au jeu. */
  private advance(): void {
    if (!this.done) {
      this.slots.forEach((slot) => this.land(slot));
      return;
    }
    this.scene.stop();
    this.scene.resume('game');
  }
}
