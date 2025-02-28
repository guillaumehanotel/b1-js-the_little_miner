import Phaser from 'phaser';
import { constants } from '../constants';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.depth = data.depth;
        this.ores = data.ores;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add semi-transparent background
        const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        bg.setOrigin(0);
        
        // Add game over text
        const gameOverText = this.add.text(width / 2, height / 4, 'Game Over', {
            font: '48px Arial Bold',
            fill: '#FF0000'
        });
        gameOverText.setOrigin(0.5);
        
        // Add stats
        const statsY = height / 3 + 50;
        
        this.add.text(width / 2, statsY, `Depth Reached: ${this.depth}`, {
            font: '32px Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        if (constants.DETAIL_SCORE) {
            this.add.text(width / 2, statsY + 50, 'Resources Collected:', {
                font: '32px Arial',
                fill: '#FFFFFF'
            }).setOrigin(0.5);
            
            const oreTypes = [
                { name: 'Coal', key: 'coal' },
                { name: 'Iron', key: 'iron' },
                { name: 'Gold', key: 'gold' },
                { name: 'Diamond', key: 'diamond' }
            ];
            
            oreTypes.forEach((ore, index) => {
                const y = statsY + 100 + (index * 40);
                
                this.add.image(width / 2 - 100, y, ore.key).setScale(0.4);
                this.add.text(width / 2 - 60, y - 10, `${ore.name}: ${this.ores[ore.key]}`, {
                    font: '24px Arial',
                    fill: '#FFFFFF'
                });
            });
        }
        
        // Add restart button
        const restartButton = this.add.text(width / 2, height * 3/4, 'Play Again', {
            font: '32px Arial',
            fill: '#FFFFFF',
            padding: { x: 20, y: 10 },
            backgroundColor: '#4a4a4a'
        });
        restartButton.setOrigin(0.5);
        restartButton.setInteractive({ useHandCursor: true });
        
        // Restart game on button click
        restartButton.on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.stop('UIScene');
            this.scene.start('GameScene');
            this.scene.start('UIScene');
        });
        
        // Button hover effects
        restartButton.on('pointerover', () => {
            restartButton.setBackgroundColor('#666666');
        });
        
        restartButton.on('pointerout', () => {
            restartButton.setBackgroundColor('#4a4a4a');
        });
    }
}
