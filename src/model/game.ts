import { COLS, LEVEL_FIRST_GAP, LEVEL_GAP_GROWTH, START_PICKS } from '../config';
import {
  type BlockKind,
  ORE_POINTS,
  type OreKind,
  type SpecialKind,
  isExplosive,
  isOre,
  isSpecial,
  randomKind,
} from './blockTypes';
import { type Cell, Grid } from './grid';
import { layerAt } from './layers';
import {
  type DrawState,
  type Mods,
  PERKS,
  type Perk,
  SNACK,
  baseMods,
  drawPerks,
  eligiblePerks,
  evolutionReady,
} from './perks';

/** Profondeur (en mètres) du palier n : 10, 25, 45, 70, 100… (0 pour n = 0). */
export function levelMeters(n: number): number {
  return n * LEVEL_FIRST_GAP + (LEVEL_GAP_GROWTH * n * (n - 1)) / 2;
}

/** Effets des blocs spéciaux. */
export const HOURGLASS_MS = 5000;
export const LAMP_ROWS = 6;
export const MAGNET_ROWS = 6;
export const CHICKEN_PICKS = 10;
export const SKIP_PICKS = 3;
/** Le coffre donne 1, 3 ou 5 améliorations (70 / 25 / 5 %). */
export const CHEST_ROLLS: [count: number, chance: number][] = [
  [5, 0.05],
  [3, 0.25],
  [1, 0.7],
];

/**
 * Ce qui s'est passé pendant un coup de pioche, dans l'ordre.
 * La scène rejoue ces événements en animations ; le modèle ne connaît pas Phaser.
 */
export type GameEvent =
  | { type: 'bump'; cell: Cell } // bedrock : rien ne bouge
  | { type: 'crack'; cell: Cell; hp: number } // abîmé mais toujours là
  | { type: 'break'; cell: Cell; points: number } // détruit ; points > 0 pour un minerai
  | { type: 'explode'; cell: Cell; targets: Cell[]; style: 'tnt' | 'dynamite' }
  | { type: 'gain'; cell: Cell; picks: number } // coups gagnés (bonus, carte…)
  | { type: 'reveal'; cell: Cell }
  | { type: 'levelUp'; cell: Cell; level: number } // palier : un choix de cartes attend
  | { type: 'special'; cell: Cell; kind: Exclude<SpecialKind, 'chest'> }
  | { type: 'chest'; cell: Cell; perks: Perk[] }; // améliorations déjà appliquées

export interface GameOptions {
  /** Grille imposée (tests) ; sinon mine aléatoire par couches. */
  grid?: Grid;
  rng?: () => number;
  /** Cartes pouvant sortir dans les tirages. */
  pool?: Perk[];
  /** Jetons de départ (améliorés à l'Atelier). */
  rerolls?: number;
  banishes?: number;
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
  /** Niveau de chaque carte possédée (hors effets immédiats), dans l'ordre d'obtention. */
  owned: Record<string, number> = {};
  /** Cartes retirées des tirages pour cette partie. */
  banned = new Set<string>();
  rerolls: number;
  banishes: number;
  /** Paliers franchis dont la carte n'a pas encore été choisie. */
  pendingChoices = 0;
  private currentOffer: Perk[] | null = null;

  private rng: () => number;
  private pool: Perk[];

  constructor({ grid, rng = Math.random, pool = PERKS, rerolls = 1, banishes = 1 }: GameOptions = {}) {
    this.rng = rng;
    this.pool = pool;
    this.rerolls = rerolls;
    this.banishes = banishes;
    this.grid = grid ?? new Grid((row) => this.generateRow(row));
  }

  get awaitingChoice(): boolean {
    return this.pendingChoices > 0;
  }

  /** Les cartes proposées pour le palier en attente (tirées au moment où on les regarde). */
  get offer(): Perk[] {
    if (!this.awaitingChoice) return [];
    this.currentOffer ??= drawPerks(this.pool, this.drawState, this.rng);
    return this.currentOffer;
  }

