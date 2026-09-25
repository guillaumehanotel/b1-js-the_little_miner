import { describe, expect, it } from 'vitest';
import { COLS, ROWS, START_PICKS } from '../src/config';
import { type BlockKind, randomKind } from '../src/model/blockTypes';
import { MinerGame } from '../src/model/game';
import { Grid } from '../src/model/grid';

/** Grille de terre, avec quelques cases imposées : { 'col,row': kind }. */
function gridWith(overrides: Record<string, BlockKind> = {}): Grid {
  const kinds = Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => overrides[`${col},${row}`] ?? 'dirt'),
  );
  return new Grid(kinds);
}

describe('génération', () => {
  it('fait 7 × 44 blocs avec une première ligne de terre visible', () => {
    const grid = Grid.random();
    expect(grid.cells).toHaveLength(COLS * ROWS);
    expect(grid.rowCells(0).every((c) => c.kind === 'dirt' && c.revealed)).toBe(true);
    expect(grid.rowCells(1).some((c) => c.revealed)).toBe(false);
  });

  it('respecte les poids (bornes du tirage)', () => {
    expect(randomKind(() => 0)).toBe('dirt');
    expect(randomKind(() => 0.8)).toBe('stone');
    expect(randomKind(() => 0.9999)).toBe('diamond');
  });
});

describe('coups de pioche', () => {
  it('refuse une case cachée', () => {
    const game = new MinerGame(gridWith());
    expect(game.hit(0, 1)).toBeNull();
    expect(game.picks).toBe(START_PICKS);
  });

  it('casse la terre en un coup et révèle les voisins', () => {
    const game = new MinerGame(gridWith());
    const events = game.hit(3, 0)!;
    expect(events[0]).toMatchObject({ type: 'break', points: 0 });
    expect(game.picks).toBe(START_PICKS - 1);
    expect(game.depth).toBe(1);
    expect(game.grid.get(3, 1)!.revealed).toBe(true);
    expect(game.hit(3, 1)).not.toBeNull();
  });

  it('fissure un diamant 3 fois avant de le casser', () => {
    const game = new MinerGame(gridWith({ '0,1': 'diamond' }));
    game.hit(0, 0);
    for (let i = 0; i < 3; i++) expect(game.hit(0, 1)![0].type).toBe('crack');
    expect(game.hit(0, 1)![0]).toMatchObject({ type: 'break', points: 5 });
    expect(game.ores.diamond).toBe(1);
    expect(game.score).toBe(2 + 5);
  });

  it('la bedrock ne coûte rien et ne casse pas', () => {
    const game = new MinerGame(gridWith({ '0,1': 'bedrock' }));
    game.hit(0, 0);
    const picks = game.picks;
    expect(game.hit(0, 1)![0].type).toBe('bump');
    expect(game.picks).toBe(picks);
    expect(game.grid.get(0, 1)!.destroyed).toBe(false);
  });

  it('le bonus rapporte 5 coups sans en coûter', () => {
    const game = new MinerGame(gridWith({ '0,1': 'bonus' }));
    game.hit(0, 0);
    game.hit(0, 1);
    expect(game.picks).toBe(START_PICKS - 1 + 5);
  });

  it('la partie se termine à 0 coup', () => {
    const game = new MinerGame(gridWith());
    for (let row = 0; row < START_PICKS; row++) game.hit(row % COLS, Math.floor(row / COLS));
    expect(game.over).toBe(true);
    expect(game.hit(0, 6)).toBeNull();
  });
});

describe('explosifs', () => {
  it('la TNT détruit un losange de rayon 2 et révèle le rayon 3', () => {
    const game = new MinerGame(gridWith({ '3,1': 'tnt' }));
    game.hit(3, 0);
    game.hit(3, 1);
    expect(game.picks).toBe(START_PICKS - 2);
    expect(game.grid.get(3, 3)!.destroyed).toBe(true); // 2 cases en dessous
    expect(game.grid.get(4, 2)!.destroyed).toBe(true); // diagonale
    expect(game.grid.get(3, 4)!.destroyed).toBe(false);
    expect(game.grid.get(3, 4)!.revealed).toBe(true); // rayon 3
    expect(game.depth).toBe(4);
  });

  it('la dynamite détruit toute sa ligne, sauf la bedrock', () => {
    const game = new MinerGame(gridWith({ '0,1': 'dynamite', '6,1': 'bedrock', '3,1': 'stone' }));
    game.hit(0, 0);
    game.hit(0, 1);
    const row = game.grid.rowCells(1);
    expect(row.filter((c) => c.destroyed)).toHaveLength(5);
    expect(game.grid.get(3, 1)!.hp).toBe(1); // la pierre est juste fissurée
    expect(game.grid.rowCells(2).every((c) => c.revealed)).toBe(true);
  });

  it('les explosifs voisins sautent en chaîne sans coûter de coup', () => {
    const game = new MinerGame(gridWith({ '0,1': 'dynamite', '5,1': 'tnt' }));
    game.hit(0, 0);
    game.hit(0, 1);
    const explosions = game.grid.cells.filter((c) => c.kind === 'tnt' && c.destroyed);
    expect(explosions).toHaveLength(1);
    expect(game.grid.get(5, 3)!.destroyed).toBe(true); // zone de la TNT
    expect(game.picks).toBe(START_PICKS - 2);
  });
});
