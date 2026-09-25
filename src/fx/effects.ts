import * as Phaser from 'phaser';
import { BLOCK_TYPES, type BlockKind } from '../model/blockTypes';
import { meta } from '../meta';
import { MAX_SLOTS, PERKS, PERKS_BY_ID, type Perk, type PerkRarity } from '../model/perks';

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
/** Évolution dont cette carte fait partie, et la carte qu'il faut en plus. */
function evolutionHint(perk: Perk): string | null {
  for (const evo of PERKS) {
    if (!evo.evolves) continue;
    const { from, with: partner } = evo.evolves;
    if (perk.id === from) return `Évolue avec ${PERKS_BY_ID.get(partner)?.name}`;
    if (perk.id === partner) return `Évolue avec ${PERKS_BY_ID.get(from)?.name} max`;
  }
  return null;
}

/** Libellé de niveau : « Nouveau », « Niv. 1 > 2 », « Niv. 2 > MAX », ou le niveau obtenu. */
function levelLabel(perk: Perk, level: number, from?: number): { text: string; color: string } | null {
  if (perk.evolves) return { text: `Remplace ${PERKS_BY_ID.get(perk.evolves.from)?.name}`, color: '#ffd84a' };
  if (perk.instant || level <= 0) return null;
  const show = (n: number) => (n >= perk.maxLevel && perk.maxLevel > 1 ? 'MAX' : String(n));
  if (from === 0) return { text: 'Nouveau', color: '#8cff6b' };
  if (from !== undefined) return { text: `Niv. ${from} > ${show(level)}`, color: '#ffd84a' };
  return { text: perk.maxLevel > 1 ? `Niv. ${show(level)}` : '', color: '#ffd84a' };
}

export function perkCard(
  scene: Phaser.Scene,
  x: number,
  y: number,
  perk: Perk,
  {
    width = 360,
    height = 116,
    dimmed = false,
    compact = false,
    /** Niveau affiché (après avoir pris la carte) ; 0 = pas d'indication de niveau. */
    level = 0,
    /** Niveau avant de la prendre (écran de choix) : affiche « Nouveau » ou « Niv. 1 > 2 ». */
    from = undefined as number | undefined,
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

  // Niveau : pastilles (pleines jusqu'au niveau, la nouvelle clignote) + libellé en clair.
  const bottom = height / 2 - (compact ? 10 : 14);
  if (level > 0 && perk.maxLevel > 1 && !perk.instant) {
    for (let i = 0; i < perk.maxLevel; i++) {
      const pip = scene.add
        .rectangle(width / 2 - 14 - (perk.maxLevel - 1 - i) * 14, bottom, 9, 9, color, i < level ? 1 : 0)
        .setStrokeStyle(2, color);
      card.add(pip);
      if (from !== undefined && i === level - 1) {
        scene.tweens.add({ targets: pip, alpha: 0.2, duration: 350, yoyo: true, repeat: -1 });
      }
    }
  }
  const label = levelLabel(perk, level, from);
  if (label?.text) {
    const pipsWidth = perk.maxLevel > 1 ? perk.maxLevel * 14 + 8 : 0;
    card.add(
      scene.add
        .text(width / 2 - 8 - pipsWidth, bottom, label.text, textStyle(compact ? 7 : 8, label.color))
        .setOrigin(1, 0.5),
    );
  }
  // Recette d'évolution (écran de choix uniquement) : pour apprendre les combinaisons en jouant.
  const hint = compact ? null : evolutionHint(perk);
  if (hint) card.add(scene.add.text(left, bottom - 18, hint, textStyle(7, '#ffd84a')).setOrigin(0, 0.5).setAlpha(0.8));

  if (perk.rarity === 'evolution') {
    scene.tweens.add({ targets: bg, strokeAlpha: 0.4, duration: 450, yoyo: true, repeat: -1 });
  }
  if (dimmed) card.setAlpha(0.55);
  card.setSize(width, height);
  return card;
}

/**
 * Les cartes possédées, en rangée : icône, cadre de la couleur de la rareté, pastilles de niveau
 * dessous, et les emplacements encore libres en pointillé pour voir la limite de 6.
 */
export function buildStrip(
  scene: Phaser.Scene,
  x: number,
  y: number,
  owned: Record<string, number>,
  size = 26,
): Phaser.GameObjects.Container {
  const strip = scene.add.container(x, y);
  const step = size + 12;
  const entries = Object.entries(owned);
  for (let slot = 0; slot < MAX_SLOTS; slot++) {
    const cx = slot * step + size / 2;
    const entry = entries[slot];
    const perk = entry && PERKS_BY_ID.get(entry[0]);
    if (!perk) {
      strip.add(scene.add.rectangle(cx, 0, size, size, 0x000000, 0.35).setStrokeStyle(1, 0x6b5a44, 0.8));
      continue;
    }
    const level = entry[1];
    const color = RARITY_COLOR[perk.rarity];
    strip.add(scene.add.rectangle(cx, 0, size, size, 0x1f1610, 0.9).setStrokeStyle(2, color));
    const icon = scene.add.image(cx, 0, perk.icon, 0);
    icon.setScale((size - 6) / Math.max(icon.width, icon.height));
    strip.add(icon);
    const max = perk.maxLevel;
    const full = level >= max;
    for (let i = 0; i < max; i++) {
      const px = cx + (i - (max - 1) / 2) * 7;
      strip.add(
        scene.add
          .rectangle(px, size / 2 + 5, 5, 5, full ? 0xffd84a : color, i < level ? 1 : 0)
          .setStrokeStyle(1, full ? 0xffd84a : color),
      );
    }
  }
  return strip;
}

/** Bouton encadré vers l'Atelier ; il pulse avec une pastille verte quand un achat est possible. */
export function workshopButton(scene: Phaser.Scene, x: number, y: number, width = 240, height = 56) {
  const button = scene.add.container(x, y);
  const frame = scene.add.rectangle(0, 0, width, height, 0x1f1610, 0.95).setStrokeStyle(3, 0x5decf5);
  const big = height >= 50;
  button.add([
    frame,
    scene.add.text(-width / 2 + 20, 0, 'Atelier', textStyle(big ? 16 : 12, '#5decf5')).setOrigin(0, 0.5),
    scene.add.image(width / 2 - 68, 0, 'diamond_block').setScale(big ? 0.4 : 0.3),
    scene.add.text(width / 2 - 48, 0, String(meta.gems), textStyle(big ? 14 : 12)).setOrigin(0, 0.5),
  ]);
  if (meta.canBuySomething()) {
    button.add(scene.add.circle(width / 2 - 4, -height / 2 + 4, 7, 0x8cff6b).setStrokeStyle(2, 0x1a0f08));
    scene.tweens.add({ targets: frame, strokeAlpha: 0.35, duration: 600, yoyo: true, repeat: -1 });
  }
  button.setSize(width, height).setInteractive();
  button.on('pointerover', () => scene.tweens.add({ targets: button, scale: 1.06, duration: 120 }));
  button.on('pointerout', () => scene.tweens.add({ targets: button, scale: 1, duration: 120 }));
  button.on('pointerdown', () => scene.scene.start('workshop'));
  return button;
}
