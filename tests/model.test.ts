import { describe, expect, it } from 'vitest';
import { COLS, START_PICKS } from '../src/config';
import { type BlockKind, randomKind } from '../src/model/blockTypes';
import { MinerGame } from '../src/model/game';
import { Grid } from '../src/model/grid';
import { LAYERS, layerAt } from '../src/model/layers';
import { PERKS, PERKS_BY_ID, type Perk, STARTER_PERK_IDS, drawPerks } from '../src/model/perks';

/** Mine de terre, avec quelques cases imposées : { 'col,row': kind }. */
function gridWith(overrides: Record<string, BlockKind> = {}): Grid {
  const rows = Math.max(40, ...Object.keys(overrides).map((k) => Number(k.split(',')[1]) + 1));
  const kinds = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => overrides[`${col},${row}`] ?? 'dirt'),
  );
  return new Grid(undefined, kinds);
}

const game = (overrides: Record<string, BlockKind> = {}, pool?: Perk[]) =>
  new MinerGame({ grid: gridWith(overrides), pool });

/** Creuse tout droit dans une colonne jusqu'à la ligne `to` (incluse). */
function digDown(g: MinerGame, col: number, to: number): void {
  for (let row = 0; row <= to; row++) while (!g.grid.get(col, row)!.destroyed) g.hit(col, row);
}

const withPerk = (id: string, overrides: Record<string, BlockKind> = {}) => {
  const g = game(overrides);
  PERKS_BY_ID.get(id)!.apply(g);
  return g;
};

describe('génération', () => {
  it('première ligne de terre visible, lignes suivantes cachées', () => {
    const g = new MinerGame();
    expect(g.grid.rowCells(0).every((c) => c.kind === 'dirt' && c.revealed)).toBe(true);
    expect(g.grid.rowCells(1).some((c) => c.revealed)).toBe(false);
  });

  it('la mine est sans fond : les lignes naissent à la demande', () => {
    const g = new MinerGame();
    expect(g.grid.rowCount).toBe(0);
    expect(g.grid.get(3, 500)).toBeDefined();
    expect(g.grid.rowCount).toBe(501);
  });

  it('respecte les poids (bornes du tirage)', () => {
    expect(randomKind(() => 0)).toBe('dirt');
    expect(randomKind(() => 0.8)).toBe('stone');
    expect(randomKind(() => 0.9999)).toBe('diamond');
  });

  it('les couches se succèdent avec la profondeur', () => {
    expect(layerAt(0).name).toBe('Terre');
    expect(layerAt(13).name).toBe('Terre'); // 14 m
    expect(layerAt(14).name).toBe('Roche'); // 15 m
    expect(layerAt(200).name).toBe('Magma');
    const diamondShare = (i: number) => {
      const w = LAYERS[i].weights;
      return w.diamond / Object.values(w).reduce((a, b) => a + b, 0);
    };
    expect(diamondShare(3)).toBeGreaterThan(diamondShare(0) * 3);
  });
});

describe('coups de pioche', () => {
  it('refuse une case cachée', () => {
    const g = game();
    expect(g.hit(0, 1)).toBeNull();
    expect(g.picks).toBe(START_PICKS);
  });

  it('casse la terre en un coup et révèle les voisins', () => {
    const g = game();
    expect(g.hit(3, 0)![0]).toMatchObject({ type: 'break', points: 0 });
    expect(g.picks).toBe(START_PICKS - 1);
    expect(g.depth).toBe(1);
    expect(g.grid.get(3, 1)!.revealed).toBe(true);
    expect(g.grid.get(4, 1)!.revealed).toBe(false); // pas les diagonales
  });

  it('fissure un diamant 3 fois avant de le casser', () => {
    const g = game({ '0,1': 'diamond' });
    g.hit(0, 0);
    for (let i = 0; i < 3; i++) expect(g.hit(0, 1)![0].type).toBe('crack');
    expect(g.hit(0, 1)![0]).toMatchObject({ type: 'break', points: 5 });
    expect(g.ores.diamond).toBe(1);
    expect(g.score).toBe(2 + 5);
  });

  it('la bedrock ne coûte rien et ne casse pas', () => {
    const g = game({ '0,1': 'bedrock' });
    g.hit(0, 0);
    const picks = g.picks;
    expect(g.hit(0, 1)![0].type).toBe('bump');
    expect(g.picks).toBe(picks);
    expect(g.grid.get(0, 1)!.destroyed).toBe(false);
  });

  it('le bonus rapporte 5 coups sans en coûter', () => {
    const g = game({ '0,1': 'bonus' });
    g.hit(0, 0);
    g.hit(0, 1);
    expect(g.picks).toBe(START_PICKS - 1 + 5);
  });

  it('la partie se termine à 0 coup', () => {
    const g = game();
    for (let i = 0; i < START_PICKS; i++) g.hit(i % COLS, Math.floor(i / COLS));
    expect(g.over).toBe(true);
    expect(g.hit(0, 6)).toBeNull();
  });
});

