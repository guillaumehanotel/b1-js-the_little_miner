import type * as Phaser from 'phaser';
import { BLOCK_SIZE } from '../config';
import { BLOCK_TYPES, SPECIAL_KINDS, type SpecialKind } from '../model/blockTypes';

/**
 * Icônes des blocs spéciaux en pixel art 12×12, agrandies ×5 par-dessus la texture de pierre :
 * même style que les minerais, sans fichier image à ajouter.
 */
const ICONS: Record<SpecialKind, { palette: Record<string, string>; pixels: string[] }> = {
  chest: {
    palette: { B: '#4a2a12', w: '#9a5a24', G: '#ffd84a' },
    pixels: [
      '............',
      '............',
      '..BBBBBBBB..',
      '.BwwwwwwwwB.',
      '.BwwwwwwwwB.',
      '.BBBBGGBBBB.',
      '.BwwwGGwwwB.',
      '.BwwwwwwwwB.',
      '.BwwwwwwwwB.',
      '.BBBBBBBBBB.',
      '............',
      '............',
    ],
  },
  hourglass: {
    palette: { F: '#6b4a2a', G: '#cfe8f0', S: '#ffd84a' },
    pixels: [
      '............',
      '..FFFFFFFF..',
      '...G....G...',
      '...GSSSSG...',
      '....GSSG....',
      '.....SS.....',
      '.....GG.....',
      '....G..G....',
      '...G.SS.G...',
      '...GSSSSG...',
      '..FFFFFFFF..',
      '............',
    ],
  },
  lamp: {
    palette: { F: '#2e2e2e', G: '#8a8a8a', Y: '#ffcc33', W: '#fff6c0' },
    pixels: [
      '............',
      '.....FF.....',
      '....F..F....',
      '...FFFFFF...',
      '...GYYYYG...',
      '...GYWWYG...',
      '...GYWWYG...',
      '...GYYYYG...',
      '...FFFFFF...',
      '....FFFF....',
      '............',
      '............',
    ],
  },
  magnet: {
    palette: { R: '#d83b2b', W: '#e8e8e8' },
    pixels: [
      '............',
      '..WW....WW..',
      '..WW....WW..',
      '..RR....RR..',
      '..RR....RR..',
      '..RR....RR..',
      '..RRR..RRR..',
      '...RRRRRR...',
      '....RRRR....',
      '............',
      '............',
      '............',
    ],
  },
  chicken: {
    palette: { B: '#c8742c', D: '#8a4a1a', W: '#f4ecd8' },
    pixels: [
      '............',
      '....BBBB....',
      '...BBBBBB...',
      '..BBBBBBBD..',
      '..BBBBBBBD..',
      '..BBBBBBD...',
      '...BBBBD....',
      '.....WW.....',
      '......WW....',
      '.....WWWW...',
      '......WW....',
      '............',
    ],
  },
};

export function makeSpecialBlockTextures(scene: Phaser.Scene): void {
  const stone = scene.textures.get('stone_block').getSourceImage() as CanvasImageSource;
  const scale = BLOCK_SIZE / 12;
  for (const kind of SPECIAL_KINDS) {
    const texture = scene.textures.createCanvas(BLOCK_TYPES[kind].texture, BLOCK_SIZE, BLOCK_SIZE)!;
    const ctx = texture.getContext();
    ctx.drawImage(stone, 0, 0, BLOCK_SIZE, BLOCK_SIZE);
    const { palette, pixels } = ICONS[kind];
    pixels.forEach((line, y) =>
      [...line].forEach((char, x) => {
        if (!palette[char]) return;
        ctx.fillStyle = palette[char];
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }),
    );
    texture.refresh();
  }
}
