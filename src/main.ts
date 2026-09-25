import * as Phaser from 'phaser';
import { GAME_WIDTH, VIEW_HEIGHT } from './config';
import { GameOverScene } from './scenes/GameOverScene';
import { GameScene } from './scenes/GameScene';
import { HudScene } from './scenes/HudScene';
import { PreloadScene } from './scenes/PreloadScene';
import { TitleScene } from './scenes/TitleScene';

// La police pixel vient de Google Fonts : on l'attend (au plus 1,5 s) pour que Phaser ne dessine
// pas les premiers textes avec la police de secours.
const fontReady = Promise.race([
  document.fonts.load('16px "Press Start 2P"'),
  new Promise((resolve) => setTimeout(resolve, 1500)),
]);

fontReady.finally(() => {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: GAME_WIDTH,
    height: VIEW_HEIGHT,
    backgroundColor: '#0d0906',
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: { activePointers: 2 },
    scene: [PreloadScene, TitleScene, GameScene, HudScene, GameOverScene],
  });
  // Accès depuis la console pour déboguer (dev uniquement).
  if (import.meta.env.DEV) Object.assign(window, { game });
});
