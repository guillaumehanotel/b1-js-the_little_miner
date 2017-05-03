$(document).ready(function () {


    const START_Y = 360;
    const GAME_WIDTH = 420;
    const GAME_HEIGHT = 1320;
    const FRAME_HEIGHT = 650;

    /* const RESISTANCE de chaque type */

    /* const proportions d'apparitions des blocks */



    var game = new Phaser.Game(GAME_WIDTH, FRAME_HEIGHT, Phaser.AUTO, '', {
        preload: preload,
        create: create,
        update: update
    });


    /*********************************************************************************************/
    /* Méthodes de préloadage des images du jeu */
    

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

        game.load.spritesheet('destroy_1_5', 'assets/img/destroy_stage_1_to_5.png', 60, 60, 5);
        game.load.spritesheet('destroy_6_9', 'assets/img/destroy_stage_6_to_9.png', 60, 60, 4);

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
            fill: '#000'
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
        game.camera.y += 1;
        scoreText.y = game.camera.y;
        

        // Condition de fin d'arret du jeu
        if(GameModel.pioche == 0){
            //destroy
        }


        // Déplacement au curseur pour le débuggage
        if (cursors.up.isDown){
             game.camera.y -= 4;
        } else if (cursors.down.isDown) {
            game.camera.y += 4;
        }

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
        var destroy = crackAnimation(sprite,9);

        destroy.onComplete.add(function(){
                sprite.destroy();
            },this);
    }



    function crackAnimation(sprite, state){

        var cracks = game.add.sprite(sprite.x,sprite.y,'destroy_all');
        var destroy = cracks.animations.add('destroy');
        cracks.animations.play('destroy', 30, false, true);

        return destroy;

    }



    /**
     * Méthode de la vue : updateText
     * Sert à mettre à jour le texte du nombre de coup restant
     */
    function updateText(){
        scoreText.setText("Pioche: "+GameModel.pioche);
    }






    /************************************************************************************/
    /***********************************   CONTROLLER  **********************************/
    /************************************************************************************/
    /* Méthode controller -> quand un évenement est joué / un block est cliqué */
    
    
    function clickBlock(sprite){

        // block récupéré correspondant à la position du clic
        var block = GameModel.getBlock(sprite.x,sprite.y);
        // variable destroyed à vrai ou faux selon si le block est détruit ou non
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





    /**
     * Méthode pas fini
     *
     */
     function getResistanceState(block){
         var original_resistance = block.getType().name;
         console.log(original_resistance);
     }







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
        pioche: 35,



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
             var rand = Math.floor((Math.random() * 100) + 1);
             if (rand >= 1 && rand < 75) {
                 this.type = TYPEBLOCK.DIRT;
             }
             else if (rand >= 75 && rand < 86) {
                 this.type = TYPEBLOCK.STONE;
             }
             else if (rand >= 86 && rand < 91) {
                 this.type = TYPEBLOCK.BEDROCK;
             }
             else if (rand >= 91 && rand < 94) {
                 this.type = TYPEBLOCK.TNT;
             }
             else if (rand >= 94 && rand < 97) {
                 this.type = TYPEBLOCK.DYNAMITE;
             }
             else if (rand >= 97 && rand <= 100) {
                 this.type = TYPEBLOCK.BONUS;
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
        case TYPEBLOCK.BONUS:
            this.resistance = TYPEBLOCK.BONUS.resistance;
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

    
    
    //Méthode de Block : TNT
    
    Block.prototype.destructionTNTBlock = function(x,y){
        var block = GameModel.getBlock(x,y);
        var destroyBlock = [];
        destroyBlock.push(block);
        destroyBlock.push()
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
        BONUS: { name: "Bonus" , resistance: 1 }
    };
    /* impossibilité de changer les énumérations */
    Object.freeze(TYPEBLOCK);


});
