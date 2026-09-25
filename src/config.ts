/** Dimensions et règles du jeu (valeurs reprises de la version 2017). */
export const BLOCK_SIZE = 60;
export const COLS = 7;
export const ROWS = 44;

export const GAME_WIDTH = COLS * BLOCK_SIZE; // 420
export const VIEW_HEIGHT = 650;
/** Ordonnée de la première ligne de blocs (sous le ciel). */
export const GROUND_Y = 360;
export const WORLD_HEIGHT = GROUND_Y + ROWS * BLOCK_SIZE; // 3000

export const START_PICKS = 40;
export const BONUS_PICKS = 5;

/** Rayon (distance de Manhattan) de la zone détruite puis révélée par la TNT. */
export const TNT_BLAST_RADIUS = 2;
export const TNT_REVEAL_RADIUS = 3;

/** Défilement automatique, en pixels par seconde (l'original faisait 1 px/frame ≈ 60 px/s). */
export const SCROLL_SPEED_BASE = 55;
export const SCROLL_SPEED_PER_METER = 1.2;
export const SCROLL_SPEED_MAX = 110;
/** Fin de partie quand le dernier coup est à plus de ça au-dessus du haut de l'écran. */
export const SCROLL_LOSE_MARGIN = 140;
