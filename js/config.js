// Namespace global para o jogo
var SuikaGame = SuikaGame || {};

// Configurações do jogo
SuikaGame.config = {
    // Dimensões do jogo
    GAME_WIDTH: 400,
    GAME_HEIGHT: 700,
    WALL_THICKNESS: 20,
    
    // Variáveis para controle de game over
    gameOverLine: 150,
    gameOverWarning: false,
    gameOverTimer: null,
    blinkInterval: null,
    totalCollisions: 0,
    
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
    runner: null
};

// Função para lidar com colisões de frutas
SuikaGame.game.handleFruitCollision = function(fruitA, fruitB) {
    // Incrementar contador de colisões
    SuikaGame.config.totalCollisions++;
    
    // Verificar se são do mesmo tipo
    if (fruitA.fruitIndex === fruitB.fruitIndex) {
        // Verificar se já não foram marcados para remoção e se não ultrapassou o limite de colisões
        if (!fruitA.toRemove && !fruitB.toRemove &&
            fruitA.fruitIndex < SuikaGame.fruits.types.length - 1 &&
            SuikaGame.config.totalCollisions < 3) {
            
            // Marcar para remoção
            fruitA.toRemove = true;
            fruitB.toRemove = true;
            
            // Calcular posição média
            const midX = (fruitA.position.x + fruitB.position.x) / 2;
            const midY = (fruitA.position.y + fruitB.position.y) / 2;
            
            // Criar partículas na posição da fusão
            const fruitColor = SuikaGame.fruits.getColorForEmoji(SuikaGame.fruits.types[fruitA.fruitIndex].emoji);
            SuikaGame.particles.createParticles(midX, midY, fruitColor, 25);
            
            // Criar fruta maior
            const newFruitIndex = fruitA.fruitIndex + 1;
            const newFruit = SuikaGame.fruits.createFruitBody(midX, midY, SuikaGame.fruits.types[newFruitIndex]);
            
            // Atualizar 
            SuikaGame.config.score += SuikaGame.fruits.types[newFruitIndex].score;
            SuikaGame.ui.updateScore(SuikaGame.config.score);
            
            setTimeout(function() {
                Matter.World.remove(SuikaGame.config.engine.world, [fruitA, fruitB]);
                Matter.World.add(SuikaGame.config.engine.world, newFruit);
                
                SuikaGame.config.totalCollisions = 0;
            }, 100);
        }
    }
};
