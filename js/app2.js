$(document).ready(function () {
    
    
    const START_Y = 360;
    const GAME_WIDTH = 420;
    const GAME_HEIGHT = 1320;
    const FRAME_HEIGHT = 650;
    
    
    
    var game = new Phaser.Game(GAME_WIDTH, FRAME_HEIGHT, Phaser.AUTO, '', {
        preload: preload
        , create: create
        , update: update
    });

    function loadImages() {
        game.load.image('sky', 'assets/img/little_sky.png');
        
        game.load.image('ground', 'assets/img/ground.png');
        
        game.load.image('dirt_block', 'assets/img/dirt_block.jpg');
        
        game.load.image('grass_block', 'assets/img/grass_block.png');
        
        game.load.image('stone_block', 'assets/img/stone_block.jpg');
        
        game.load.image('bedrock_block', 'assets/img/bedrock_block.png');
        
        /*
        game.load.image('destroy_1', 'assets/img/destroy_stage_1.png');
        game.load.image('destroy_2', 'assets/img/destroy_stage_2.png');
        game.load.image('destroy_3', 'assets/img/destroy_stage_3.png');
        game.load.image('destroy_4', 'assets/img/destroy_stage_4.png');
        game.load.image('destroy_5', 'assets/img/destroy_stage_5.png');
        game.load.image('destroy_6', 'assets/img/destroy_stage_6.png');
        game.load.image('destroy_7', 'assets/img/destroy_stage_7.png');
        game.load.image('destroy_8', 'assets/img/destroy_stage_8.png');
        game.load.image('destroy_9', 'assets/img/destroy_stage_9.png');
        */
        
        game.load.spritesheet('destroy_all', 'assets/img/destroy_stage_all.png', 60, 60, 9);
        
        game.load.spritesheet('destroy_all_', 'assets/img/destroy_stage_1_to_5.png', 60, 60, 5);
        game.load.spritesheet('destroy_all_', 'assets/img/destroy_stage_6_to_9.png', 60, 60, 4);

    }
    
    
    
    
    /* PRELOAD */
    function preload() {
        loadImages();
    }
    
    
    
    
    /* Fonction servant à initialiser la vue du jeu */
    function loadGameView() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        // On ajoute le sprite du ciel à partir de la position (0,0)
        game.add.sprite(0, 0, 'sky');
        // On ajoute le sprite du sol à partir de la position (0,360)
        game.add.sprite(0, START_Y, 'ground');
        // On défini les limites du jeu s'arretant à 1280px de profondeur
        game.world.setBounds(0, 0, 0, GAME_HEIGHT);
        //game.time.slowMotion = 60.0;
        // Création des blocks
        loadBlocks();
        
        
        scoreText = game.add.text(16, 16, 'Pioche: ' + GameModel.pioche, {
            fontSize: '23px'
            , fill: '#000'
        });
        
        
    }
    
    
    
    
    
    /* CREATE */
    function create() {
        GameModel.createBlocks();
        loadGameView();
        //GameModel.printBlocks();
        
      /*  
        var cracks = game.add.sprite(0,280,'destroy_all');
        var destroy = cracks.animations.add('destroy');
        cracks.animations.play('destroy', 20, true, true);
        */

        
    }
    
    

    
    
    /* FONCTION SERVANT A CREER GRAPHIQUEMENT LES BLOCKS */
    function loadBlocks() {
        
        
        blocks = game.add.group();
        blocks.enableBody = true;
        blocks.inputEnableChildren = true;
        
        
        // on récupère dans un tableau, l'attribut blocks de l'objet GameModel
        var arrayBlocks = GameModel.blocks;
        
        arrayBlocks.forEach(function (element) {
            // si les éléments ne sont pas détruit
            if (element.destroyed == false) {
                
                
                // si l'ordonnée des éléments est sur la ligne de départ
                if (element.location.y == START_Y) {
                    
                    var sprite = blocks.create(element.location.x, element.location.y, 'grass_block');

                // si les éléments sont de types DIRT
                } else if (element.type == TYPEBLOCK.DIRT) { 
                    var sprite = blocks.create(element.location.x, element.location.y, 'dirt_block')   
                    
                } else if (element.type == TYPEBLOCK.STONE) { 
                    var sprite = blocks.create(element.location.x, element.location.y, 'stone_block')    
                    
                } else if (element.type == TYPEBLOCK.BEDROCK) { 
                    var sprite = blocks.create(element.location.x, element.location.y, 'bedrock_block')    
                }
                
                sprite.x = element.location.x;
                sprite.y = element.location.y;
                sprite.input.useHandCursor = true;
                
            }

        });
        
       // ajout d'un listener onClick pour chaque sprite
        blocks.onChildInputDown.add(clickBlock, this);
        

    }
    
    
    
    
    function destroyBlock(sprite){
          
        
        crackAnimation(sprite,9);
        
        sprite.destroy();
        
        
    }
    
    
    
    function crackAnimation(sprite, state){
        
        

            var cracks = game.add.sprite(sprite.x,sprite.y,'destroy_all');
            var destroy = cracks.animations.add('destroy');
            cracks.animations.play('destroy', 30, false, true);

        
        
        
    }
    
    
    
    
    
    

    /* UPDATE */
    function update() {
        //game.camera.y += 1;
        if(GameModel.pioche == 0){
            //destroy
        }
    }
    
    
    
    
    
    /************************************************************************************/
    /***********************************   CONTROLLER  **********************************/
    /************************************************************************************/
    
    function clickBlock(sprite){

        
        
        //console.log(sprite.x+","+sprite.y);
        var block = GameModel.getBlock(sprite.x,sprite.y);
        
        var destroyed = block.hitBlock();
        
        getResistanceState(block);
        
        if(destroyed == true){
            
            
            
            destroyBlock(sprite, 9);
           
            
            
            // Res = 2
        } else if(destroyed == false){
                  
            //destroyBlock(sprite, 5);
        }
            
        updateText();
        
    }
    
    function updateText(){
        scoreText.setText("Pioche: "+GameModel.pioche);
    }
    
    
                  
                  
     function getResistanceState(block){
     
         var original_resistance = block.getType().name;
         console.log(original_resistance);
         
         
     }
                  
    
    
    
    
    
    
    /************************************************************************************/
    /**************************************   MODEL  ************************************/
    /************************************************************************************/
    
    /* Notre modèle jeu qui a un attribut liste des blocks et un fonction pour les créer */
    
    var GameModel = {
        blocks: null,
        pioche: 35,
        
        createBlocks: function () {
            var array_blocks = [];
            // de 360 à 1280
            for (var j = START_Y; j < GAME_HEIGHT; j += 60) {
                // de 0 à 420
                for (var i = 0; i < GAME_WIDTH; i += 60) {
                    // ici qu'on mettrait un random pour définir le type des blocks
                    var profondeur = (j - 300) / 60;
                    var block = new Block(i, j, profondeur)
                    
                       do { 
                    
                    var rand = Math.floor((Math.random() * 100) + 1);
                    
                                 

                        if(rand >= 1 && rand < 85){
                            block.type = TYPEBLOCK.DIRT;
                        } else if (rand >= 85 && rand < 98){
                            block.type = TYPEBLOCK.STONE;
                        } else if (rand >= 98 && rand <= 100){
                            block.type = TYPEBLOCK.BEDROCK;
                        } 

                    } while(block.location.y == 360 && block.type != TYPEBLOCK.DIRT)
                    
                    
                    
                    block.setResistance();
                    array_blocks.push(block);
                }
            }
            this.blocks = array_blocks;
        }, 
        
        printBlocks: function () {
            this.blocks.forEach(function (block) {
                block.printLocation();
            });
        },
        
        
        getBlock: function(x, y){
            
            var res = null;
            
            this.blocks.forEach(function (block) {
                
                
                if(block.location.x == x && block.location.y == y){
                    res = block;
                }
                
            });
            
            return res;
        }
        
    };
    
    
    
    
    
    
    // OBJET LOCATION
    function Location(x, y) {
        this.x = x;
        this.y = y;
    }
    
    
    
    
    
    /** 
     * OBJECT BLOCK
     * hauteur et largeur a 60px
     */
    function Block(x, y, profondeur) {
        this.height = 60;
        this.width = 60;
        this.location = new Location(x, y);
        this.profondeur = profondeur;
        this.resistance = null;
        this.type = null;
        this.destroyed = false;
    }
    
    
    
    
    Block.prototype.setResistance = function () {
        switch (this.type) {
        case TYPEBLOCK.DIRT:
            this.resistance = 1;
            break;
        case TYPEBLOCK.STONE:
            this.resistance = 2;
            break;
        case TYPEBLOCK.BEDROCK:
            this.resistance = 9999;
            break;
        default:
            this.resistance = 1;
            break;
        }
    }
    

    
    
    
    Block.prototype.hitBlock = function(){
    
        this.printLocation();

        if(this.type != TYPEBLOCK.BEDROCK){
            GameModel.pioche--;
        }
        
        this.resistance--;
        if(this.resistance == 0){
            this.destroyed = true;
            return true;
        } else {
            return false;
        }
        
    }

    
    Block.prototype.printLocation = function () {
        console.log("(" + this.location.x + "," + this.location.y + ")");
    }
    
    Block.prototype.getType = function(){
        return this.type;
    }
    
    
    
    
    var TYPEBLOCK = {
        DIRT: {
            name: "Dirt"
            , resistance: 1
        }
        , STONE: {
            name: "Stone"
            , resistance: 2
        }
        , BEDROCK: {
            name: "Bedrock"
            , resistance: 9999
        }
    };
    
    
    Object.freeze(TYPEBLOCK);
    
    
});


