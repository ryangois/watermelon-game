var SuikaGame = SuikaGame || {};

SuikaGame.ui = {
    initializeUI: function () {
        this.setupEventListeners();
        this.updateHighScoreDisplay();
        this.updateCoinDisplays();
        this.createEvolutionDiagram();
        this.renderShop();
        SuikaGame.skins.preloadAssets(SuikaGame.fruits.types).then(() => {
            this.createEvolutionDiagram();
            this.renderShop();
            SuikaGame.fruits.updateNextFruitPreview();
        });
        this.showMainMenu();
    },

    setupEventListeners: function () {
        document.getElementById('start-button').addEventListener('click', SuikaGame.game.startGame);
        document.getElementById('options-button').addEventListener('click', () => this.showOptions());
        document.getElementById('shop-button').addEventListener('click', () => this.showShop());
        document.getElementById('shop-close-button').addEventListener('click', () => this.showMainMenu());
        document.getElementById('easy-button').addEventListener('click', () => this.setDifficulty('easy'));
        document.getElementById('normal-button').addEventListener('click', () => this.setDifficulty('normal'));
        document.getElementById('hard-button').addEventListener('click', () => this.setDifficulty('hard'));
        document.getElementById('back-button').addEventListener('click', () => this.showMainMenu());
    },

    updateHighScoreDisplay: function () {
        const highScore = SuikaGame.game.getHighScore();
        document.getElementById('high-score').textContent = `Melhor pontuação: ${highScore}`;
    },

    updateCoinDisplays: function () {
        const coins = SuikaGame.skins.getCoins();

        document.getElementById('coin-balance').textContent = `Moedas: ${coins}`;
        document.getElementById('shop-coins').textContent = `Moedas: ${coins}`;
        document.getElementById('game-coins').textContent = `Moedas: ${coins}`;
    },

    showOptions: function () {
        document.getElementById('game-title').style.display = 'none';
        document.querySelector('.menu-stats').style.display = 'none';
        document.getElementById('start-button').style.display = 'none';
        document.getElementById('shop-button').style.display = 'none';
        document.getElementById('options-button').style.display = 'none';
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

        document.getElementById('game-title').style.display = 'block';
        document.querySelector('.menu-stats').style.display = 'grid';
        document.getElementById('start-button').style.display = 'inline-block';
        document.getElementById('shop-button').style.display = 'inline-block';
        document.getElementById('options-button').style.display = 'inline-block';
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

        for (let i = 0; i < SuikaGame.fruits.types.length; i++) {
            const fruit = SuikaGame.fruits.types[i];
            const fruitIcon = document.createElement('div');

            fruitIcon.className = 'fruit-icon';
            fruitIcon.style.backgroundColor = SuikaGame.fruits.getColorForFruit(fruit);
            fruitIcon.title = fruit.name;
            fruitIcon.appendChild(SuikaGame.fruits.createFruitPreview(fruit, 30));
            row.appendChild(fruitIcon);
        }

        diagram.appendChild(row);
    },

    renderShop: function () {
        const list = document.getElementById('skin-list');
        const activeId = SuikaGame.skins.getActiveId();
        const coins = SuikaGame.skins.getCoins();

        list.innerHTML = '';

        SuikaGame.skins.packs.forEach(pack => {
            const isUnlocked = SuikaGame.skins.isUnlocked(pack.id);
            const isActive = activeId === pack.id;
            const card = document.createElement('article');
            const preview = document.createElement('div');
            const body = document.createElement('div');
            const title = document.createElement('h3');
            const description = document.createElement('p');
            const price = document.createElement('span');
            const action = document.createElement('button');

            card.className = `skin-card ${pack.themeClass}`;
            preview.className = 'skin-preview';
            body.className = 'skin-card-body';
            title.textContent = pack.name;
            description.textContent = pack.description;
            price.className = 'skin-price';
            price.textContent = isUnlocked ? 'Desbloqueado' : `${pack.price} moedas`;

            SuikaGame.fruits.types.slice(0, 5).forEach(fruit => {
                const icon = document.createElement('div');
                const view = SuikaGame.skins.getFruitViewForPack
                    ? SuikaGame.skins.getFruitViewForPack(pack, fruit)
                    : this.getFruitViewForPackFallback(pack, fruit);

                icon.className = 'skin-preview-fruit';
                icon.style.backgroundColor = view.color;
                icon.appendChild(this.createSkinPreviewImage(fruit, view.image));
                preview.appendChild(icon);
            });

            action.className = 'skin-action';
            action.disabled = !isUnlocked && coins < pack.price;
            action.textContent = isActive ? 'Equipada' : isUnlocked ? 'Equipar' : coins >= pack.price ? 'Comprar' : 'Bloqueada';
            action.addEventListener('click', () => {
                if (isUnlocked) {
                    SuikaGame.skins.setActive(pack.id);
                } else {
                    SuikaGame.skins.buyPack(pack.id);
                }

                SuikaGame.fruits.updateNextFruitPreview();
                this.createEvolutionDiagram();
                this.updateCoinDisplays();
                this.renderShop();
            });

            body.appendChild(title);
            body.appendChild(description);
            body.appendChild(price);
            body.appendChild(action);
            card.appendChild(preview);
            card.appendChild(body);
            list.appendChild(card);
        });
    },

    getFruitViewForPackFallback: function (pack, fruit) {
        return {
            image: pack.images && pack.images[fruit.id] ? pack.images[fruit.id] : fruit.image,
            color: pack.colorShift && pack.colorShift[fruit.id] ? pack.colorShift[fruit.id] : fruit.color
        };
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
