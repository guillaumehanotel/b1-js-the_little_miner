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
     * - breakable  -> boolean disant si il est cassable ou non
     */
    function Block(x, y) {
        this.height = 60;
        this.width = 60;
        this.location = new Location(x, y);
        this.profondeur = (y-300)/60;
        this.resistance = null;
        this.type = null;
        this.destroyed = false;
        this.breakable = false;
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
    Block.prototype.hitBlock = function(isCollateral){

        
        if(this.type == TYPEBLOCK.BONUS){
            GameModel.pioche+= 5;
        } else if(this.type != TYPEBLOCK.BEDROCK){
            if(!isCollateral)
                GameModel.pioche--;
        }

        // on décrémente la résistance du block
        this.resistance--;
        
        // si c'est de la TNT ou de la dynamite
        if(this.type == TYPEBLOCK.TNT || this.type == TYPEBLOCK.DYNAMITE){

            this.destroyed = true;
            this.propagateBreakable();
            
        // si c'est un block normal    
        } else {
            if(this.resistance == 0){
                
                GameModel.incrementOreScore(this);
                this.destroyed = true;
                // met breakable à true à toutes les cases autour du/des block(s) détruit(s)
                this.propagateBreakable();
            }     
        } 
        return this.destroyed;
    }
    
    /**
     * Méthode propagateBreakable
     * Récupère tous les blocks autour du block this, et leurs met l'état
     * breakable(visible)
     */
    Block.prototype.propagateBreakable = function(){
        
        if(this.type == TYPEBLOCK.TNT){
            var array = this.getAroundTNTBlocks();
        } else if(this.type == TYPEBLOCK.DYNAMITE){
            var array = this.getAroundDynamiteBlocks();
        } else {
            var array = this.getAroundBlocks();
        }
        
        array.forEach(function (element) {
            element.setBreakable(true);
        });
        
    }

    /**
     * Méthode getAroundBlocks
     * Retourne un tableau de tous les blocks autour du block this
     */
    Block.prototype.getAroundBlocks = function(){
        
        var arrayBlocks = [];
        
        if(typeof this.getBottomBlock() !== 'undefined'){
            arrayBlocks.push(this.getBottomBlock());
        }
        
        if(typeof this.getTopBlock() !== 'undefined'){
            arrayBlocks.push(this.getTopBlock());
        }
        
        if(typeof this.getLeftBlock() !== 'undefined'){
            arrayBlocks.push(this.getLeftBlock());
        }
        
        if(typeof this.getRightBlock() !== 'undefined'){
            arrayBlocks.push(this.getRightBlock());
        }
        
        return arrayBlocks;
        
    }

    /**
     * Méthode getAroundDynamiteBlocks
     * Retourne un tableau de tous les blocks autour des blocks touchés par la dynamite
     */
    Block.prototype.getAroundDynamiteBlocks = function(){
        
        var Blocks = this.getDynamiteBlocks();
        
        var aroundBlocks = [];
        
        Blocks.forEach(function(block){
           
            if(typeof block.getTopBlock() !== 'undefined'){
                aroundBlocks.push(block.getTopBlock());
            }
            
            if(typeof block.getBottomBlock() !== 'undefined'){
                aroundBlocks.push(block.getBottomBlock());
            }         
  
        });
        
        return aroundBlocks;
        
    }
    
    /**
     * Méthode getAroundBlocks
     * Retourne un tableau de tous les blocks autour des blocks touchés par la TNT
     */
    Block.prototype.getAroundTNTBlocks = function(){
        
        var Blocks = [];
        
        // block du haut y-3
        var block_1 = this.getTopBlock(3);
        if(typeof block_1 !== 'undefined')
            Blocks.push(block_1);
        
        // block y-2 x+1
        var block_2 = this.getTopRightBlock();
        if(typeof block_2 !== 'undefined'){
            var block_2a = block_2.getTopBlock();
            if(typeof block_2a !== 'undefined')
                Blocks.push(block_2a);
        }
        
        // block y-1 x+2
        var block_3 = this.getTopRightBlock();
        if(typeof block_3 !== 'undefined'){
            var block_3a = block_3.getRightBlock();
            if(typeof block_3a !== 'undefined')
                Blocks.push(block_3a);
        }
        
        
        // block x+3
        var block_4 = this.getRightBlock(3);
        if(typeof block_4 !== 'undefined')
            Blocks.push(block_4);       
        
        
        // block y+1 x+2
        var block_5 = this.getBottomRightBlock();
        if(typeof block_5 !== 'undefined'){
            var block_5a = block_5.getRightBlock();
            if(typeof block_5a !== 'undefined')
                Blocks.push(block_5a); 
        }
        
        // block y+2 x+1
        var block_6 = this.getBottomRightBlock();
        if(typeof block_6 !== 'undefined'){
            var block_6a = block_6.getBottomBlock();
            if(typeof block_6a !== 'undefined')
                Blocks.push(block_6a);     
        }
         
        // block y+3
        var block_7 = this.getBottomBlock(3);
        if(typeof block_7 !== 'undefined')
            Blocks.push(block_7);  
        
        // block y+2 x-1
        var block_8 = this.getBottomLeftBlock();
        if(typeof block_8 !== 'undefined'){
            var block_8a = block_8.getBottomBlock();
            if(typeof block_8a !== 'undefined')
                Blocks.push(block_8a);     
        }
        
        // block y+1 x-2
        var block_9 = this.getBottomLeftBlock();
        if(typeof block_9 !== 'undefined'){
            var block_9a = block_9.getLeftBlock();
            if(typeof block_9a !== 'undefined')
                Blocks.push(block_9a);   
        }
        
        // block  x-3
        var block_10 = this.getLeftBlock(3);
        if(typeof block_10 !== 'undefined')
            Blocks.push(block_10);   
          
        // block  x-2 y-1
        var block_11 = this.getTopLeftBlock();
        if(typeof block_11 !== 'undefined'){
            var block_11a = block_11.getLeftBlock();
            if(typeof block_11a !== 'undefined')
                Blocks.push(block_11a); 
        }
        
        // block  x-1 y-2
        var block_12 = this.getTopLeftBlock();
        if(typeof block_12 !== 'undefined'){
            var block_12a = block_12.getTopBlock();
            if(typeof block_12a !== 'undefined')
                Blocks.push(block_12a);  
        }
        
        return Blocks;
        
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

    Block.prototype.getProfondeur = function(){
        return this.profondeur;
    }
    Block.prototype.getInitialResistance = function(){
        return this.type.resistance;
    }

    Block.prototype.getResistance = function(){
        return this.resistance;
    }
    
    Block.prototype.isBreakable = function(){
        return this.breakable;
    }
    
    Block.prototype.setBreakable = function(bool){
        this.breakable = bool;
    }
    
    Block.prototype.getX = function(){
        return this.location.x;
    }
    
    Block.prototype.getY = function(){
        return this.location.y;
    }
    
    /**
     * Retourne la liste des blocks touchés par la dynamite
     */
    Block.prototype.getDynamiteBlocks = function(){
     
        return GameModel.getBlocksByProfondeur(this.getProfondeur());

    }
    
    /**
     * Retourne la liste des blocks touchés par la TNT
     */
    Block.prototype.getTNTBlocks =  function(){
        
        
        var Blocks = [];

        // block du haut y-1
        var block_top_1 = this.getTopBlock();
        if(typeof block_top_1 !== 'undefined'){
            Blocks.push(block_top_1);
            // block du haut y-2
            var block_top_2 = block_top_1.getTopBlock();
            if(typeof block_top_2 !== 'undefined')
                Blocks.push(block_top_2);
        }
        
        // block de droite x+1
        var block_right_1 = this.getRightBlock();
        if(typeof block_right_1 !== 'undefined'){
            Blocks.push(block_right_1);
            // block de droite x+2
            var block_right_2 = block_right_1.getRightBlock();
            if(typeof block_right_2 !== 'undefined')
                Blocks.push(block_right_2);
        }
        
        // block de gauche x-1
        var block_left_1 = this.getLeftBlock();
        if(typeof block_left_1 !== 'undefined'){
            Blocks.push(block_left_1);
            // block de gauche x-2
            var block_left_2 = block_left_1.getLeftBlock();
            if(typeof block_left_2 !== 'undefined')
                Blocks.push(block_left_2);  
        }
        
        // block du bas y+1
        var block_bottom_1 = this.getBottomBlock();
        if(typeof block_bottom_1 !== 'undefined'){
            Blocks.push(block_bottom_1);
            // block du bas y+2
            var block_bottom_2 = block_bottom_1.getBottomBlock();
            if(typeof block_bottom_2 !== 'undefined')
                Blocks.push(block_bottom_2);    
        }
        
        // block haut gauche x-1 y-1
        var block_top_left = this.getTopLeftBlock();
        if(typeof block_top_left !== 'undefined')
            Blocks.push(block_top_left);
        
        // block haut droite x+1 y-1
        var block_top_right = this.getTopRightBlock();
        if(typeof block_top_right !== 'undefined')
            Blocks.push(block_top_right);
        
        // block bas droite x+1 y+1
        var block_bottom_right = this.getBottomRightBlock();
        if(typeof block_bottom_right !== 'undefined')
            Blocks.push(block_bottom_right);
        
        // block bas gauche x-1 y+1
        var block_bottom_left = this.getBottomLeftBlock();
        if(typeof block_bottom_left !== 'undefined')
            Blocks.push(block_bottom_left);
        
        
        
        return Blocks;
        
    }
    
    
    Block.prototype.getLeftBlock = function(nb){
        var x = this.getX();
        var y = this.getY();
        if(nb !== 'undefined')
            nb = 1;
        // si la borne inférieur de x n'est pas à 0 (au minimum)
        if(x != 0)
            return GameModel.getBlock(x-(60*nb),y);
    }
    Block.prototype.getRightBlock = function(nb){
        var x = this.getX();
        var y = this.getY();
        if(nb !== 'undefined')
            nb = 1;
        // si la borne supérieur de x n'est pas à 360 (au max) (420)
        if(x != 360)
            return GameModel.getBlock(x+(60*nb),y);
    }
    Block.prototype.getTopBlock = function(nb){
        var x = this.getX();
        var y = this.getY();
        if(nb !== 'undefined')
            nb = 1;
        // si la borne inférieur de y n'est pas au minimum de Y (360)
        if(y != START_Y)
            return GameModel.getBlock(x,y-(60*nb));
    }
    
    Block.prototype.getBottomBlock = function(nb){
        var x = this.getX();
        var y = this.getY();
        if(nb !== 'undefined')
            nb = 1;
        // si la borne supérieur de y n'est pas au max du jeu
        if(y != GAME_HEIGHT-60)
            return GameModel.getBlock(x,y+(60*nb));
    }
    
    
    Block.prototype.getTopLeftBlock = function(){
        var x = this.getX();
        var y = this.getY();
        if(y != START_Y && x != 0){
            return GameModel.getBlock(x-60,y-60);
        }
    }
    Block.prototype.getTopRightBlock = function(){
        var x = this.getX();
        var y = this.getY();
        
        if(y != START_Y && x != 360){
            return GameModel.getBlock(x+60,y-60);
        }
    }
    Block.prototype.getBottomRightBlock = function(){
        var x = this.getX();
        var y = this.getY();
        
        if(y != GAME_HEIGHT-60 && x != 360){
            return GameModel.getBlock(x+60,y+60);
        }
    }
    Block.prototype.getBottomLeftBlock = function(){
        var x = this.getX();
        var y = this.getY();
        
        if(y != GAME_HEIGHT-60 && x != 0){
            return GameModel.getBlock(x-60,y+60);
        }
    }
    
    
    
    
    
    
    
    
