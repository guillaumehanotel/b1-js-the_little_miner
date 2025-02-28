import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { LoadingScene } from './scenes/LoadingScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { GameOverScene } from './scenes/GameOverScene';
import { constants } from './constants';

const config = {
    type: Phaser.AUTO,
    width: constants.GAME_WIDTH,
    height: constants.FRAME_HEIGHT,
    parent: 'game-container',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        BootScene,
        LoadingScene,
        MainMenuScene,
        GameScene,
        UIScene,
        GameOverScene
    ]
};

const game = new Phaser.Game(config);
