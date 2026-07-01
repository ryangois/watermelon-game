var SuikaGame = SuikaGame || {};

SuikaGame.ui = {
    activeShopTab: 'skins',

    initializeUI: function () {
        this.setupEventListeners();
        this.updateHighScoreDisplay();
        this.updateCoinDisplays();
        this.updateDifficultyDisplay();
        this.updateMuteButton();
        this.createEvolutionDiagram();
        this.renderShop();
        this.renderMedalStrip();
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
        document.getElementById('easy-button').addEventListener('click', () => this.setDifficulty('easy'));
        document.getElementById('normal-button').addEventListener('click', () => this.setDifficulty('normal'));
        document.getElementById('hard-button').addEventListener('click', () => this.setDifficulty('hard'));
        document.getElementById('back-button').addEventListener('click', () => this.showMainMenu());
        document.getElementById('move-left-button').addEventListener('click', () => SuikaGame.physics.moveBy(-34));
        document.getElementById('move-right-button').addEventListener('click', () => SuikaGame.physics.moveBy(34));
        document.getElementById('drop-button').addEventListener('click', () => SuikaGame.physics.dropFruit());

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
        button.textContent = SuikaGame.skins.isMuted() ? '×♪' : '♪';
        button.setAttribute('aria-label', SuikaGame.skins.isMuted() ? 'Ativar música' : 'Mutar música');
    },

    showOptions: function () {
        document.getElementById('game-title').style.display = 'none';
        document.querySelector('.menu-stats').style.display = 'none';
        document.querySelector('.menu-actions').style.display = 'none';
        document.getElementById('login-button').style.display = 'none';
        document.getElementById('how-to-play').style.display = 'none';
        document.getElementById('medal-strip').style.display = 'none';
        document.getElementById('difficulty-buttons').style.display = 'grid';
    },

    showShop: function () {
        this.updateCoinDisplays();
        this.renderShop();
        document.getElementById('menu-container').style.display = 'none';
        document.getElementById('shop-container').style.display = 'flex';
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('fruit-evolution').style.display = 'none';
    },

    showMainMenu: function () {
        this.updateHighScoreDisplay();
        this.updateCoinDisplays();
        this.updateDifficultyDisplay();
        this.renderMedalStrip();

        document.getElementById('game-title').style.display = 'block';
        document.querySelector('.menu-stats').style.display = 'grid';
        document.querySelector('.menu-actions').style.display = 'grid';
        document.getElementById('login-button').style.display = 'flex';
        document.getElementById('how-to-play').style.display = 'block';
        document.getElementById('medal-strip').style.display = 'flex';
        document.getElementById('difficulty-buttons').style.display = 'none';
        document.getElementById('menu-container').style.display = 'flex';
        document.getElementById('shop-container').style.display = 'none';
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('fruit-evolution').style.display = 'none';
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

            SuikaGame.fruits.types.filter(fruit => !fruit.hiddenFromEvolution).slice(0, 5).forEach(fruit => {
                const icon = document.createElement('div');
                const view = SuikaGame.skins.getFruitViewForPack(pack, fruit);
                icon.className = 'skin-preview-fruit';
                icon.style.backgroundColor = view.color;
                icon.appendChild(this.createSkinPreviewImage(fruit, view.image));
                preview.appendChild(icon);
            });

            action.disabled = !isUnlocked && coins < pack.price;
            action.textContent = isActive ? 'Equipada' : isUnlocked ? 'Equipar' : coins >= pack.price ? 'Comprar' : 'Bloqueada';
            action.addEventListener('click', () => {
                if (isUnlocked) SuikaGame.skins.setActive(pack.id);
                else SuikaGame.skins.buyPack(pack.id);
                this.afterShopAction();
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
            action.disabled = !isUnlocked && coins < track.price;
            action.textContent = isActive ? 'Tocando' : isUnlocked ? 'Equipar' : coins >= track.price ? 'Comprar' : 'Bloqueada';
            action.addEventListener('click', () => {
                if (isUnlocked) SuikaGame.skins.setActiveTrack(track.id);
                else SuikaGame.skins.buyTrack(track.id);
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
            preview.textContent = '✦';
            preview.classList.add('power-preview');
            action.disabled = coins < power.price;
            action.textContent = coins >= power.price ? 'Comprar' : 'Sem moedas';
            action.addEventListener('click', () => {
                SuikaGame.skins.buyPower(power.id);
                this.afterShopAction();
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
                <span class="shop-price">${price}</span>
                <button class="shop-action"></button>
            </div>
        `;
        return card;
    },

    afterShopAction: function () {
        SuikaGame.fruits.updateNextFruitPreview();
        this.createEvolutionDiagram();
        this.updateCoinDisplays();
        this.renderShop();
        this.renderMedalStrip();
        this.updatePowerToolbar();
    },

    updatePowerToolbar: function () {
        const toolbar = document.getElementById('power-toolbar');
        toolbar.innerHTML = '';
        SuikaGame.skins.powers.forEach(power => {
            const count = SuikaGame.skins.getPowerCount(power.id);
            const button = document.createElement('button');
            button.className = 'power-button';
            button.disabled = count <= 0 || !SuikaGame.config.gameActive;
            button.textContent = `${power.name} (${count})`;
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
    }
};
