var SuikaGame = SuikaGame || {};

SuikaGame.ui = {
    activeShopTab: 'skins',
    tutorialIndex: 0,
    deferredInstallPrompt: null,

    initializeUI: function () {
        SuikaGame.skins.applyActiveTheme();
        this.registerServiceWorker();
        this.setupEventListeners();
        this.initializeAuthUI();
        this.updateHighScoreDisplay();
        this.updateCoinDisplays();
        this.updateDifficultyDisplay();
        this.updateMuteButton();
        this.updateAccessibilityControls();
        this.createEvolutionDiagram();
        this.renderShop();
        this.renderMedalStrip();
        this.renderRankingStats();
        this.renderDailyPanel();
        this.setupPwaInstall();
        SuikaGame.skins.preloadAssets(SuikaGame.fruits.types).then(() => {
            this.createEvolutionDiagram();
            this.renderShop();
            SuikaGame.fruits.updateNextFruitPreview();
        });
        this.showMainMenu();
    },

    setupEventListeners: function () {
        document.getElementById('start-button').addEventListener('click', () => SuikaGame.game.startGame());
        document.getElementById('options-button').addEventListener('click', () => this.showOptions());
        document.getElementById('shop-button').addEventListener('click', () => this.showShop());
        document.getElementById('shop-close-button').addEventListener('click', () => this.showMainMenu());
        document.getElementById('login-button').addEventListener('click', () => this.handleLoginClick());
        document.getElementById('mute-button').addEventListener('click', () => SuikaGame.audio.toggleMute());
        document.getElementById('game-options-button').addEventListener('click', () => this.setGameOptionsOpen(true));
        document.getElementById('game-options-close-button').addEventListener('click', () => this.setGameOptionsOpen(false));
        document.getElementById('fullscreen-button').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('pause-button').addEventListener('click', () => SuikaGame.game.togglePause());
        document.getElementById('game-return-menu-button').addEventListener('click', () => this.returnToMenuFromGame());
        document.getElementById('tutorial-next-button').addEventListener('click', () => this.nextTutorialStep());
        document.getElementById('tutorial-skip-button').addEventListener('click', () => this.closeTutorial(true));
        document.getElementById('pwa-install-button').addEventListener('click', () => this.installPwa());
        document.getElementById('pwa-dismiss-button').addEventListener('click', () => this.dismissPwaBanner());
        document.getElementById('pack-preview-close').addEventListener('click', () => this.closePackPreview());
        document.addEventListener('fullscreenchange', () => this.updateFullscreenButton());
        document.addEventListener('webkitfullscreenchange', () => this.updateFullscreenButton());
        document.getElementById('easy-button').addEventListener('click', () => this.setDifficulty('easy'));
        document.getElementById('normal-button').addEventListener('click', () => this.setDifficulty('normal'));
        document.getElementById('hard-button').addEventListener('click', () => this.setDifficulty('hard'));
        document.getElementById('back-button').addEventListener('click', () => this.showMainMenu());
        document.getElementById('move-left-button').addEventListener('click', () => SuikaGame.physics.moveBy(-34));
        document.getElementById('move-right-button').addEventListener('click', () => SuikaGame.physics.moveBy(34));
        document.getElementById('drop-button').addEventListener('click', () => SuikaGame.physics.dropFruit());
        document.getElementById('accessibility-toggle').addEventListener('change', event => {
            SuikaGame.skins.setAccessibilityControlsEnabled(event.target.checked);
            this.updateAccessibilityControls();
        });
        document.getElementById('fruit-radius-toggle').addEventListener('change', event => {
            SuikaGame.skins.setFruitRadiusOverlayEnabled(event.target.checked);
            this.updateAccessibilityControls();
        });
        document.getElementById('game-mute-toggle').addEventListener('change', event => {
            SuikaGame.skins.setMuted(event.target.checked);
            if (SuikaGame.audio.backgroundMusic) {
                SuikaGame.audio.backgroundMusic.muted = event.target.checked;
                if (!event.target.checked) SuikaGame.audio.backgroundMusic.play().catch(function () {});
            }
            this.updateMuteButton();
        });
        document.getElementById('game-accessibility-toggle').addEventListener('change', event => {
            SuikaGame.skins.setAccessibilityControlsEnabled(event.target.checked);
            this.updateAccessibilityControls();
        });
        document.getElementById('game-fruit-radius-toggle').addEventListener('change', event => {
            SuikaGame.skins.setFruitRadiusOverlayEnabled(event.target.checked);
            this.updateAccessibilityControls();
        });

        document.querySelectorAll('.shop-tab').forEach(tab => {
            tab.addEventListener('click', () => this.setShopTab(tab.dataset.shopTab));
        });

        window.addEventListener('beforeinstallprompt', event => {
            event.preventDefault();
            this.deferredInstallPrompt = event;
            this.renderPwaBanner();
        });
    },

    initializeAuthUI: function () {
        const bindAuth = () => {
            if (!window.SuikaAuth || this.authBound) return;

            this.authBound = true;
            window.SuikaAuth.listen(({ user, status, error }) => {
                this.updateLoginButton(user, status);
                if (error) this.showToast(this.getAuthErrorMessage(error));
            });
        };

        bindAuth();
        window.addEventListener('suika-auth-ready', bindAuth);
        setTimeout(bindAuth, 1200);
        setTimeout(() => {
            if (!window.SuikaAuth && !this.authBound) {
                this.updateLoginButton(null, 'signed-out');
            }
        }, 2600);
    },

    handleLoginClick: function () {
        const auth = window.SuikaAuth;

        if (!auth) {
            this.showToast('Login indisponível. Verifique conexão e domínio autorizado');
            return;
        }

        const user = auth.getUser();
        const action = user ? auth.logout() : auth.login();

        Promise.resolve(action).catch(error => {
            this.showToast(this.getAuthErrorMessage(error));
        });
    },

    updateLoginButton: function (user, status) {
        const button = document.getElementById('login-button');
        if (!button) return;

        button.classList.toggle('signed-in', Boolean(user));
        button.disabled = status === 'loading' || status === 'signing-in' || status === 'signing-out';

        if (status === 'loading') {
            button.innerHTML = 'Google <span>carregando</span>';
            return;
        }

        if (status === 'signing-in') {
            button.innerHTML = 'Entrando <span>Google</span>';
            return;
        }

        if (status === 'signing-out') {
            button.innerHTML = 'Saindo <span>aguarde</span>';
            return;
        }

        if (user) {
            const firstName = (user.name || 'Jogador').split(' ')[0];
            button.innerHTML = `${firstName} <span>Sair</span>`;
            return;
        }

        button.innerHTML = 'Entrar com Google <span>online</span>';
    },

    getAuthErrorMessage: function (error) {
        const code = error && error.code ? error.code : '';

        if (code.includes('unauthorized-domain')) {
            return 'Autorize este domínio no Firebase Auth';
        }

        if (code.includes('popup-closed-by-user') || code.includes('cancelled-popup-request')) {
            return 'Login cancelado';
        }

        if (code.includes('network-request-failed')) {
            return 'Falha de rede no login';
        }

        return 'Não foi possível entrar com Google';
    },

    registerServiceWorker: function () {
        if (!('serviceWorker' in navigator)) return;

        navigator.serviceWorker.register('service-worker.js').catch(function () {});
    },

    setupPwaInstall: function () {
        this.renderPwaBanner();
    },

    renderPwaBanner: function () {
        const banner = document.getElementById('pwa-install-banner');
        if (!banner) return;

        const dismissed = localStorage.getItem('suikaPwaBannerDismissed') === 'true';
        const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
        banner.classList.toggle('visible', !dismissed && !standalone);
    },

    installPwa: function () {
        if (!this.deferredInstallPrompt) {
            this.showToast('Use o menu do navegador para adicionar à tela inicial');
            this.dismissPwaBanner();
            return;
        }

        this.deferredInstallPrompt.prompt();
        this.deferredInstallPrompt.userChoice.finally(() => {
            this.deferredInstallPrompt = null;
            this.dismissPwaBanner();
        });
    },

    dismissPwaBanner: function () {
        localStorage.setItem('suikaPwaBannerDismissed', 'true');
        document.getElementById('pwa-install-banner').classList.remove('visible');
    },

    maybeShowTutorial: function () {
        if (localStorage.getItem('suikaTutorialDone') === 'true') return;
        this.tutorialIndex = 0;
        this.renderTutorial();
        document.getElementById('tutorial-overlay').classList.add('open');
    },

    renderTutorial: function () {
        const steps = [
            { title: 'Mova a fruta', text: 'Arraste dentro do pote ou use os botões para posicionar a fruta antes de soltar.', hint: 'Arraste aqui', target: 'drop' },
            { title: 'Solte com intenção', text: 'Toque no pote ou no botão Soltar. Frutas iguais se juntam e viram frutas maiores.', hint: 'Solte aqui', target: 'controls' },
            { title: 'Olhe os atalhos', text: 'A próxima fruta fica no topo, os poderes ficam na lateral e a evolução aparece abaixo no celular.', hint: 'HUD e poderes', target: 'hud' }
        ];
        const step = steps[this.tutorialIndex];
        document.getElementById('tutorial-overlay').dataset.target = step.target;
        document.getElementById('tutorial-step').innerHTML = `<span>${step.hint}</span><h2>${step.title}</h2><p>${step.text}</p><strong>${this.tutorialIndex + 1}/3</strong>`;
        document.getElementById('tutorial-next-button').textContent = this.tutorialIndex === steps.length - 1 ? 'Jogar' : 'Próximo';
    },

    nextTutorialStep: function () {
        this.tutorialIndex += 1;
        if (this.tutorialIndex >= 3) {
            this.closeTutorial(true);
            return;
        }
        this.renderTutorial();
    },

    closeTutorial: function (persist) {
        document.getElementById('tutorial-overlay').classList.remove('open');
        if (persist) localStorage.setItem('suikaTutorialDone', 'true');
    },

    haptic: function (duration) {
        if (navigator.vibrate) navigator.vibrate(duration);
    },

    requestFullscreen: function (silent) {
        const target = document.documentElement;
        const request = target.requestFullscreen ||
            target.webkitRequestFullscreen ||
            target.msRequestFullscreen;

        if (!request) {
            if (!silent) this.showToast('Tela cheia não suportada neste navegador');
            this.updateFullscreenButton();
            return Promise.resolve(false);
        }

        if (this.getFullscreenElement()) {
            if (!silent) this.showToast('Tela cheia já ativa');
            this.updateFullscreenButton();
            return Promise.resolve(true);
        }

        return Promise.resolve(request.call(target))
            .then(() => {
                if (!silent) this.showToast('Tela cheia ativada');
                this.updateFullscreenButton();
                return true;
            })
            .catch(() => {
                if (!silent) this.showToast('Use o botão do navegador ou instale o app');
                this.updateFullscreenButton();
                return false;
            });
    },

    exitFullscreen: function () {
        const exit = document.exitFullscreen ||
            document.webkitExitFullscreen ||
            document.msExitFullscreen;

        if (!exit || !this.getFullscreenElement()) {
            this.updateFullscreenButton();
            return Promise.resolve(false);
        }

        return Promise.resolve(exit.call(document))
            .then(() => {
                this.showToast('Tela cheia desativada');
                this.updateFullscreenButton();
                return true;
            })
            .catch(() => {
                this.showToast('Não foi possível sair da tela cheia');
                this.updateFullscreenButton();
                return false;
            });
    },

    toggleFullscreen: function () {
        if (this.getFullscreenElement()) {
            return this.exitFullscreen();
        }

        return this.requestFullscreen(false);
    },

    getFullscreenElement: function () {
        return document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement ||
            null;
    },

    updateFullscreenButton: function () {
        const button = document.getElementById('fullscreen-button');
        if (!button) return;

        const isFullscreen = Boolean(this.getFullscreenElement());
        button.textContent = isFullscreen ? 'Sair da tela cheia' : 'Tela cheia';
        button.setAttribute('aria-label', isFullscreen ? 'Sair da tela cheia' : 'Abrir em tela cheia');
    },

    updatePauseButton: function () {
        const button = document.getElementById('pause-button');
        if (!button) return;
        button.textContent = SuikaGame.config.paused ? 'Continuar' : 'Pausar';
    },

    showCombo: function (comboCount) {
        const badge = document.getElementById('combo-badge');
        if (!badge || comboCount < 2) return;

        clearTimeout(this.comboTimer);
        badge.textContent = `Combo x${comboCount}`;
        badge.classList.add('visible');
        this.comboTimer = setTimeout(() => badge.classList.remove('visible'), 1100);
    },

    updateHighScoreDisplay: function () {
        document.getElementById('high-score').textContent = `Melhor pontuação: ${SuikaGame.game.getHighScore()}`;
    },

    updateCoinDisplays: function () {
        const coins = SuikaGame.skins.getCoins();
        document.getElementById('coin-balance').textContent = `Moedas: ${coins}`;
        document.getElementById('shop-coins').textContent = `Moedas: ${coins}`;
        document.getElementById('game-coins').textContent = `Moedas: ${coins}`;
    },

    updateDifficultyDisplay: function () {
        const level = SuikaGame.config.currentDifficulty;
        const settings = SuikaGame.config.DIFFICULTY_LEVELS[level];
        document.getElementById('difficulty-status').textContent = `Dificuldade: ${settings.label}`;

        document.querySelectorAll('.difficulty-button').forEach(button => {
            button.classList.toggle('selected', button.dataset.level === level);
        });
    },

    updateMuteButton: function () {
        const button = document.getElementById('mute-button');
        const gameToggle = document.getElementById('game-mute-toggle');
        button.textContent = SuikaGame.skins.isMuted() ? '×♪' : '♪';
        button.setAttribute('aria-label', SuikaGame.skins.isMuted() ? 'Ativar música' : 'Mutar música');
        if (gameToggle) gameToggle.checked = SuikaGame.skins.isMuted();
    },

    updateAccessibilityControls: function () {
        const enabled = SuikaGame.skins.areAccessibilityControlsEnabled();
        const radiusOverlayEnabled = SuikaGame.skins.isFruitRadiusOverlayEnabled();
        const toggle = document.getElementById('accessibility-toggle');
        const radiusToggle = document.getElementById('fruit-radius-toggle');
        const gameToggle = document.getElementById('game-accessibility-toggle');
        const gameRadiusToggle = document.getElementById('game-fruit-radius-toggle');
        const controls = document.getElementById('game-controls');

        if (toggle) toggle.checked = enabled;
        if (radiusToggle) radiusToggle.checked = radiusOverlayEnabled;
        if (gameToggle) gameToggle.checked = enabled;
        if (gameRadiusToggle) gameRadiusToggle.checked = radiusOverlayEnabled;
        if (controls) controls.classList.toggle('enabled', enabled);
    },

    setGameOptionsOpen: function (open) {
        const panel = document.getElementById('game-options-panel');
        if (!panel) return;
        this.updateMuteButton();
        this.updateAccessibilityControls();
        this.updateFullscreenButton();
        this.updatePauseButton();
        panel.classList.toggle('open', open);
    },

    returnToMenuFromGame: function () {
        this.setGameOptionsOpen(false);
        SuikaGame.config.gameActive = false;
        SuikaGame.game.resetGame();
        SuikaGame.audio.stopBackgroundMusic();
        this.showMainMenu();
    },

    showOptions: function () {
        document.getElementById('game-title').textContent = 'Opções';
        document.getElementById('game-title').style.display = 'block';
        document.querySelector('.menu-stats').style.display = 'none';
        document.querySelector('.menu-actions').style.display = 'none';
        document.getElementById('login-button').style.display = 'none';
        document.getElementById('how-to-play').style.display = 'none';
        document.getElementById('medal-strip').style.display = 'none';
        document.getElementById('ranking-stats').style.display = 'none';
        document.getElementById('daily-panel').style.display = 'none';
        document.getElementById('difficulty-buttons').style.display = 'grid';
    },

    showShop: function () {
        this.updateCoinDisplays();
        this.renderShop();
        document.getElementById('menu-container').style.display = 'none';
        document.getElementById('shop-container').style.display = 'flex';
        document.getElementById('game-area').style.display = 'none';
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('fruit-evolution').style.display = 'none';
        this.setGameOptionsOpen(false);
    },

    showMainMenu: function () {
        SuikaGame.skins.applyActiveTheme();
        this.updateHighScoreDisplay();
        this.updateCoinDisplays();
        this.updateDifficultyDisplay();
        this.updateAccessibilityControls();
        this.renderMedalStrip();
        this.renderRankingStats();
        this.renderDailyPanel();

        document.getElementById('game-title').textContent = 'Suika Game';
        document.getElementById('game-title').style.display = 'block';
        document.querySelector('.menu-stats').style.display = 'grid';
        document.querySelector('.menu-actions').style.display = 'grid';
        document.getElementById('login-button').style.display = 'flex';
        document.getElementById('how-to-play').style.display = 'block';
        document.getElementById('medal-strip').style.display = 'flex';
        document.getElementById('ranking-stats').style.display = 'grid';
        document.getElementById('daily-panel').style.display = 'grid';
        document.getElementById('difficulty-buttons').style.display = 'none';
        document.getElementById('menu-container').style.display = 'flex';
        document.getElementById('shop-container').style.display = 'none';
        document.getElementById('game-area').style.display = 'none';
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('fruit-evolution').style.display = 'none';
        this.setGameOptionsOpen(false);
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

        SuikaGame.fruits.types.filter(fruit => !fruit.hiddenFromEvolution).forEach(fruit => {
            const fruitIcon = document.createElement('div');
            fruitIcon.className = 'fruit-icon';
            fruitIcon.style.backgroundColor = SuikaGame.fruits.getColorForFruit(fruit);
            fruitIcon.title = fruit.name;
            fruitIcon.appendChild(SuikaGame.fruits.createFruitPreview(fruit, 30));
            row.appendChild(fruitIcon);
        });

        diagram.appendChild(row);
    },

    setShopTab: function (tabName) {
        this.activeShopTab = tabName;
        document.querySelectorAll('.shop-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.shopTab === tabName));
        document.querySelectorAll('.shop-list').forEach(panel => panel.classList.toggle('active', panel.dataset.panel === tabName));
    },

    renderShop: function () {
        this.renderSkinShop();
        this.renderThemeShop();
        this.renderMusicShop();
        this.renderPowerShop();
        this.setShopTab(this.activeShopTab);
    },

    renderSkinShop: function () {
        const list = document.getElementById('skin-list');
        const activeId = SuikaGame.skins.getActiveId();
        const coins = SuikaGame.skins.getCoins();

        list.innerHTML = '';
        SuikaGame.skins.packs.forEach(pack => {
            const isUnlocked = SuikaGame.skins.isSkinUnlocked(pack.id);
            const isActive = activeId === pack.id;
            const price = SuikaGame.skins.getSkinPrice(pack);
            const card = this.createShopCard(pack.name, pack.description, isUnlocked ? 'Skin liberada' : `Skin: ${price} moedas`, pack.themeClass);
            const action = card.querySelector('.shop-action');

            this.decoratePackCard(card, pack, 'fruits', 'skin');
            this.addRarityBadge(card, pack);

            this.setShopCardState(card, isActive ? 'equipped' : isUnlocked ? 'owned' : coins >= price ? 'buy' : 'locked', isActive ? 'Equipada' : isUnlocked ? 'Comprada' : coins >= price ? 'Disponível' : `Faltam ${price - coins}`);
            this.setShopActionState(action, isActive ? 'active' : isUnlocked ? 'available' : coins >= price ? 'buy' : 'locked', isActive ? 'Equipada' : isUnlocked ? 'Equipar skin' : coins >= price ? 'Comprar skin' : 'Sem moedas');
            action.addEventListener('click', event => {
                event.stopPropagation();
                if (isActive) {
                    this.showToast('Skin já equipada');
                } else if (isUnlocked) {
                    SuikaGame.skins.setActive(pack.id);
                    this.afterShopAction('Skin equipada');
                } else if (SuikaGame.skins.buySkinPack(pack.id)) {
                    SuikaGame.skins.setActive(pack.id);
                    this.afterShopAction('Frutas compradas e equipadas');
                } else {
                    this.showToast('Moedas insuficientes');
                }
            });
            list.appendChild(card);
        });
    },

    renderThemeShop: function () {
        const list = document.getElementById('theme-list');
        const activeId = SuikaGame.skins.getActiveThemeId();
        const coins = SuikaGame.skins.getCoins();

        list.innerHTML = '';
        SuikaGame.skins.packs.forEach(pack => {
            const isUnlocked = SuikaGame.skins.isThemeUnlocked(pack.id);
            const isActive = activeId === pack.id;
            const price = SuikaGame.skins.getThemePrice(pack);
            const card = this.createShopCard(pack.name, 'Tema do menu, pote, caixa de evolução e linha final', isUnlocked ? 'Tema liberado' : `Tema: ${price} moedas`, pack.themeClass);
            const action = card.querySelector('.shop-action');

            this.decoratePackCard(card, pack, 'theme', 'theme');
            this.addRarityBadge(card, pack);

            this.setShopCardState(card, isActive ? 'equipped' : isUnlocked ? 'owned' : coins >= price ? 'buy' : 'locked', isActive ? 'Ativo' : isUnlocked ? 'Comprado' : coins >= price ? 'Disponível' : `Faltam ${price - coins}`);
            this.setShopActionState(action, isActive ? 'active' : isUnlocked ? 'available' : coins >= price ? 'buy' : 'locked', isActive ? 'Ativo' : isUnlocked ? 'Equipar tema' : coins >= price ? 'Comprar tema' : 'Sem moedas');
            action.addEventListener('click', event => {
                event.stopPropagation();
                if (isActive) {
                    this.showToast('Tema já ativo');
                } else if (isUnlocked) {
                    SuikaGame.skins.setActiveTheme(pack.id);
                    this.afterShopAction('Tema equipado');
                } else if (SuikaGame.skins.buyThemePack(pack.id)) {
                    SuikaGame.skins.setActiveTheme(pack.id);
                    this.afterShopAction('Tema comprado e equipado');
                } else {
                    this.showToast('Moedas insuficientes');
                }
            });
            list.appendChild(card);
        });
    },

    renderMusicShop: function () {
        const list = document.getElementById('music-list');
        const activeId = SuikaGame.skins.getActiveTrackId();
        const coins = SuikaGame.skins.getCoins();

        list.innerHTML = '';
        SuikaGame.skins.tracks.forEach(track => {
            const isUnlocked = SuikaGame.skins.isTrackUnlocked(track.id);
            const isActive = activeId === track.id;
            const card = this.createShopCard(track.name, track.description, isUnlocked ? 'Desbloqueada' : `${track.price} moedas`, 'music-card');
            const preview = card.querySelector('.shop-preview');
            const action = card.querySelector('.shop-action');
            preview.textContent = track.icon || '♪';
            preview.classList.add('music-preview');
            this.setShopCardState(card, isActive ? 'equipped' : isUnlocked ? 'owned' : coins >= track.price ? 'buy' : 'locked', isActive ? 'Tocando' : isUnlocked ? 'Comprada' : coins >= track.price ? 'Disponível' : `Faltam ${track.price - coins}`);
            this.setShopActionState(action, isActive ? 'active' : isUnlocked ? 'available' : coins >= track.price ? 'buy' : 'locked', isActive ? 'Tocando' : isUnlocked ? 'Equipar' : coins >= track.price ? 'Comprar' : 'Sem moedas');
            action.addEventListener('click', () => {
                if (isActive) {
                    this.showToast('Música já ativa');
                } else if (isUnlocked) {
                    SuikaGame.skins.setActiveTrack(track.id);
                    this.showToast('Música equipada');
                } else if (SuikaGame.skins.buyTrack(track.id)) {
                    this.showToast('Música comprada e equipada');
                } else {
                    this.showToast('Moedas insuficientes');
                }
                SuikaGame.audio.stopBackgroundMusic();
                this.afterShopAction();
            });
            list.appendChild(card);
        });
    },

    renderPowerShop: function () {
        const list = document.getElementById('power-list');
        const coins = SuikaGame.skins.getCoins();

        list.innerHTML = '';
        SuikaGame.skins.powers.forEach(power => {
            const count = SuikaGame.skins.getPowerCount(power.id);
            const card = this.createShopCard(power.name, power.description, `${power.price} moedas · Você tem ${count}`, 'power-card');
            const preview = card.querySelector('.shop-preview');
            const action = card.querySelector('.shop-action');
            preview.textContent = power.icon || '+';
            preview.classList.add('power-preview');
            this.setShopCardState(card, coins >= power.price ? 'buy' : 'locked', coins >= power.price ? `Você tem ${count}` : `Faltam ${power.price - coins}`);
            this.setShopActionState(action, coins >= power.price ? 'buy' : 'locked', coins >= power.price ? 'Comprar' : 'Sem moedas');
            action.addEventListener('click', () => {
                if (SuikaGame.skins.buyPower(power.id)) {
                    this.afterShopAction(`${power.name} comprado`);
                } else {
                    this.showToast('Moedas insuficientes');
                }
            });
            list.appendChild(card);
        });
    },

    createShopCard: function (title, description, price, className) {
        const card = document.createElement('article');
        card.className = `shop-card ${className}`;
        card.innerHTML = `
            <div class="shop-preview"></div>
            <div class="shop-card-body">
                <h3>${title}</h3>
                <p>${description}</p>
                <div class="shop-card-footer">
                    <div class="shop-meta">
                        <span class="shop-price">${price}</span>
                        <small class="shop-status"></small>
                    </div>
                    <button class="shop-action"></button>
                </div>
            </div>
        `;
        return card;
    },

    setShopCardState: function (card, state, status) {
        card.dataset.shopStatus = state;
        const label = card.querySelector('.shop-status');
        if (label) label.textContent = status;
    },

    setShopActionState: function (action, state, label) {
        action.disabled = state === 'locked' || state === 'active';
        action.dataset.state = state;
        action.textContent = label;
    },

    decoratePackCard: function (card, pack, mode, category) {
        const preview = card.querySelector('.shop-preview');
        const theme = SuikaGame.skins.getThemeForPack(pack);

        preview.classList.add('theme-preview');
        preview.style.background = mode === 'theme' ? theme.preview : theme.vars['--panel-soft'];

        SuikaGame.fruits.types.filter(fruit => !fruit.hiddenFromEvolution).slice(0, mode === 'theme' ? 3 : 5).forEach(fruit => {
            const icon = document.createElement('div');
            const view = SuikaGame.skins.getFruitViewForPack(pack, fruit);
            icon.className = 'skin-preview-fruit';
            icon.style.backgroundColor = view.color;
            icon.appendChild(this.createSkinPreviewImage(fruit, view.image));
            preview.appendChild(icon);
        });

        card.appendChild(this.createPackDetails(pack, category));
        card.addEventListener('click', event => {
            if (event.target.closest('button')) return;
            card.classList.toggle('expanded');
        });
    },

    createPackDetails: function (pack, category) {
        const details = document.createElement('div');
        const theme = SuikaGame.skins.getThemeForPack(pack);
        const fruitRow = document.createElement('div');
        const swatches = document.createElement('div');
        const actions = document.createElement('div');

        details.className = 'pack-details';
        fruitRow.className = 'pack-fruit-row';
        swatches.className = 'theme-swatches';
        actions.className = 'pack-extra-actions';

        SuikaGame.fruits.types.filter(fruit => !fruit.hiddenFromEvolution).forEach(fruit => {
            const icon = document.createElement('div');
            const view = SuikaGame.skins.getFruitViewForPack(pack, fruit);
            icon.className = 'skin-preview-fruit';
            icon.style.backgroundColor = view.color;
            icon.title = fruit.name;
            icon.appendChild(this.createSkinPreviewImage(fruit, view.image));
            fruitRow.appendChild(icon);
        });

        [
            ['Menu', theme.preview],
            ['Jogo', theme.vars['--canvas-bg']],
            ['Linha', theme.vars['--danger-line']]
        ].forEach(([label, color]) => {
            const swatch = document.createElement('span');
            swatch.innerHTML = `<i></i>${label}`;
            swatch.querySelector('i').style.background = color;
            swatches.appendChild(swatch);
        });

        details.appendChild(fruitRow);
        details.appendChild(swatches);
        actions.appendChild(this.createPreviewButton(pack));
        if (pack.id !== 'classic' && (!SuikaGame.skins.isSkinUnlocked(pack.id) || !SuikaGame.skins.isThemeUnlocked(pack.id))) {
            actions.appendChild(this.createBundleButton(pack, category));
        }
        details.appendChild(actions);
        return details;
    },

    addRarityBadge: function (card, pack) {
        const badge = document.createElement('span');
        badge.className = `rarity-badge rarity-${pack.rarity || 'comum'}`;
        badge.textContent = pack.rarity || 'comum';
        card.querySelector('.shop-card-body').insertBefore(badge, card.querySelector('.shop-card-body h3').nextSibling);
    },

    createPreviewButton: function (pack) {
        const button = document.createElement('button');
        button.className = 'shop-action preview-action';
        button.dataset.state = 'preview';
        button.textContent = 'Prévia';
        button.addEventListener('click', event => {
            event.stopPropagation();
            this.openPackPreview(pack);
        });
        return button;
    },

    createBundleButton: function (pack) {
        const button = document.createElement('button');
        const price = SuikaGame.skins.getBundlePrice(pack);
        const coins = SuikaGame.skins.getCoins();
        button.className = 'shop-action bundle-action';
        button.dataset.state = coins >= price ? 'bundle' : 'locked';
        button.disabled = coins < price;
        button.textContent = coins >= price ? `Bundle ${price}` : `Faltam ${price - coins}`;
        button.addEventListener('click', event => {
            event.stopPropagation();
            if (SuikaGame.skins.buyBundle(pack.id)) {
                SuikaGame.skins.setActive(pack.id);
                SuikaGame.skins.setActiveTheme(pack.id);
                this.afterShopAction('Bundle comprado e equipado');
            } else {
                this.showToast('Moedas insuficientes');
            }
        });
        return button;
    },

    openPackPreview: function (pack) {
        const modal = document.getElementById('pack-preview-modal');
        const content = document.getElementById('pack-preview-content');
        const theme = SuikaGame.skins.getThemeForPack(pack);

        content.innerHTML = `<h2>${pack.name}</h2><p>${pack.description}</p>`;
        const stage = document.createElement('div');
        const row = document.createElement('div');
        const meta = document.createElement('div');

        stage.className = 'pack-preview-stage';
        stage.style.background = theme.preview;
        row.className = 'pack-fruit-row';
        meta.className = 'theme-swatches';

        SuikaGame.fruits.types.filter(fruit => !fruit.hiddenFromEvolution).forEach(fruit => {
            const icon = document.createElement('div');
            const view = SuikaGame.skins.getFruitViewForPack(pack, fruit);
            icon.className = 'skin-preview-fruit';
            icon.style.backgroundColor = view.color;
            icon.appendChild(this.createSkinPreviewImage(fruit, view.image));
            row.appendChild(icon);
        });

        [['Menu', theme.preview], ['Jogo', theme.vars['--canvas-bg']], ['Linha', theme.vars['--danger-line']]]
            .forEach(([label, color]) => {
                const item = document.createElement('span');
                item.innerHTML = `<i></i>${label}`;
                item.querySelector('i').style.background = color;
                meta.appendChild(item);
            });

        stage.appendChild(row);
        content.appendChild(stage);
        content.appendChild(meta);
        modal.classList.add('open');
    },

    closePackPreview: function () {
        document.getElementById('pack-preview-modal').classList.remove('open');
    },

    afterShopAction: function (message) {
        SuikaGame.skins.applyActiveTheme();
        SuikaGame.fruits.updateNextFruitPreview();
        this.createEvolutionDiagram();
        this.updateCoinDisplays();
        this.renderShop();
        this.renderMedalStrip();
        this.updatePowerToolbar();
        if (message) this.showToast(message);
    },

    updatePowerToolbar: function () {
        const toolbar = document.getElementById('power-toolbar');

        toolbar.innerHTML = '';
        SuikaGame.skins.powers.forEach(power => {
            const count = SuikaGame.skins.getPowerCount(power.id);
            const button = document.createElement('button');
            button.className = 'power-button';
            button.disabled = count <= 0 || !SuikaGame.config.gameActive;
            button.title = `${power.name} (${count})`;
            button.setAttribute('aria-label', `${power.name}: ${count} disponiveis`);
            button.innerHTML = `<span>${power.icon || '?'}</span><strong>${count}</strong><em>${power.name}</em>`;
            button.addEventListener('click', () => SuikaGame.game.usePower(power.id));
            toolbar.appendChild(button);
        });
    },

    renderMedalStrip: function () {
        const strip = document.getElementById('medal-strip');
        const unlocked = SuikaGame.progress.getUnlocked();
        strip.innerHTML = '';
        SuikaGame.progress.medals.forEach(medal => {
            const badge = document.createElement('span');
            badge.className = unlocked.includes(medal.id) ? 'medal unlocked' : 'medal';
            badge.title = medal.description;
            badge.textContent = medal.name;
            strip.appendChild(badge);
        });
    },

    renderRankingStats: function () {
        const container = document.getElementById('ranking-stats');
        if (!container) return;

        const stats = SuikaGame.progress.getStats();
        const bestFruit = typeof stats.bestFruitIndex === 'number' ? SuikaGame.fruits.types[stats.bestFruitIndex] : null;
        const items = [
            ['Partidas', stats.gamesPlayed || 0],
            ['Recorde', SuikaGame.game.getHighScore()],
            ['Melhor fruta', bestFruit ? bestFruit.name : '-']
        ];

        container.innerHTML = '';
        items.forEach(([label, value]) => {
            const item = document.createElement('span');
            item.innerHTML = `<strong>${value}</strong><small>${label}</small>`;
            container.appendChild(item);
        });
    },

    renderDailyPanel: function () {
        const container = document.getElementById('daily-panel');
        if (!container) return;

        const rewards = SuikaGame.progress.getDailyRewards();
        container.innerHTML = '';
        [
            ['mission', rewards.mission],
            ['chest', rewards.chest]
        ].forEach(([type, reward]) => {
            const item = document.createElement('button');
            item.className = 'daily-reward';
            item.disabled = !reward.ready || reward.claimed;
            item.innerHTML = `<strong>${reward.title}</strong><span>${reward.description}</span><small>${reward.claimed ? 'Coletado' : reward.ready ? `Coletar ${reward.reward}` : type === 'chest' ? `${Math.min(reward.progress, 3)}/3 partidas` : `+${reward.reward} moedas`}</small>`;
            item.addEventListener('click', () => {
                const amount = type === 'mission' ? SuikaGame.progress.claimDailyMission() : SuikaGame.progress.claimDailyChest();
                if (amount) {
                    this.updateCoinDisplays();
                    this.renderDailyPanel();
                    this.showToast(`+${amount} moedas`);
                }
            });
            container.appendChild(item);
        });
    },

    renderMedals: function (medalIds) {
        const container = document.getElementById('earned-medals');
        container.innerHTML = '';
        medalIds.forEach(id => {
            const medal = SuikaGame.progress.getMedal(id);
            if (!medal) return;
            const item = document.createElement('span');
            item.className = 'earned-medal';
            item.textContent = `Medalha: ${medal.name}`;
            container.appendChild(item);
        });
        this.renderMedalStrip();
    },

    createSkinPreviewImage: function (fruit, image) {
        const img = document.createElement('img');
        img.src = image;
        img.alt = fruit.name;
        img.onerror = function () {
            img.src = fruit.image;
        };
        return img;
    },

    showToast: function (message) {
        const toast = document.getElementById('toast');
        if (!toast) return;

        clearTimeout(this.toastTimer);
        toast.textContent = message;
        toast.classList.add('visible');
        this.toastTimer = setTimeout(() => {
            toast.classList.remove('visible');
        }, 1900);
    }
};
