import { BlockTypes } from './BlockTypes';
import { Location } from './Location';
import { GameModel } from './GameModel';
import { constants } from '../constants';

export class Block {
    constructor(x, y) {
        this.height = 60;
        this.width = 60;
        this.location = new Location(x, y);
        this.depth = Math.floor((y - constants.START_Y) / 60) + 1;
        this.resistance = 0;
        this.type = null;
        this.destroyed = false;
        this.breakable = false;
    }

    setRandomType() {
        const rand = Math.floor((Math.random() * 1000) + 1);
        
        if (rand >= 1 && rand < 800) {
            this.type = BlockTypes.DIRT;
            this.resistance = constants.RESISTANCE_DIRT;
        } else if (rand >= 800 && rand < 900) {
            this.type = BlockTypes.STONE;
            this.resistance = constants.RESISTANCE_STONE;
        } else if (rand >= 900 && rand < 950) {
            this.type = BlockTypes.COAL;
            this.resistance = constants.RESISTANCE_COAL;
        } else if (rand >= 950 && rand < 970) {
            this.type = BlockTypes.IRON;
            this.resistance = constants.RESISTANCE_IRON;
        } else if (rand >= 970 && rand < 985) {
            this.type = BlockTypes.GOLD;
            this.resistance = constants.RESISTANCE_GOLD;
        } else if (rand >= 985 && rand < 995) {
            this.type = BlockTypes.DIAMOND;
            this.resistance = constants.RESISTANCE_DIAMOND;
        } else if (rand >= 995 && rand < 998) {
            this.type = BlockTypes.TNT;
            this.resistance = constants.RESISTANCE_TNT;
        } else if (rand >= 998 && rand <= 1000) {
            this.type = BlockTypes.DYNAMITE;
            this.resistance = constants.RESISTANCE_DYNAMITE;
        }
        
        // Bedrock at the bottom
        if (this.depth >= 5) {
            this.type = BlockTypes.BEDROCK;
            this.resistance = constants.RESISTANCE_BEDROCK;
        }
    }

    getTypeName() {
        return this.type.name;
    }

    propagateBreakable() {
        let array;
        
        if (this.type === BlockTypes.TNT) {
            array = this.getAroundTNTBlocks();
        } else if (this.type === BlockTypes.DYNAMITE) {
            array = this.getAroundDynamiteBlocks();
        } else {
            array = this.getAroundBlocks();
        }
        
        return array;
    }

    getAroundBlocks() {
        const arrayBlocks = [];
        
        const topBlock = this.getTopBlock();
        if (topBlock) {
            arrayBlocks.push(topBlock);
        }
        
        const bottomBlock = this.getBottomBlock();
        if (bottomBlock) {
            arrayBlocks.push(bottomBlock);
        }
        
        const leftBlock = this.getLeftBlock();
        if (leftBlock) {
            arrayBlocks.push(leftBlock);
        }
        
        const rightBlock = this.getRightBlock();
        if (rightBlock) {
            arrayBlocks.push(rightBlock);
        }
        
        return arrayBlocks;
    }

    getAroundDynamiteBlocks() {
        const blocks = this.getDynamiteBlocks();
        const aroundBlocks = [];
        
        blocks.forEach(block => {
            const topBlock = block.getTopBlock();
            if (topBlock) {
                aroundBlocks.push(topBlock);
            }
            
            const bottomBlock = block.getBottomBlock();
            if (bottomBlock) {
                aroundBlocks.push(bottomBlock);
            }
            
            const leftBlock = block.getLeftBlock();
            if (leftBlock) {
                aroundBlocks.push(leftBlock);
            }
            
            const rightBlock = block.getRightBlock();
            if (rightBlock) {
                aroundBlocks.push(rightBlock);
            }
        });
        
        return aroundBlocks;
    }

    getAroundTNTBlocks() {
        const blocks = [];
        
        // Check blocks in a 5x5 area around the TNT
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                if (dx === 0 && dy === 0) continue; // Skip the TNT block itself
                
                const block = this.getBlockAtOffset(dx, dy);
                if (block) {
                    blocks.push(block);
                }
            }
        }
        
        return blocks;
    }

    getBlockAtOffset(dx, dy) {
        const x = this.location.x + (dx * this.width);
        const y = this.location.y + (dy * this.height);
        
        // Check if coordinates are within bounds
        if (x >= 0 && x < constants.GAME_WIDTH && y >= constants.START_Y && y < constants.GAME_HEIGHT) {
            return GameModel.getBlock(x, y);
        }
        
        return null;
    }

    getTopBlock(nb = 1) {
        const x = this.getX();
        const y = this.getY();
        
        // Check if we're at the top edge
        if (y !== constants.START_Y) {
            return GameModel.getBlock(x, y - (60 * nb));
        }
        
        return null;
    }

    getBottomBlock(nb = 1) {
        const x = this.getX();
        const y = this.getY();
        
        // Check if we're at the bottom edge
        if (y < constants.GAME_HEIGHT - 60) {
            return GameModel.getBlock(x, y + (60 * nb));
        }
        
        return null;
    }

    getLeftBlock(nb = 1) {
        const x = this.getX();
        const y = this.getY();
        
        // Check if we're at the left edge
        if (x !== 0) {
            return GameModel.getBlock(x - (60 * nb), y);
        }
        
        return null;
    }

    getRightBlock(nb = 1) {
        const x = this.getX();
        const y = this.getY();
        
        // Check if we're at the right edge
        if (x < constants.GAME_WIDTH - 60) {
            return GameModel.getBlock(x + (60 * nb), y);
        }
        
        return null;
    }

    getDynamiteBlocks() {
        return GameModel.getBlocksByDepth(this.depth);
    }

    getType() {
        return this.type;
    }

    getDepth() {
        return this.depth;
    }

    setBreakable(bool) {
        this.breakable = bool;
    }

    isBreakable() {
        return this.breakable;
    }

    getX() {
        return this.location.x;
    }

    getY() {
        return this.location.y;
    }

    setDestroyed(value) {
        this.destroyed = value;
    }

    isDestroyed() {
        return this.destroyed;
    }

    decreaseResistance() {
        if (this.resistance > 0) {
            this.resistance--;
            return false;
        }
        return true;
    }
}
