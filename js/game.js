SuikaGame.game = {
    initialize: function () {
        SuikaGame.ui.initializeUI();
        SuikaGame.physics.setupEngine();
        this.resetGame();
    },

    startGame: function () {
        SuikaGame.config.gameActive = true;
        document.getElementById('menu-container').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        document.getElementById('fruit-evolution').style.display = 'block';
        SuikaGame.fruits.createNewFruit(); // Alterado para chamar a função correta
    },

    resetGame: function () {
        SuikaGame.config.score = 0;
        SuikaGame.config.gameOver = false;
        SuikaGame.ui.updateScore(0);

        // Limpar frutas existentes
        if (SuikaGame.config.engine && SuikaGame.config.engine.world) {
            const bodies = Matter.Composite.allBodies(SuikaGame.config.engine.world);
            for (let i = 0; i < bodies.length; i++) {
                if (bodies[i].isFruit) {
                    Matter.World.remove(SuikaGame.config.engine.world, bodies[i]);
                }
            }
        }

        // Inicializar próxima fruta
        SuikaGame.fruits.nextFruitIndex = Math.floor(Math.random() * 3);
    },

    createNewFruit: function () {
        SuikaGame.fruits.createNewFruit();
    },

    handleFruitCollision: function (fruitA, fruitB) {
        // Verificar se são do mesmo tipo
        if (fruitA.fruitIndex === fruitB.fruitIndex) {
            // Verificar se já não foram marcados para remoção
            if (!fruitA.toRemove && !fruitB.toRemove && fruitA.fruitIndex < SuikaGame.fruits.types.length - 1) {
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

                // Atualizar pontuação
                SuikaGame.config.score += SuikaGame.fruits.types[newFruitIndex].score;
                SuikaGame.ui.updateScore(SuikaGame.config.score);

                // Remover frutas antigas e adicionar nova
                setTimeout(function () {
                    Matter.World.remove(SuikaGame.config.engine.world, [fruitA, fruitB]);
                    Matter.World.add(SuikaGame.config.engine.world, newFruit);
                }, 100);
            }
        }
    },

    setDifficulty: function (level) {
        SuikaGame.config.currentDifficulty = level;
        const diffSettings = SuikaGame.config.DIFFICULTY_LEVELS[level];
        SuikaGame.physics.updateGravity(diffSettings.gravity);
        SuikaGame.fruits.updateFruitSizes(diffSettings.fruitSizeMultiplier);
    },

    getHighScore: function () {
        return parseInt(localStorage.getItem("suikaHighScore") || 0);
    },

    saveHighScore: function (score) {
        const currentHighScore = this.getHighScore();
        if (score > currentHighScore) {
            localStorage.setItem("suikaHighScore", score);
            return true;
        }
        return false;
    },

    endGame: function () {
        SuikaGame.config.gameOver = true;
        const isNewHighScore = this.saveHighScore(SuikaGame.config.score);

        // Mostrar tela de fim de jogo
        const highScore = this.getHighScore();
        let message = `Game Over!\nPontuação: ${SuikaGame.config.score}\nMelhor pontuação: ${highScore}`;

        if (isNewHighScore) {
            message += "\n\nNova pontuação recorde!";
        }

        setTimeout(() => {
            alert(message);
            this.resetGame();
            document.getElementById('game-container').style.display = 'none';
            document.getElementById('menu-container').style.display = 'flex';
            document.getElementById('fruit-evolution').style.display = 'none'
        }, 1000);
    }
};

// Inicialização do jogo - CORRIGIDO para preservar o contexto 'this'
document.addEventListener('DOMContentLoaded', function () {
    SuikaGame.game.initialize();
});
