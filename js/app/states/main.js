
var theGame = function(game){
    sprites = [];

}



theGame.prototype = {
    
    create: function(){
        
        GameModel.reset();
        GameModel.createBlocks();
        this.loadGameView();
    
    }, 
    
    
    
    
    update: function(){
        
        // curseur
        pioche.position.set(this.game.input.mousePointer.worldX-15, this.game.input.mousePointer.worldY-15);

        this.game.world.bringToTop(pioche);
         
        
        if(MODE_LIBRE){
            // Déplacement au curseur pour le débuggage
            if (cursors.up.isDown) {
                this.game.camera.y -= 4;
            } else if (cursors.down.isDown) {
                this.game.camera.y += 4;
            }
            
        } else {
            
            // Au premier block cliqué, la fenetre descend    
            if(GameModel.pioche != PICKER_NB_HIT){
                this.game.camera.y += 1;
                scoreText.y = this.game.camera.y;
                profText.y = this.game.camera.y; 
            }
              
        }
        

        if(typeof tap_y !== 'undefined')
            var res_y = tap_y;
        
        // Condition de fin d'arret du jeu
        if (GameModel.pioche <= 0 || res_y < this.game.camera.y-140) {

            this.game.state.start("GameOver");
        }

        scoreText.y = this.game.camera.y;
        profText.y = this.game.camera.y;
    },
    
    

    
    
     /*********************************************************************************************/
    /* Méthodes de la création grahique du jeu */
    
    
    /**
     * Animation de la pioche
     */
    movePickaxe : function(){
        
        var pioche_anim = this.game.add.sprite(this.game.input.mousePointer.worldX, this.game.input.mousePointer.worldY, 'pioche_animation');
        var hit = pioche_anim.animations.add('hit');
        pioche_anim.animations.play('hit', 13, false);
        
        tap_y = this.game.input.mousePointer.worldY;
        
        pioche.visible = false;
        
        hit.onComplete.add(function(){
            pioche_anim.destroy();
            pioche.visible = true;
        });

    },
    
    
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
        this.game.world.sendToBack(ground);
        // On défini les limites du jeu s'arretant à 1280px de profondeur
        this.game.world.setBounds(0, 0, 0, GAME_HEIGHT);
        //game.time.slowMotion = 60.0;

        cursors = this.game.input.keyboard.createCursorKeys();
        
        pioche = this.game.add.sprite(this.game.input.mousePointer.worldX, this.game.input.mousePointer.worldY, 'pioche');
        this.game.world.bringToTop(pioche);


        // Création graphique des blocks
        // retourne tableau de sprites
        this.generateBlocksView(this.game, this);
        
        scoreText = this.game.add.text(16, 16, 'Pioche: ' + GameModel.pioche, {
            fontSize: '23px',
            fill: '#fff'
        });
        
        profText = this.game.add.text(350, 450,GameModel.getProfondeur()+" m", {
            fontSize: '23px',
            fill: '#fff'
        });

    },
    
    
    /**
     * Retourne le sprite d'une position (x,y)
     */
    getSprite : function(x,y){
        var res = null;
        
        sprites.forEach(function(sprite) {
           if(sprite.x == x && sprite.y == y){
               res = sprite;
           }
        });
        
        return res;
    },
    
    
    /**
     * Retourne un tableau de sprite correspondant au tableau de blocks en paramètres
     */
    getSprites : function(array, self){
        
        var array_res = [];
        
        array.forEach(function(block){
            var sprite = self.getSprite(block.getX(), block.getY());
            array_res.push(sprite);
        });
        
        return array_res;
    },
    
    
    /** 
     * Méthode pour enlever le cache noir du block pris en paramètre 
     */
    showBlock : function(sprite){
        if(typeof sprite.graph !== 'undefined'){
            sprite.graph.destroy();
        } 
    },
    
    
    
    /**
     * Méthode pour enlever tous les caches noirs du sprite en paramètre
     */
    showBlocks : function(sprite, self){
        
        var block = GameModel.getBlock(sprite.x, sprite.y);
        
        if(sprite.name == "Tnt"){

            // prend les blocks de la zone + ceux autour pour les rendre visible
            var ATNTBlocks = block.getAroundTNTBlocks();
            var TNTBlocks =  block.getTNTBlocks();
            var aroundBlocks = ATNTBlocks.concat(TNTBlocks);
          
        } else if(sprite.name == "Dynamite"){
            
            var DynamiteBlocks = block.getDynamiteBlocks();
            var ADynamiteBlocks = block.getAroundDynamiteBlocks();
            var aroundBlocks = ADynamiteBlocks.concat(DynamiteBlocks);
            
        } else {
            var aroundBlocks = block.getAroundBlocks(); 
        }
        
        aroundBlocks.forEach(function(element) {
            var sprite = self.getSprite(element.getX(), element.getY());
            self.showBlock(sprite);
        });
    },
    
   
    /**
     * Méthode pour mettre un cache noir devant le block pris en paramètre 
     */
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
                sprite.input.useHandCursor = false;
                

                if(HIDEBLOCK){
                    self.hideBlock(element, graphics, sprite);
                }
    
                //game.world.bringToTop(graphics);
                sprites.push(sprite);
            }

        });

        // ajout d'un listener onClick pour chaque sprite
        blocks.onChildInputDown.add(self.clickBlock, this);
        blocks.onChildInputDown.add(self.movePickaxe, this);
    },
    

    /**
     * Méthode de la vue : updateText
     * Sert à mettre à jour le texte du nombre de coup restant
     */
    updateText : function(){
        scoreText.setText("Pioche: "+GameModel.pioche);
        profText.setText(GameModel.getProfondeur()+" m");
    },


    
    /********************************************/
    /* Animation Destruction */


    /**
     * Méthode destroyBlockView
     * Sert à récupérer le block cliqué pour appeler  
     * la méthode destroyAnimation, puis détruire le sprite
     */
    destroyBlockView : function(sprite){
        
        var block = GameModel.getBlock(sprite.x, sprite.y);
        
        var destroy = this.destroyAnimation(block, sprite);
        
        destroy.onComplete.add(function () {
            
            if (sprite.img) {
                sprite.img.destroy();
            }
            sprite.destroy();
        }, this);
    },

    
    /**
     * Méthode destroyAnimation
     * Prend en paramètre un block et son sprite pour faire jouer l'animation 
     * de fissurage complète  
     */
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
        cracks.animations.play('destroy', 15, false, true);
        cracks.animations.currentAnim.setFrame(begin_frame,true);

        return destroy;

    },


    
    /*********************************************/
    /* Animation Fissurage */
    
    /**
     * Méthode crackBlockView
     * Sert à récupérer le block cliqué pour appeler successivement 
     * les méthode crackAnimation, puis crackImage
     */
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
    
    
    

    /**
     * Méthode crackImage
     * méthode appelé après la fin de l'animation de fissurage, pour afficher la bonne  *image de fissurage
     *
     */
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
    
    
    

    /**
     * Méthode crackAnimation
     * Prend en paramètre le bloc et le sprite associé
     * Va jouer la bonne animation de fissurage en fonction de la résistance de base et  * de la résistance actuelle
     * Retourne l'animation
     */
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
        cracks.animations.play('destroy', 15, false, true);
        cracks.animations.currentAnim.setFrame(begin_frame,true);

        return destroy;
        
    },
    
        
    
    /**
     * TNT Animation
     */
    
    TNTAnimation : function(sprite, self) {
    
        // on récupère le block de TNt
        var TNT_Block = GameModel.getBlock(sprite.x, sprite.y);

        
        var music = this.game.add.audio('BigExplosion');
        music.play();
        music.volume -= 0.5;
        
        // ANIMATION 
        
        var explosion = this.game.add.sprite(sprite.x-150, sprite.y-150, 'explosion_TNT');
        var boom = explosion.animations.add('boom');
        explosion.animations.play('boom', 15, false);
        
        var array_Blocks = TNT_Block.getTNTBlocks();
        
        //SPRITE
        
        // on efface le sprite de la TNT
        sprite.destroy();
        
        // on découvre les sprites alentours
        this.showBlocks(sprite, self);
        
        // sprite des bloks dans la zone
        var sprite_array_TNT = this.getSprites(array_Blocks, this);
    
        GameModel.pioche--;
        
        // on parcourt tous les sprites des blocks touchés
        sprite_array_TNT.forEach(function (sprite_touch) {
            
            // on récupère leurs block
            var block = GameModel.getBlock(sprite_touch.x, sprite_touch.y);
              
            if(!block.destroyed)
                self.BlockAnimation(sprite_touch, block, self, true);
            
            // détruire les images de fissures et effacer les blocks si pas bedrock
            if (sprite_touch.img && sprite_touch.name != 'Bedrock') 
                sprite_touch.img.destroy();
            //sprite_touch.destroy();   
            
        });

        // appeler clickblock pour chaque sprite de la TNT
    },
    
    

    DynamiteAnimation : function(sprite, self){
        
        // le block de dynamite
        var Dynamite_Block = GameModel.getBlock(sprite.x, sprite.y);
        
        // on détruit son sprite
        sprite.destroy();
        
        // on récupère les blocks touchés
        var array_Blocks = Dynamite_Block.getDynamiteBlocks();
        
        // on montre les blocks adjacents
        this.showBlocks(sprite, self);
        
        var mygame = this.game;
        
        GameModel.pioche--;
        
        // on récupère les sprites des blocks touchés
        var sprite_array_Dynamite = this.getSprites(array_Blocks, this);
        
        sprite_array_Dynamite.forEach(function(sprite_touch){
            
            var music = mygame.add.audio('BigExplosion');
            music.play();
            music.volume -= 0.5;

            var explosion = mygame.add.sprite(sprite_touch.x-30, sprite_touch.y-30, 'explosion_Dynamite');
            var boom = explosion.animations.add('boom');
            explosion.animations.play('boom', 50, false);
        
            
            // on récupère leurs block
            var block = GameModel.getBlock(sprite_touch.x, sprite_touch.y);
            
            if(!block.destroyed)
                self.BlockAnimation(sprite_touch, block, self, true);
        
            // détruire les images de fissures et effacer les blocks si pas bedrock
            if (sprite_touch.img && sprite_touch.name != 'Bedrock') 
                sprite_touch.img.destroy();
   
        });
        

    },
    
    BlockAnimation : function(sprite, block, self, isCollateral){
        
        // si les blocks touchés ne sont pas de la TNT ou dynamite
        if(block.getType() != TYPEBLOCK.TNT || block.getType() != TYPEBLOCK.DYNAMITE)
            // variable destroyed à vrai ou faux selon si le block est détruit ou non
            var destroyed = block.hitBlock(isCollateral);
                     
        // si le block est détruit
        if (destroyed == true) {
                    
            
            var music = this.game.add.audio('BreakStone');
            music.play();
            music.volume -= 0.8;
            
            
            // on affiche l'animation de destruction
            self.destroyBlockView(sprite);
            // on enlève de cache noir des blocks alentours
            self.showBlocks(sprite, this);

        // si il n'est pas détruit et que ce n'est pas de la bedrock
        } else if (destroyed == false && sprite.name != 'Bedrock') {
            
            
            var music = this.game.add.audio('HitStone');
            music.play();
            music.volume -= 0.8;
            
            // on affiche juste l'animaion de fissurage
            self.crackBlockView(sprite);
        }
           
    },
    
        
    

    /************************************************/
    /******************   CONTROLLER  ***************/
    /************************************************/
    /* Méthode controller -> quand un évenement est joué / un block est cliqué */


    clickBlock : function(sprite) {

        // block récupéré correspondant à la position du clic
        var block = GameModel.getBlock(sprite.x, sprite.y);
        
        // si le block est cassable
        if (block.isBreakable()) {
            
            // animation TNT 
            if (sprite.name == "Tnt"){
                this.TNTAnimation(sprite, this);
    
            // animation Dynamite    
            } else if(sprite.name == "Dynamite"){
                this.DynamiteAnimation(sprite, this);      
                
            // animation normal
            } else {
                this.BlockAnimation(sprite, block, this, false);
            }
            
  
            this.updateText();
        }
    }
}
   







    

    



