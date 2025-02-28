import Phaser from 'phaser';
import { Block } from '../model/Block';
import { BlockTypes } from '../model/BlockTypes';
import { GameModel } from '../model/GameModel';
import { constants } from '../constants';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        
        this.blocks = [];
        this.gameModel = null;
        this.blockSize = 60;
        this.picker = null;
    }

    create() {
        // Initialize game model
        this.gameModel = new GameModel();
        this.gameModel.reset();
        
        // Create background
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
        
        // Create blocks grid
        this.createBlocks();
        
        // Create picker cursor
        this.picker = this.add.image(0, 0, 'picker').setScale(0.5);
        this.picker.setDepth(1000);
        
        // Setup input
        this.input.on('pointermove', (pointer) => {
            this.picker.setPosition(pointer.x, pointer.y);
        });
        
        this.input.on('pointerdown', this.handleBlockClick, this);
        
        // Play background music if enabled
        if (constants.MUSIC) {
            this.sound.play('background-music', {
                loop: true,
                volume: 0.5
            });
        }
        
        // Setup communication with UI scene
        this.events.on('updateUI', this.updateUI, this);
        
        // Initial UI update
        this.updateUI();
    }

    createBlocks() {
        // Clear existing blocks
        this.blocks = [];
        
        // Create blocks grid
        for (let y = constants.START_Y; y < constants.START_Y + 300; y += this.blockSize) {
            for (let x = 0; x < constants.GAME_WIDTH; x += this.blockSize) {
                const block = new Block(x, y);
                block.setRandomType();
                
                // Add block to the scene
                const sprite = this.add.image(x + this.blockSize / 2, y + this.blockSize / 2, block.getTypeName());
                sprite.setOrigin(0.5);
                sprite.setInteractive();
                sprite.blockData = block;
                
                this.blocks.push(sprite);
                this.gameModel.addBlock(block);
            }
        }
        
        // Set breakable blocks (those that are accessible)
        this.gameModel.updateBreakableBlocks();
    }

    handleBlockClick(pointer) {
        // Find the clicked block
        const clickedBlock = this.blocks.find(blockSprite => {
            const bounds = blockSprite.getBounds();
            return Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y);
        });
        
        if (clickedBlock && clickedBlock.blockData.isBreakable()) {
            // Try to break the block
            const blockData = clickedBlock.blockData;
            const broken = this.gameModel.hitBlock(blockData);
            
            if (broken) {
                // Play sound based on block type
                if (blockData.getType() === BlockTypes.TNT || blockData.getType() === BlockTypes.DYNAMITE) {
                    this.sound.play('explosion');
                    
                    // Handle explosion effects
                    this.handleExplosion(blockData);
                } else {
                    this.sound.play('dig');
                    
                    // Collect resources
                    if (this.isOre(blockData.getType())) {
                        this.sound.play('collect');
                        this.gameModel.incrementOreScore(blockData);
                    }
                    
                    // Mark block as destroyed
                    blockData.setDestroyed(true);
                    clickedBlock.setVisible(false);
                }
                
                // Update breakable blocks
                this.gameModel.updateBreakableBlocks();
                
                // Update UI
                this.updateUI();
                
                // Check if game over
                if (this.gameModel.getPicksLeft() <= 0) {
                    this.scene.pause();
                    this.scene.launch('GameOverScene', { 
                        depth: this.gameModel.getDepth(),
                        ores: this.gameModel.getOreScores()
                    });
                }
            } else {
                // Show hit effect
                this.showHitEffect(clickedBlock);
            }
        }
    }

    handleExplosion(blockData) {
        let blocksToExplode = [];
        
        if (blockData.getType() === BlockTypes.TNT) {
            blocksToExplode = blockData.getAroundTNTBlocks();
        } else if (blockData.getType() === BlockTypes.DYNAMITE) {
            blocksToExplode = blockData.getAroundDynamiteBlocks();
        }
        
        // Destroy blocks in explosion radius
        blocksToExplode.forEach(block => {
            if (block && !block.isDestroyed() && block.getType() !== BlockTypes.BEDROCK) {
                // Find the sprite for this block
                const blockSprite = this.blocks.find(sprite => 
                    sprite.blockData.getX() === block.getX() && 
                    sprite.blockData.getY() === block.getY()
                );
                
                if (blockSprite) {
                    // Collect resources if it's an ore
                    if (this.isOre(block.getType())) {
                        this.gameModel.incrementOreScore(block);
                    }
                    
                    // Mark block as destroyed
                    block.setDestroyed(true);
                    blockSprite.setVisible(false);
                    
                    // Add explosion effect
                    this.addExplosionEffect(blockSprite.x, blockSprite.y);
                }
            }
        });
    }

    addExplosionEffect(x, y) {
        const particles = this.add.particles('dirt');
        
        const emitter = particles.createEmitter({
            x: x,
            y: y,
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            lifespan: 500,
            quantity: 20,
            blendMode: 'ADD'
        });
        
        // Auto-destroy the particle emitter after 1 second
        this.time.delayedCall(1000, () => {
            particles.destroy();
        });
    }

    showHitEffect(blockSprite) {
        // Flash the block
        this.tweens.add({
            targets: blockSprite,
            alpha: 0.5,
            duration: 100,
            yoyo: true
        });
    }

    isOre(blockType) {
        return [
            BlockTypes.COAL,
            BlockTypes.IRON,
            BlockTypes.GOLD,
            BlockTypes.DIAMOND
        ].includes(blockType);
    }

    updateUI() {
        // Send updated data to UI scene
        const sceneUI = this.scene.get('UIScene');
        if (sceneUI) {
            sceneUI.events.emit('updateUIData', {
                picksLeft: this.gameModel.getPicksLeft(),
                depth: this.gameModel.getDepth(),
                ores: this.gameModel.getOreScores()
            });
        }
    }
}
