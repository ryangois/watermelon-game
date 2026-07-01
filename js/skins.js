var SuikaGame = SuikaGame || {};

SuikaGame.skins = {
    storageKeys: {
        coins: 'suikaCoins',
        unlocked: 'suikaUnlockedSkins',
        active: 'suikaActiveSkin',
        unlockedTracks: 'suikaUnlockedTracks',
        activeTrack: 'suikaActiveTrack',
        powers: 'suikaPowers',
        muted: 'suikaMuted'
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
        { id: 'slow-time', name: 'Gravidade leve', description: 'Reduz a gravidade por alguns segundos', price: 160 }
    ],

    assetAvailability: {},

    getCoins: function () {
        return parseInt(localStorage.getItem(this.storageKeys.coins) || '0', 10);
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
