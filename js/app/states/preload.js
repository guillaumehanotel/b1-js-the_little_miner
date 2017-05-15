var preload = function(game){}

preload.prototype = {
    
    preload: function(){
    
        this.game.load.image('sky', 'assets/img/little_sky.png');
        this.game.load.image('ground', 'assets/img/ground.png');

        this.game.load.image('dirt_block', 'assets/img/dirt_block.jpg');
        this.game.load.image('grass_block', 'assets/img/grass_block.png');
        this.game.load.image('stone_block', 'assets/img/stone_block.jpg');
        this.game.load.image('bedrock_block', 'assets/img/bedrock_block.png');
        this.game.load.image('tnt_block', 'assets/img/tnt_block.jpg');
        this.game.load.image('dynamite_block', 'assets/img/dynamite_block.jpg');
        this.game.load.image('bonus_block', 'assets/img/bonus_block.png');
        this.game.load.image('coal_block', 'assets/img/coal_block.jpg');
        this.game.load.image('gold_block', 'assets/img/gold_block.jpg');
        this.game.load.image('iron_block', 'assets/img/iron_block.jpg');
        this.game.load.image('diamond_block', 'assets/img/diamond_block.jpg');

        
        this.game.load.image('destroy_1', 'assets/img/destroy_stage_1.png');
        this.game.load.image('destroy_2', 'assets/img/destroy_stage_2.png');
        this.game.load.image('destroy_3', 'assets/img/destroy_stage_3.png');
        this.game.load.image('destroy_4', 'assets/img/destroy_stage_4.png');
        this.game.load.image('destroy_5', 'assets/img/destroy_stage_5.png');
        this.game.load.image('destroy_6', 'assets/img/destroy_stage_6.png');
        this.game.load.image('destroy_7', 'assets/img/destroy_stage_7.png');
        this.game.load.image('destroy_8', 'assets/img/destroy_stage_8.png');
        this.game.load.image('destroy_9', 'assets/img/destroy_stage_9.png');
        

        this.game.load.spritesheet('destroy_all', 'assets/img/destroy_stage_all.png', 60, 60, 10);
        
        this.game.load.spritesheet('destroy_to_1', 'assets/img/destroy_stage_to_1.png', 60, 60, 2);
        this.game.load.spritesheet('destroy_to_3', 'assets/img/destroy_stage_to_3.png', 60, 60, 4);
        this.game.load.spritesheet('destroy_to_4', 'assets/img/destroy_stage_to_4.png', 60, 60, 5);
        this.game.load.spritesheet('destroy_to_6', 'assets/img/destroy_stage_to_6.png', 60, 60, 7);

        this.game.load.spritesheet('miner', 'assets/img/anim_miner_test2_right.gif', 60, 80, 10);
        
        
    
    },
    create : function(){
        this.game.state.start("GameTitle");
    }
    
    
}