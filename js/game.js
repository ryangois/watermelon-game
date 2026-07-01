var SuikaGame = SuikaGame || {};

SuikaGame.game = {
    initialize: function () {
        SuikaGame.ui.initializeUI();
        SuikaGame.physics.setupEngine();
        this.resetGame();
    },

    startGame: function () {
        SuikaGame.skins.applyActiveTheme();
        SuikaGame.physics.applyTheme();
        this.resetGame();
        SuikaGame.config.gameActive = true;
        SuikaGame.ui.setGameOptionsOpen(false);

        document.getElementById('menu-container').style.display = 'none';
        document.getElementById('shop-container').style.display = 'none';
        document.getElementById('game-area').style.display = 'flex';
        document.getElementById('game-container').style.display = 'block';
        document.getElementById('fruit-evolution').style.display = 'block';

        SuikaGame.fruits.createNewFruit();
        SuikaGame.audio.playBackgroundMusic();
        SuikaGame.ui.updatePowerToolbar();
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
        SuikaGame.ui.updatePowerToolbar();
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
        SuikaGame.ui.updateDifficultyDisplay();
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

    usePower: function (powerId) {
        if (!SuikaGame.config.gameActive || SuikaGame.config.gameOver || !SuikaGame.skins.consumePower(powerId)) {
            return false;
        }

        if (powerId === 'clear-small') {
            this.removeFruits(body => body.fruitIndex <= 1);
        }

        if (powerId === 'pop-lowest') {
            const fruits = this.getLooseFruits().sort((a, b) => a.fruitIndex - b.fruitIndex || b.position.y - a.position.y);
            if (fruits[0]) Matter.World.remove(SuikaGame.config.engine.world, fruits[0]);
        }

        if (powerId === 'slow-time') {
            const currentGravity = SuikaGame.config.engine.gravity.scale;
            SuikaGame.physics.updateGravity(currentGravity * 0.45);
            setTimeout(() => {
                SuikaGame.physics.updateGravity(SuikaGame.config.DIFFICULTY_LEVELS[SuikaGame.config.currentDifficulty].gravity);
            }, 6000);
        }

        SuikaGame.ui.updatePowerToolbar();
        SuikaGame.ui.updateCoinDisplays();
        return true;
    },

    getLooseFruits: function () {
        return Matter.Composite.allBodies(SuikaGame.config.engine.world)
            .filter(body => body.isFruit && !body.isStatic && !body.toRemove);
    },

    removeFruits: function (predicate) {
        this.getLooseFruits().forEach(body => {
            if (predicate(body)) {
                Matter.World.remove(SuikaGame.config.engine.world, body);
            }
        });
    },

    endGame: function () {
        if (SuikaGame.config.gameOver) return;

        SuikaGame.config.gameOver = true;
        SuikaGame.config.gameActive = false;

        const earnedCoins = SuikaGame.skins.addCoins(SuikaGame.skins.getCoinsForScore(SuikaGame.config.score));
        const isNewHighScore = this.saveHighScore(SuikaGame.config.score);
        const highScore = this.getHighScore();
        const medals = SuikaGame.progress.evaluateGame(SuikaGame.config.score);
        const message = isNewHighScore
            ? `Nova pontuação recorde!\nPontuação: ${SuikaGame.config.score}\nMoedas ganhas: ${earnedCoins}\nMelhor pontuação: ${highScore}`
            : `Fim de jogo!\nPontuação: ${SuikaGame.config.score}\nMoedas ganhas: ${earnedCoins}\nMelhor pontuação: ${highScore}`;

        SuikaGame.ui.updateCoinDisplays();
        SuikaGame.ui.renderMedals(medals);
        document.getElementById('game-over-message').textContent = message;
        document.getElementById('game-over-card').style.display = 'block';

        document.getElementById('restart-button').onclick = () => {
            document.getElementById('game-over-card').style.display = 'none';
            this.startGame();
        };

        document.getElementById('return-button').onclick = () => {
            document.getElementById('game-over-card').style.display = 'none';
            this.resetGame();
            SuikaGame.audio.stopBackgroundMusic();
            SuikaGame.ui.showMainMenu();
        };
    }
};

SuikaGame.audio = {
    backgroundMusic: null,

    playBackgroundMusic: function () {
        const track = SuikaGame.skins.getActiveTrack();

        if (!this.backgroundMusic || this.backgroundMusic.src.indexOf(track.src) === -1) {
            if (this.backgroundMusic) this.backgroundMusic.pause();
            this.backgroundMusic = new Audio(track.src);
            this.backgroundMusic.loop = true;
            this.backgroundMusic.volume = 0.35;
        }

        this.backgroundMusic.muted = SuikaGame.skins.isMuted();
        if (!SuikaGame.skins.isMuted()) {
            this.backgroundMusic.play().catch(function () {});
        }
    },

    stopBackgroundMusic: function () {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    },

    toggleMute: function () {
        const muted = !SuikaGame.skins.isMuted();
        SuikaGame.skins.setMuted(muted);
        if (this.backgroundMusic) {
            this.backgroundMusic.muted = muted;
            if (!muted) this.backgroundMusic.play().catch(function () {});
        }
        SuikaGame.ui.updateMuteButton();
    }
};

document.addEventListener('DOMContentLoaded', function () {
    SuikaGame.game.initialize();
});
