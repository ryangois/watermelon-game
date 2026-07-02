var SuikaGame = SuikaGame || {};

SuikaGame.ui = {
    activeShopTab: 'skins',

    initializeUI: function () {
        SuikaGame.skins.ensureTestCoins();
        SuikaGame.skins.applyActiveTheme();
        this.setupEventListeners();
        this.updateHighScoreDisplay();
        this.updateCoinDisplays();
        this.updateDifficultyDisplay();
        this.updateMuteButton();
        this.updateAccessibilityControls();
        this.createEvolutionDiagram();
        this.renderShop();
        this.renderMedalStrip();
        this.renderRankingStats();
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
        document.getElementById('mute-button').addEventListener('click', () => SuikaGame.audio.toggleMute());
        document.getElementById('game-options-button').addEventListener('click', () => this.setGameOptionsOpen(true));
        document.getElementById('game-options-close-button').addEventListener('click', () => this.setGameOptionsOpen(false));
        document.getElementById('game-return-menu-button').addEventListener('click', () => this.returnToMenuFromGame());
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

        document.getElementById('game-title').textContent = 'Suika Game';
        document.getElementById('game-title').style.display = 'block';
        document.querySelector('.menu-stats').style.display = 'grid';
        document.querySelector('.menu-actions').style.display = 'grid';
        document.getElementById('login-button').style.display = 'flex';
        document.getElementById('how-to-play').style.display = 'block';
        document.getElementById('medal-strip').style.display = 'flex';
        document.getElementById('ranking-stats').style.display = 'grid';
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
            const isUnlocked = SuikaGame.skins.isUnlocked(pack.id);
            const isActive = activeId === pack.id;
            const card = this.createShopCard(pack.name, pack.description, isUnlocked ? 'Desbloqueado' : `${pack.price} moedas`, pack.themeClass);
            const preview = card.querySelector('.shop-preview');
            const action = card.querySelector('.shop-action');

            this.decoratePackCard(card, pack, 'fruits');

            action.disabled = false;
            action.textContent = isActive ? 'Equipada' : isUnlocked ? 'Equipar' : coins >= pack.price ? 'Comprar' : 'Bloqueada';
            action.dataset.state = isActive ? 'active' : isUnlocked ? 'available' : coins >= pack.price ? 'buy' : 'locked';
            action.addEventListener('click', event => {
                event.stopPropagation();
                if (isActive) {
                    this.showToast('Skin já equipada');
                } else if (isUnlocked) {
                    SuikaGame.skins.setActive(pack.id);
                    this.afterShopAction('Skin equipada');
                } else if (SuikaGame.skins.buyPack(pack.id)) {
                    this.afterShopAction('Skin comprada e equipada');
                } else {
                    this.showToast('Moedas insuficientes');
                }
            });
            list.appendChild(card);
        });
    },

    renderThemeShop: function () {
        const list = document.getElementById('theme-list');
        const activeId = SuikaGame.skins.getActiveId();
        const coins = SuikaGame.skins.getCoins();

        list.innerHTML = '';
        SuikaGame.skins.packs.forEach(pack => {
            const isUnlocked = SuikaGame.skins.isUnlocked(pack.id);
            const isActive = activeId === pack.id;
            const card = this.createShopCard(pack.name, 'Tema do menu, pote, caixa de evolução e linha final', isUnlocked ? 'Desbloqueado' : `${pack.price} moedas`, pack.themeClass);
            const action = card.querySelector('.shop-action');

            this.decoratePackCard(card, pack, 'theme');

            action.disabled = false;
            action.textContent = isActive ? 'Ativo' : isUnlocked ? 'Equipar' : coins >= pack.price ? 'Comprar' : 'Bloqueado';
            action.dataset.state = isActive ? 'active' : isUnlocked ? 'available' : coins >= pack.price ? 'buy' : 'locked';
            action.addEventListener('click', event => {
                event.stopPropagation();
                if (isActive) {
                    this.showToast('Tema já ativo');
                } else if (isUnlocked) {
                    SuikaGame.skins.setActive(pack.id);
                    this.afterShopAction('Tema equipado');
                } else if (SuikaGame.skins.buyPack(pack.id)) {
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
            preview.textContent = '♪';
            preview.classList.add('music-preview');
            action.disabled = false;
            action.textContent = isActive ? 'Tocando' : isUnlocked ? 'Equipar' : coins >= track.price ? 'Comprar' : 'Bloqueada';
            action.dataset.state = isActive ? 'active' : isUnlocked ? 'available' : coins >= track.price ? 'buy' : 'locked';
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
        const icons = {
            'cherry-rain': 'C',
            'side-push': '↔',
            'hide-line': 'L',
            'small-bomb': 'B'
        };

        list.innerHTML = '';
        SuikaGame.skins.powers.forEach(power => {
            const count = SuikaGame.skins.getPowerCount(power.id);
            const card = this.createShopCard(power.name, power.description, `${power.price} moedas · Você tem ${count}`, 'power-card');
            const preview = card.querySelector('.shop-preview');
            const action = card.querySelector('.shop-action');
            preview.textContent = icons[power.id] || '+';
            preview.classList.add('power-preview');
            action.disabled = false;
            action.textContent = coins >= power.price ? 'Comprar' : 'Sem moedas';
            action.dataset.state = coins >= power.price ? 'buy' : 'locked';
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
                    <span class="shop-price">${price}</span>
                    <button class="shop-action"></button>
                </div>
            </div>
        `;
        return card;
    },

    decoratePackCard: function (card, pack, mode) {
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

        card.appendChild(this.createPackDetails(pack));
        card.addEventListener('click', event => {
            if (event.target.closest('button')) return;
            card.classList.toggle('expanded');
        });
    },

    createPackDetails: function (pack) {
        const details = document.createElement('div');
        const theme = SuikaGame.skins.getThemeForPack(pack);
        const fruitRow = document.createElement('div');
        const swatches = document.createElement('div');

        details.className = 'pack-details';
        fruitRow.className = 'pack-fruit-row';
        swatches.className = 'theme-swatches';

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
        return details;
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
        const icons = {
            'cherry-rain': 'C',
            'side-push': '↔',
            'hide-line': 'L',
            'small-bomb': 'B'
        };

        toolbar.innerHTML = '';
        SuikaGame.skins.powers.forEach(power => {
            const count = SuikaGame.skins.getPowerCount(power.id);
            const button = document.createElement('button');
            button.className = 'power-button';
            button.disabled = count <= 0 || !SuikaGame.config.gameActive;
            button.title = `${power.name} (${count})`;
            button.setAttribute('aria-label', `${power.name}: ${count} disponiveis`);
            button.innerHTML = `<span>${icons[power.id] || '?'}</span><strong>${count}</strong>`;
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
