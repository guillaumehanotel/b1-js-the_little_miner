import * as Phaser from 'phaser';
import { BLOCK_TYPES, type BlockKind } from '../model/blockTypes';
import type { Perk, PerkRarity } from '../model/perks';

export const FONT = '"Press Start 2P", monospace';

export function textStyle(size: number, color = '#ffffff'): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: FONT,
    fontSize: `${size}px`,
    color,
    stroke: '#1a0f08',
    strokeThickness: Math.max(3, size / 4),
  };
}

/** Éclats de bloc : un émetteur par type, créé à la demande. */
export class Debris {
  private emitters = new Map<BlockKind, Phaser.GameObjects.Particles.ParticleEmitter>();

  constructor(private scene: Phaser.Scene) {}

  burst(kind: BlockKind, x: number, y: number, count: number): void {
    this.emitter(kind).explode(count, x, y);
  }

  private emitter(kind: BlockKind): Phaser.GameObjects.Particles.ParticleEmitter {
    let emitter = this.emitters.get(kind);
    if (!emitter) {
      emitter = this.scene.add.particles(0, 0, 'px', {
        emitting: false,
        tint: BLOCK_TYPES[kind].color,
        speed: { min: 60, max: 220 },
        angle: { min: 200, max: 340 },
        gravityY: 700,
        lifespan: { min: 350, max: 700 },
        scale: { start: 1, end: 0.2 },
        rotate: { min: 0, max: 360 },
      });
      emitter.setDepth(50);
      this.emitters.set(kind, emitter);
    }
    return emitter;
  }
}

/** Petit texte qui monte et s'efface (« +3 », « +5 ⛏ »). */
export function floatingText(scene: Phaser.Scene, x: number, y: number, label: string, color: string): void {
  const text = scene.add.text(x, y, label, textStyle(16, color)).setOrigin(0.5).setDepth(80);
  scene.tweens.add({
    targets: text,
    y: y - 50,
    alpha: { from: 1, to: 0 },
    scale: { from: 1.4, to: 1 },
    duration: 900,
    ease: 'Cubic.easeOut',
    onComplete: () => text.destroy(),
  });
}

/** Bouton image qui grossit au survol. */
export function imageButton(scene: Phaser.Scene, x: number, y: number, texture: string, onClick: () => void) {
  const button = scene.add.image(x, y, texture).setInteractive({ useHandCursor: false });
  button.on('pointerover', () => scene.tweens.add({ targets: button, scale: 1.08, duration: 120 }));
  button.on('pointerout', () => scene.tweens.add({ targets: button, scale: 1, duration: 120 }));
  button.on('pointerdown', onClick);
  scene.tweens.add({ targets: button, y: y - 4, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  return button;
}

/** Curseur en forme de pioche (souris uniquement ; masqué sur écran tactile). */
export function pickaxeCursor(scene: Phaser.Scene): Phaser.GameObjects.Image | null {
  if (!window.matchMedia('(pointer: fine)').matches) return null;
  const cursor = scene.add.image(-100, -100, 'pioche').setOrigin(0.25, 0.25).setDepth(1000);
  const follow = () => {
    const point = scene.input.activePointer.positionToCamera(scene.cameras.main) as Phaser.Math.Vector2;
    cursor.setPosition(point.x, point.y);
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, follow);
  // Phaser ne vide pas scene.events à l'arrêt : sans ça, chaque partie ajouterait un écouteur.
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, follow));
  return cursor;
}

const RARITY_COLOR: Record<PerkRarity, number> = {
  common: 0xc9a36b,
  rare: 0x5decf5,
  curse: 0xd05ae8,
  evolution: 0xffd84a,
};
const RARITY_TAG: Record<PerkRarity, string> = { common: '', rare: 'rare', curse: 'malédiction', evolution: 'évolution' };

/** Carte de pouvoir dessinée en code : cadre coloré selon la rareté, icône = texture de bloc. */
export function perkCard(
  scene: Phaser.Scene,
  x: number,
  y: number,
  perk: Perk,
  {
    width = 360,
    height = 104,
    dimmed = false,
    compact = false,
    /** Niveau à afficher en pastilles (0 = pas de pastilles). */
    level = 0,
  } = {},
): Phaser.GameObjects.Container {
  const color = RARITY_COLOR[perk.rarity];
  const iconSize = compact ? 34 : 48;
  const left = -width / 2 + (compact ? 58 : 82);
  const card = scene.add.container(x, y);
  const bg = scene.add
    .rectangle(0, 0, width, height, 0x1f1610, 0.95)
    .setStrokeStyle(3, color, dimmed ? 0.35 : 1);
  const icon = scene.add.image(-width / 2 + (compact ? 28 : 42), 0, perk.icon, 0);
  icon.setScale(iconSize / Math.max(icon.width, icon.height));
  const name = scene.add.text(left, compact ? -20 : -height / 2 + 16, perk.name, textStyle(compact ? 10 : 12));
  const text = scene.add.text(left, compact ? 0 : -height / 2 + 40, perk.text, {
    ...textStyle(compact ? 7 : 8, '#e8d5b0'),
    lineSpacing: compact ? 3 : 6,
  });
  card.add([bg, icon, name, text]);
  const tag = RARITY_TAG[perk.rarity];
  if (tag) {
    card.add(
      scene.add
        .text(width / 2 - 8, -height / 2 + 8, tag, textStyle(compact ? 6 : 8, `#${color.toString(16).padStart(6, '0')}`))
        .setOrigin(1, 0),
    );
  }
  // Pastilles de niveau (★) en bas à droite : pleines jusqu'au niveau atteint.
  if (level > 0 && perk.maxLevel > 1) {
    for (let i = 0; i < perk.maxLevel; i++) {
      const pip = scene.add
        .rectangle(width / 2 - 14 - (perk.maxLevel - 1 - i) * 14, height / 2 - 14, 9, 9, color, i < level ? 1 : 0)
        .setStrokeStyle(2, color);
      card.add(pip);
    }
  }
  if (perk.rarity === 'evolution') {
    scene.tweens.add({ targets: bg, strokeAlpha: 0.4, duration: 450, yoyo: true, repeat: -1 });
  }
  if (dimmed) card.setAlpha(0.55);
  card.setSize(width, height);
  return card;
}
