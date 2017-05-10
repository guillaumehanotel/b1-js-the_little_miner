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
                    if(j == START_Y){
                        block.setBreakable(true);
                    }
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
    
    

