SuikaGame.ui = {
    initializeUI: function() {
        this.setupEventListeners();
        this.updateHighScoreDisplay();
    },
    
    setupEventListeners: function() {
        document.getElementById('start-button').addEventListener('click', SuikaGame.game.startGame);
        document.getElementById('options-button').addEventListener('click', this.showOptions);
        document.getElementById('easy-button').addEventListener('click', () => this.setDifficulty('easy'));
        document.getElementById('normal-button').addEventListener('click', () => this.setDifficulty('normal'));
        document.getElementById('hard-button').addEventListener('click', () => this.setDifficulty('hard'));
        document.getElementById('back-button').addEventListener('click', this.showMainMenu);
    },
    
    updateHighScoreDisplay: function() {
        const highScore = SuikaGame.game.getHighScore();
        document.getElementById('high-score').textContent = `Melhor pontuação: ${highScore}`;
    },
    
    showOptions: function() {
        document.getElementById('game-title').style.display = 'none';
        document.getElementById('start-button').style.display = 'none';
        document.getElementById('options-button').style.display = 'none';
        document.getElementById('difficulty-buttons').style.display = 'block';
    },
    
    showMainMenu: function() {
        document.getElementById('game-title').style.display = 'block';
        document.getElementById('start-button').style.display = 'block';
        document.getElementById('options-button').style.display = 'block';
        document.getElementById('difficulty-buttons').style.display = 'none';
    },
    
    setDifficulty: function(level) {
        SuikaGame.game.setDifficulty(level);
        this.showMainMenu();
    },
    
    updateScore: function(score) {
        document.getElementById('score').textContent = `Pontos: ${score}`;
    },
    
    updateNextFruit: function(fruitEmoji) {
        document.getElementById('next-fruit').textContent = `Próxima: ${fruitEmoji}`;
    }
    
};