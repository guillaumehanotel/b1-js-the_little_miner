import * as Phaser from 'phaser';
import {
  BLOCK_SIZE,
  GAME_WIDTH,
  GROUND_Y,
  SCROLL_LOSE_MARGIN,
  SCROLL_SPEED_BASE,
  SCROLL_SPEED_MAX,
  SCROLL_SPEED_PER_METER,
  VIEW_HEIGHT,
} from '../config';
import { playSfx, toggleMute } from '../fx/audio';
import { Debris, floatingText, pickaxeCursor, textStyle } from '../fx/effects';
import { meta } from '../meta';
import { BLOCK_TYPES, isOre } from '../model/blockTypes';
import { type GameEvent, MinerGame } from '../model/game';
import type { Cell } from '../model/grid';
import { type Layer, layerAt } from '../model/layers';
import { storage } from '../storage';

export type EndReason = 'picks' | 'scroll';

export interface GameOverData {
  score: number;
  depth: number;
  ores: MinerGame['ores'];
  orePoints: MinerGame['orePoints'];
  best: number;
  record: boolean;
  reason: EndReason;
  gems: number;
}

/** Délai entre deux cases touchées par une même explosion (effet d'onde). */
const BLAST_STEP_MS = 45;
/** Opacité du brouillard sur un minerai quand on a le Détecteur. */
const DETECTOR_FOG_ALPHA = 0.55;

const center = (cell: Cell) => ({
  x: cell.col * BLOCK_SIZE + BLOCK_SIZE / 2,
  y: GROUND_Y + cell.row * BLOCK_SIZE + BLOCK_SIZE / 2,
});
const distance = (a: Cell, b: Cell) => Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
/** Image de fissure (0 à 9) selon la résistance restante. */
const crackFrame = (hp: number, max: number) => Math.round(((max - hp) / max) * 9);

export class GameScene extends Phaser.Scene {
  model!: MinerGame;
  private blocks = new Map<Cell, Phaser.GameObjects.Image>();
  private cracks = new Map<Cell, Phaser.GameObjects.Sprite>();
  private fog = new Map<Cell, Phaser.GameObjects.Rectangle>();
  /** Lignes actuellement dessinées : seules celles autour de l'écran existent en sprites. */
  private renderedRows = new Set<number>();
  private background!: Phaser.GameObjects.TileSprite;
  private layer!: Layer;
  private debris!: Debris;
  private hover!: Phaser.GameObjects.Rectangle;
  private danger!: Phaser.GameObjects.Image;
  /** Ordonnée (monde) du dernier coup : s'il sort trop haut de l'écran, c'est perdu. */
  private lastHitY = 0;
  private started = false;
  private ended = false;

  constructor() {
    super('game');
  }

