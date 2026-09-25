export type BlockKind =
  | 'dirt'
  | 'stone'
  | 'bedrock'
  | 'tnt'
  | 'dynamite'
  | 'bonus'
  | 'coal'
  | 'iron'
  | 'gold'
  | 'diamond';

export type OreKind = 'coal' | 'iron' | 'gold' | 'diamond';

export interface BlockType {
  texture: string;
  /** Nombre de coups pour casser le bloc (Infinity = incassable). */
  resistance: number;
  /** Chances d'apparition sur 1000. */
  weight: number;
  /** Couleur des éclats quand on le frappe. */
  color: number;
}

export const BLOCK_TYPES: Record<BlockKind, BlockType> = {
  dirt: { texture: 'dirt_block', resistance: 1, weight: 799, color: 0x7a5230 },
  stone: { texture: 'stone_block', resistance: 2, weight: 100, color: 0x8a8a8a },
  bedrock: { texture: 'bedrock_block', resistance: Infinity, weight: 10, color: 0x333333 },
  tnt: { texture: 'tnt_block', resistance: 1, weight: 10, color: 0xd83b2b },
  dynamite: { texture: 'dynamite_block', resistance: 1, weight: 10, color: 0xe0503a },
  bonus: { texture: 'bonus_block', resistance: 1, weight: 10, color: 0xffd84a },
  coal: { texture: 'coal_block', resistance: 1, weight: 20, color: 0x2b2b2b },
  iron: { texture: 'iron_block', resistance: 2, weight: 15, color: 0xd8af93 },
  gold: { texture: 'gold_block', resistance: 3, weight: 15, color: 0xfcee4b },
  diamond: { texture: 'diamond_block', resistance: 4, weight: 11, color: 0x5decf5 },
};

/** Points rapportés par minerai (en plus de 1 point par mètre de profondeur). */
export const ORE_POINTS: Record<OreKind, number> = { coal: 2, iron: 3, gold: 4, diamond: 5 };

export const ORE_KINDS = Object.keys(ORE_POINTS) as OreKind[];

export function isOre(kind: BlockKind): kind is OreKind {
  return kind in ORE_POINTS;
}

export function isExplosive(kind: BlockKind): kind is 'tnt' | 'dynamite' {
  return kind === 'tnt' || kind === 'dynamite';
}

/** Tire un type selon les poids ; `rng` renvoie un nombre dans [0, 1[. */
export function randomKind(rng: () => number): BlockKind {
  const total = Object.values(BLOCK_TYPES).reduce((sum, t) => sum + t.weight, 0);
  let roll = rng() * total;
  for (const [kind, type] of Object.entries(BLOCK_TYPES) as [BlockKind, BlockType][]) {
    roll -= type.weight;
    if (roll < 0) return kind;
  }
  return 'dirt';
}
