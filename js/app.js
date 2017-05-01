$(document).ready(function() {


    
    
    
    /**************** MODEL *****************/
    
    // OBJET LOCATION
    function Location(x,y){
        this.x = x;
        this.y = y;
    }
    
    
    
    /** 
     * OBJECT CASE
     * hauteur et largeur a 60px
     */
    
    function Case(x,y){
        this.height = 60;
        this.width =  60;
        this.location = new Location(x,y);
        
    }
    
    
    
    
    
    

    // LA STRUCTURE DU JEU  
    var GameLogic = {
        
        construct: function(y_start, width, height){
            // on déclare un tableau de cases
            var cases = [];
            
            // de y start à la fin de la hauteur
            
            for (var i = y_start; i <= height; i+= 60){
                
                for (var j = 0; j <= width; j+= 60){
                    
                    var kase = new Case(i,j);
                    cases.push(kase);
                }
            }
                 
              return cases;      
        }
        
    };
    
    
    
    
    /** 
     * OBJET GAME
     * y_start : position verticale ou on commence à mettre les cases
     *
     */
    
    function Game(y_start){
        this.y_start = y_start;
        this.height = 920;
        this.width = 420;
        this.gameSet = GameLogic.construct(y_start, this.width, this.height);
    }
    
    // méthode de l'objet Game
    

    
    
    

                    
                    
    
    /***************** CONTROLLER *****************/
    
    function GameController(){
 
    }
    
    
    // Fonction start : initialise le modèle, la vue 
    GameController.prototype.Start = function(y_start){
        // on initialise un nouveau modèle
        this.game = new Game(y_start);
        // on initialise une vue
        
        this.view = new Phaser.Game(420, 700, Phaser.AUTO, '', 
                               { preload: preload, 
                                create: create,
                               /*update : update*/ }
                              );
        
        console.log(this.view);
        //this.view = new GameView(this.context,this.game.gameSet);
        // on appelle la méthode update de la vue
        this.view.update();
        
    };
    
    
    
    /***************** VIEW ******************/
     
    
    /*
    function GameView(ctx,cases){   
        this.context = ctx;
        this.cases = cases; 
    }
    

    GameView.prototype.Update = function(){      
        for(var kase in this.cases){
            console.log("test");
        }     
    }
    */
    
    
    
    var spacefield;
    var y_max = -260;
    

    function preload() {
        this.load.image('sky', 'img/sky.png');
    }
    
    function create() {
        spacefield = this.add.tileSprite(0,0,420,700,'sky');
        //game.add.sprite(0,0, 'sky'); 
    }
    
    function update() {
        //console.log(spacefield.tilePosition.y);  
        if(spacefield.tilePosition.y >= y_max){
            spacefield.tilePosition.y -= 1;
        } 
    }
    
    
                   
    
    /****************** MAIN *****************/



   // var context = document.getElementById("myCanvas").getContext("2d");
   // var context = document.getElementsByTagName("CANVAS")[0].getContext("2d");
 


    var currentInstance;       
    
    // on initialise un game controller
    currentInstance = new GameController();
    currentInstance.Start(240);


    
    
    
    
    
    
    
    
    
    
    
    
    
    
    


});

