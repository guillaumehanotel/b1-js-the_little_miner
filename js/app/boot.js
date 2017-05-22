$(document).ready(function () {

    
    var game = new Phaser.Game(GAME_WIDTH, FRAME_HEIGHT, Phaser.AUTO, 'game');

    
    game.state.add("Preload", preload);
    
    game.state.add("GameTitle", gameTitle);
    
    game.state.add("TheGame", theGame);
    
    game.state.add("GameOver", gameOver);
    
    game.state.start("Preload");
    
    
    
    
});
    

