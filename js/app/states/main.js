
var theGame = function(game){
    
}



theGame.prototype = {
    
    create: function(){
        
        GameModel.createBlocks();
        this.loadGameView();
        
    }, 
    update: function(){
        
        // Au premier block cliqué, la fenetre descend
        
        /*
        game.camera.y += 1;
        scoreText.y = game.camera.y;
        */
        
        // Condition de fin d'arret du jeu
        if (GameModel.pioche <= 0) {
            //scoreText.setText("Game Over");
            this.game.state.start("GameOver");
        }
        
        // Déplacement au curseur pour le débuggage
        if (cursors.up.isDown) {
            game.camera.y -= 4;
        }
        else if (cursors.down.isDown) {
            game.camera.y += 4;
        }
        scoreText.y = game.camera.y;
    },
    
    
    loadGameView: function(){
        
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        // On ajoute le sprite du ciel à partir de la position (0,0)
        this.game.add.sprite(0, 0, 'sky');
        // On ajoute le sprite du sol à partir de la position (0,360)
        this.game.add.sprite(0, START_Y, 'ground');
        // On défini les limites du jeu s'arretant à 1280px de profondeur
        this.game.world.setBounds(0, 0, 0, GAME_HEIGHT);
        //game.time.slowMotion = 60.0;

        cursors = this.game.input.keyboard.createCursorKeys();
        
        

        // Création graphique des blocks
        // retourne tableau de sprites
        generateBlocksView();
        

        scoreText = this.game.add.text(16, 16, 'Pioche: ' + GameModel.pioche, {
            fontSize: '23px',
            fill: '#fff'
        });
        

    }
    
}

    /*********************************************************************************************/
    /* Méthodes de la création grahique du jeu */


    /**
     * Méthode de la vue : loadGameView
     * Sert à initialiser le jeu en y ajoutant les sprites et affichage de base
     *
     */
    /*function loadGameView() {


    }
*/




  /*********************************************************************************************/
    /* Méthodes concernant la vue du jeu */

    
    function getSprite(x,y){
        
        var res = null;
        
        game.sprites.forEach(function(sprite) {
           if(sprite.x == x && sprite.y == y){
               res = sprite;
           }
        });
        
        return res;
    }
    
    
    

    /* Méthode pour montrer le block pris en paramètre */
    function showBlock(sprite){
        if(typeof sprite.graph !== 'undefined'){
            sprite.graph.destroy();
        } 
    }
    
    
    
    function showBlocks(sprite){
        
        var block = GameModel.getBlock(sprite.x, sprite.y);
        
        var aroundBlocks = block.getAroundBlocks(); 
        
        aroundBlocks.forEach(function(element) {
            var sprite = getSprite(element.getX(), element.getY());
            showBlock(sprite);
        });
        
    }
    
    
    
    
    
    
    
    /* Méthode pour cacher le block pris en paramètre */
    function hideBlock(block, graphics, sprite){
        
        if (block.isBreakable() == false) {
            var rect = graphics.drawRect(block.location.x, block.location.y, 60, 60);
            sprite.graph = rect;
        }
    }
    
    
    
    

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
        
        //var sprites = [];
        


        blocks = game.add.group();

        blocks.enableBody = true;
        blocks.inputEnableChildren = true;

        // on récupère dans un tableau, l'attribut blocks de l'objet GameModel
        var arrayBlocks = GameModel.blocks;

        arrayBlocks.forEach(function (element) {
            
            
            var graphics = game.add.graphics(0, 0);
            graphics.beginFill(0x000000, 1); 

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
                

                hideBlock(element, graphics, sprite);
    
                game.world.bringToTop(graphics);
                
                game.sprites.push(sprite);

                
            }

        });

        // ajout d'un listener onClick pour chaque sprite
        blocks.onChildInputDown.add(clickBlock, this);
    }

    
            /*
        
        graphics.beginFill(0x000000, 1); 
        graphics.drawRect(200, 200, 60, 60);
    */
    
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
        
        block.printLocation();
        
        // si le block est cassable
        if(block.isBreakable()){
            
            // variable destroyed à vrai ou faux selon si le block est détruit ou non
            var destroyed = block.hitBlock();
            

            if (destroyed == true) {
                destroyBlockView(sprite);
                 showBlocks(sprite);
            } else if (destroyed == false && sprite.name != 'Bedrock') {
                crackBlockView(sprite);
            }
                updateText();
        }
        
    }