describe('explosifs', () => {
  it('la TNT détruit un losange de rayon 2 et révèle le rayon 3', () => {
    const g = game({ '3,1': 'tnt' });
    g.hit(3, 0);
    g.hit(3, 1);
    expect(g.picks).toBe(START_PICKS - 2);
    expect(g.grid.get(3, 3)!.destroyed).toBe(true);
    expect(g.grid.get(4, 2)!.destroyed).toBe(true);
    expect(g.grid.get(3, 4)!.destroyed).toBe(false);
    expect(g.grid.get(3, 4)!.revealed).toBe(true);
    expect(g.depth).toBe(4);
  });

  it('la dynamite détruit toute sa ligne, sauf la bedrock', () => {
    const g = game({ '0,1': 'dynamite', '6,1': 'bedrock', '3,1': 'stone' });
    g.hit(0, 0);
    g.hit(0, 1);
    expect(g.grid.rowCells(1).filter((c) => c.destroyed)).toHaveLength(5);
    expect(g.grid.get(3, 1)!.hp).toBe(1);
    expect(g.grid.rowCells(2).every((c) => c.revealed)).toBe(true);
  });

  it('les explosifs voisins sautent en chaîne sans coûter de coup', () => {
    const g = game({ '0,1': 'dynamite', '5,1': 'tnt' });
    g.hit(0, 0);
    g.hit(0, 1);
    expect(g.grid.get(5, 1)!.destroyed).toBe(true);
    expect(g.grid.get(5, 3)!.destroyed).toBe(true);
    expect(g.picks).toBe(START_PICKS - 2);
  });
});

