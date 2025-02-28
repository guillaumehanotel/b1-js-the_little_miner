import { constants } from '../constants';

export class GameModel {
    static instance = null;
    
    constructor() {
        if (GameModel.instance) {
            return GameModel.instance;
        }
        
        this.blocks = [];
        this.picks = constants.PICKER_NB_HIT;
        this.depth = 0;
        this.oreScores = {
            coal: 0,
            iron: 0,
            gold: 0,
            diamond: 0
        };
        
        GameModel.instance = this;
    }

    static getBlock(x, y) {
        if (!GameModel.instance) {
            return null;
        }
        
        return GameModel.instance.blocks.find(block => 
            block.location.x === x && block.location.y === y
        );
    }

    static getBlocksByDepth(depth) {
        if (!GameModel.instance) {
            return [];
        }
        
        return GameModel.instance.blocks.filter(block => block.depth === depth);
    }

    addBlock(block) {
        this.blocks.push(block);
    }

    updateBreakableBlocks() {
        // Reset all blocks to non-breakable
        this.blocks.forEach(block => {
            block.setBreakable(false);
        });
        
        // Set top row as breakable
        this.blocks.forEach(block => {
            if (block.getY() === constants.START_Y && !block.isDestroyed()) {
                block.setBreakable(true);
            }
        });
        
        // Propagate breakable status
        let changed = true;
        while (changed) {
            changed = false;
            
            this.blocks.forEach(block => {
                if (block.isBreakable() && !block.isDestroyed()) {
                    const aroundBlocks = block.propagateBreakable();
                    
                    aroundBlocks.forEach(aroundBlock => {
                        if (aroundBlock && !aroundBlock.isBreakable() && !aroundBlock.isDestroyed()) {
                            aroundBlock.setBreakable(true);
                            changed = true;
                        }
                    });
                }
            });
        }
    }

    hitBlock(block) {
        if (this.picks <= 0) {
            return false;
        }
        
        // Decrease picks
        this.picks--;
        
        // Try to break the block
        const broken = block.decreaseResistance();
        
        // Update depth if block is broken
        if (broken) {
            this.updateDepth();
        }
        
        return broken;
    }

    updateDepth() {
        let maxDepth = 0;
        
        this.blocks.forEach(block => {
            if (block.isDestroyed() && block.getDepth() > maxDepth) {
                maxDepth = block.getDepth();
            }
        });
        
        this.depth = maxDepth;
    }

    incrementOreScore(block) {
        const type = block.getType().name;
        
        switch (type) {
            case 'coal':
                this.oreScores.coal++;
                break;
            case 'iron':
                this.oreScores.iron++;
                break;
            case 'gold':
                this.oreScores.gold++;
                break;
            case 'diamond':
                this.oreScores.diamond++;
                break;
        }
    }

    getPicksLeft() {
        return this.picks;
    }

    getDepth() {
        return this.depth;
    }

    getOreScores() {
        return this.oreScores;
    }

    reset() {
        this.blocks = [];
        this.picks = constants.PICKER_NB_HIT;
        this.depth = 0;
        this.oreScores = {
            coal: 0,
            iron: 0,
            gold: 0,
            diamond: 0
        };
    }
}
