
var gameOver = function(game){}
 
gameOver.prototype = {
    
	init: function(){
		
	},
  	create: function(){
        
        GameModel.getScore();
        
  		var gameOverTitle = this.game.add.sprite(210,130,"gameover");
		gameOverTitle.anchor.setTo(0.5,0.5);
        
        if(DETAIL_SCORE){
            coal = this.game.add.text(150, 310, 'Charbon : ' + GameModel.ore_score.coal, {
                fontSize: '23px',
                fill: '#fff'
            });

            iron = this.game.add.text(150, 330, 'Fer : ' + GameModel.ore_score.iron, {
                fontSize: '23px',
                fill: '#fff'
            });
            gold = this.game.add.text(150, 350, 'Or : ' + GameModel.ore_score.gold, {
                fontSize: '23px',
                fill: '#fff'
            });
            diamond = this.game.add.text(150, 370, 'Diamant : ' + GameModel.ore_score.diamond, {
                fontSize: '23px',
                fill: '#fff'
            });
        }
        
           
        score = this.game.add.text(90, 240, 'Score : ' + GameModel.score, {
            fontSize: '55px',
            fill: '#fff'
        });
        

        
		var playButton = this.game.add.button(220,450,"play",this.playTheGame,this);
		playButton.anchor.setTo(0.5,0.5);
	},
    
	playTheGame: function(){
		this.game.state.start("TheGame");
	}
}