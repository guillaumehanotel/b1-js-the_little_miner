/** Dimensions et règles du jeu (valeurs de base reprises de la version 2017). */
export const BLOCK_SIZE = 60;
export const COLS = 7;

export const GAME_WIDTH = COLS * BLOCK_SIZE; // 420
export const VIEW_HEIGHT = 650;
/** Ordonnée de la première ligne de blocs (sous le ciel). La mine, elle, n'a pas de fond. */
export const GROUND_Y = 360;

export const START_PICKS = 40;
export const BONUS_PICKS = 5;

/** Rayon (distance de Manhattan) de la zone détruite par la TNT ; elle éclaire un cran plus loin. */
export const TNT_BLAST_RADIUS = 2;

/** Un choix de carte tous les N mètres. */
export const LEVEL_EVERY_METERS = 10;

/** Défilement automatique, en pixels par seconde (l'original faisait 1 px/frame ≈ 60 px/s). */
export const SCROLL_SPEED_BASE = 55;
export const SCROLL_SPEED_PER_METER = 0.6;
export const SCROLL_SPEED_MAX = 110;
/** Fin de partie quand le dernier coup est à plus de ça au-dessus du haut de l'écran. */
export const SCROLL_LOSE_MARGIN = 140;