describe('paliers et cartes', () => {
  it('propose 3 cartes à 10 m et bloque la pioche en attendant', () => {
    const g = game();
    digDown(g, 0, 9);
    expect(g.depth).toBe(10);
    expect(g.awaitingChoice).toBe(true);
    expect(g.offer).toHaveLength(3);
    expect(g.hit(0, 10)).toBeNull();
    const perk = g.choose(0)!;
    expect(g.owned).toEqual([perk.id]);
    expect(g.awaitingChoice).toBe(false);
    expect(g.hit(0, 10)).not.toBeNull();
  });

  it('une explosion qui franchit deux paliers donne deux choix', () => {
    // Dynamite en ligne 8 → TNT en colonne 3 tous les 2 rangs : la chaîne descend jusqu'à 21 m.
    const chain = Object.fromEntries([8, 10, 12, 14, 16, 18].map((row) => [`3,${row}`, 'tnt' as BlockKind]));
    const g = game({ '0,8': 'dynamite', ...chain });
    digDown(g, 0, 7);
    g.hit(0, 8);
    expect(g.depth).toBe(21);
    expect(g.pendingChoices).toBe(2);
    g.choose(0);
    expect(g.offer).toHaveLength(3); // second tirage, tiré après le premier choix
    g.choose(1);
    expect(g.owned).toHaveLength(2);
  });

  it('à 0 coup, la partie continue tant qu\'une carte reste à choisir', () => {
    const g = game();
    g.picks = 10;
    digDown(g, 0, 9);
    expect(g.picks).toBe(0);
    expect(g.over).toBe(false);
    g.choose(0);
    expect(g.over).toBe(g.picks <= 0);
  });

  it('les cartes de départ sont les 8 gratuites', () => {
    expect(STARTER_PERK_IDS).toHaveLength(8);
    expect(PERKS).toHaveLength(16);
  });

  it('le tirage ne repropose pas une carte unique déjà prise', () => {
    const pool = [PERKS_BY_ID.get('lantern')!, PERKS_BY_ID.get('second_wind')!];
    for (let i = 0; i < 20; i++) {
      expect(drawPerks(pool, ['lantern'], Math.random).map((p) => p.id)).toEqual(['second_wind']);
    }
  });

  it('Pioche de fer : la pierre tombe en un coup', () => {
    const g = withPerk('iron_pick', { '0,1': 'stone' });
    g.hit(0, 0);
    expect(g.hit(0, 1)![0].type).toBe('break');
  });

  it('Mèche longue : la TNT porte à 3 cases', () => {
    const g = withPerk('long_fuse', { '3,1': 'tnt' });
    g.hit(3, 0);
    g.hit(3, 1);
    expect(g.grid.get(3, 4)!.destroyed).toBe(true);
  });

  it('Lanterne : casser éclaire les diagonales', () => {
    const g = withPerk('lantern');
    g.hit(3, 0);
    expect(g.grid.get(4, 1)!.revealed).toBe(true);
  });

  it('Prospecteur et Avidité modifient les points des minerais', () => {
    const g = withPerk('prospector', { '0,1': 'coal' });
    PERKS_BY_ID.get('greed')!.apply(g);
    g.hit(0, 0);
    expect(g.hit(0, 1)![0]).toMatchObject({ type: 'break', points: (2 + 1) * 2 });
  });

  it('Géologue : le charbon rend un coup', () => {
    const g = withPerk('geologist', { '0,1': 'coal' });
    g.hit(0, 0);
    g.hit(0, 1);
    expect(g.picks).toBe(START_PICKS - 1);
  });

  it('Écho : la dynamite souffle aussi la ligne du dessous', () => {
    const g = withPerk('echo', { '0,1': 'dynamite' });
    g.hit(0, 0);
    g.hit(0, 1);
    expect(g.grid.rowCells(2).every((c) => c.destroyed)).toBe(true);
    expect(g.grid.rowCells(3).every((c) => c.revealed)).toBe(true);
  });

  it('Artificier : chaque explosion rend 2 coups', () => {
    const g = withPerk('artificer', { '0,1': 'tnt' });
    g.hit(0, 0);
    g.hit(0, 1);
    expect(g.picks).toBe(START_PICKS - 2 + 2);
  });

  it('la dynamite ne mélange pas les lignes de la grille', () => {
    const g = withPerk('echo', { '0,2': 'dynamite' });
    digDown(g, 0, 1);
    g.hit(0, 2);
    expect(g.grid.rowCells(1)).toHaveLength(COLS);
    expect(g.grid.cells).toHaveLength(g.grid.rowCount * COLS);
  });

  it('Recyclage : taper la bedrock ne fait pas avancer le compteur', () => {
    const g = withPerk('recycling', { '0,1': 'bedrock' });
    g.hit(0, 0);
    for (let i = 0; i < 6; i++) g.hit(0, 1);
    g.hit(1, 0);
    expect(g.picks).toBe(START_PICKS - 2);
  });

  it('Recyclage : un coup sur 4 est gratuit', () => {
    const g = withPerk('recycling');
    for (let col = 0; col < 4; col++) g.hit(col, 0);
    expect(g.picks).toBe(START_PICKS - 3);
  });

  it('Avidité : plus aucun bloc bonus généré', () => {
    const g = new MinerGame();
    PERKS_BY_ID.get('greed')!.apply(g);
    PERKS_BY_ID.get('vein')!.apply(g);
    const kinds = Array.from({ length: 300 }, (_, row) => g.grid.rowCells(row + 1)).flat().map((c) => c.kind);
    expect(kinds).not.toContain('bonus');
  });

  it('les gemmes valent diamants + 1 par tranche de 20 m', () => {
    const g = game();
    g.depth = 45;
    g.ores.diamond = 2;
    expect(g.gems).toBe(4);
  });
});
