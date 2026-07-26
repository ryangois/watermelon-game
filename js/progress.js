var SuikaGame = SuikaGame || {};

SuikaGame.progress = {
    storageKey: 'suikaMedals',
    statsKey: 'suikaStats',
    dailyKey: 'suikaDailyProgress',
    newlyUnlocked: [],

    medals: [
        { id: 'first-game', icon: '🎮', name: 'Primeira partida', description: 'Jogue uma partida até o fim.', hint: 'Inicie o jogo e deixe a partida terminar.' },
        { id: 'five-games', icon: '📅', name: 'Aquecimento', description: 'Jogue 5 partidas.', hint: 'Complete 5 partidas em qualquer dificuldade.' },
        { id: 'ten-games', icon: '🔥', name: 'Rotina de treino', description: 'Jogue 10 partidas.', hint: 'Complete 10 partidas no total.' },
        { id: 'score-500', icon: '⭐', name: '500 pontos', description: 'Chegue a 500 pontos em uma partida.', hint: 'Faça fusões constantes até passar de 500 pontos.' },
        { id: 'score-1000', icon: '🏆', name: '1000 pontos', description: 'Chegue a 1000 pontos em uma partida.', hint: 'Controle o espaço do pote e busque frutas maiores.' },
        { id: 'score-1500', icon: '💎', name: '1500 pontos', description: 'Chegue a 1500 pontos em uma partida.', hint: 'Mantenha o centro baixo e evite empilhar frutas pequenas perto da linha.' },
        { id: 'hard-mode', icon: '🛡️', name: 'Coragem', description: 'Jogue uma partida no difícil.', hint: 'Escolha Difícil em Opções e finalize uma partida.' },
        { id: 'collector', icon: '🎨', name: 'Colecionador', description: 'Desbloqueie uma skin ou tema.', hint: 'Compre uma skin, um tema ou um bundle na loja.' },
        { id: 'theme-stylist', icon: '🌈', name: 'Estilista', description: 'Equipe um tema comprado.', hint: 'Compre um tema na loja e deixe ele ativo.' },
        { id: 'music-fan', icon: '🎵', name: 'Trilha nova', description: 'Desbloqueie uma música.', hint: 'Compre qualquer música na aba Músicas da loja.' },
        { id: 'first-power', icon: '🧰', name: 'Preparado', description: 'Compre um poder.', hint: 'Compre qualquer item na aba Poderes da loja.' },
        { id: 'power-user', icon: '⚡', name: 'Estratégia', description: 'Use um poder durante a partida.', hint: 'Compre um poder, entre no jogo e toque nele na barra lateral.' },
        { id: 'combo-big', icon: '💥', name: 'Combo grande', description: 'Faça 4 fusões em sequência.', hint: 'Solte frutas iguais próximas para encadear fusões rapidamente.' },
        { id: 'first-watermelon', icon: '🍉', name: 'Melancia!', description: 'Crie a primeira melancia.', hint: 'Continue evoluindo frutas até chegar na melancia.' },
        { id: 'daily-claim', icon: '🎁', name: 'Recompensa do dia', description: 'Colete uma recompensa diária.', hint: 'Complete uma missão diária ou o cofre diário e toque para coletar.' },
        { id: 'coin-bank', icon: '🪙', name: 'Cofrinho cheio', description: 'Tenha 500 moedas guardadas.', hint: 'Jogue partidas e colete recompensas até acumular 500 moedas.' },
        { id: 'score-1000-no-powers', icon: '✨', name: 'Puro talento', description: 'Faça 1000 pontos sem usar poderes.', hint: 'Não use poderes durante a partida e passe de 1000 pontos.' },
        { id: 'hard-watermelon', icon: '👑', name: 'Melancia difícil', description: 'Crie uma melancia no difícil.', hint: 'Escolha Difícil e evolua as frutas até a melancia.' },
        { id: 'jackfruit-egg', icon: '❔', name: 'Easter egg', description: 'Você encontrou um segredo escondido no jogo.', hint: '???', secret: true }
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

        if (stats.gamesPlayed >= 5) this.unlock('five-games');
        if (stats.gamesPlayed >= 10) this.unlock('ten-games');
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
        if (score >= 1500) this.unlock('score-1500');
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
        this.unlock('daily-claim');
        return rewards.mission.reward;
    },

    claimDailyChest: function () {
        const daily = this.getDaily();
        const rewards = this.getDailyRewards();

        if (!rewards.chest.ready || daily.claimedChest) return false;
        daily.claimedChest = true;
        this.saveDaily(daily);
        SuikaGame.skins.addCoins(rewards.chest.reward);
        this.unlock('daily-claim');
        return rewards.chest.reward;
    }
};