  create(): void {
    this.blocks.clear();
    this.cracks.clear();
    this.fog.clear();
    this.renderedRows.clear();
    this.started = false;
    this.ended = false;
    this.model = new MinerGame({ pool: meta.pool() });
    this.layer = layerAt(0);

    // Fond de galerie en boucle, fixé à l'écran et décalé avec la caméra ; le ciel passe devant.
    this.background = this.add
      .tileSprite(0, 0, GAME_WIDTH, VIEW_HEIGHT, 'ground')
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(-2);
    this.add.image(0, 0, 'sky').setOrigin(0).setDepth(-1);

    this.debris = new Debris(this);
    this.hover = this.add
      .rectangle(0, 0, BLOCK_SIZE - 4, BLOCK_SIZE - 4)
      .setStrokeStyle(3, 0xffffff, 0.7)
      .setDepth(40)
      .setVisible(false);
    this.danger = this.add.image(0, 0, 'danger').setOrigin(0).setScrollFactor(0).setDepth(90).setAlpha(0);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, GAME_WIDTH, Number.MAX_SAFE_INTEGER);
    cam.fadeIn(300);
    this.syncRows();

    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
    this.events.on(Phaser.Scenes.Events.RESUME, this.afterChoice, this);
    // Phaser ne vide pas scene.events à l'arrêt : on retire l'écouteur pour ne pas l'empiler à chaque partie.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () =>
      this.events.off(Phaser.Scenes.Events.RESUME, this.afterChoice, this),
    );
    this.input.keyboard?.on('keydown-M', () => toggleMute(this));
    pickaxeCursor(this);

    this.scene.launch('hud');
    this.emitState();
  }

  update(_time: number, delta: number): void {
    const cam = this.cameras.main;
    this.background.tilePositionY = cam.scrollY;
    this.syncRows();
    this.updateHover();
    // Coups épuisés (fin déjà programmée) ou carte à choisir : l'écran ne bouge plus.
    if (!this.started || this.ended || this.model.over || this.model.awaitingChoice) return;

    const base = Math.min(SCROLL_SPEED_MAX, SCROLL_SPEED_BASE + this.model.depth * SCROLL_SPEED_PER_METER);
    const speed = base * this.model.mods.scroll;
    // delta plafonné : un onglet mis en arrière-plan ne doit pas faire sauter l'écran d'un coup.
    cam.scrollY += (speed * Math.min(delta, 50)) / 1000;

    const limit = cam.scrollY - SCROLL_LOSE_MARGIN;
    const room = this.lastHitY - limit; // marge restante, en pixels
    this.danger.setAlpha(Phaser.Math.Clamp(1 - room / 220, 0, 1) * (0.75 + 0.25 * Math.sin(_time / 90)));
    if (room < 0) this.end('scroll');
  }

  /** Dessine les lignes qui entrent dans l'écran (avec une marge) et efface celles qui en sortent. */
  private syncRows(): void {
    const top = this.cameras.main.scrollY - GROUND_Y;
    const first = Math.max(0, Math.floor(top / BLOCK_SIZE) - 2);
    const last = Math.floor((top + VIEW_HEIGHT) / BLOCK_SIZE) + 3;
    for (const row of this.renderedRows) {
      if (row < first || row > last) this.unrenderRow(row);
    }
    for (let row = first; row <= last; row++) {
      if (!this.renderedRows.has(row)) this.renderRow(row);
    }
  }

  private renderRow(row: number): void {
    this.renderedRows.add(row);
    for (const cell of this.model.grid.rowCells(row)) {
      if (cell.destroyed) continue;
      const { x, y } = center(cell);
      const texture = cell.row === 0 ? 'grass_block' : BLOCK_TYPES[cell.kind].texture;
      this.blocks.set(cell, this.add.image(x, y, texture).setDepth(10));
      const max = BLOCK_TYPES[cell.kind].resistance;
      if (cell.hp < max) this.cracks.set(cell, this.add.sprite(x, y, 'cracks', crackFrame(cell.hp, max)).setDepth(11));
      if (!cell.revealed) {
        const fog = this.add.rectangle(x, y, BLOCK_SIZE, BLOCK_SIZE, 0x0b0705).setDepth(20);
        this.fog.set(cell, fog.setAlpha(this.fogAlpha(cell)));
      }
    }
  }

  private unrenderRow(row: number): void {
    this.renderedRows.delete(row);
    for (const cell of this.model.grid.rowCells(row)) {
      for (const map of [this.blocks, this.cracks, this.fog] as Map<Cell, Phaser.GameObjects.GameObject>[]) {
        map.get(cell)?.destroy();
        map.delete(cell);
      }
    }
  }

  private fogAlpha(cell: Cell): number {
    return this.model.mods.detector && isOre(cell.kind) ? DETECTOR_FOG_ALPHA : 1;
  }

  private cellAt(pointer: Phaser.Input.Pointer): Cell | undefined {
    const col = Math.floor(pointer.worldX / BLOCK_SIZE);
    const row = Math.floor((pointer.worldY - GROUND_Y) / BLOCK_SIZE);
    return this.model.grid.get(col, row);
  }

  private updateHover(): void {
    const pointer = this.input.activePointer;
    pointer.updateWorldPoint(this.cameras.main);
    const cell = pointer.wasTouch ? undefined : this.cellAt(pointer);
    const visible = !!cell && !this.ended && this.model.canHit(cell);
    this.hover.setVisible(visible);
    if (visible) this.hover.setPosition(center(cell).x, center(cell).y);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.ended) return;
    const cell = this.cellAt(pointer);
    if (!cell) return;
    const events = this.model.hit(cell.col, cell.row);
    if (!events) return;

    // Comme l'original, l'écran ne part qu'au premier vrai coup (taper la bedrock ne compte pas).
    if (events.some((e) => e.type !== 'bump')) this.started = true;
    this.lastHitY = center(cell).y;
    this.swingPickaxe(pointer.worldX, pointer.worldY);
    this.play(events);
    this.emitState();
    this.checkLayer();

    if (this.model.awaitingChoice) {
      // Palier atteint : on laisse l'explosion se jouer un peu, puis on fige tout pour choisir.
      this.time.delayedCall(450, () => this.openChoice());
    } else if (this.model.over) {
      // On laisse les animations finir avant d'afficher le score.
      this.time.delayedCall(1100, () => this.end('picks'));
    }
  }

  private openChoice(): void {
    if (this.ended || !this.model.awaitingChoice || this.scene.isPaused()) return;
    this.hover.setVisible(false);
    this.scene.pause();
    this.scene.launch('perk');
  }

  /** Retour de l'écran des cartes : on applique ce qui se voit, puis la partie reprend. */
  private afterChoice(): void {
    for (const [cell, fog] of this.fog) fog.setAlpha(this.fogAlpha(cell));
    this.emitState();
    if (this.model.over) this.time.delayedCall(600, () => this.end('picks'));
  }

  /** Bandeau au passage d'une couche à l'autre, et fond qui change de teinte. */
  private checkLayer(): void {
    const layer = layerAt(Math.max(0, this.model.depth - 1));
    if (layer === this.layer) return;
    const from = Phaser.Display.Color.ValueToColor(this.layer.tint);
    const to = Phaser.Display.Color.ValueToColor(layer.tint);
    this.layer = layer;
    this.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 1200,
      onUpdate: (tween) => {
        const c = Phaser.Display.Color.Interpolate.ColorWithColor(from, to, 100, tween.getValue() ?? 0);
        this.background.setTint(Phaser.Display.Color.GetColor(c.r, c.g, c.b));
      },
    });
    const banner = this.add
      .text(GAME_WIDTH / 2, VIEW_HEIGHT / 2 - 60, layer.name, textStyle(28, '#ffd84a'))
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(95)
      .setAlpha(0);
    this.tweens.chain({
      targets: banner,
      tweens: [
        { alpha: 1, scale: { from: 1.6, to: 1 }, duration: 350, ease: 'Back.easeOut' },
        { alpha: 0, delay: 1100, duration: 400, onComplete: () => banner.destroy() },
      ],
    });
  }

  /** Rejoue les événements du modèle ; les cases soufflées par une explosion partent en onde. */
  private play(events: GameEvent[]): void {
    // Chaque case est atteinte par l'onde de l'explosion la plus proche (utile en cas de réaction en chaîne).
    const origins: { cell: Cell; delay: number }[] = [];
    for (const event of events) {
      const delay = origins.length
        ? Math.min(...origins.map((o) => o.delay + distance(event.cell, o.cell) * BLAST_STEP_MS))
        : 0;
      if (event.type === 'explode') origins.push({ cell: event.cell, delay });
      if (delay === 0) this.playEvent(event);
      else this.time.delayedCall(delay, () => this.playEvent(event));
    }
  }

  private playEvent(event: GameEvent): void {
    const { cell } = event;
    const { x, y } = center(cell);
    const block = this.blocks.get(cell);

    switch (event.type) {
      case 'bump':
        playSfx(this, 'bump');
        this.cameras.main.shake(80, 0.004);
        this.debris.burst('bedrock', x, y, 4);
        break;

      case 'crack': {
        if (!block) break; // cassé entre-temps (clic pendant l'onde d'une explosion)
        playSfx(this, 'hit');
        this.debris.burst(cell.kind, x, y, 6);
        this.punch(block);
        const frame = crackFrame(event.hp, BLOCK_TYPES[cell.kind].resistance);
        const crack = this.cracks.get(cell) ?? this.add.sprite(x, y, 'cracks').setDepth(11);
        this.cracks.set(cell, crack.setFrame(frame));
        break;
      }

      case 'break':
        playSfx(this, 'break');
        this.debris.burst(cell.kind, x, y, 14);
        this.cracks.get(cell)?.destroy();
        this.cracks.delete(cell);
        this.add
          .sprite(x, y, 'cracks')
          .setDepth(11)
          .play('crumble')
          .once(Phaser.Animations.Events.ANIMATION_COMPLETE, (_: unknown, __: unknown, s: Phaser.GameObjects.Sprite) =>
            s.destroy(),
          );
        if (block) {
          this.tweens.killTweensOf(block);
          this.tweens.add({
            targets: block,
            scale: 0.4,
            alpha: 0,
            angle: Phaser.Math.Between(-25, 25),
            duration: 220,
            ease: 'Back.easeIn',
            onComplete: () => block.destroy(),
          });
        }
        this.blocks.delete(cell);
        if (event.points > 0) floatingText(this, x, y - 10, `+${event.points}`, '#ffd84a');
        break;

      case 'explode':
        this.explosion(cell, event.targets);
        block?.destroy();
        this.blocks.delete(cell);
        this.fog.get(cell)?.destroy();
        this.fog.delete(cell);
        break;

      case 'gain':
        playSfx(this, 'bonus');
        floatingText(this, x, y - 10, event.picks > 0 ? `+${event.picks} coups` : 'gratuit', '#8cff6b');
        break;

      case 'levelUp':
        this.cameras.main.flash(250, 255, 216, 74);
        break;

      case 'reveal': {
        const fog = this.fog.get(cell);
        this.fog.delete(cell);
        if (fog) this.tweens.add({ targets: fog, alpha: 0, duration: 260, onComplete: () => fog.destroy() });
        break;
      }
    }
  }

  private explosion(cell: Cell, targets: Cell[]): void {
    const { x, y } = center(cell);
    playSfx(this, 'boom');
    if (cell.kind === 'tnt') {
      this.add
        .sprite(x, y, 'tnt_boom')
        .setDepth(60)
        .play('tnt_boom')
        .once(Phaser.Animations.Events.ANIMATION_COMPLETE, (_: unknown, __: unknown, s: Phaser.GameObjects.Sprite) =>
          s.destroy(),
        );
      this.cameras.main.shake(350, 0.018);
      this.cameras.main.flash(150, 255, 230, 180);
    } else {
      this.cameras.main.shake(300, 0.012);
      for (const target of [cell, ...targets]) {
        const p = center(target);
        this.time.delayedCall(distance(cell, target) * BLAST_STEP_MS, () =>
          this.add
            .sprite(p.x, p.y, 'dynamite_boom')
            .setDepth(60)
            .play('dynamite_boom')
            .once(
              Phaser.Animations.Events.ANIMATION_COMPLETE,
              (_: unknown, __: unknown, s: Phaser.GameObjects.Sprite) => s.destroy(),
            ),
        );
      }
    }
    this.debris.burst(cell.kind, x, y, 30);
  }

  private punch(block: Phaser.GameObjects.Image | undefined): void {
    if (!block) return;
    this.tweens.killTweensOf(block);
    block.setScale(0.88);
    this.tweens.add({ targets: block, scale: 1, duration: 160, ease: 'Back.easeOut' });
  }

  private swingPickaxe(x: number, y: number): void {
    this.add
      .sprite(x, y, 'pick_swing')
      .setDepth(70)
      .play('pick_swing')
      .once(Phaser.Animations.Events.ANIMATION_COMPLETE, (_: unknown, __: unknown, s: Phaser.GameObjects.Sprite) =>
        s.destroy(),
      );
  }

  private emitState(): void {
    this.events.emit('state', this.model);
  }

  private end(reason: EndReason): void {
    if (this.ended) return;
    this.ended = true;
    this.hover.setVisible(false);

    const { score, depth, ores, orePoints, gems } = this.model;
    const previousBest = storage.bestScore;
    const record = score > previousBest;
    if (record) storage.bestScore = score;
    meta.addGems(gems);

    const data: GameOverData = {
      score,
      depth,
      ores: { ...ores },
      orePoints: { ...orePoints },
      best: Math.max(score, previousBest),
      record,
      reason,
      gems,
    };
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.stop('hud');
      this.scene.start('gameover', data);
    });
  }
}
