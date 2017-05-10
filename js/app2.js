$(document).ready(function () {


    const START_Y = 360;
    const GAME_WIDTH = 420;
    const GAME_HEIGHT = 1320;
    const FRAME_HEIGHT = 650;
    
    const PICKER_NB_HIT = 35;

    /* const RESISTANCE de chaque type */
    
    const RESISTANCE_DIRT = 1;
    const RESISTANCE_BEDROCK = 9999;
    const RESISTANCE_STONE = 2;
    

    /* const proportions d'apparitions des blocks */



    var game = new Phaser.Game(GAME_WIDTH, FRAME_HEIGHT, Phaser.AUTO, '', {
        preload: preload,
        create: create,
        update: update
    });


    /*********************************************************************************************/

    /**
     * Méthode de la vue : loadImages
     * Sert à loader les images et sprites utilisés dans le jeu
     */
    function loadImages() {

        game.load.image('sky', 'assets/img/little_sky.png');
        game.load.image('ground', 'assets/img/ground.png');

        game.load.image('dirt_block', 'assets/img/dirt_block.jpg');
        game.load.image('grass_block', 'assets/img/grass_block.png');
        game.load.image('stone_block', 'assets/img/stone_block.jpg');
        game.load.image('bedrock_block', 'assets/img/bedrock_block.png');
        game.load.image('tnt_block', 'assets/img/tnt_block.jpg');
        game.load.image('dynamite_block', 'assets/img/dynamite_block.jpg');
        game.load.image('bonus_block', 'assets/img/bonus_block.png');
        game.load.image('coal_block', 'assets/img/coal_block.jpg');
        game.load.image('gold_block', 'assets/img/gold_block.jpg');
        game.load.image('iron_block', 'assets/img/iron_block.jpg');
        game.load.image('diamond_block', 'assets/img/diamond_block.jpg');

        
        game.load.image('destroy_1', 'assets/img/destroy_stage_1.png');
        game.load.image('destroy_2', 'assets/img/destroy_stage_2.png');
        game.load.image('destroy_3', 'assets/img/destroy_stage_3.png');
        game.load.image('destroy_4', 'assets/img/destroy_stage_4.png');
        game.load.image('destroy_5', 'assets/img/destroy_stage_5.png');
        game.load.image('destroy_6', 'assets/img/destroy_stage_6.png');
        game.load.image('destroy_7', 'assets/img/destroy_stage_7.png');
        game.load.image('destroy_8', 'assets/img/destroy_stage_8.png');
        game.load.image('destroy_9', 'assets/img/destroy_stage_9.png');
        

        game.load.spritesheet('destroy_all', 'assets/img/destroy_stage_all.png', 60, 60, 10);
        
        game.load.spritesheet('destroy_to_1', 'assets/img/destroy_stage_to_1.png', 60, 60, 2);
        game.load.spritesheet('destroy_to_3', 'assets/img/destroy_stage_to_3.png', 60, 60, 4);
        game.load.spritesheet('destroy_to_4', 'assets/img/destroy_stage_to_4.png', 60, 60, 5);
        game.load.spritesheet('destroy_to_6', 'assets/img/destroy_stage_to_6.png', 60, 60, 7);


    }




    /**
     * Méthode du jeu Phaser : preload
     * Appel la fonction d'initialiation des images
     */
    function preload() {
        loadImages();
    }



    /*********************************************************************************************/
    /* Méthodes de la création grahique du jeu */


    /**
     * Méthode de la vue : loadGameView
     * Sert à initialiser le jeu en y ajoutant les sprites et affichage de base
     *
     */
    function loadGameView() {

        game.physics.startSystem(Phaser.Physics.ARCADE);
        // On ajoute le sprite du ciel à partir de la position (0,0)
        game.add.sprite(0, 0, 'sky');
        // On ajoute le sprite du sol à partir de la position (0,360)
        game.add.sprite(0, START_Y, 'ground');
        // On défini les limites du jeu s'arretant à 1280px de profondeur
        game.world.setBounds(0, 0, 0, GAME_HEIGHT);
        //game.time.slowMotion = 60.0;

        cursors = game.input.keyboard.createCursorKeys();

        // Création graphique des blocks
        generateBlocksView();


        scoreText = game.add.text(16, 16, 'Pioche: ' + GameModel.pioche, {
            fontSize: '23px',
            fill: '#fff'
        });


    }




    /**
     * Méthode du jeu Phaser : create
     * Sert à initialiser le jeu et les graphiques :
     * - Initialise la liste des blocks de GameModel
     * - Appel la fonction loadGameView
     */
    function create() {
        GameModel.createBlocks();
        loadGameView();
    }



    /*********************************************************************************************/
    /* Méthode update */



    /**
     * Méthode du jeu Phaser : update
     * Sert à mettre à jour le jeu
     * contient la condition de fin du jeu ?
     *
     */
    function update() {
        // Au premier block cliqué, la fenetre descend
        
        /*
        game.camera.y += 1;
        scoreText.y = game.camera.y;
        */
        
        // Condition de fin d'arret du jeu
        if (GameModel.pioche <= 0) {
            scoreText.setText("Game Over");
        }
        // Déplacement au curseur pour le débuggage
        if (cursors.up.isDown) {
            game.camera.y -= 4;
        }
        else if (cursors.down.isDown) {
            game.camera.y += 4;
        }
        scoreText.y = game.camera.y;
    }




    /*********************************************************************************************/
    /* Méthodes concernant la vue du jeu */



    /* FONCTION SERVANT A CREER GRAPHIQUEMENT LES BLOCKS */
    /**
     * Méthode de la vue : generateBlocksView
     * Fonction servant à créer graphiquement chaque block
     * Pour chaque Block de l'objet GameModel, un sprite contenant les coordonnées du block est créé
     * un listener est ajouté au clic de chaque sprite qui appelle la fonction clickBlock
     *
     *
     */
    function generateBlocksView() {

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
                } else if (element.type == TYPEBLOCK.TNT) {
                    var sprite = blocks.create(element.location.x, element.location.y, 'tnt_block')
                } else if (element.type == TYPEBLOCK.DYNAMITE) {
                    var sprite = blocks.create(element.location.x, element.location.y, 'dynamite_block')
                } else if (element.type == TYPEBLOCK.BONUS) {
                    var sprite = blocks.create(element.location.x, element.location.y, 'bonus_block')
                } else if (element.type == TYPEBLOCK.COAL) {
                    var sprite = blocks.create(element.location.x, element.location.y, 'coal_block')
                } else if (element.type == TYPEBLOCK.IRON) {
                    var sprite = blocks.create(element.location.x, element.location.y, 'iron_block')
                } else if (element.type == TYPEBLOCK.GOLD) {
                    var sprite = blocks.create(element.location.x, element.location.y, 'gold_block')
                } else if (element.type == TYPEBLOCK.DIAMOND) {
                    var sprite = blocks.create(element.location.x, element.location.y, 'diamond_block')

                }
                
                sprite.name = element.type.name;
                sprite.x = element.location.x;
                sprite.y = element.location.y;
                sprite.input.useHandCursor = true;
            }

        });

        // ajout d'un listener onClick pour chaque sprite
        blocks.onChildInputDown.add(clickBlock, this);
    }

    
    
    /**
     * Méthode de la vue : updateText
     * Sert à mettre à jour le texte du nombre de coup restant
     */
    function updateText(){
        scoreText.setText("Pioche: "+GameModel.pioche);
    }



    /********************************************/
    /* Animation Destruction */


    function destroyBlockView(sprite){
        
        var block = GameModel.getBlock(sprite.x, sprite.y);
        var destroy = destroyAnimation(block, sprite);
        
        
        destroy.onComplete.add(function(){
            if(sprite.img){
                sprite.img.destroy();
            }
            sprite.destroy();
        },this);
    }


    
    
    

    function destroyAnimation(block, sprite){
        
        var resi_init = block.getInitialResistance();
        var resi_actuel = block.getResistance();
        
        
        if(sprite.img){
            sprite.img.destroy();
        }
        
        var begin_frame;
        var cracks = game.add.sprite(sprite.x,sprite.y,'destroy_all');
        
        switch(resi_init){
            case 2 :
                begin_frame = 5;
                break;
                
            case 3 : 
            case 4 : 
                begin_frame = 6;
                break;
                
            default :
                begin_frame = 0;
                break;
        }
        
        
        var destroy = cracks.animations.add('destroy');
        cracks.animations.play('destroy', 20, false, true);
        cracks.animations.currentAnim.setFrame(begin_frame,true);

        return destroy;

    }


    
    
    
    /*********************************************/
    /* Animation Fissurage */
    
    function crackBlockView(sprite){
        
        var block = GameModel.getBlock(sprite.x, sprite.y);
        
        
        var destroy = crackAnimation(block, sprite);
        
        
        
        // quand l'animation est finie
        destroy.onComplete.add(function(){
            if(sprite.img){
                sprite.img.destroy();
            }
            crackImage(block, sprite);
            
        },this);
          
    }
    
    
    // l'image qui restera affiché après la fin de l'animation
    function crackImage(block, sprite){
        
        var resi_init = block.getInitialResistance();
        var resi_actuel = block.getResistance();


        
        switch(resi_init){
            case 2 : 
                sprite.img = game.add.sprite(sprite.x,sprite.y,'destroy_5');
            break;
                
                
            case 3 : 
                if(resi_actuel == 2){
                    sprite.img = game.add.sprite(sprite.x,sprite.y,'destroy_3');
                } else if(resi_actuel == 1){
                    sprite.img = game.add.sprite(sprite.x,sprite.y,'destroy_6');
                }
            break;
                
                
            case 4 :
                if(resi_actuel == 3){
                    sprite.img = game.add.sprite(sprite.x,sprite.y,'destroy_2');
                } else if(resi_actuel == 2){
                    sprite.img = game.add.sprite(sprite.x,sprite.y,'destroy_4');
                } else if(resi_actuel == 1){
                    sprite.img = game.add.sprite(sprite.x,sprite.y,'destroy_6');
                }
            break;
                
            default: 
            break;
        
        }
            
        
            
    }
    
    
    
    // retourne l'animation
    function crackAnimation(block, sprite){
        
        var resi_init = block.getInitialResistance();
        var resi_actuel = block.getResistance();


            
        
        
        var begin_frame;
        
        switch(resi_init){
            case 2 : 
                var cracks = game.add.sprite(sprite.x,sprite.y,'destroy_to_4');
                begin_frame = 0;
            break;
                
                
            case 3 : 
                if(resi_actuel == 2){
                    var cracks = game.add.sprite(sprite.x,sprite.y,'destroy_to_3');
                    begin_frame = 0;
                } else if(resi_actuel == 1){
                    var cracks = game.add.sprite(sprite.x,sprite.y,'destroy_to_6');
                    begin_frame = 4
                }
            break;
                
                
            case 4 :
                if(resi_actuel == 3){
                    var cracks = game.add.sprite(sprite.x,sprite.y,'destroy_to_1');
                    begin_frame = 0;
                } else if(resi_actuel == 2){
                    var cracks = game.add.sprite(sprite.x,sprite.y,'destroy_to_4');
                    begin_frame = 3;
                } else if(resi_actuel == 1){
                    var cracks = game.add.sprite(sprite.x,sprite.y,'destroy_to_6');
                    begin_frame = 5;
                }
            break;
                
            default:
                begin_frame = 0;
                
            break;
        }
        
        var destroy = cracks.animations.add('destroy');
        cracks.animations.play('destroy', 20, false, true);
        cracks.animations.currentAnim.setFrame(begin_frame,true);

            
        
        return destroy;
        
    }
    
    
    
    
    /************************************************************************************/
    /***********************************   CONTROLLER  **********************************/
    /************************************************************************************/
    /* Méthode controller -> quand un évenement est joué / un block est cliqué */


    function clickBlock(sprite) {
        
        // block récupéré correspondant à la position du clic
        var block = GameModel.getBlock(sprite.x, sprite.y);
        
        // variable destroyed à vrai ou faux selon si le block est détruit ou non
        var destroyed = block.hitBlock();

        
        if (destroyed == true) {
            destroyBlockView(sprite);
        } else if (destroyed == false && sprite.name != 'Bedrock') {
            crackBlockView(sprite);
        }
            updateText();
    }




    /**
     * Méthode pas fini
     *
     */
    /*
     function getResistanceState(block){
         var original_resistance = block.getType().resistance;
         console.log(original_resistance);
     }
*/

    





    /************************************************************************************/
    /**************************************   MODEL  ************************************/
    /************************************************************************************/
    /* Modèle physique du jeu */
    /* Classe GameModel */



    /* Notre modèle jeu qui a un attribut liste des blocks et un fonction pour les créer */

    /**
     * OBJECT GameModel
     * - blocks     -> liste de Block
     * - pioche     -> Nb de coup que l'on peut frapper
     *
     */

    var GameModel = {
        blocks: null,
        pioche: PICKER_NB_HIT,



        /**
         * Méhode createBlocks de GameModel
         * Parcourt la taille du jeu de 60 en 60
         * Pour chaque itération, la fonction créé un Block :
         * initialise sa profondeur,
         * tire au sort son type
         */
        createBlocks: function () {

            var array_blocks = [];

            for (var j = START_Y; j < GAME_HEIGHT; j += 60) {
                for (var i = 0; i < GAME_WIDTH; i += 60) {
                    var block = new Block(i, j)
                    block.setRandomType();
                    array_blocks.push(block);
                }
            }
            this.blocks = array_blocks;
        },


        /**
         * Méthode printBlocks de GameModel
         * Appel la méthode printLocation() de chaque block
         */
        printBlocks: function () {
            this.blocks.forEach(function (block) {
                block.printLocation();
            });
        },

        /**
         * Méthode getBlock(x,y) de GameModel
         * Retourne un block en fonction de son x, y
         */
        getBlock: function(x, y){
            var res = null;
            this.blocks.forEach(function (block) {
                if(block.location.x == x && block.location.y == y){
                    res = block;
                }
            });
            return res;
        },
        
        getBlocksByProfondeur: function(prof){
            var res_blocks=[];
            
            this.blocks.forEach(function (block) {
                if(block.profondeur == prof ){
                    res_blocks.push(block);
                }
            });
            
            return res_blocks;
        },
        
        destroyDynamite: function(){
            
        }

    };
    
    


    /*********************************************************************************************/
    /* Class Location */


    /**
     * OBJECT Location
     */
    function Location(x, y) {
        this.x = x;
        this.y = y;
    }


    /*********************************************************************************************/
    /* Class Block et ses méthodes */


    /**
     * OBJECT Block
     * - height     -> 60
     * - width      -> 60
     * - location   -> objet Location(x,y)
     * - profondeur -> entier définissant la profondeur du block en fonction de son ordonnée
     * - resistance -> nombre de coup qu'il faut pour détruire le block
     * - type       -> TYPEBLOCK enumeration pour définir le type du block
     * - destroyed  -> boolean disant si oui ou non le block esr détruit
     */
    function Block(x, y) {
        this.height = 60;
        this.width = 60;
        this.location = new Location(x, y);
        this.profondeur = (y-300)/60;
        this.resistance = null;
        this.type = null;
        this.destroyed = false;
    }

    /**
     * Méthode de Block : setRandomType
     * Attribue au block un type random selon les coefficients d'apparition de chaque type
     */
     Block.prototype.setRandomType = function () {
         do {
             var rand = Math.floor((Math.random() * 1000) + 1);
             if (rand >= 1 && rand < 800) {
                 this.type = TYPEBLOCK.DIRT;
             }
             else if (rand >= 800 && rand < 900) {
                 this.type = TYPEBLOCK.STONE;
             }
             else if (rand >= 900 && rand < 910) {
                 this.type = TYPEBLOCK.BEDROCK;
             }
             else if (rand >= 910 && rand < 920) {
                 this.type = TYPEBLOCK.TNT;
             }
             else if (rand >= 920 && rand < 930) {
                 this.type = TYPEBLOCK.DYNAMITE;
             }
             else if (rand >= 930 && rand < 940) {
                 this.type = TYPEBLOCK.BONUS;
             }
             else if (rand >= 940 && rand < 960) {
                 this.type = TYPEBLOCK.COAL;
             }
             else if (rand >= 960 && rand < 975) {
                 this.type = TYPEBLOCK.IRON;
             }
             else if (rand >= 975 && rand < 990) {
                 this.type = TYPEBLOCK.GOLD;
             }
             else if (rand >= 990 && rand <= 1000) {
                 this.type = TYPEBLOCK.DIAMOND;
             }
         } while (this.location.y == START_Y && this.type != TYPEBLOCK.DIRT)
        // Pour ne pas qu'un block de la première ligne soit autre chose d'un block dirt

        this.setResistance();
     }




    /**
     * Méthode de Block : setResistance
     * Attribue la résistance du block en fonction de son type
     *
     */
    Block.prototype.setResistance = function () {
        switch (this.type) {
        case TYPEBLOCK.DIRT:
            this.resistance = TYPEBLOCK.DIRT.resistance;
            break;
        case TYPEBLOCK.STONE:
            this.resistance = TYPEBLOCK.STONE.resistance;
            break;
        case TYPEBLOCK.BEDROCK:
            this.resistance = TYPEBLOCK.BEDROCK.resistance;
            break;
        case TYPEBLOCK.TNT:
            this.resistance = TYPEBLOCK.TNT.resistance;
            break;
        case TYPEBLOCK.DYNAMITE:
            this.resistance = TYPEBLOCK.DYNAMITE.resistance;
            break;
        case TYPEBLOCK.COAL:
            this.resistance = TYPEBLOCK.COAL.resistance;
            break; 
        case TYPEBLOCK.IRON:
            this.resistance = TYPEBLOCK.IRON.resistance;
            break; 
        case TYPEBLOCK.GOLD:
            this.resistance = TYPEBLOCK.GOLD.resistance;
            break; 
        case TYPEBLOCK.DIAMOND:
            this.resistance = TYPEBLOCK.DIAMOND.resistance;
            break; 
        default:
            this.resistance = 1;
            break;
        }
    }


    /**
     * Méthode de Block : hitBlock
     * Appelé lorsqu'un block a été cliqué
     * Décrémente le nb de coup de la pioche si ce n'est pas de la Bedrock
     * Décrémente la résistance du block
     * Si la résistance tombe à 0, le block est considéré comme détruit et renvoie true, sinon false
     *
     */
    Block.prototype.hitBlock = function(){

        this.printLocation();

        if(this.type == TYPEBLOCK.BONUS){
            GameModel.pioche+= 5;
        }
        else if(this.type != TYPEBLOCK.BEDROCK){
            GameModel.pioche--;
        }

        this.resistance--;
        if(this.resistance == 0){
            this.destroyed = true;
        }

        return this.destroyed;

    }



    /**
     * Méthode de Block : printLocation
     * affiche la position x,y d'un block
     */
    Block.prototype.printLocation = function () {
        console.log("(" + this.location.x + "," + this.location.y + ")");
    }

    
    /**
     * Méthode de Block : getType
     * retourne le type du block
     */
    Block.prototype.getType = function(){
        return this.type;
    }

    Block.prototype.getInitialResistance = function(){
        return this.type.resistance;
    }
    
    //Méthode de Block : TNT
    
    /*Block.prototype.destructionTNTBlock = function(x,y){
        var block = GameModel.getBlock(x,y);
        var destroyBlock = [];
        destroyBlock.push(block);
        destroyBlock.push()
    }*/
    
    
    

    Block.prototype.getResistance = function(){
        return this.resistance;
    }


    /*********************************************************************************************/
    /* Enumération des blocks */


    /**
     * ENUMERATION TYPEBLOCK
     * défini les types de blocs disponibles avec leurs noms et leurs résistances
     */
    var TYPEBLOCK = {

        DIRT: { name: "Dirt", resistance: 1 },
        STONE: { name: "Stone" , resistance: 2 },
        BEDROCK: { name: "Bedrock" , resistance: 9999 },
        TNT: { name: "Tnt" , resistance: 1 },
        DYNAMITE: { name: "Dynamite" , resistance: 1 },
        BONUS: { name: "Bonus" , resistance: 1 },
        COAL: { name: "Coal" , resistance: 1 },
        IRON: { name: "Iron" , resistance: 2 },
        GOLD: { name: "Gold" , resistance: 3 },
        DIAMOND: { name: "Diamond" , resistance: 4 }

    };
    /* impossibilité de changer les énumérations */
    Object.freeze(TYPEBLOCK);


});
