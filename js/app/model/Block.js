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
    Block.prototype.hitBlock = function(){

        if(this.type == TYPEBLOCK.BONUS){
            GameModel.pioche+= 5;
        }
        else if(this.type != TYPEBLOCK.BEDROCK){
            GameModel.pioche--;
        }

        this.resistance--;
        if(this.resistance == 0){
            this.propagateBreakable();
            this.destroyed = true;
        }

        return this.destroyed;

    }
    
    Block.prototype.getLeftBlock = function(){
        var x = this.getX();
        var y = this.getY();
        // si la borne inférieur de x n'est pas à 0 (au minimum)
        if(x != 0){
            return GameModel.getBlock(x-60,y);
        }
    }
    
    Block.prototype.getRightBlock = function(){
        
        var x = this.getX();
        var y = this.getY();
        
        // si la borne supérieur de x n'est pas à 360 (au max) (420)
        if(x != 360){
            return GameModel.getBlock(x+60,y);
        }
        
    }
    
    Block.prototype.getTopBlock = function(){
        
        var x = this.getX();
        var y = this.getY();
        
        // si la borne inférieur de y n'est pas au minimum de Y (360)
        if(y != START_Y){
            return GameModel.getBlock(x,y-60);
        }
        
    }
        
        
    Block.prototype.getBottomBlock = function(){
        
        var x = this.getX();
        var y = this.getY();
        
        // si la borne supérieur de y n'est pas au max du jeu
        if(y != GAME_HEIGHT-60){
            return GameModel.getBlock(x,y+60);
        }
    }
    
    
    Block.prototype.propagateBreakable = function(){
        
        var array = this.getAroundBlocks();
        
        array.forEach(function (element) {
            element.setBreakable(true);
        });
        
    }

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
