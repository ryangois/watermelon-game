var SuikaGame = SuikaGame || {};

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
            label: 'Fácil',
            gravity: 0.0007,
            fruitSizeMultiplier: 1.15,
            scoreMultiplier: 0.8,
            coinMultiplier: 0.65
        },
        normal: {
            label: 'Normal',
            gravity: 0.001,
            fruitSizeMultiplier: 1,
            scoreMultiplier: 1,
            coinMultiplier: 0.85
        },
        hard: {
            label: 'Difícil',
            gravity: 0.0015,
            fruitSizeMultiplier: 0.85,
            scoreMultiplier: 1.5,
            coinMultiplier: 1
        }
    },

    currentDifficulty: 'normal',
    dropPosition: 200,
    canDropFruit: true,
    paused: false,
    usedPowersThisGame: false,
    lineInvisibleUntil: 0,
    lineInvisibleTimer: null,
    bombSelectionRemaining: 0,
    comboCount: 0,
    lastMergeAt: 0,

    engine: null,
    render: null,
    runner: null
};
