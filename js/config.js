// Namespace global para o jogo
var SuikaGame = SuikaGame || {};

// Configurações do jogo
SuikaGame.config = {
    // Dimensões do jogo
    GAME_WIDTH: 400,
    GAME_HEIGHT: 700,
    WALL_THICKNESS: 20,

    // Configurações de dificuldade
    DIFFICULTY_LEVELS: {
        easy: {
            gravity: 0.0007,
            fruitSizeMultiplier: 1.2,
            scoreMultiplier: 0.8
        },
        normal: {
            gravity: 0.001,
            fruitSizeMultiplier: 1.0,
            scoreMultiplier: 1.0
        },
        hard: {
            gravity: 0.0015,
            fruitSizeMultiplier: 0.8,
            scoreMultiplier: 1.5
        }
    },

    // Dificuldade atual
    currentDifficulty: 'normal',

    // Estado do jogo
    gameActive: false,
    gameInitialized: false,
    gameOver: false,
    score: 0,

    // Controle de frutas
    dropPosition: 200, // GAME_WIDTH / 2
    canDropFruit: true,

    // Referências Matter.js
    engine: null,
    render: null,
    runner: null,
    // Adicione esta variável ao SuikaGame.config
    totalCollisions: 0,

    // Modifique a função handleFruitCollision no game.js
    handleFruitCollision: function (fruitA, fruitB) {
        // Incrementar contador de colisões
        SuikaGame.config.totalCollisions++;

        // Verificar se são do mesmo tipo
        if (fruitA.fruitIndex === fruitB.fruitIndex) {
            // Verificar se já não foram marcados para remoção e se não ultrapassou o limite de colisões
            if (!fruitA.toRemove && !fruitB.toRemove &&
                fruitA.fruitIndex < SuikaGame.fruits.types.length - 1 &&
                SuikaGame.config.totalCollisions < 3) {

                // Resto do código para fundir frutas...

                // Resetar contador após processar
                setTimeout(function () {
                    SuikaGame.config.totalCollisions = 0;
                }, 100);
            }
        }
    }


};
