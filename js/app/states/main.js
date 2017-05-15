
var theGame = function(game){
    sprites = [];
    miner = 0;
}



theGame.prototype = {
    
    create: function(){
        
        //this.game.physics.startSystem(Phaser.Physics.ARCADE);
        
        
        GameModel.reset();
        GameModel.createBlocks();
        this.loadGameView();
        
        
        
        
        
        this.miner = this.game.add.sprite(60,280,'miner');
        /*
        var mine = this.miner.animations.add('mine');
        
        this.miner.animations.play('mine', 15, true);
        */
        
        this.game.physics.arcade.enable(this.miner);
        
     
        
        this.miner.body.bounce.y = 0.1;
        this.miner.body.gravity.y = 300;
        this.miner.body.collideWorldBounds = true;

        
        
        
        
        
        
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
            this.game.camera.y -= 6;
        }
        else if (cursors.down.isDown) {
            this.game.camera.y += 6;
        }
        scoreText.y = this.game.camera.y;
        
        
        
        this.game.physics.arcade.collide(this.miner, this.sprites);
        
        
        
    },
    
    

    
    
     /*********************************************************************************************/
    /* Méthodes de la création grahique du jeu */
    
    
    /**
     * Méthode de la vue : loadGameView
     * Sert à initialiser le jeu en y ajoutant les sprites et affichage de base
     *
     */
    loadGameView: function(){
        
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        // On ajoute le sprite du ciel à partir de la position (0,0)
        this.game.add.sprite(0, 0, 'sky');
        // On ajoute le sprite du sol à partir de la position (0,360)
        var ground = this.game.add.sprite(0, START_Y, 'ground');
        // On défini les limites du jeu s'arretant à 1280px de profondeur
        this.game.world.setBounds(0, 0, 0, GAME_HEIGHT);
        //game.time.slowMotion = 60.0;

        cursors = this.game.input.keyboard.createCursorKeys();
        
        
        

        // Création graphique des blocks
        // retourne tableau de sprites
        this.generateBlocksView(this.game, this);
        

        scoreText = this.game.add.text(16, 16, 'Pioche: ' + GameModel.pioche, {
            fontSize: '23px',
            fill: '#fff'
        });
        

    },
    
    
    
    getSprite : function(x,y){
        var res = null;
        
        sprites.forEach(function(sprite) {
           if(sprite.x == x && sprite.y == y){
               res = sprite;
           }
        });
        
        return res;
    },
    
    
    /* Méthode pour montrer le block pris en paramètre */
    showBlock : function(sprite){
        if(typeof sprite.graph !== 'undefined'){
            sprite.graph.destroy();
        } 
    },
    
    
    
    
    
    showBlocks : function(sprite, self){
        
        var block = GameModel.getBlock(sprite.x, sprite.y);
        
        var aroundBlocks = block.getAroundBlocks(); 
        
        aroundBlocks.forEach(function(element) {
            var sprite = self.getSprite(element.getX(), element.getY());
            self.showBlock(sprite);
        });
    },
    
   
    
    
        
    /* Méthode pour cacher le block pris en paramètre */
    hideBlock : function(block, graphics, sprite){
        
        if (block.isBreakable() == false) {
            var rect = graphics.drawRect(block.location.x, block.location.y, 60, 60);
            sprite.graph = rect;
        }
    },
    
    
    
    
    
    
        /* FONCTION SERVANT A CREER GRAPHIQUEMENT LES BLOCKS */
    /**
     * Méthode de la vue : generateBlocksView
     * Fonction servant à créer graphiquement chaque block
     * Pour chaque Block de l'objet GameModel, un sprite contenant les coordonnées du block est créé
     * un listener est ajouté au clic de chaque sprite qui appelle la fonction clickBlock
     *
     *
     */
    generateBlocksView : function(game, self) {
        
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
                sprite.body.immovable = true;
                

                self.hideBlock(element, graphics, sprite);
    
                game.world.bringToTop(graphics);
                
                sprites.push(sprite);

                
            }

        });

        // ajout d'un listener onClick pour chaque sprite
        blocks.onChildInputDown.add(self.clickBlock, this);
    },
    

    /**
     * Méthode de la vue : updateText
     * Sert à mettre à jour le texte du nombre de coup restant
     */
    updateText : function(){
        scoreText.setText("Pioche: "+GameModel.pioche);
    },


    
    
    /********************************************/
    /* Animation Destruction */


    destroyBlockView : function(sprite){
        
        var block = GameModel.getBlock(sprite.x, sprite.y);
        var destroy = this.destroyAnimation(block, sprite);
        
        
        destroy.onComplete.add(function(){
            if(sprite.img){
                sprite.img.destroy();
            }
            sprite.destroy();
        },this);
    },


    
    
    

    destroyAnimation : function(block, sprite){
        
        var resi_init = block.getInitialResistance();
        var resi_actuel = block.getResistance();
        
        
        if(sprite.img){
            sprite.img.destroy();
        }
        
        var begin_frame;
        var cracks = this.game.add.sprite(sprite.x,sprite.y,'destroy_all');
        
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

    },


    
    
    
    /*********************************************/
    /* Animation Fissurage */
    
    crackBlockView : function(sprite){
        
        var block = GameModel.getBlock(sprite.x, sprite.y);
        var destroy = this.crackAnimation(block, sprite);
        
        // quand l'animation est finie
        destroy.onComplete.add(function(){
            if(sprite.img){
                sprite.img.destroy();
            }
            this.crackImage(block, sprite);
            
        },this);   
    },
    
    
    
    // l'image qui restera affiché après la fin de l'animation
    crackImage : function(block, sprite){
        
        var resi_init = block.getInitialResistance();
        var resi_actuel = block.getResistance();
        
        switch(resi_init){
            case 2 : 
                sprite.img = this.game.add.sprite(sprite.x,sprite.y,'destroy_5');
            break;
                   
            case 3 : 
                if(resi_actuel == 2){
                    sprite.img = this.game.add.sprite(sprite.x,sprite.y,'destroy_3');
                } else if(resi_actuel == 1){
                    sprite.img = this.game.add.sprite(sprite.x,sprite.y,'destroy_6');
                }
            break;
                
            case 4 :
                if(resi_actuel == 3){
                    sprite.img = this.game.add.sprite(sprite.x,sprite.y,'destroy_2');
                } else if(resi_actuel == 2){
                    sprite.img = this.game.add.sprite(sprite.x,sprite.y,'destroy_4');
                } else if(resi_actuel == 1){
                    sprite.img = this.game.add.sprite(sprite.x,sprite.y,'destroy_6');
                }
            break;
                
            default: 
            break;
        
        }
    },
    
    
    
    // retourne l'animation
    crackAnimation : function(block, sprite){
        
        var resi_init = block.getInitialResistance();
        var resi_actuel = block.getResistance();
        
        var begin_frame;
        
        switch(resi_init){
            case 2 : 
                var cracks = this.game.add.sprite(sprite.x,sprite.y,'destroy_to_4');
                begin_frame = 0;
            break;
                
            case 3 : 
                if(resi_actuel == 2){
                    var cracks = this.game.add.sprite(sprite.x,sprite.y,'destroy_to_3');
                    begin_frame = 0;
                } else if(resi_actuel == 1){
                    var cracks = this.game.add.sprite(sprite.x,sprite.y,'destroy_to_6');
                    begin_frame = 4
                }
            break;
                
            case 4 :
                if(resi_actuel == 3){
                    var cracks = this.game.add.sprite(sprite.x,sprite.y,'destroy_to_1');
                    begin_frame = 0;
                } else if(resi_actuel == 2){
                    var cracks = this.game.add.sprite(sprite.x,sprite.y,'destroy_to_4');
                    begin_frame = 3;
                } else if(resi_actuel == 1){
                    var cracks = this.game.add.sprite(sprite.x,sprite.y,'destroy_to_6');
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
        
    },
    
        
    
    
    /************************************************************************************/
    /***********************************   CONTROLLER  **********************************/
    /************************************************************************************/
    /* Méthode controller -> quand un évenement est joué / un block est cliqué */


    clickBlock : function(sprite) {
        
        // block récupéré correspondant à la position du clic
        var block = GameModel.getBlock(sprite.x, sprite.y);
        
        block.printLocation();
        
        // si le block est cassable
        if(block.isBreakable()){
            
            // variable destroyed à vrai ou faux selon si le block est détruit ou non
            var destroyed = block.hitBlock();
            

            if (destroyed == true) {
                this.destroyBlockView(sprite);
                this.showBlocks(sprite, this);
            } else if (destroyed == false && sprite.name != 'Bedrock') {
                this.crackBlockView(sprite);
            }
                this.updateText();
        }
        
    }
    
}

   







    

    



