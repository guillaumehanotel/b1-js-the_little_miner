import Phaser from 'phaser';
import { constants } from '../constants';

export class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
        
        this.picksText = null;
        this.depthText = null;
        this.oreTexts = {};
    }

    create() {
        // Create UI elements
        this.createUI();
        
        // Listen for updates from the game scene
        this.events.on('updateUIData', this.updateUI, this);
    }

    createUI() {
        // Create UI panel
        const panel = this.add.rectangle(constants.GAME_WIDTH / 2, 50, constants.GAME_WIDTH - 20, 80, 0x000000, 0.7);
        panel.setOrigin(0.5, 0.5);
        panel.setStrokeStyle(2, 0xffffff);
        
        // Picks left
        this.add.image(50, 50, 'picker').setScale(0.5);
        this.picksText = this.add.text(80, 40, `x ${constants.PICKER_NB_HIT}`, {
            font: '24px Arial',
            fill: '#ffffff'
        });
        
        // Depth
        this.depthText = this.add.text(200, 40, 'Depth: 0', {
            font: '24px Arial',
            fill: '#ffffff'
        });
        
        // Ore counters
        if (constants.DETAIL_SCORE) {
            const oreTypes = ['coal', 'iron', 'gold', 'diamond'];
            const startX = 300;
            
            oreTypes.forEach((type, index) => {
                const x = startX + index * 30;
                this.add.image(x, 50, type).setScale(0.4);
                this.oreTexts[type] = this.add.text(x + 15, 40, 'x 0', {
                    font: '16px Arial',
                    fill: '#ffffff'
                });
            });
        }
    }

    updateUI(data) {
        // Update picks
        this.picksText.setText(`x ${data.picksLeft}`);
        
        // Update depth
        this.depthText.setText(`Depth: ${data.depth}`);
        
        // Update ore counts if detail score is enabled
        if (constants.DETAIL_SCORE) {
            for (const [ore, count] of Object.entries(data.ores)) {
                if (this.oreTexts[ore]) {
                    this.oreTexts[ore].setText(`x ${count}`);
                }
            }
        }
    }
}
