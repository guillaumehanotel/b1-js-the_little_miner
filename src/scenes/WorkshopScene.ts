import * as Phaser from 'phaser';
import { GAME_WIDTH, VIEW_HEIGHT } from '../config';
import { playSfx } from '../fx/audio';
import { perkCard, pickaxeCursor, textStyle } from '../fx/effects';
import { TOKEN_UPGRADES, type TokenKind, meta } from '../meta';
import { PERKS } from '../model/perks';

/** L'Atelier : dépenser ses gemmes pour ajouter des cartes au tirage. */
export class WorkshopScene extends Phaser.Scene {
  constructor() {
    super('workshop');
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    this.add.image(0, 0, 'ground').setOrigin(0);
    this.add.rectangle(0, 0, GAME_WIDTH, VIEW_HEIGHT, 0x000000, 0.65).setOrigin(0);

    this.add.text(cx, 34, 'Atelier', textStyle(20, '#ffd84a')).setOrigin(0.5);
    this.add.image(cx - 40, 70, 'diamond_block').setScale(0.3);
    this.add.text(cx - 22, 70, `${meta.gems}`, textStyle(12)).setOrigin(0, 0.5);

    // Jetons de l'écran des cartes : un bouton par type, niveau en pastilles.
    (Object.keys(TOKEN_UPGRADES) as TokenKind[]).forEach((kind, i) => this.tokenButton(kind, 110 + i * 200, 112));

    const unlockable = PERKS.filter((p) => p.cost > 0);
    unlockable.forEach((perk, i) => {
      const y = 170 + i * 54;
      const owned = meta.isUnlocked(perk);
      const affordable = meta.gems >= perk.cost;
      const card = perkCard(this, cx - 30, y, perk, { width: 330, height: 48, dimmed: !owned && !affordable, compact: true });

      const label = owned ? 'OK' : `${perk.cost}`;
      const price = this.add
        .text(GAME_WIDTH - 12, y, label, textStyle(10, owned ? '#8cff6b' : affordable ? '#ffd84a' : '#8a7658'))
        .setOrigin(1, 0.5);
      if (!owned && affordable) {
        card.setInteractive({ useHandCursor: false });
        card.on('pointerdown', () => {
          if (!meta.buy(perk)) return;
          playSfx(this, 'bonus');
          this.scene.restart();
        });
        this.tweens.add({ targets: price, scale: 1.2, duration: 500, yoyo: true, repeat: -1 });
      }
    });

    const back = this.add.text(cx, VIEW_HEIGHT - 36, 'Retour', textStyle(14, '#ffffff')).setOrigin(0.5).setInteractive();
    back.on('pointerdown', () => this.scene.start('title'));
    this.input.keyboard?.once('keydown-ESC', () => this.scene.start('title'));
    pickaxeCursor(this);
  }

  private tokenButton(kind: TokenKind, x: number, y: number): void {
    const cost = meta.tokenCost(kind);
    const affordable = cost !== null && meta.gems >= cost;
    const button = this.add.container(x, y);
    button.add(this.add.rectangle(0, 0, 180, 50, 0x1f1610, 0.95).setStrokeStyle(3, 0xffd84a, affordable ? 1 : 0.35));
    button.add(this.add.text(0, -12, `${TOKEN_UPGRADES[kind].name} ×${meta.tokens(kind)}`, textStyle(8)).setOrigin(0.5));
    const label = cost === null ? 'max' : `+1 : ${cost}`;
    button.add(this.add.text(0, 10, label, textStyle(8, affordable ? '#ffd84a' : '#8a7658')).setOrigin(0.5));
    if (!affordable) return;
    button.setSize(180, 50).setInteractive();
    button.on('pointerdown', () => {
      if (!meta.buyToken(kind)) return;
      playSfx(this, 'bonus');
      this.scene.restart();
    });
  }
}
