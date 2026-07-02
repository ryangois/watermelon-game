var SuikaGame = SuikaGame || {};

SuikaGame.game = {
    initialize: function () {
        SuikaGame.ui.initializeUI();
        SuikaGame.physics.setupEngine();
        this.resetGame();
    },

    startGame: function () {
        SuikaGame.ui.requestFullscreen(true);
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
        SuikaGame.config.lineInvisibleUntil = 0;
        SuikaGame.config.bombSelectionRemaining = 0;
        SuikaGame.config.comboCount = 0;
        SuikaGame.config.lastMergeAt = 0;
        clearTimeout(SuikaGame.config.lineInvisibleTimer);
        document.getElementById('game-container').classList.remove('bomb-selecting');
        SuikaGame.fruits.currentFruit = null;
        SuikaGame.particles.activeParticles = [];
        SuikaGame.physics.clearLineWarnings();
        SuikaGame.ui.updateScore(0);
        SuikaGame.ui.updateCoinDisplays();

        if (SuikaGame.config.engine && SuikaGame.config.engine.world) {
            const bodies = Matter.Composite.allBodies(SuikaGame.config.engine.world);
            for (let i = 0; i < bodies.length; i++) {
                if (bodies[i].isFruit) {
                    Matter.World.remove(SuikaGame.config.engine.world, bodies[i]);
                }
            }
            const line = SuikaGame.physics.getGameOverLine();
            if (line) line.isLineHidden = false;
            SuikaGame.physics.applyTheme();
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
        const now = Date.now();

        SuikaGame.config.comboCount = now - SuikaGame.config.lastMergeAt <= 1800 ? SuikaGame.config.comboCount + 1 : 1;
        SuikaGame.config.lastMergeAt = now;
        if (SuikaGame.config.comboCount >= 4) SuikaGame.progress.unlock('combo-big');
        SuikaGame.progress.noteFruit(newFruitData.id, newFruitIndex);

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
        if (!SuikaGame.config.gameActive || SuikaGame.config.gameOver || SuikaGame.skins.getPowerCount(powerId) <= 0) {
            return false;
        }

        if (powerId === 'clear-small') {
            const targets = this.getLooseFruits().filter(body => body.fruitIndex <= 1);
            if (!targets.length) {
                SuikaGame.ui.showToast('Não há cerejas ou morangos soltos');
                return false;
            }
            if (!SuikaGame.skins.consumePower(powerId)) return false;
            targets.forEach(body => Matter.World.remove(SuikaGame.config.engine.world, body));
            SuikaGame.ui.showToast('Cerejas e morangos removidos');
        }

        if (powerId === 'hide-line') {
            if (!SuikaGame.skins.consumePower(powerId)) return false;
            SuikaGame.physics.hideGameOverLine(7000);
            SuikaGame.ui.showToast('Linha invisível por 7 segundos');
        }

        if (powerId === 'cherry-rain') {
            if (!SuikaGame.skins.consumePower(powerId)) return false;
            this.rainCherries();
            SuikaGame.ui.showToast('Chuva de cerejas!');
        }

        if (powerId === 'side-push') {
            const fruits = this.getLooseFruits();
            if (!fruits.length) {
                SuikaGame.ui.showToast('Não há frutas para chacoalhar');
                return false;
            }
            if (!SuikaGame.skins.consumePower(powerId)) return false;
            this.shakeFruits(fruits);
            SuikaGame.ui.showToast('Chacoalhão aplicado');
        }

        if (powerId === 'small-bomb') {
            const fruits = this.getLooseFruits();
            if (!fruits.length) {
                SuikaGame.ui.showToast('Não há frutas para eliminar');
                return false;
            }
            if (!SuikaGame.skins.consumePower(powerId)) return false;
            this.startBombSelection(Math.min(4, fruits.length));
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

    rainCherries: function () {
        const cherry = SuikaGame.fruits.types[0];
        const count = 6;

        for (let i = 0; i < count; i++) {
            const x = 34 + (i * ((SuikaGame.config.GAME_WIDTH - 68) / (count - 1)));
            const y = 46 + (i % 2) * 18;
            const body = SuikaGame.fruits.createFruitBody(x, y, cherry);
            body.launchTimestamp = Date.now();
            Matter.Body.setVelocity(body, { x: (i % 2 === 0 ? -0.6 : 0.6), y: 1.2 });
            Matter.World.add(SuikaGame.config.engine.world, body);
        }
    },

    shakeFruits: function (fruits) {
        const center = SuikaGame.config.GAME_WIDTH / 2;

        fruits.forEach((body, index) => {
            const edgeBias = body.position.x < center ? 1 : -1;
            const alternating = index % 2 === 0 ? 1 : -1;
            const horizontal = (edgeBias * 0.012) + (alternating * 0.016);
            const vertical = body.position.y > SuikaGame.config.GAME_HEIGHT * 0.52 ? -0.014 : 0.006;

            Matter.Body.applyForce(body, body.position, {
                x: horizontal * body.mass,
                y: vertical * body.mass
            });
            Matter.Body.setAngularVelocity(body, body.angularVelocity + alternating * 0.08);
        });
    },

    startBombSelection: function (count) {
        SuikaGame.config.bombSelectionRemaining = count;
        document.getElementById('game-container').classList.add('bomb-selecting');
        SuikaGame.ui.showToast(`Toque em ${count} frutas para eliminar`);
    },

    handleBombSelectionPointer: function (event) {
        if (!SuikaGame.config.bombSelectionRemaining || !event) return false;

        const fruit = this.getFruitAtClientPoint(event);
        if (!fruit) {
            SuikaGame.ui.showToast('Toque em uma fruta solta');
            return true;
        }

        Matter.World.remove(SuikaGame.config.engine.world, fruit);
        SuikaGame.particles.createParticles(fruit.position.x, fruit.position.y, fruit.render.fillStyle, 14);
        SuikaGame.config.bombSelectionRemaining -= 1;

        if (SuikaGame.config.bombSelectionRemaining <= 0 || !this.getLooseFruits().length) {
            SuikaGame.config.bombSelectionRemaining = 0;
            document.getElementById('game-container').classList.remove('bomb-selecting');
            SuikaGame.ui.showToast('Bomba concluída');
        } else {
            SuikaGame.ui.showToast(`${SuikaGame.config.bombSelectionRemaining} frutas restantes`);
        }

        return true;
    },

    getFruitAtClientPoint: function (event) {
        const canvas = document.getElementById('game-canvas');
        const rect = canvas.getBoundingClientRect();
        const source = event.changedTouches && event.changedTouches[0] ? event.changedTouches[0] : event;
        const x = (source.clientX - rect.left) * (SuikaGame.config.GAME_WIDTH / rect.width);
        const y = (source.clientY - rect.top) * (SuikaGame.config.GAME_HEIGHT / rect.height);

        return this.getLooseFruits()
            .filter(body => {
                const dx = body.position.x - x;
                const dy = body.position.y - y;
                return Math.sqrt(dx * dx + dy * dy) <= body.circleRadius + 10;
            })
            .sort((a, b) => {
                const da = Math.hypot(a.position.x - x, a.position.y - y);
                const db = Math.hypot(b.position.x - x, b.position.y - y);
                return da - db;
            })[0] || null;
    },

    endGame: function () {
        if (SuikaGame.config.gameOver) return;

        SuikaGame.config.gameOver = true;
        SuikaGame.config.gameActive = false;
        SuikaGame.config.bombSelectionRemaining = 0;
        document.getElementById('game-container').classList.remove('bomb-selecting');

        const earnedCoins = SuikaGame.skins.addCoins(SuikaGame.skins.getCoinsForScore(SuikaGame.config.score));
        const isNewHighScore = this.saveHighScore(SuikaGame.config.score);
        const highScore = this.getHighScore();
        SuikaGame.progress.recordGame(SuikaGame.config.score);
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
