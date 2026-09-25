import { COLS, ROWS } from '../config';
import { BLOCK_TYPES, type BlockKind, randomKind } from './blockTypes';

export interface Cell {
  col: number;
  row: number;
  kind: BlockKind;
  hp: number;
  destroyed: boolean;
  /** Visible et frappable : touche un trou, ou a été éclairé par une explosion. */
  revealed: boolean;
}

export class Grid {
  readonly cells: Cell[];

  constructor(kinds: BlockKind[][]) {
    this.cells = kinds.flatMap((line, row) =>
      line.map((kind, col) => ({
        col,
        row,
        kind,
        hp: BLOCK_TYPES[kind].resistance,
        destroyed: false,
        revealed: row === 0,
      })),
    );
  }

  /** Grille aléatoire ; la première ligne (l'herbe) est toujours de la terre. */
  static random(rng: () => number = Math.random): Grid {
    const kinds = Array.from({ length: ROWS }, (_, row) =>
      Array.from({ length: COLS }, () => (row === 0 ? 'dirt' : randomKind(rng))),
    );
    return new Grid(kinds);
  }

  get(col: number, row: number): Cell | undefined {
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return undefined;
    return this.cells[row * COLS + col];
  }

  /** Voisins directs (haut, bas, gauche, droite). */
  neighbours(cell: Cell): Cell[] {
    return this.within(cell, 1).filter((c) => c !== cell);
  }

  /** Cases à une distance de Manhattan ≤ radius (un losange), centre compris. */
  within(cell: Cell, radius: number): Cell[] {
    const out: Cell[] = [];
    for (let dr = -radius; dr <= radius; dr++) {
      const span = radius - Math.abs(dr);
      for (let dc = -span; dc <= span; dc++) {
        const c = this.get(cell.col + dc, cell.row + dr);
        if (c) out.push(c);
      }
    }
    return out;
  }

  rowCells(row: number): Cell[] {
    if (row < 0 || row >= ROWS) return [];
    return this.cells.slice(row * COLS, (row + 1) * COLS);
  }
}
