import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load minimal assets needed for the loading screen
        this.load.image('background', 'assets/img/background.png');
    }

    create() {
        // Go to the loading scene
        this.scene.start('LoadingScene');
    }
}
