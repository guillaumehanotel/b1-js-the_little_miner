import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add background
        this.add.image(width / 2, height / 2, 'background');
        
        // Add title
        const title = this.add.text(width / 2, height / 3, 'The Little Miner', {
            font: '48px Arial Bold',
            fill: '#FFFFFF'
        });
        title.setOrigin(0.5);
        
        // Add start button
        const startButton = this.add.text(width / 2, height / 2, 'Start Game', {
            font: '32px Arial',
            fill: '#FFFFFF',
            padding: { x: 20, y: 10 },
            backgroundColor: '#4a4a4a'
        });
        startButton.setOrigin(0.5);
        startButton.setInteractive({ useHandCursor: true });
        
        // Start game on button click
        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
            this.scene.launch('UIScene');
        });
        
        // Button hover effects
        startButton.on('pointerover', () => {
            startButton.setBackgroundColor('#666666');
        });
        
        startButton.on('pointerout', () => {
            startButton.setBackgroundColor('#4a4a4a');
        });
    }
}
