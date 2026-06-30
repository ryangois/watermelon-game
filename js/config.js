// Namespace global para o jogo
var SuikaGame = SuikaGame || {};

// Configurações do jogo
SuikaGame.config = {
    GAME_WIDTH: 400,
    GAME_HEIGHT: 700,
    WALL_THICKNESS: 20,

    gameOverLine: 130,
    gameOver: false,
    gameActive: false,
    score: 0,

    DIFFICULTY_LEVELS: {
        easy: {
            gravity: 0.0007,
            fruitSizeMultiplier: 1.15,
            scoreMultiplier: 0.8
        },
        normal: {
            gravity: 0.001,
            fruitSizeMultiplier: 1,
            scoreMultiplier: 1
        },
        hard: {
            gravity: 0.0015,
            fruitSizeMultiplier: 0.85,
            scoreMultiplier: 1.5
        }
    },

    currentDifficulty: 'normal',
    dropPosition: 200,
    canDropFruit: true,

    engine: null,
    render: null,
    runner: null
};