  private get drawState(): DrawState {
    return { owned: this.owned, banned: this.banned };
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

  /**
   * On ne frappe que ce qu'on peut atteindre : un bloc qui touche un trou (ou la ligne d'herbe).
   * Voir un bloc (Lampe, explosion, Lanterne…) ne suffit pas à y accéder.
   */
  isReachable(cell: Cell): boolean {
    return cell.row === 0 || this.grid.neighbours(cell).some((n) => n.destroyed);
  }

  canHit(cell: Cell): boolean {
    return (
      this.picks > 0 && !this.awaitingChoice && cell.revealed && !cell.destroyed && this.isReachable(cell)
    );
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
    // Foreuse : le coup porte aussi sur le bloc du dessous.
    const below = this.grid.get(cell.col, cell.row + 1);
    if (this.mods.drill && cell.destroyed && below) this.damage(below, events, 1);
    this.checkLevel(cell, events);
    return events;
  }

  /** Prend la carte `index` du premier tirage en attente. */
  choose(index: number): Perk | null {
    const perk = this.offer[index];
    if (!perk) return null;
    this.closeOffer();
    this.take(perk);
    return perk;
  }

  /** Nouveau tirage contre un jeton. */
  reroll(): boolean {
    if (!this.awaitingChoice || this.rerolls <= 0) return false;
    this.rerolls--;
    this.currentOffer = null;
    return true;
  }

  /** Ne rien prendre : quelques coups en consolation. */
  skip(): boolean {
    if (!this.awaitingChoice) return false;
    this.closeOffer();
    this.picks += SKIP_PICKS;
    return true;
  }

  /** Retire une carte des tirages pour toute la partie, puis retire. */
  banish(index: number): boolean {
    const perk = this.offer[index];
    if (!perk || this.banishes <= 0 || perk.evolves || perk === SNACK) return false;
    this.banishes--;
    this.banned.add(perk.id);
    this.currentOffer = null;
    return true;
  }

  levelOf(id: string): number {
    return this.owned[id] ?? 0;
  }

  private closeOffer(): void {
    this.pendingChoices--;
    this.currentOffer = null;
  }

  /** Applique une carte : effet immédiat, montée de niveau, ou évolution qui remplace sa base. */
  private take(perk: Perk): void {
    perk.apply(this);
    if (perk.instant) return;
    if (perk.evolves) {
      // La base disparaît et ne doit pas ressortir : sinon on remonterait ses niveaux par-dessus l'évolution.
      delete this.owned[perk.evolves.from];
      this.banned.add(perk.evolves.from);
    }
    this.owned[perk.id] = this.levelOf(perk.id) + 1;
  }

  /**
   * Coffre : améliorations choisies automatiquement, comme dans Vampire Survivors —
   * évolution prête d'abord, puis montée de niveau, puis nouvelle carte, sinon Casse-croûte.
   */
  private openChest(): Perk[] {
    let roll = this.rng();
    const count = CHEST_ROLLS.find(([, chance]) => (roll -= chance) < 0)?.[0] ?? 1;
    const gained: Perk[] = [];
    for (let i = 0; i < count; i++) {
      const state = this.drawState;
      const evolution = this.pool.find((p) => evolutionReady(p, state));
      const eligible = eligiblePerks(this.pool, state).filter((p) => !p.instant);
      const levelUps = eligible.filter((p) => this.levelOf(p.id) > 0);
      const options = levelUps.length > 0 ? levelUps : eligible;
      const perk = evolution ?? options[Math.floor(this.rng() * options.length)] ?? SNACK;
      this.take(perk);
      gained.push(perk);
    }
    return gained;
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
    this.reveal(this.revealedAround(cell), events);
    if (isSpecial(cell.kind)) this.trigger(cell, cell.kind, events);
    // Filon-mère : les minerais identiques collés partent avec.
    if (this.mods.motherlode && isOre(cell.kind)) {
      for (const n of this.grid.neighbours(cell)) {
        if (n.kind === cell.kind && !n.destroyed) {
          this.reveal([n], events);
          this.damage(n, events, n.hp);
        }
      }
    }
  }

  private revealedAround(cell: Cell): Cell[] {
    if (this.mods.eye) return this.grid.within(cell, 2);
    return this.mods.lantern ? this.grid.around(cell) : this.grid.neighbours(cell);
  }

  private trigger(cell: Cell, kind: SpecialKind, events: GameEvent[]): void {
    switch (kind) {
      case 'chest':
        events.push({ type: 'chest', cell, perks: this.openChest() });
        return;
      case 'chicken':
        this.gain(cell, CHICKEN_PICKS, events);
        break;
      case 'lamp': {
        const lit: Cell[] = [];
        for (let row = cell.row + 1; row <= cell.row + LAMP_ROWS; row++) lit.push(...this.grid.rowCells(row));
        this.reveal(lit, events);
        break;
      }
      case 'magnet': {
        events.push({ type: 'special', cell, kind });
        for (let row = cell.row - MAGNET_ROWS; row <= cell.row + MAGNET_ROWS; row++) {
          for (const c of this.grid.rowCells(row)) {
            if (c.revealed && !c.destroyed && isOre(c.kind)) this.damage(c, events, c.hp);
          }
        }
        return;
      }
      case 'hourglass':
        break;
    }
    events.push({ type: 'special', cell, kind });
  }

  /**
   * TNT : losange autour d'elle (rayon 2 de base), éclaire un cran plus loin.
   * Dynamite : toute sa ligne (et celle du dessous avec Écho), éclaire les lignes voisines.
   * Chaque bloc touché perd 1 point de résistance, sans coûter de pioche.
   */
  private explode(cell: Cell, events: GameEvent[], style: 'tnt' | 'dynamite' = cell.kind === 'tnt' ? 'tnt' : 'dynamite'): void {
    this.destroy(cell);
    const g = this.grid;
    let targets: Cell[];
    let lit: Cell[];
    if (style === 'tnt') {
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

    events.push({ type: 'explode', cell, targets, style });
    if (this.mods.blastRefund > 0) this.gain(cell, this.mods.blastRefund, events);
    this.reveal(lit, events);
    for (const target of targets) this.damage(target, events, 1);

    // Tapis de bombes : une vraie TNT provoque une réplique 3 lignes plus bas (sans nouvelle réplique).
    const echo = this.grid.get(cell.col, cell.row + 3);
    if (this.mods.aftershock && cell.kind === 'tnt' && style === 'tnt' && echo && !echo.destroyed && echo.kind !== 'bedrock') {
      this.reveal([echo], events);
      if (isExplosive(echo.kind)) this.explode(echo, events);
      else this.aftershock(echo, events);
    }
  }

  /** Souffle de TNT centré sur un bloc ordinaire, qui casse au passage (avec ses effets). */
  private aftershock(center: Cell, events: GameEvent[]): void {
    this.damage(center, events, center.hp);
    const targets = this.grid.within(center, this.mods.tntRadius).filter((c) => c !== center);
    events.push({ type: 'explode', cell: center, targets, style: 'tnt' });
    this.reveal(this.grid.within(center, this.mods.tntRadius + 1), events);
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

  /** Un tirage de cartes par palier franchi (plusieurs d'un coup après une grosse explosion). */
  private checkLevel(cell: Cell, events: GameEvent[]): void {
    while (this.depth >= levelMeters(this.level + 1)) {
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
