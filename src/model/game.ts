import { COLS, LEVEL_EVERY_METERS, START_PICKS } from '../config';
import { type BlockKind, ORE_POINTS, type OreKind, isExplosive, isOre, randomKind } from './blockTypes';
import { type Cell, Grid } from './grid';
import { layerAt } from './layers';
import { type Mods, PERKS, type Perk, baseMods, drawPerks } from './perks';

/**
 * Ce qui s'est passé pendant un coup de pioche, dans l'ordre.
 * La scène rejoue ces événements en animations ; le modèle ne connaît pas Phaser.
 */
export type GameEvent =
  | { type: 'bump'; cell: Cell } // bedrock : rien ne bouge
  | { type: 'crack'; cell: Cell; hp: number } // abîmé mais toujours là
  | { type: 'break'; cell: Cell; points: number } // détruit ; points > 0 pour un minerai
  | { type: 'explode'; cell: Cell; targets: Cell[] }
  | { type: 'gain'; cell: Cell; picks: number } // coups gagnés (bonus, carte…)
  | { type: 'reveal'; cell: Cell }
  | { type: 'levelUp'; cell: Cell; level: number }; // palier : un choix de cartes attend

export interface GameOptions {
  /** Grille imposée (tests) ; sinon mine aléatoire par couches. */
  grid?: Grid;
  rng?: () => number;
  /** Cartes pouvant sortir dans les tirages. */
  pool?: Perk[];
}

export class MinerGame {
  readonly grid: Grid;
  readonly mods: Mods = baseMods();
  picks = START_PICKS;
  /** Profondeur atteinte, en mètres (1 ligne = 1 m, la ligne d'herbe vaut 1). */
  depth = 0;
  ores: Record<OreKind, number> = { coal: 0, iron: 0, gold: 0, diamond: 0 };
  /** Points gagnés par type de minerai (les cartes peuvent changer la valeur en cours de partie). */
  orePoints: Record<OreKind, number> = { coal: 0, iron: 0, gold: 0, diamond: 0 };
  hits = 0;
  /** Paliers déjà atteints. */
  level = 0;
  /** Cartes prises, dans l'ordre. */
  owned: string[] = [];
  /** Paliers franchis dont la carte n'a pas encore été choisie. */
  pendingChoices = 0;
  private currentOffer: Perk[] | null = null;

  private rng: () => number;
  private pool: Perk[];

  constructor({ grid, rng = Math.random, pool = PERKS }: GameOptions = {}) {
    this.rng = rng;
    this.pool = pool;
    this.grid = grid ?? new Grid((row) => this.generateRow(row));
  }

  get awaitingChoice(): boolean {
    return this.pendingChoices > 0;
  }

  /** Les cartes proposées pour le palier en attente (tirées au moment où on les regarde). */
  get offer(): Perk[] {
    if (!this.awaitingChoice) return [];
    this.currentOffer ??= drawPerks(this.pool, this.owned, this.rng);
    return this.currentOffer;
  }

  /** Plus de coups et plus de carte à choisir (une carte peut encore rendre des coups). */
  get over(): boolean {
    return this.picks <= 0 && !this.awaitingChoice;
  }

  get score(): number {
    return this.depth + Object.values(this.orePoints).reduce((a, b) => a + b, 0);
  }

  /** Gemmes gagnées pour l'Atelier. */
  get gems(): number {
    return this.ores.diamond + Math.floor(this.depth / 20);
  }

  canHit(cell: Cell): boolean {
    return this.picks > 0 && !this.awaitingChoice && cell.revealed && !cell.destroyed;
  }

  /** Un coup de pioche du joueur. Renvoie null si la case n'est pas frappable. */
  hit(col: number, row: number): GameEvent[] | null {
    const cell = this.grid.get(col, row);
    if (!cell || !this.canHit(cell)) return null;

    const events: GameEvent[] = [];
    if (cell.kind === 'bedrock') {
      events.push({ type: 'bump', cell });
      return events;
    }
    // Compté après la bedrock : taper dans le vide ne doit pas faire avancer le Recyclage.
    this.hits++;
    // Le bonus ne coûte pas de coup : il en rapporte. Recyclage : un coup sur N est offert.
    const free = cell.kind === 'bonus' || (this.mods.freeEvery > 0 && this.hits % this.mods.freeEvery === 0);
    if (!free) this.picks--;
    else if (cell.kind !== 'bonus') events.push({ type: 'gain', cell, picks: 0 });

    this.damage(cell, events, this.mods.power);
    this.checkLevel(cell, events);
    return events;
  }

