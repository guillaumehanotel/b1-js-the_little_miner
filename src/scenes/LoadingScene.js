import Phaser from 'phaser';

export class LoadingScene extends Phaser.Scene {
    constructor() {
        super('LoadingScene');
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
        
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        
        const percentText = this.make.text({
            x: width / 2,
            y: height / 2,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);
        
        // Update the loading bar as assets are loaded
        this.load.on('progress', (value) => {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });
        
        // Load all game assets
        this.loadAssets();
    }

    loadAssets() {
        // Blocks and tiles
        this.load.image('dirt', 'assets/img/dirt.png');
        this.load.image('stone', 'assets/img/stone.png');
        this.load.image('bedrock', 'assets/img/bedrock.png');
        this.load.image('coal', 'assets/img/coal.png');
        this.load.image('iron', 'assets/img/iron.png');
        this.load.image('gold', 'assets/img/gold.png');
        this.load.image('diamond', 'assets/img/diamond.png');
        this.load.image('tnt', 'assets/img/tnt.png');
        this.load.image('dynamite', 'assets/img/dynamite.png');
        
        // UI elements
        this.load.image('picker', 'assets/img/picker.png');
        
        // Audio
        this.load.audio('dig', 'assets/audio/dig.mp3');
        this.load.audio('explosion', 'assets/audio/explosion.mp3');
        this.load.audio('collect', 'assets/audio/collect.mp3');
        this.load.audio('background-music', 'assets/audio/background-music.mp3');
    }

    create() {
        // Go to the main menu
        this.scene.start('MainMenuScene');
    }
}
