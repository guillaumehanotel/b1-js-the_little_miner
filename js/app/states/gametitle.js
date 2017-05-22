var gameTitle = function(game){}


gameTitle.prototype = {
    
    
    create: function(){
        
        pioche = this.game.add.sprite(this.game.input.mousePointer.worldX, this.game.input.mousePointer.worldY, 'pioche');
            
        var music = this.game.add.audio('fairytail');
        music.volume -= 0.8;
        if(MUSIC)
            music.play();
        
        
        var gameTitle = this.game.add.sprite(210,180,"gametitle");
		gameTitle.anchor.setTo(0.5,0.5);
		var playButton = this.game.add.button(220,370,"play",this.playTheGame,this);
		playButton.anchor.setTo(0.5,0.5);
        
        var torch1 = this.game.add.sprite(230,235, 'torch');
        var torch2 = this.game.add.sprite(170,235, 'torch');
        
        var burn = torch1.animations.add('burn');
        torch1.animations.play('burn', 10, true);
        
        var burn = torch2.animations.add('burn');
        torch2.animations.play('burn', 11, true);
        
    },
    
    update: function(){
        pioche.position.set(this.game.input.mousePointer.worldX-20, this.game.input.mousePointer.worldY-20);

        this.game.world.bringToTop(pioche);
    },
    
    
    playTheGame: function(){
		this.game.state.start("TheGame");
	}
    
    
    
    
    
}