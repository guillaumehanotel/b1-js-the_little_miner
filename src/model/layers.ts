import type { Weights } from './blockTypes';

export interface Layer {
  name: string;
  /** Profondeur (en mètres) à partir de laquelle la couche commence. */
  from: number;
  weights: Weights;
  /** Teinte du fond de la galerie. */
  tint: number;
}

// Coffres : même fréquence partout (≈ 1 tous les 45 m), sinon ils éclipsent les paliers.
// Plus on descend, moins il y a de terre, plus il y a de minerais… et de bedrock pour barrer la route.
export const LAYERS: Layer[] = [
  {
    name: 'Terre',
    from: 0,
    tint: 0xffffff,
    weights: { dirt: 799, stone: 100, bedrock: 10, tnt: 10, dynamite: 10, bonus: 10, chest: 3, hourglass: 3, lamp: 3, magnet: 3, chicken: 3, coal: 20, iron: 15, gold: 15, diamond: 11 },
  },
  {
    name: 'Roche',
    from: 15,
    tint: 0xb8b0a8,
    weights: { dirt: 600, stone: 250, bedrock: 15, tnt: 12, dynamite: 12, bonus: 10, chest: 3, hourglass: 3, lamp: 3, magnet: 3, chicken: 3, coal: 35, iron: 35, gold: 18, diamond: 13 },
  },
  {
    name: 'Caverne',
    from: 40,
    tint: 0x8a90b8,
    weights: { dirt: 450, stone: 300, bedrock: 40, tnt: 25, dynamite: 15, bonus: 12, chest: 3, hourglass: 3, lamp: 3, magnet: 3, chicken: 4, coal: 40, iron: 45, gold: 45, diamond: 28 },
  },
  {
    name: 'Magma',
    from: 80,
    tint: 0xe07050,
    weights: { dirt: 300, stone: 350, bedrock: 80, tnt: 30, dynamite: 20, bonus: 12, chest: 3, hourglass: 3, lamp: 3, magnet: 4, chicken: 4, coal: 30, iron: 50, gold: 60, diamond: 68 },
  },
];

/** Couche d'une ligne (la ligne 0 est à 1 m). */
export function layerAt(row: number): Layer {
  const meters = row + 1;
  return LAYERS.findLast((layer) => meters >= layer.from) ?? LAYERS[0];
}
