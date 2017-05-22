var preload = function(game){}

preload.prototype = {
    
    preload: function(){
        
        /*
        this.game.canvas.style.marginLeft= "auto";
        this.game.canvas.style.marginRight= "auto";
        */
        
        this.game.canvas.style.cursor = 'none';
        
        this.game.load.audio('fairytail','assets/music/FairyTail.mp3');
        this.game.load.audio('BigExplosion','assets/music/BigExplosion.mp3');
        this.game.load.audio('BreakStone','assets/music/BreakStone.mp3');
        this.game.load.audio('HitStone','assets/music/HitStone.mp3');
        


        this.game.load.image('gametitle', 'assets/img/accueil.png');
        this.game.load.image('play', 'assets/img/start2.png');
        this.game.load.image('gameover', 'assets/img/gameover.png');
        this.game.load.spritesheet('torch', 'assets/img/torch.png', 19, 39, 5);
        
    
        this.game.load.image('sky', 'assets/img/little_sky.png');
        this.game.load.image('ground', 'assets/img/ground.png');
        
        this.game.load.image('pioche', 'assets/img/pioche50x50.png');

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

        this.game.load.spritesheet('explosion_TNT', 'assets/img/explosion.png', 384, 384, 16);
        
        this.game.load.spritesheet('explosion_Dynamite', 'assets/img/dynamite_explosion.png', 100, 100, 40);
        
        this.game.load.spritesheet('pioche_animation', 'assets/img/pioche_animation.png', 65, 65, 3);
        
    
    },
    create : function(){
        this.game.state.start("GameTitle");
    }
    
    
}