var SuikaGame = SuikaGame || {};

SuikaGame.progress = {
    storageKey: 'suikaMedals',
    statsKey: 'suikaStats',
    dailyKey: 'suikaDailyProgress',
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
        { id: 'jackfruit-egg', name: 'Easter egg', description: 'Descubra a Jaca' },
        { id: 'score-1000-no-powers', name: 'Puro talento', description: 'Faça 1000 pontos sem usar poderes' },
        { id: 'hard-watermelon', name: 'Melancia difícil', description: 'Crie uma melancia no difícil' }
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

    getTodayKey: function () {
        return new Date().toISOString().slice(0, 10);
    },

    getDaily: function () {
        const fallback = { date: this.getTodayKey(), games: 0, bestScore: 0, claimedMission: false, claimedChest: false };

        try {
            const daily = JSON.parse(localStorage.getItem(this.dailyKey) || JSON.stringify(fallback));
            return daily.date === this.getTodayKey() ? Object.assign(fallback, daily) : fallback;
        } catch (error) {
            return fallback;
        }
    },

    saveDaily: function (daily) {
        localStorage.setItem(this.dailyKey, JSON.stringify(daily));
    },

    recordGame: function (score) {
        const stats = this.getStats();
        const daily = this.getDaily();

        stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
        stats.bestScore = Math.max(stats.bestScore || 0, score);
        this.saveStats(stats);

        daily.games += 1;
        daily.bestScore = Math.max(daily.bestScore || 0, score);
        this.saveDaily(daily);
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
        if (fruitId === 'watermelon' && SuikaGame.config.currentDifficulty === 'hard') this.unlock('hard-watermelon');
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
        if (score >= 1000 && !SuikaGame.config.usedPowersThisGame) this.unlock('score-1000-no-powers');
        if (SuikaGame.config.currentDifficulty === 'hard') this.unlock('hard-mode');

        const medals = this.newlyUnlocked.slice();
        this.newlyUnlocked = [];
        return medals;
    },

    getMedal: function (medalId) {
        return this.medals.find(medal => medal.id === medalId);
    },

    getDailyRewards: function () {
        const daily = this.getDaily();

        return {
            mission: {
                title: 'Missão diária',
                description: 'Faça 650 pontos em uma partida',
                ready: daily.bestScore >= 650,
                claimed: daily.claimedMission,
                reward: 60
            },
            chest: {
                title: 'Cofre diário',
                description: 'Jogue 3 partidas hoje',
                ready: daily.games >= 3,
                claimed: daily.claimedChest,
                reward: 85,
                progress: daily.games
            }
        };
    },

    claimDailyMission: function () {
        const daily = this.getDaily();
        const rewards = this.getDailyRewards();

        if (!rewards.mission.ready || daily.claimedMission) return false;
        daily.claimedMission = true;
        this.saveDaily(daily);
        SuikaGame.skins.addCoins(rewards.mission.reward);
        return rewards.mission.reward;
    },

    claimDailyChest: function () {
        const daily = this.getDaily();
        const rewards = this.getDailyRewards();

        if (!rewards.chest.ready || daily.claimedChest) return false;
        daily.claimedChest = true;
        this.saveDaily(daily);
        SuikaGame.skins.addCoins(rewards.chest.reward);
        return rewards.chest.reward;
    }
};
