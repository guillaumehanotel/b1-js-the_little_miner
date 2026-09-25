import { BONUS_PICKS, TNT_BLAST_RADIUS } from '../config';

/** Tout ce qu'une carte peut changer aux règles. Valeurs par défaut = le jeu de base. */
export interface Mods {
  /** Points de résistance retirés par coup de pioche. */
  power: number;
  tntRadius: number;
  /** La dynamite souffle aussi la ligne du dessous. */
  echo: boolean;
  /** Casser un bloc révèle aussi les diagonales. */
  lantern: boolean;
  /** Casser un bloc éclaire un losange de rayon 2 (évolution Œil du mineur). */
  eye: boolean;
  /** Minerais visibles à travers le brouillard (effet purement visuel). */
  detector: boolean;
  bonusPicks: number;
  /** Multiplicateur de la vitesse de défilement. */
  scroll: number;
  orePointsBonus: number;
  orePointsMult: number;
  /** Multiplicateur des chances de tomber sur un minerai. */
  oreLuck: number;
  noBonus: boolean;
  /** Coups rendus en cassant du charbon. */
  coalRefund: number;
  /** Coups rendus à chaque explosion. */
  blastRefund: number;
  /** Un coup gratuit tous les N coups (0 = jamais). */
  freeEvery: number;
  /** Chaque TNT déclenche une réplique 3 lignes plus bas (évolution Tapis de bombes). */
  aftershock: boolean;
  /** Casser un bloc abîme celui du dessous (évolution Foreuse). */
  drill: boolean;
  /** Casser un minerai casse les minerais identiques qui le touchent (évolution Filon-mère). */
  motherlode: boolean;
}

export const baseMods = (): Mods => ({
  power: 1,
  tntRadius: TNT_BLAST_RADIUS,
  echo: false,
  lantern: false,
  eye: false,
  detector: false,
  bonusPicks: BONUS_PICKS,
  scroll: 1,
  orePointsBonus: 0,
  orePointsMult: 1,
  oreLuck: 1,
  noBonus: false,
  coalRefund: 0,
  blastRefund: 0,
  freeEvery: 0,
  aftershock: false,
  drill: false,
  motherlode: false,
});

export type PerkRarity = 'common' | 'rare' | 'curse' | 'evolution';

/** Ce qu'une carte a le droit de toucher quand on la prend. */
export interface PerkTarget {
  mods: Mods;
  picks: number;
}

export interface Perk {
  id: string;
  name: string;
  /** Effet d'un niveau. */
  text: string;
  rarity: PerkRarity;
  /** Niveau maximum ; chaque niveau réapplique `apply`. */
  maxLevel: number;
  /** Effet immédiat, ne prend pas d'emplacement (ex. coups en plus). */
  instant?: boolean;
  /** Prix en gemmes à l'Atelier ; 0 = disponible d'emblée. */
  cost: number;
  /** Texture existante servant d'icône. */
  icon: string;
  /** Évolution : `from` au niveau max + `with` possédée ; remplace `from`. */
  evolves?: { from: string; with: string };
  apply(target: PerkTarget): void;
}

/** Nombre de cartes (hors effets immédiats) qu'on peut posséder. */
export const MAX_SLOTS = 6;

