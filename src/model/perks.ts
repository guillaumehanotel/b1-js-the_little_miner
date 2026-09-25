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
}

export const baseMods = (): Mods => ({
  power: 1,
  tntRadius: TNT_BLAST_RADIUS,
  echo: false,
  lantern: false,
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
});

export type PerkRarity = 'common' | 'rare' | 'curse';

/** Ce qu'une carte a le droit de toucher quand on la prend. */
export interface PerkTarget {
  mods: Mods;
  picks: number;
}

export interface Perk {
  id: string;
  name: string;
  text: string;
  rarity: PerkRarity;
  /** Peut sortir plusieurs fois dans la même partie. */
  stackable: boolean;
  /** Prix en gemmes à l'Atelier ; 0 = disponible d'emblée. */
  cost: number;
  /** Texture existante servant d'icône. */
  icon: string;
  apply(target: PerkTarget): void;
}

export const PERKS: Perk[] = [
  // --- De départ ---
  {
    id: 'iron_pick', name: 'Pioche de fer', text: 'Chaque coup retire 1 point\nde résistance de plus.',
    rarity: 'common', stackable: true, cost: 0, icon: 'iron_block',
    apply: (t) => void (t.mods.power += 1),
  },
  {
    id: 'second_wind', name: 'Second souffle', text: '+8 coups de pioche.',
    rarity: 'common', stackable: true, cost: 0, icon: 'pioche',
    apply: (t) => void (t.picks += 8),
  },
  {
    id: 'long_fuse', name: 'Mèche longue', text: 'La TNT souffle\n1 case plus loin.',
    rarity: 'common', stackable: true, cost: 0, icon: 'tnt_block',
    apply: (t) => void (t.mods.tntRadius += 1),
  },
  {
    id: 'lantern', name: 'Lanterne', text: 'Casser un bloc éclaire\naussi les diagonales.',
    rarity: 'common', stackable: false, cost: 0, icon: 'torch',
    apply: (t) => void (t.mods.lantern = true),
  },
  {
    id: 'prospector', name: 'Prospecteur', text: '+1 point par minerai.',
    rarity: 'common', stackable: true, cost: 0, icon: 'gold_block',
    apply: (t) => void (t.mods.orePointsBonus += 1),
  },
  {
    id: 'heavy_boots', name: 'Bottes lourdes', text: 'L\'écran descend\n15 % moins vite.',
    rarity: 'common', stackable: true, cost: 0, icon: 'stone_block',
    apply: (t) => void (t.mods.scroll *= 0.85),
  },
  {
    id: 'deep_pockets', name: 'Poches profondes', text: 'Les blocs bonus donnent\n3 coups de plus.',
    rarity: 'common', stackable: true, cost: 0, icon: 'bonus_block',
    apply: (t) => void (t.mods.bonusPicks += 3),
  },
  {
    id: 'geologist', name: 'Géologue', text: 'Casser du charbon\nrend 1 coup.',
    rarity: 'common', stackable: true, cost: 0, icon: 'coal_block',
    apply: (t) => void (t.mods.coalRefund += 1),
  },
  // --- À débloquer à l'Atelier ---
  {
    id: 'detector', name: 'Détecteur', text: 'Les minerais se voient\nà travers le noir.',
    rarity: 'rare', stackable: false, cost: 6, icon: 'diamond_block',
    apply: (t) => void (t.mods.detector = true),
  },
  {
    id: 'echo', name: 'Écho', text: 'La dynamite souffle aussi\nla ligne du dessous.',
    rarity: 'rare', stackable: false, cost: 5, icon: 'dynamite_block',
    apply: (t) => void (t.mods.echo = true),
  },
  {
    id: 'vein', name: 'Filon', text: 'Les minerais sont\n50 % plus fréquents.',
    rarity: 'rare', stackable: true, cost: 8, icon: 'gold_block',
    apply: (t) => void (t.mods.oreLuck *= 1.5),
  },
  {
    id: 'artificer', name: 'Artificier', text: 'Chaque explosion\nrend 2 coups.',
    rarity: 'rare', stackable: true, cost: 6, icon: 'tnt_block',
    apply: (t) => void (t.mods.blastRefund += 2),
  },
  {
    id: 'recycling', name: 'Recyclage', text: 'Un coup sur 4\nest gratuit.',
    rarity: 'rare', stackable: false, cost: 8, icon: 'pioche',
    apply: (t) => void (t.mods.freeEvery = 4),
  },
  {
    id: 'magma_pact', name: 'Pacte du magma', text: '+15 coups, mais l\'écran\ndescend 25 % plus vite.',
    rarity: 'curse', stackable: true, cost: 4, icon: 'bedrock_block',
    apply: (t) => {
      t.picks += 15;
      t.mods.scroll *= 1.25;
    },
  },
  {
    id: 'fragile_pick', name: 'Pioche fragile', text: 'Force +2,\nmais −6 coups.',
    rarity: 'curse', stackable: true, cost: 4, icon: 'diamond_block',
    apply: (t) => {
      t.mods.power += 2;
      t.picks = Math.max(1, t.picks - 6);
    },
  },
  {
    id: 'greed', name: 'Avidité', text: 'Minerais à points doublés,\nplus aucun bloc bonus.',
    rarity: 'curse', stackable: false, cost: 5, icon: 'coal_block',
    apply: (t) => {
      t.mods.orePointsMult *= 2;
      t.mods.noBonus = true;
    },
  },
];

export const PERKS_BY_ID = new Map(PERKS.map((p) => [p.id, p]));
export const STARTER_PERK_IDS = PERKS.filter((p) => p.cost === 0).map((p) => p.id);

/** Chances relatives d'apparaître dans un tirage : les malédictions sortent moins souvent. */
const DRAW_WEIGHT: Record<PerkRarity, number> = { common: 3, rare: 2, curse: 1 };

/**
 * Tire `count` cartes différentes parmi `pool`, sans reproposer une carte non cumulable déjà prise.
 */
export function drawPerks(pool: Perk[], owned: string[], rng: () => number, count = 3): Perk[] {
  const candidates = pool.filter((p) => p.stackable || !owned.includes(p.id));
  const picked: Perk[] = [];
  while (picked.length < count && candidates.length > 0) {
    const total = candidates.reduce((sum, p) => sum + DRAW_WEIGHT[p.rarity], 0);
    let roll = rng() * total;
    const index = candidates.findIndex((p) => (roll -= DRAW_WEIGHT[p.rarity]) < 0);
    picked.push(...candidates.splice(index === -1 ? candidates.length - 1 : index, 1));
  }
  return picked;
}
