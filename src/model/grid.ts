import { COLS } from '../config';
import { BLOCK_TYPES, type BlockKind } from './blockTypes';

export interface Cell {
  col: number;
  row: number;
  kind: BlockKind;
  hp: number;
  destroyed: boolean;
  /** Visible et frappable : touche un trou, ou a été éclairé par une explosion. */
  revealed: boolean;
}

/** Fabrique les 7 types d'une nouvelle ligne. */
export type RowGenerator = (row: number) => BlockKind[];

const allDirt: RowGenerator = () => Array<BlockKind>(COLS).fill('dirt');

/**
 * Mine sans fond : les lignes sont générées à la demande, la première fois qu'on les consulte.
 * `preset` impose les premières lignes (pratique pour les tests).
 */
export class Grid {
  private rows: Cell[][] = [];

  constructor(
    private generate: RowGenerator = allDirt,
    private preset: BlockKind[][] = [],
  ) {}

  get rowCount(): number {
    return this.rows.length;
  }

  /** Toutes les cases déjà générées. */
  get cells(): Cell[] {
    return this.rows.flat();
  }

  get(col: number, row: number): Cell | undefined {
    if (col < 0 || col >= COLS || row < 0) return undefined;
    return this.row(row)[col];
  }

  /** Copie des cases d'une ligne (modifier le tableau renvoyé ne touche pas la grille). */
  rowCells(row: number): Cell[] {
    return row < 0 ? [] : [...this.row(row)];
  }

  /** Voisins directs (haut, bas, gauche, droite). */
  neighbours(cell: Cell): Cell[] {
    return this.within(cell, 1).filter((c) => c !== cell);
  }

  /** Les 8 cases autour, diagonales comprises. */
  around(cell: Cell): Cell[] {
    const out: Cell[] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const c = (dr || dc) && this.get(cell.col + dc, cell.row + dr);
        if (c) out.push(c);
      }
    }
    return out;
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

  private row(index: number): Cell[] {
    while (this.rows.length <= index) {
      const row = this.rows.length;
      // La première ligne (l'herbe) est toujours de la terre, visible d'emblée.
      const kinds = this.preset[row] ?? (row === 0 ? allDirt(row) : this.generate(row));
      this.rows.push(
        kinds.map((kind, col) => ({
          col,
          row,
          kind,
          hp: BLOCK_TYPES[kind].resistance,
          destroyed: false,
          revealed: row === 0,
        })),
      );
    }
    return this.rows[index];
  }
}