export const PERKS: Perk[] = [
  // --- De départ ---
  {
    id: 'iron_pick', name: 'Pioche de fer', text: 'Chaque coup retire 1 point\nde résistance de plus.',
    rarity: 'common', maxLevel: 3, cost: 0, icon: 'iron_block',
    apply: (t) => void (t.mods.power += 1),
  },
  {
    id: 'second_wind', name: 'Second souffle', text: '+8 coups de pioche.',
    rarity: 'common', maxLevel: 1, instant: true, cost: 0, icon: 'pioche',
    apply: (t) => void (t.picks += 8),
  },
  {
    id: 'long_fuse', name: 'Mèche longue', text: 'La TNT souffle\n1 case plus loin.',
    rarity: 'common', maxLevel: 3, cost: 0, icon: 'tnt_block',
    apply: (t) => void (t.mods.tntRadius += 1),
  },
  {
    id: 'lantern', name: 'Lanterne', text: 'Casser un bloc éclaire\naussi les diagonales.',
    rarity: 'common', maxLevel: 1, cost: 0, icon: 'torch',
    apply: (t) => void (t.mods.lantern = true),
  },
  {
    id: 'prospector', name: 'Prospecteur', text: '+1 point par minerai.',
    rarity: 'common', maxLevel: 3, cost: 0, icon: 'gold_block',
    apply: (t) => void (t.mods.orePointsBonus += 1),
  },
  {
    id: 'heavy_boots', name: 'Bottes lourdes', text: 'L\'écran descend\n15 % moins vite.',
    rarity: 'common', maxLevel: 3, cost: 0, icon: 'stone_block',
    apply: (t) => void (t.mods.scroll *= 0.85),
  },
  {
    id: 'deep_pockets', name: 'Poches profondes', text: 'Les blocs bonus donnent\n3 coups de plus.',
    rarity: 'common', maxLevel: 3, cost: 0, icon: 'bonus_block',
    apply: (t) => void (t.mods.bonusPicks += 3),
  },
  {
    id: 'geologist', name: 'Géologue', text: 'Casser du charbon\nrend 1 coup.',
    rarity: 'common', maxLevel: 3, cost: 0, icon: 'coal_block',
    apply: (t) => void (t.mods.coalRefund += 1),
  },
  // --- À débloquer à l'Atelier ---
  {
    id: 'detector', name: 'Détecteur', text: 'Les minerais se voient\nà travers le noir.',
    rarity: 'rare', maxLevel: 1, cost: 6, icon: 'diamond_block',
    apply: (t) => void (t.mods.detector = true),
  },
  {
    id: 'echo', name: 'Écho', text: 'La dynamite souffle aussi\nla ligne du dessous.',
    rarity: 'rare', maxLevel: 1, cost: 5, icon: 'dynamite_block',
    apply: (t) => void (t.mods.echo = true),
  },
  {
    id: 'vein', name: 'Filon', text: 'Les minerais sont\n50 % plus fréquents.',
    rarity: 'rare', maxLevel: 2, cost: 8, icon: 'gold_block',
    apply: (t) => void (t.mods.oreLuck *= 1.5),
  },
  {
    id: 'artificer', name: 'Artificier', text: 'Chaque explosion\nrend 2 coups.',
    rarity: 'rare', maxLevel: 3, cost: 6, icon: 'tnt_block',
    apply: (t) => void (t.mods.blastRefund += 2),
  },
  {
    id: 'recycling', name: 'Recyclage', text: 'Un coup sur 4\nest gratuit.',
    rarity: 'rare', maxLevel: 1, cost: 8, icon: 'pioche',
    apply: (t) => void (t.mods.freeEvery = 4),
  },
  {
    id: 'magma_pact', name: 'Pacte du magma', text: '+15 coups, mais l\'écran\ndescend 25 % plus vite.',
    rarity: 'curse', maxLevel: 2, cost: 4, icon: 'bedrock_block',
    apply: (t) => {
      t.picks += 15;
      t.mods.scroll *= 1.25;
    },
  },
  {
    id: 'fragile_pick', name: 'Pioche fragile', text: 'Force +2,\nmais −6 coups.',
    rarity: 'curse', maxLevel: 2, cost: 4, icon: 'diamond_block',
    apply: (t) => {
      t.mods.power += 2;
      t.picks = Math.max(1, t.picks - 6);
    },
  },
  {
    id: 'greed', name: 'Avidité', text: 'Minerais à points doublés,\nplus aucun bloc bonus.',
    rarity: 'curse', maxLevel: 1, cost: 5, icon: 'coal_block',
    apply: (t) => {
      t.mods.orePointsMult *= 2;
      t.mods.noBonus = true;
    },
  },
  // --- Évolutions : jamais tirées au hasard, proposées dès que la recette est réunie ---
  {
    id: 'carpet_bombing', name: 'Tapis de bombes', text: 'Chaque TNT déclenche\nune réplique 3 lignes plus bas.',
    rarity: 'evolution', maxLevel: 1, cost: 0, icon: 'tnt_block', evolves: { from: 'long_fuse', with: 'artificer' },
    apply: (t) => void (t.mods.aftershock = true),
  },
  {
    id: 'drill', name: 'Foreuse', text: 'Casser un bloc abîme\naussi celui du dessous.',
    rarity: 'evolution', maxLevel: 1, cost: 0, icon: 'iron_block', evolves: { from: 'iron_pick', with: 'geologist' },
    apply: (t) => void (t.mods.drill = true),
  },
  {
    id: 'miners_eye', name: 'Œil du mineur', text: 'Casser un bloc éclaire\n2 cases tout autour.',
    rarity: 'evolution', maxLevel: 1, cost: 0, icon: 'torch', evolves: { from: 'lantern', with: 'detector' },
    apply: (t) => void (t.mods.eye = true),
  },
  {
    id: 'motherlode', name: 'Filon-mère', text: 'Casser un minerai casse\nceux du même type collés.',
    rarity: 'evolution', maxLevel: 1, cost: 0, icon: 'diamond_block', evolves: { from: 'prospector', with: 'vein' },
    apply: (t) => void (t.mods.motherlode = true),
  },
];

