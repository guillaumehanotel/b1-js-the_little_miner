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
        profondeur : 0,
        ore_score : {
            coal : 0,
            iron : 0,
            gold : 0,
            diamond : 0
        },
        score : 0,
        
        


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
                    if(j == START_Y){
                        block.setBreakable(true);
                    }
                    array_blocks.push(block);
                }
            }
            this.blocks = array_blocks;
        },
        
        /**
         * Incrémente le score des minerais en fonction du block tapé
         */
        incrementOreScore : function(block){
            
            switch(block.getType()){
                    
                case TYPEBLOCK.COAL : 
                    this.ore_score.coal++;
                    break;
                    
                case TYPEBLOCK.IRON : 
                    this.ore_score.iron++;
                    break;
                    
                case TYPEBLOCK.GOLD : 
                    this.ore_score.gold++;
                    break;
                    
                case TYPEBLOCK.DIAMOND : 
                    this.ore_score.diamond++;
                    break;
                default : break;
            }
            
        },

            
        getScore : function(){
            
            var coal = this.ore_score.coal*2;
            var iron = this.ore_score.iron*3;
            var gold = this.ore_score.gold*4;
            var diamond = this.ore_score.diamond*5;
            
            this.score = this.profondeur + coal + iron + gold + diamond;
            
            
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
        
        /**
         * Méthode getBlocksByProfondeur
         * Retourne la liste de tous les blocks d'une profondeur donnée
         */
        getBlocksByProfondeur: function(prof){
            var res_blocks=[];
            
            this.blocks.forEach(function (block) {
                if(block.profondeur == prof ){
                    res_blocks.push(block);
                }
            });
            
            return res_blocks;
        },
        
        /**
         * Retourne la profondeur la plus basse atteinte
         */
        getProfondeur : function(){
          
            var prof = 0;
            
            this.blocks.forEach(function(block){
               
                if(block.destroyed == true && block.getProfondeur() > prof){
                    prof = block.getProfondeur();
                }
                
            });
            
            this.profondeur = prof;
            
            return prof;
            
        },
            
        
        reset : function(){
            this.blocks = null;
            this.pioche = PICKER_NB_HIT;
        }
        

    };
    
    

