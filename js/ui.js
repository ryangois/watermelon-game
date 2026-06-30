var SuikaGame = SuikaGame || {};

SuikaGame.ui = {
    initializeUI: function () {
        this.setupEventListeners();
        this.updateHighScoreDisplay();
        this.createEvolutionDiagram();
        this.showMainMenu();
    },

    setupEventListeners: function () {
        document.getElementById('start-button').addEventListener('click', SuikaGame.game.startGame);
        document.getElementById('options-button').addEventListener('click', () => this.showOptions());
        document.getElementById('easy-button').addEventListener('click', () => this.setDifficulty('easy'));
        document.getElementById('normal-button').addEventListener('click', () => this.setDifficulty('normal'));
        document.getElementById('hard-button').addEventListener('click', () => this.setDifficulty('hard'));
        document.getElementById('back-button').addEventListener('click', () => this.showMainMenu());
    },

    updateHighScoreDisplay: function () {
        const highScore = SuikaGame.game.getHighScore();
        document.getElementById('high-score').textContent = `Melhor pontuação: ${highScore}`;
    },

    showOptions: function () {
        document.getElementById('game-title').style.display = 'none';
        document.getElementById('high-score').style.display = 'none';
        document.getElementById('start-button').style.display = 'none';
        document.getElementById('options-button').style.display = 'none';
        document.getElementById('difficulty-buttons').style.display = 'grid';
    },

    showMainMenu: function () {
        this.updateHighScoreDisplay();

        document.getElementById('game-title').style.display = 'block';
        document.getElementById('high-score').style.display = 'block';
        document.getElementById('start-button').style.display = 'inline-block';
        document.getElementById('options-button').style.display = 'inline-block';
        document.getElementById('difficulty-buttons').style.display = 'none';
        document.getElementById('menu-container').style.display = 'flex';
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('fruit-evolution').style.display = 'none';
    },

    setDifficulty: function (level) {
        SuikaGame.game.setDifficulty(level);
        this.showMainMenu();
    },

    updateScore: function (score) {
        document.getElementById('score').textContent = `Pontos: ${score}`;
    },

    createEvolutionDiagram: function () {
        const diagram = document.getElementById('evolution-diagram');
        const row = document.createElement('div');

        diagram.innerHTML = '';
        row.className = 'evolution-row';

        for (let i = 0; i < SuikaGame.fruits.types.length; i++) {
            const fruit = SuikaGame.fruits.types[i];
            const fruitIcon = document.createElement('div');

            fruitIcon.className = 'fruit-icon';
            fruitIcon.style.backgroundColor = fruit.color;
            fruitIcon.title = fruit.name;
            fruitIcon.appendChild(SuikaGame.fruits.createFruitPreview(fruit, 30));
            row.appendChild(fruitIcon);
        }

        diagram.appendChild(row);
    }
};
