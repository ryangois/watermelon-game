var SuikaGame = SuikaGame || {};

SuikaGame.progress = {
    storageKey: 'suikaMedals',
    statsKey: 'suikaStats',
    newlyUnlocked: [],

    medals: [
        { id: 'first-game', name: 'Primeira partida', description: 'Jogue uma partida' },
        { id: 'score-500', name: '500 pontos', description: 'Chegue a 500 pontos' },
        { id: 'score-1000', name: '1000 pontos', description: 'Chegue a 1000 pontos' },
        { id: 'hard-mode', name: 'Coragem', description: 'Jogue no difícil' },
        { id: 'collector', name: 'Colecionador', description: 'Desbloqueie uma skin' },
        { id: 'power-user', name: 'Estratégia', description: 'Use um poder' },
        { id: 'combo-big', name: 'Combo grande', description: 'Faça 4 fusões em sequência' },
        { id: 'first-watermelon', name: 'Melancia!', description: 'Crie a primeira melancia' },
        { id: 'jackfruit-egg', name: 'Easter egg', description: 'Descubra a Jaca' }
    ],

    getUnlocked: function () {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        } catch (error) {
            return [];
        }
    },

    getStats: function () {
        try {
            return JSON.parse(localStorage.getItem(this.statsKey) || '{}');
        } catch (error) {
            return {};
        }
    },

    saveStats: function (stats) {
        localStorage.setItem(this.statsKey, JSON.stringify(stats));
    },

    recordGame: function (score) {
        const stats = this.getStats();
        stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
        stats.bestScore = Math.max(stats.bestScore || 0, score);
        this.saveStats(stats);
    },

    noteFruit: function (fruitId, fruitIndex) {
        const stats = this.getStats();
        const currentBestIndex = typeof stats.bestFruitIndex === 'number' ? stats.bestFruitIndex : -1;

        if (fruitIndex > currentBestIndex) {
            stats.bestFruitIndex = fruitIndex;
            stats.bestFruitId = fruitId;
            this.saveStats(stats);
        }

        if (fruitId === 'watermelon') this.unlock('first-watermelon');
        if (fruitId === 'jackfruit') this.unlock('jackfruit-egg');
    },

    unlock: function (medalId) {
        const unlocked = this.getUnlocked();

        if (unlocked.includes(medalId)) {
            return false;
        }

        unlocked.push(medalId);
        localStorage.setItem(this.storageKey, JSON.stringify(unlocked));
        this.newlyUnlocked.push(medalId);
        return true;
    },

    evaluateGame: function (score) {
        this.unlock('first-game');

        if (score >= 500) this.unlock('score-500');
        if (score >= 1000) this.unlock('score-1000');
        if (SuikaGame.config.currentDifficulty === 'hard') this.unlock('hard-mode');

        const medals = this.newlyUnlocked.slice();
        this.newlyUnlocked = [];
        return medals;
    },

    getMedal: function (medalId) {
        return this.medals.find(medal => medal.id === medalId);
    }
};