/** Carte de secours quand plus rien ne peut sortir (tout est au niveau max). */
export const SNACK: Perk = {
  id: 'snack', name: 'Casse-croûte', text: '+5 coups de pioche.',
  rarity: 'common', maxLevel: 1, instant: true, cost: 0, icon: 'pioche',
  apply: (t) => void (t.picks += 5),
};

export const PERKS_BY_ID = new Map([...PERKS, SNACK].map((p) => [p.id, p]));
export const STARTER_PERK_IDS = PERKS.filter((p) => p.cost === 0 && !p.evolves).map((p) => p.id);

/** Où en est le joueur, pour savoir quoi lui proposer. */
export interface DrawState {
  /** Niveau de chaque carte possédée (les effets immédiats n'y figurent pas). */
  owned: Record<string, number>;
  banned: ReadonlySet<string>;
}

/** Chances relatives d'apparaître dans un tirage : les malédictions sortent moins souvent. */
const DRAW_WEIGHT: Record<PerkRarity, number> = { common: 3, rare: 2, curse: 1, evolution: 0 };

export function evolutionReady(perk: Perk, { owned }: DrawState): boolean {
  if (!perk.evolves || owned[perk.id]) return false;
  const from = PERKS_BY_ID.get(perk.evolves.from);
  return !!from && owned[from.id] === from.maxLevel && !!owned[perk.evolves.with];
}

/** Cartes qu'on peut encore recevoir : montée de niveau, nouvelle carte s'il reste de la place. */
export function eligiblePerks(pool: Perk[], state: DrawState): Perk[] {
  const slotsFree = Object.keys(state.owned).length < MAX_SLOTS;
  return pool.filter((p) => {
    if (p.evolves || state.banned.has(p.id)) return false;
    const level = state.owned[p.id] ?? 0;
    if (level >= p.maxLevel && !p.instant) return false;
    return level > 0 || p.instant || slotsFree;
  });
}

/**
 * Tire `count` cartes différentes : d'abord les évolutions prêtes (à coup sûr, comme dans
 * Vampire Survivors), puis au hasard selon la rareté. Casse-croûte si rien d'autre ne peut sortir.
 */
export function drawPerks(pool: Perk[], state: DrawState, rng: () => number, count = 3): Perk[] {
  const picked = pool.filter((p) => evolutionReady(p, state)).slice(0, count);
  const candidates = eligiblePerks(pool, state);
  while (picked.length < count && candidates.length > 0) {
    const total = candidates.reduce((sum, p) => sum + DRAW_WEIGHT[p.rarity], 0);
    let roll = rng() * total;
    const index = candidates.findIndex((p) => (roll -= DRAW_WEIGHT[p.rarity]) < 0);
    picked.push(...candidates.splice(index === -1 ? candidates.length - 1 : index, 1));
  }
  return picked.length > 0 ? picked : [SNACK];
}