  /** Prend la carte `index` du premier tirage en attente. */
  choose(index: number): Perk | null {
    const perk = this.offer[index];
    if (!perk) return null;
    this.pendingChoices--;
    this.currentOffer = null;
    perk.apply(this);
    this.owned.push(perk.id);
    return perk;
  }

  /** Retire `amount` points de résistance ; les explosifs sautent, en chaîne s'il le faut. */
  private damage(cell: Cell, events: GameEvent[], amount: number): void {
    if (cell.destroyed || cell.kind === 'bedrock') return;

    if (isExplosive(cell.kind)) {
      this.explode(cell, events);
      return;
    }

    cell.hp = Math.max(0, cell.hp - amount);
    if (cell.kind === 'bonus') this.gain(cell, this.mods.bonusPicks, events);
    if (cell.hp > 0) {
      events.push({ type: 'crack', cell, hp: cell.hp });
      return;
    }

    let points = 0;
    if (isOre(cell.kind)) {
      points = (ORE_POINTS[cell.kind] + this.mods.orePointsBonus) * this.mods.orePointsMult;
      this.ores[cell.kind]++;
      this.orePoints[cell.kind] += points;
    }
    this.destroy(cell);
    events.push({ type: 'break', cell, points });
    if (cell.kind === 'coal' && this.mods.coalRefund > 0) this.gain(cell, this.mods.coalRefund, events);
    this.reveal(this.mods.lantern ? this.grid.around(cell) : this.grid.neighbours(cell), events);
  }

  /**
   * TNT : losange autour d'elle (rayon 2 de base), éclaire un cran plus loin.
   * Dynamite : toute sa ligne (et celle du dessous avec Écho), éclaire les lignes voisines.
   * Chaque bloc touché perd 1 point de résistance, sans coûter de pioche.
   */
  private explode(cell: Cell, events: GameEvent[]): void {
    this.destroy(cell);
    const g = this.grid;
    let targets: Cell[];
    let lit: Cell[];
    if (cell.kind === 'tnt') {
      targets = g.within(cell, this.mods.tntRadius);
      lit = g.within(cell, this.mods.tntRadius + 1);
    } else {
      const last = cell.row + (this.mods.echo ? 1 : 0);
      targets = [];
      lit = [...g.rowCells(cell.row - 1)];
      for (let row = cell.row; row <= last; row++) targets.push(...g.rowCells(row));
      for (let row = cell.row; row <= last + 1; row++) lit.push(...g.rowCells(row));
    }
    targets = targets.filter((c) => c !== cell);

    events.push({ type: 'explode', cell, targets });
    if (this.mods.blastRefund > 0) this.gain(cell, this.mods.blastRefund, events);
    this.reveal(lit, events);
    for (const target of targets) this.damage(target, events, 1);
  }

  private gain(cell: Cell, picks: number, events: GameEvent[]): void {
    this.picks += picks;
    events.push({ type: 'gain', cell, picks });
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

  /** Un tirage de cartes par palier de 10 m franchi (plusieurs d'un coup après une grosse explosion). */
  private checkLevel(cell: Cell, events: GameEvent[]): void {
    const reached = Math.floor(this.depth / LEVEL_EVERY_METERS);
    while (this.level < reached) {
      this.level++;
      this.pendingChoices++;
      events.push({ type: 'levelUp', cell, level: this.level });
    }
  }

  private generateRow(row: number): BlockKind[] {
    const weights = { ...layerAt(row).weights };
    for (const ore of Object.keys(ORE_POINTS) as OreKind[]) weights[ore] *= this.mods.oreLuck;
    if (this.mods.noBonus) weights.bonus = 0;
    return Array.from({ length: COLS }, () => randomKind(this.rng, weights));
  }
}
