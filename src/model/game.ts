import { BONUS_PICKS, START_PICKS, TNT_BLAST_RADIUS, TNT_REVEAL_RADIUS } from '../config';
import { ORE_KINDS, ORE_POINTS, type OreKind, isExplosive, isOre } from './blockTypes';
import { type Cell, Grid } from './grid';

/**
 * Ce qui s'est passé pendant un coup de pioche, dans l'ordre.
 * La scène rejoue ces événements en animations ; le modèle ne connaît pas Phaser.
 */
export type GameEvent =
  | { type: 'bump'; cell: Cell } // bedrock : rien ne bouge
  | { type: 'crack'; cell: Cell; hp: number } // abîmé mais toujours là
  | { type: 'break'; cell: Cell; points: number } // détruit ; points > 0 pour un minerai
  | { type: 'explode'; cell: Cell; targets: Cell[] }
  | { type: 'bonus'; cell: Cell; picks: number }
  | { type: 'reveal'; cell: Cell };

export class MinerGame {
  readonly grid: Grid;
  picks = START_PICKS;
  /** Profondeur atteinte, en mètres (1 ligne = 1 m, la ligne d'herbe vaut 1). */
  depth = 0;
  ores: Record<OreKind, number> = { coal: 0, iron: 0, gold: 0, diamond: 0 };
  hits = 0;

  constructor(grid: Grid = Grid.random()) {
    this.grid = grid;
  }

  get over(): boolean {
    return this.picks <= 0;
  }

  get score(): number {
    return this.depth + ORE_KINDS.reduce((sum, ore) => sum + this.ores[ore] * ORE_POINTS[ore], 0);
  }

  canHit(cell: Cell): boolean {
    return !this.over && cell.revealed && !cell.destroyed;
  }

  /** Un coup de pioche du joueur. Renvoie null si la case n'est pas frappable. */
  hit(col: number, row: number): GameEvent[] | null {
    const cell = this.grid.get(col, row);
    if (!cell || !this.canHit(cell)) return null;

    const events: GameEvent[] = [];
    this.hits++;

    if (cell.kind === 'bedrock') {
      events.push({ type: 'bump', cell });
      return events;
    }
    // Le bonus ne coûte pas de coup : il en rapporte.
    if (cell.kind !== 'bonus') this.picks--;

    this.damage(cell, events);
    return events;
  }

  /** Retire un point de résistance ; les explosifs sautent, en chaîne s'il le faut. */
  private damage(cell: Cell, events: GameEvent[]): void {
    if (cell.destroyed || cell.kind === 'bedrock') return;

    if (isExplosive(cell.kind)) {
      this.explode(cell, events);
      return;
    }

    cell.hp--;
    if (cell.kind === 'bonus') {
      this.picks += BONUS_PICKS;
      events.push({ type: 'bonus', cell, picks: BONUS_PICKS });
    }
    if (cell.hp > 0) {
      events.push({ type: 'crack', cell, hp: cell.hp });
      return;
    }

    let points = 0;
    if (isOre(cell.kind)) {
      this.ores[cell.kind]++;
      points = ORE_POINTS[cell.kind];
    }
    this.destroy(cell);
    events.push({ type: 'break', cell, points });
    this.reveal(this.grid.neighbours(cell), events);
  }

  /**
   * TNT : losange de rayon 2 autour d'elle, révèle jusqu'au rayon 3.
   * Dynamite : toute sa ligne, révèle les lignes au-dessus et en dessous.
   * Chaque bloc touché prend un coup (sans coûter de pioche).
   */
  private explode(cell: Cell, events: GameEvent[]): void {
    this.destroy(cell);
    const g = this.grid;
    const tnt = cell.kind === 'tnt';
    const targets = (tnt ? g.within(cell, TNT_BLAST_RADIUS) : g.rowCells(cell.row)).filter(
      (c) => c !== cell,
    );
    const lit = tnt
      ? g.within(cell, TNT_REVEAL_RADIUS)
      : [...g.rowCells(cell.row - 1), ...g.rowCells(cell.row), ...g.rowCells(cell.row + 1)];

    events.push({ type: 'explode', cell, targets });
    this.reveal(lit, events);
    for (const target of targets) this.damage(target, events);
  }

  private destroy(cell: Cell): void {
    cell.destroyed = true;
    cell.hp = 0;
    this.depth = Math.max(this.depth, cell.row + 1);
  }

  private reveal(cells: Cell[], events: GameEvent[]): void {
    for (const c of cells) {
      if (c.revealed || c.destroyed) continue;
      c.revealed = true;
      events.push({ type: 'reveal', cell: c });
    }
  }
}
