var SuikaGame = SuikaGame || {};

SuikaGame.game = {
    initialize: function () {
        SuikaGame.ui.initializeUI();
        SuikaGame.physics.setupEngine();
        this.resetGame();
    },

    startGame: function () {
        SuikaGame.game.resetGame();
        SuikaGame.config.gameActive = true;

        document.getElementById('menu-container').style.display = 'none';
        document.getElementById('shop-container').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        document.getElementById('fruit-evolution').style.display = 'block';

        SuikaGame.fruits.createNewFruit();
        SuikaGame.audio.playBackgroundMusic();
    },

    resetGame: function () {
        SuikaGame.config.score = 0;
        SuikaGame.config.gameOver = false;
        SuikaGame.config.canDropFruit = true;
        SuikaGame.config.dropPosition = SuikaGame.config.GAME_WIDTH / 2;
        SuikaGame.fruits.currentFruit = null;
        SuikaGame.particles.activeParticles = [];
        SuikaGame.ui.updateScore(0);
        SuikaGame.ui.updateCoinDisplays();

        if (SuikaGame.config.engine && SuikaGame.config.engine.world) {
            const bodies = Matter.Composite.allBodies(SuikaGame.config.engine.world);

            for (let i = 0; i < bodies.length; i++) {
                if (bodies[i].isFruit) {
                    Matter.World.remove(SuikaGame.config.engine.world, bodies[i]);
                }
            }
        }

        SuikaGame.fruits.nextFruitIndex = Math.floor(Math.random() * Math.min(3, SuikaGame.fruits.spawnableCount));
        SuikaGame.fruits.updateNextFruitPreview();
    },

    handleFruitCollision: function (fruitA, fruitB) {
        if (
            fruitA.fruitIndex !== fruitB.fruitIndex ||
            fruitA.toRemove ||
            fruitB.toRemove ||
            fruitA.fruitIndex >= SuikaGame.fruits.types.length - 1
        ) {
            return;
        }

        fruitA.toRemove = true;
        fruitB.toRemove = true;

        const midX = (fruitA.position.x + fruitB.position.x) / 2;
        const midY = (fruitA.position.y + fruitB.position.y) / 2;
        const currentFruitData = SuikaGame.fruits.types[fruitA.fruitIndex];
        const newFruitIndex = fruitA.fruitIndex + 1;
        const newFruitData = SuikaGame.fruits.types[newFruitIndex];
        const newFruit = SuikaGame.fruits.createFruitBody(midX, midY, newFruitData);
        const scoreMultiplier = SuikaGame.config.DIFFICULTY_LEVELS[SuikaGame.config.currentDifficulty].scoreMultiplier;

        SuikaGame.particles.createParticles(midX, midY, SuikaGame.fruits.getColorForFruit(currentFruitData), 25);
        SuikaGame.config.score += Math.round(newFruitData.score * scoreMultiplier);
        SuikaGame.ui.updateScore(SuikaGame.config.score);

        setTimeout(function () {
            Matter.World.remove(SuikaGame.config.engine.world, [fruitA, fruitB]);
            Matter.World.add(SuikaGame.config.engine.world, newFruit);
        }, 80);
    },

    setDifficulty: function (level) {
        SuikaGame.config.currentDifficulty = level;
        const diffSettings = SuikaGame.config.DIFFICULTY_LEVELS[level];

        SuikaGame.physics.updateGravity(diffSettings.gravity);
        SuikaGame.fruits.updateFruitSizes(diffSettings.fruitSizeMultiplier);
    },

    getHighScore: function () {
        return parseInt(localStorage.getItem('suikaHighScore') || '0', 10);
    },

    saveHighScore: function (score) {
        const currentHighScore = this.getHighScore();

        if (score > currentHighScore) {
            localStorage.setItem('suikaHighScore', score);
            return true;
        }

        return false;
    },

    endGame: function () {
        if (SuikaGame.config.gameOver) {
            return;
        }

        SuikaGame.config.gameOver = true;
        SuikaGame.config.gameActive = false;

        const earnedCoins = SuikaGame.skins.addCoins(SuikaGame.skins.getCoinsForScore(SuikaGame.config.score));
        const isNewHighScore = this.saveHighScore(SuikaGame.config.score);
        const highScore = this.getHighScore();
        const message = isNewHighScore
            ? `Nova pontuação recorde!\nPontuação: ${SuikaGame.config.score}\nMoedas ganhas: ${earnedCoins}\nMelhor pontuação: ${highScore}`
            : `Fim de jogo!\nPontuação: ${SuikaGame.config.score}\nMoedas ganhas: ${earnedCoins}\nMelhor pontuação: ${highScore}`;

        SuikaGame.ui.updateCoinDisplays();
        document.getElementById('game-over-message').textContent = message;

        const gameOverCard = document.getElementById('game-over-card');
        gameOverCard.style.display = 'block';

        document.getElementById('restart-button').onclick = () => {
            gameOverCard.style.display = 'none';
            SuikaGame.game.startGame();
        };

        document.getElementById('return-button').onclick = () => {
            gameOverCard.style.display = 'none';
            SuikaGame.game.resetGame();
            SuikaGame.audio.stopBackgroundMusic();
            SuikaGame.ui.showMainMenu();
        };
    }
};

SuikaGame.audio = {
    backgroundMusic: null,

    playBackgroundMusic: function () {
        if (!this.backgroundMusic) {
            this.backgroundMusic = new Audio('assets/music/music-fruits.mp3');
            this.backgroundMusic.loop = true;
            this.backgroundMusic.volume = 0.35;
        }

        this.backgroundMusic.play().catch(function () {
            // O navegador pode bloquear autoplay até o primeiro gesto do usuário.
        });
    },

    stopBackgroundMusic: function () {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }
};

document.addEventListener('DOMContentLoaded', function () {
    SuikaGame.game.initialize();
});
