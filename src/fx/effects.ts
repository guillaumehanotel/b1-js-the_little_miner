import * as Phaser from 'phaser';
import { BLOCK_TYPES, type BlockKind } from '../model/blockTypes';

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
