var SuikaGame = SuikaGame || {};

SuikaGame.skins = {
    storageKeys: {
        coins: 'suikaCoins',
        unlocked: 'suikaUnlockedSkins',
        active: 'suikaActiveSkin',
        unlockedTracks: 'suikaUnlockedTracks',
        activeTrack: 'suikaActiveTrack',
        powers: 'suikaPowers',
        muted: 'suikaMuted',
        accessibilityControls: 'suikaAccessibilityControls',
        fruitRadiusOverlay: 'suikaFruitRadiusOverlay'
    },

    packs: [
        { id: 'classic', name: 'Clássico', description: 'Frutas originais', price: 0, unlockedByDefault: true, themeClass: 'skin-classic', colorShift: {} },
        { id: 'halloween', name: 'Halloween', description: 'Abóboras, fantasmas e slasher fruits', price: 120, assetFolder: 'assets/images/Halloween', themeClass: 'skin-halloween', colorShift: { cherry: '#ff6b35', strawberry: '#f72585', grape: '#5a189a', orange: '#fb8500', apple: '#b5179e', pear: '#6a994e', peach: '#ff9f1c', pineapple: '#fca311', melon: '#588157', watermelon: '#386641', jackfruit: '#8d6b25' } },
        { id: 'christmas', name: 'Natal', description: 'Gorros, neve, luzinhas e frutas festivas', price: 220, assetFolder: 'assets/images/Christmas', themeClass: 'skin-christmas', colorShift: { cherry: '#c1121f', strawberry: '#d90429', grape: '#6a4c93', orange: '#f77f00', apple: '#9d0208', pear: '#52b788', peach: '#ffcad4', pineapple: '#ffd166', melon: '#95d5b2', watermelon: '#2d6a4f', jackfruit: '#b7a57a' } },
        { id: 'sideral', name: 'Sideral', description: 'Planetas, estrelas e frutas astronautas', price: 360, assetFolder: 'assets/images/Sideral', themeClass: 'skin-sideral', colorShift: { cherry: '#ff4d6d', strawberry: '#ff006e', grape: '#7209b7', orange: '#f48c06', apple: '#3a86ff', pear: '#80ffdb', peach: '#ffafcc', pineapple: '#ffd60a', melon: '#48bfe3', watermelon: '#06d6a0', jackfruit: '#b8c0ff' } },
        { id: 'mythology', name: 'Mitologia', description: 'Deuses, titãs, ninfas e frutas lendárias', price: 520, assetFolder: 'assets/images/Mythology', themeClass: 'skin-mythology', colorShift: { cherry: '#e63946', strawberry: '#f77f00', grape: '#6d597a', orange: '#f4a261', apple: '#d4af37', pear: '#84a98c', peach: '#e9c46a', pineapple: '#c9a227', melon: '#2a9d8f', watermelon: '#457b9d', jackfruit: '#8d6e63' } },
        { id: 'ocean', name: 'Oceano', description: 'Piratas, sereias, corais e frutas submersas', price: 680, assetFolder: 'assets/images/Ocean', themeClass: 'skin-ocean', colorShift: { cherry: '#00b4d8', strawberry: '#48cae4', grape: '#5e60ce', orange: '#ffb703', apple: '#0077b6', pear: '#90e0ef', peach: '#ffd6a5', pineapple: '#f9c74f', melon: '#52b788', watermelon: '#0096c7', jackfruit: '#023e8a' } },
        { id: 'robot', name: 'Robôs', description: 'Frutas cromadas, neon e carinhas digitais', price: 850, assetFolder: 'assets/images/Robot', themeClass: 'skin-robot', colorShift: { cherry: '#ff0054', strawberry: '#ff5400', grape: '#8338ec', orange: '#fb8500', apple: '#00f5d4', pear: '#80ed99', peach: '#f15bb5', pineapple: '#fee440', melon: '#00bbf9', watermelon: '#00f5d4', jackfruit: '#adb5bd' } },
        { id: 'candy', name: 'Doceria', description: 'Balas, chantilly, chocolate e frutas sobremesa', price: 1100, assetFolder: 'assets/images/Candy', themeClass: 'skin-candy', colorShift: { cherry: '#ff5d8f', strawberry: '#ff8fab', grape: '#c77dff', orange: '#ffb703', apple: '#fb6f92', pear: '#b8f2e6', peach: '#ffc8dd', pineapple: '#fdffb6', melon: '#caffbf', watermelon: '#9bf6ff', jackfruit: '#ffd6a5' } },
        { id: 'luxury', name: 'Luxo', description: 'Dourado, diamantes, coroas e frutas premium', price: 1500, assetFolder: 'assets/images/Luxury', themeClass: 'skin-luxury', colorShift: { cherry: '#b8860b', strawberry: '#d4af37', grape: '#6f2dbd', orange: '#ffba08', apple: '#f5cb5c', pear: '#c9ada7', peach: '#ffd166', pineapple: '#f4d35e', melon: '#b7e4c7', watermelon: '#95d5b2', jackfruit: '#caa94a' } }
    ],

    tracks: [
        { id: 'fruit-groove', name: 'Fruit Groove', description: 'Trilha original animada', price: 0, src: 'assets/music/music-fruits.mp3' },
        { id: 'calm-harvest', name: 'Calm Harvest', description: 'Vibe mais calma para jogar focado', price: 180, src: 'assets/music/music-fruits.mp3' },
        { id: 'arcade-pop', name: 'Arcade Pop', description: 'Energia de fliperama para combos', price: 320, src: 'assets/music/music-fruits.mp3' },
        { id: 'boss-fruit', name: 'Boss Fruit', description: 'Trilha intensa para pontuações altas', price: 520, src: 'assets/music/music-fruits.mp3' }
    ],

    powers: [
        { id: 'clear-small', name: 'Limpar pequenas', description: 'Remove cerejas e morangos já soltos', price: 90 },
        { id: 'pop-lowest', name: 'Estourar menor', description: 'Remove a menor fruta solta do pote', price: 130 },
        { id: 'hide-line', name: 'Linha invisível', description: 'Esconde a linha final por 7 segundos', price: 160 },
        { id: 'clear-medium', name: 'Limpar médias', description: 'Remove uvas e laranjas já soltas', price: 210 }
    ],

    testCoinGrant: 9999,
    assetAvailability: {},

    themes: {
        classic: {
            background: 'linear-gradient(145deg, #fff2bf 0%, #eef3d1 46%, #bdf0dc 100%)',
            preview: 'linear-gradient(145deg, #fff2bf, #bdf0dc)',
            vars: { '--ink': '#2f261f', '--paper': '#fffaf0', '--panel': '#ffffff', '--panel-soft': '#fffdf8', '--red': '#e03131', '--teal': '#22998d', '--purple': '#7c2ec5', '--gold': '#f2b84b', '--canvas-bg': '#fff8ea', '--evolution-bg': 'rgba(255, 255, 255, 0.86)', '--danger-line': 'rgba(224, 49, 49, 0.58)' }
        },
        halloween: {
            background: 'radial-gradient(circle at 20% 12%, #ffd166 0 12%, transparent 26%), linear-gradient(145deg, #2d173f 0%, #692052 48%, #ff8f3d 100%)',
            preview: 'linear-gradient(145deg, #2d173f, #ff8f3d)',
            vars: { '--ink': '#2d1d18', '--paper': '#fff3e4', '--panel': '#fff9f1', '--panel-soft': '#fff1e9', '--red': '#f15a24', '--teal': '#6f42c1', '--purple': '#a41370', '--gold': '#ffb703', '--canvas-bg': '#fff4e8', '--evolution-bg': 'rgba(58, 20, 62, 0.86)', '--danger-line': 'rgba(164, 19, 112, 0.62)' }
        },
        christmas: {
            background: 'radial-gradient(circle at 78% 14%, #ffffff 0 8%, transparent 22%), linear-gradient(145deg, #f7fff5 0%, #d8f3dc 42%, #b91c1c 100%)',
            preview: 'linear-gradient(145deg, #f7fff5, #b91c1c)',
            vars: { '--ink': '#26351f', '--paper': '#fbfff5', '--panel': '#ffffff', '--panel-soft': '#f3fff0', '--red': '#c1121f', '--teal': '#2d6a4f', '--purple': '#8d1f2d', '--gold': '#f9c74f', '--canvas-bg': '#fbfff5', '--evolution-bg': 'rgba(247, 255, 245, 0.9)', '--danger-line': 'rgba(193, 18, 31, 0.6)' }
        },
        sideral: {
            background: 'radial-gradient(circle at 25% 18%, #f8f7ff 0 4%, transparent 14%), radial-gradient(circle at 82% 76%, #80ffdb 0 8%, transparent 24%), linear-gradient(145deg, #191235 0%, #3a0ca3 48%, #4cc9f0 100%)',
            preview: 'linear-gradient(145deg, #191235, #4cc9f0)',
            vars: { '--ink': '#201b35', '--paper': '#f5f2ff', '--panel': '#ffffff', '--panel-soft': '#f0f7ff', '--red': '#ff4d6d', '--teal': '#2ec4b6', '--purple': '#5a189a', '--gold': '#ffd60a', '--canvas-bg': '#f8f7ff', '--evolution-bg': 'rgba(25, 18, 53, 0.84)', '--danger-line': 'rgba(255, 77, 109, 0.62)' }
        },
        mythology: {
            background: 'linear-gradient(145deg, #fff8dc 0%, #e9d8a6 44%, #8ecae6 100%)',
            preview: 'linear-gradient(145deg, #fff8dc, #8ecae6)',
            vars: { '--ink': '#3b2b16', '--paper': '#fff9e8', '--panel': '#fffdf5', '--panel-soft': '#fff4d6', '--red': '#bc6c25', '--teal': '#2a9d8f', '--purple': '#6d597a', '--gold': '#d4af37', '--canvas-bg': '#fff8e6', '--evolution-bg': 'rgba(255, 248, 220, 0.9)', '--danger-line': 'rgba(188, 108, 37, 0.62)' }
        },
        ocean: {
            background: 'linear-gradient(145deg, #caf0f8 0%, #48cae4 42%, #0077b6 100%)',
            preview: 'linear-gradient(145deg, #caf0f8, #0077b6)',
            vars: { '--ink': '#12313f', '--paper': '#effcff', '--panel': '#ffffff', '--panel-soft': '#e6fbff', '--red': '#ef476f', '--teal': '#0077b6', '--purple': '#4361ee', '--gold': '#ffb703', '--canvas-bg': '#f0fdff', '--evolution-bg': 'rgba(224, 251, 252, 0.9)', '--danger-line': 'rgba(0, 119, 182, 0.62)' }
        },
        robot: {
            background: 'linear-gradient(145deg, #f1f5f9 0%, #cbd5e1 38%, #0f172a 100%)',
            preview: 'linear-gradient(145deg, #f1f5f9, #0f172a)',
            vars: { '--ink': '#1e293b', '--paper': '#f8fafc', '--panel': '#ffffff', '--panel-soft': '#eef2f7', '--red': '#ff0054', '--teal': '#00a6a6', '--purple': '#8338ec', '--gold': '#fee440', '--canvas-bg': '#f8fafc', '--evolution-bg': 'rgba(15, 23, 42, 0.84)', '--danger-line': 'rgba(0, 245, 212, 0.62)' }
        },
        candy: {
            background: 'linear-gradient(145deg, #fff0f6 0%, #ffc8dd 44%, #bde0fe 100%)',
            preview: 'linear-gradient(145deg, #fff0f6, #bde0fe)',
            vars: { '--ink': '#47233b', '--paper': '#fff7fb', '--panel': '#ffffff', '--panel-soft': '#fff0f7', '--red': '#fb6f92', '--teal': '#48bfe3', '--purple': '#c77dff', '--gold': '#ffd166', '--canvas-bg': '#fff8fc', '--evolution-bg': 'rgba(255, 240, 246, 0.9)', '--danger-line': 'rgba(199, 125, 255, 0.62)' }
        },
        luxury: {
            background: 'linear-gradient(145deg, #fff8dc 0%, #f5cb5c 42%, #2f261f 100%)',
            preview: 'linear-gradient(145deg, #fff8dc, #2f261f)',
            vars: { '--ink': '#2f261f', '--paper': '#fff8dc', '--panel': '#fffdf4', '--panel-soft': '#fff3bf', '--red': '#a4161a', '--teal': '#8a7a32', '--purple': '#5a3e85', '--gold': '#d4af37', '--canvas-bg': '#fff9e6', '--evolution-bg': 'rgba(255, 248, 220, 0.9)', '--danger-line': 'rgba(212, 175, 55, 0.7)' }
        }
    },

    getCoins: function () {
        return parseInt(localStorage.getItem(this.storageKeys.coins) || '0', 10);
    },

    ensureTestCoins: function () {
        if (this.getCoins() < this.testCoinGrant) {
            this.setCoins(this.testCoinGrant);
        }
    },

    setCoins: function (amount) {
        localStorage.setItem(this.storageKeys.coins, String(Math.max(0, amount)));
    },

    addCoins: function (amount) {
        const earned = Math.max(0, Math.floor(amount));
        this.setCoins(this.getCoins() + earned);
        return earned;
    },

    getJsonList: function (key, fallback) {
        try {
            return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
        } catch (error) {
            return fallback;
        }
    },

    getUnlockedIds: function () {
        return Array.from(new Set(['classic'].concat(this.getJsonList(this.storageKeys.unlocked, ['classic']))));
    },

    saveUnlockedIds: function (ids) {
        localStorage.setItem(this.storageKeys.unlocked, JSON.stringify(Array.from(new Set(ids))));
    },

    isUnlocked: function (packId) {
        return this.getUnlockedIds().includes(packId);
    },

    getActiveId: function () {
        const activeId = localStorage.getItem(this.storageKeys.active) || 'classic';
        return this.isUnlocked(activeId) ? activeId : 'classic';
    },

    getActivePack: function () {
        return this.getPack(this.getActiveId()) || this.packs[0];
    },

    getThemeForPack: function (pack) {
        return this.themes[pack.id] || this.themes.classic;
    },

    getActiveTheme: function () {
        return this.getThemeForPack(this.getActivePack());
    },

    applyActiveTheme: function () {
        const pack = this.getActivePack();
        const theme = this.getThemeForPack(pack);

        document.body.dataset.theme = pack.id;
        document.body.style.background = theme.background;

        Object.keys(theme.vars).forEach(key => {
            document.documentElement.style.setProperty(key, theme.vars[key]);
        });

        if (SuikaGame.config && SuikaGame.config.render) {
            SuikaGame.config.render.options.background = theme.vars['--canvas-bg'];
        }
    },

    getPack: function (packId) {
        return this.packs.find(pack => pack.id === packId);
    },

    buyPack: function (packId) {
        const pack = this.getPack(packId);
        if (!pack || this.isUnlocked(packId) || this.getCoins() < pack.price) return false;
        this.setCoins(this.getCoins() - pack.price);
        this.saveUnlockedIds(this.getUnlockedIds().concat(packId));
        this.setActive(packId);
        SuikaGame.progress.unlock('collector');
        return true;
    },

    setActive: function (packId) {
        if (!this.isUnlocked(packId)) return false;
        localStorage.setItem(this.storageKeys.active, packId);
        return true;
    },

    getUnlockedTracks: function () {
        return Array.from(new Set(['fruit-groove'].concat(this.getJsonList(this.storageKeys.unlockedTracks, ['fruit-groove']))));
    },

    isTrackUnlocked: function (trackId) {
        return this.getUnlockedTracks().includes(trackId);
    },

    getActiveTrackId: function () {
        const activeId = localStorage.getItem(this.storageKeys.activeTrack) || 'fruit-groove';
        return this.isTrackUnlocked(activeId) ? activeId : 'fruit-groove';
    },

    getActiveTrack: function () {
        return this.tracks.find(track => track.id === this.getActiveTrackId()) || this.tracks[0];
    },

    buyTrack: function (trackId) {
        const track = this.tracks.find(item => item.id === trackId);
        if (!track || this.isTrackUnlocked(trackId) || this.getCoins() < track.price) return false;
        this.setCoins(this.getCoins() - track.price);
        localStorage.setItem(this.storageKeys.unlockedTracks, JSON.stringify(this.getUnlockedTracks().concat(trackId)));
        this.setActiveTrack(trackId);
        return true;
    },

    setActiveTrack: function (trackId) {
        if (!this.isTrackUnlocked(trackId)) return false;
        localStorage.setItem(this.storageKeys.activeTrack, trackId);
        return true;
    },

    getPowerCounts: function () {
        return this.getJsonList(this.storageKeys.powers, {});
    },

    getPowerCount: function (powerId) {
        return this.getPowerCounts()[powerId] || 0;
    },

    buyPower: function (powerId) {
        const power = this.powers.find(item => item.id === powerId);
        if (!power || this.getCoins() < power.price) return false;
        const counts = this.getPowerCounts();
        this.setCoins(this.getCoins() - power.price);
        counts[powerId] = (counts[powerId] || 0) + 1;
        localStorage.setItem(this.storageKeys.powers, JSON.stringify(counts));
        return true;
    },

    consumePower: function (powerId) {
        const counts = this.getPowerCounts();
        if (!counts[powerId]) return false;
        counts[powerId] -= 1;
        localStorage.setItem(this.storageKeys.powers, JSON.stringify(counts));
        SuikaGame.progress.unlock('power-user');
        return true;
    },

    isMuted: function () {
        return localStorage.getItem(this.storageKeys.muted) === 'true';
    },

    setMuted: function (muted) {
        localStorage.setItem(this.storageKeys.muted, muted ? 'true' : 'false');
    },

    areAccessibilityControlsEnabled: function () {
        return localStorage.getItem(this.storageKeys.accessibilityControls) === 'true';
    },

    setAccessibilityControlsEnabled: function (enabled) {
        localStorage.setItem(this.storageKeys.accessibilityControls, enabled ? 'true' : 'false');
    },

    isFruitRadiusOverlayEnabled: function () {
        return localStorage.getItem(this.storageKeys.fruitRadiusOverlay) === 'true';
    },

    setFruitRadiusOverlayEnabled: function (enabled) {
        localStorage.setItem(this.storageKeys.fruitRadiusOverlay, enabled ? 'true' : 'false');
    },

    getFruitView: function (fruit) {
        return this.getFruitViewForPack(this.getActivePack(), fruit);
    },

    getFruitViewForPack: function (activePack, fruit) {
        const skinImage = this.getSkinImage(activePack, fruit);
        return {
            image: skinImage || fruit.image,
            color: activePack.colorShift && activePack.colorShift[fruit.id] ? activePack.colorShift[fruit.id] : fruit.color,
            themeClass: activePack.themeClass
        };
    },

    getSkinImage: function (pack, fruit) {
        if (!pack.assetFolder) return null;
        const fileName = fruit.image.split('/').pop();
        const path = `${pack.assetFolder}/${fileName}`;
        return this.assetAvailability[path] ? path : null;
    },

    preloadAssets: function (fruits) {
        if (typeof Image === 'undefined') return Promise.resolve();
        const checks = [];
        this.packs.forEach(pack => {
            if (!pack.assetFolder) return;
            fruits.forEach(fruit => {
                const fileName = fruit.image.split('/').pop();
                const path = `${pack.assetFolder}/${fileName}`;
                checks.push(new Promise(resolve => {
                    const img = new Image();
                    img.onload = () => { this.assetAvailability[path] = true; resolve(); };
                    img.onerror = () => { this.assetAvailability[path] = false; resolve(); };
                    img.src = path;
                }));
            });
        });
        return Promise.all(checks);
    },

    getCoinsForScore: function (score) {
        const difficulty = SuikaGame.config.DIFFICULTY_LEVELS[SuikaGame.config.currentDifficulty];
        return Math.floor((score / 22) * difficulty.coinMultiplier);
    }
};
