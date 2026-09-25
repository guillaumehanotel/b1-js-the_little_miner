import * as Phaser from 'phaser';
import {
  BLOCK_SIZE,
  GAME_WIDTH,
  GROUND_Y,
  SCROLL_LOSE_MARGIN,
  SCROLL_SPEED_BASE,
  SCROLL_SPEED_MAX,
  SCROLL_SPEED_PER_METER,
  WORLD_HEIGHT,
} from '../config';
import { playSfx, toggleMute } from '../fx/audio';
import { Debris, floatingText, pickaxeCursor } from '../fx/effects';
import { BLOCK_TYPES } from '../model/blockTypes';
import { type GameEvent, MinerGame } from '../model/game';
import type { Cell } from '../model/grid';
import { storage } from '../storage';

export type EndReason = 'picks' | 'scroll';

export interface GameOverData {
  score: number;
  depth: number;
  ores: MinerGame['ores'];
  best: number;
  record: boolean;
  reason: EndReason;
}

/** Délai entre deux cases touchées par une même explosion (effet d'onde). */
const BLAST_STEP_MS = 45;

const center = (cell: Cell) => ({
  x: cell.col * BLOCK_SIZE + BLOCK_SIZE / 2,
  y: GROUND_Y + cell.row * BLOCK_SIZE + BLOCK_SIZE / 2,
});
const distance = (a: Cell, b: Cell) => Math.abs(a.col - b.col) + Math.abs(a.row - b.row);

export class GameScene extends Phaser.Scene {
  model!: MinerGame;
  private blocks = new Map<Cell, Phaser.GameObjects.Image>();
  private cracks = new Map<Cell, Phaser.GameObjects.Sprite>();
  private fog = new Map<Cell, Phaser.GameObjects.Rectangle>();
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
    this.model = new MinerGame();
    this.blocks.clear();
    this.cracks.clear();
    this.fog.clear();
    this.started = false;
    this.ended = false;

    this.add.image(0, 0, 'sky').setOrigin(0);
    this.add.image(0, GROUND_Y, 'ground').setOrigin(0);
    for (const cell of this.model.grid.cells) this.createBlock(cell);

    this.debris = new Debris(this);
    this.hover = this.add
      .rectangle(0, 0, BLOCK_SIZE - 4, BLOCK_SIZE - 4)
      .setStrokeStyle(3, 0xffffff, 0.7)
      .setDepth(40)
      .setVisible(false);
    this.danger = this.add.image(0, 0, 'danger').setOrigin(0).setScrollFactor(0).setDepth(90).setAlpha(0);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, GAME_WIDTH, WORLD_HEIGHT);
    cam.fadeIn(300);

    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
    this.input.keyboard?.on('keydown-M', () => toggleMute(this));
    pickaxeCursor(this);

    this.scene.launch('hud');
    this.emitState();
  }

  update(_time: number, delta: number): void {
    this.updateHover();
    // Coups épuisés : la fin est déjà programmée, on ne peut plus perdre « distancé ».
    if (!this.started || this.ended || this.model.over) return;

    const cam = this.cameras.main;
    const speed = Math.min(SCROLL_SPEED_MAX, SCROLL_SPEED_BASE + this.model.depth * SCROLL_SPEED_PER_METER);
    // delta plafonné : un onglet mis en arrière-plan ne doit pas faire sauter l'écran d'un coup.
    cam.scrollY += (speed * Math.min(delta, 50)) / 1000;

    const limit = cam.scrollY - SCROLL_LOSE_MARGIN;
    const room = this.lastHitY - limit; // marge restante, en pixels
    this.danger.setAlpha(Phaser.Math.Clamp(1 - room / 220, 0, 1) * (0.75 + 0.25 * Math.sin(_time / 90)));
    if (room < 0) this.end('scroll');
  }

  private createBlock(cell: Cell): void {
    const { x, y } = center(cell);
    const texture = cell.row === 0 ? 'grass_block' : BLOCK_TYPES[cell.kind].texture;
    this.blocks.set(cell, this.add.image(x, y, texture).setDepth(10));
    if (!cell.revealed) {
      this.fog.set(cell, this.add.rectangle(x, y, BLOCK_SIZE, BLOCK_SIZE, 0x0b0705).setDepth(20));
    }
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

    if (this.model.over) {
      // On laisse les animations finir avant d'afficher le score.
      this.time.delayedCall(1100, () => this.end('picks'));
    }
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
        const max = BLOCK_TYPES[cell.kind].resistance;
        const frame = Math.round(((max - event.hp) / max) * 9);
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

      case 'bonus':
        playSfx(this, 'bonus');
        floatingText(this, x, y - 10, `+${event.picks} coups`, '#8cff6b');
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

    const { score, depth, ores } = this.model;
    const previousBest = storage.bestScore;
    const record = score > previousBest;
    if (record) storage.bestScore = score;

    const data: GameOverData = { score, depth, ores: { ...ores }, best: Math.max(score, previousBest), record, reason };
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.stop('hud');
      this.scene.start('gameover', data);
    });
  }
}
