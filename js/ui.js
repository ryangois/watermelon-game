SuikaGame.ui = {
    initializeUI: function () {
        this.setupEventListeners();
        this.updateHighScoreDisplay();
        this.createEvolutionDiagram();

        // Esconder o jogo e mostrar o menu inicialmente
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('fruit-evolution').style.display = 'none';
        document.getElementById('menu-container').style.display = 'flex';
    },

    setupEventListeners: function () {
        document.getElementById('start-button').addEventListener('click', SuikaGame.game.startGame);
        document.getElementById('options-button').addEventListener('click', this.showOptions);
        document.getElementById('easy-button').addEventListener('click', () => this.setDifficulty('easy'));
        document.getElementById('normal-button').addEventListener('click', () => this.setDifficulty('normal'));
        document.getElementById('hard-button').addEventListener('click', () => this.setDifficulty('hard'));
        document.getElementById('back-button').addEventListener('click', this.showMainMenu);
    },

    updateHighScoreDisplay: function () {
        const highScore = SuikaGame.game.getHighScore();
        document.getElementById('high-score').textContent = `Melhor pontuação: ${highScore}`;
    },

    showOptions: function () {
        document.getElementById('game-title').style.display = 'none';
        document.getElementById('start-button').style.display = 'none';
        document.getElementById('options-button').style.display = 'none';
        document.getElementById('difficulty-buttons').style.display = 'block';
    },

    showMainMenu: function () {
        document.getElementById('menu-container').style.display = 'flex';
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('fruit-evolution').style.display = 'none';
    },

    startGame: function () {
        document.getElementById('menu-container').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        document.getElementById('fruit-evolution').style.display = 'block';

        // Iniciar o jogo
        SuikaGame.game.startGame();
    },

    setDifficulty: function (level) {
        SuikaGame.game.setDifficulty(level);
        this.showMainMenu();
    },

    updateScore: function (score) {
        document.getElementById('score').textContent = `Pontos: ${score}`;
    },

    updateNextFruit: function (fruitEmoji) {
        document.getElementById('next-fruit').textContent = `Próxima: ${fruitEmoji}`;
    },

    // No arquivo ui.js, modifique a função createEvolutionDiagram:
    createEvolutionDiagram: function() {
        const diagram = document.getElementById('evolution-diagram');
        diagram.innerHTML = '';
        
        // Criar uma única linha com todas as frutas
        const row = document.createElement('div');
        row.className = 'evolution-row';
        
        const fruits = ['🍒', '🍓', '🍇', '🍊', '🍎', '🍐', '🍑', '🍍', '🍈', '🍉'];
        
        for (let i = 0; i < fruits.length; i++) {
            const fruitIcon = document.createElement('div');
            fruitIcon.className = 'fruit-icon';
            fruitIcon.style.backgroundColor = SuikaGame.fruits.getColorForEmoji(fruits[i]);
            fruitIcon.style.width = '30px';
            fruitIcon.style.height = '30px';
            fruitIcon.style.display = 'flex';
            fruitIcon.style.justifyContent = 'center';
            fruitIcon.style.alignItems = 'center';
            fruitIcon.style.borderRadius = '50%';
            fruitIcon.style.margin = '0 5px';
            fruitIcon.style.fontSize = '20px';
            fruitIcon.textContent = fruits[i];
            row.appendChild(fruitIcon);
            
            if (i < fruits.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'arrow';
                arrow.textContent = ''; // Adicionando a seta
                arrow.style.fontSize = '16px';
                arrow.style.color = '#666';
                row.appendChild(arrow);
            }
        }
        
        diagram.appendChild(row);
        
        // Garantir que o elemento esteja visível
        document.getElementById('fruit-evolution').style.display = 'block';
    }
    




};