var SuikaGame = SuikaGame || {};

SuikaGame.skins = {
    storageKeys: {
        coins: 'suikaCoins',
        unlocked: 'suikaUnlockedSkins',
        active: 'suikaActiveSkin'
    },

    packs: [
        {
            id: 'classic',
            name: 'Clássico',
            description: 'Frutas originais',
            price: 0,
            unlockedByDefault: true,
            themeClass: 'skin-classic',
            colorShift: {}
        },
        {
            id: 'halloween',
            name: 'Halloween',
            description: 'Abóboras, fantasmas, monstros e slasher fruits',
            price: 120,
            unlockedByDefault: false,
            assetFolder: 'assets/images/Halloween',
            themeClass: 'skin-halloween',
            colorShift: {
                cherry: '#ff6b35',
                strawberry: '#f72585',
                grape: '#5a189a',
                orange: '#fb8500',
                apple: '#b5179e',
                pear: '#6a994e',
                peach: '#ff9f1c',
                pineapple: '#fca311',
                melon: '#588157',
                watermelon: '#386641',
                jackfruit: '#8d6b25'
            }
        },
        {
            id: 'christmas',
            name: 'Natal',
            description: 'Gorros, neve, luzinhas e frutas festivas',
            price: 220,
            unlockedByDefault: false,
            assetFolder: 'assets/images/Christmas',
            themeClass: 'skin-christmas',
            colorShift: {
                cherry: '#c1121f',
                strawberry: '#d90429',
                grape: '#6a4c93',
                orange: '#f77f00',
                apple: '#9d0208',
                pear: '#52b788',
                peach: '#ffcad4',
                pineapple: '#ffd166',
                melon: '#95d5b2',
                watermelon: '#2d6a4f',
                jackfruit: '#b7a57a'
            }
        },
        {
            id: 'sideral',
            name: 'Sideral',
            description: 'Planetas, estrelas, nebulosas e frutas astronautas',
            price: 360,
            unlockedByDefault: false,
            assetFolder: 'assets/images/Sideral',
            themeClass: 'skin-sideral',
            colorShift: {
                cherry: '#ff4d6d',
                strawberry: '#ff006e',
                grape: '#7209b7',
                orange: '#f48c06',
                apple: '#3a86ff',
                pear: '#80ffdb',
                peach: '#ffafcc',
                pineapple: '#ffd60a',
                melon: '#48bfe3',
                watermelon: '#06d6a0',
                jackfruit: '#b8c0ff'
            }
        },
        {
            id: 'mythology',
            name: 'Mitologia',
            description: 'Deuses, titãs, ninfas e frutas lendárias',
            price: 520,
            unlockedByDefault: false,
            assetFolder: 'assets/images/Mythology',
            themeClass: 'skin-mythology',
            colorShift: {
                cherry: '#e63946',
                strawberry: '#f77f00',
                grape: '#6d597a',
                orange: '#f4a261',
                apple: '#d4af37',
                pear: '#84a98c',
                peach: '#e9c46a',
                pineapple: '#c9a227',
                melon: '#2a9d8f',
                watermelon: '#457b9d',
                jackfruit: '#8d6e63'
            }
        },
        {
            id: 'ocean',
            name: 'Oceano',
            description: 'Piratas, sereias, corais e frutas submersas',
            price: 680,
            unlockedByDefault: false,
            assetFolder: 'assets/images/Ocean',
            themeClass: 'skin-ocean',
            colorShift: {
                cherry: '#00b4d8',
                strawberry: '#48cae4',
                grape: '#5e60ce',
                orange: '#ffb703',
                apple: '#0077b6',
                pear: '#90e0ef',
                peach: '#ffd6a5',
                pineapple: '#f9c74f',
                melon: '#52b788',
                watermelon: '#0096c7',
                jackfruit: '#023e8a'
            }
        },
        {
            id: 'robot',
            name: 'Robôs',
            description: 'Frutas cromadas, neon, chips e carinhas digitais',
            price: 850,
            unlockedByDefault: false,
            assetFolder: 'assets/images/Robot',
            themeClass: 'skin-robot',
            colorShift: {
                cherry: '#ff0054',
                strawberry: '#ff5400',
                grape: '#8338ec',
                orange: '#fb8500',
                apple: '#00f5d4',
                pear: '#80ed99',
                peach: '#f15bb5',
                pineapple: '#fee440',
                melon: '#00bbf9',
                watermelon: '#00f5d4',
                jackfruit: '#adb5bd'
            }
        },
        {
            id: 'candy',
            name: 'Doceria',
            description: 'Balas, chantilly, chocolate e frutas sobremesa',
            price: 1100,
            unlockedByDefault: false,
            assetFolder: 'assets/images/Candy',
            themeClass: 'skin-candy',
            colorShift: {
                cherry: '#ff5d8f',
                strawberry: '#ff8fab',
                grape: '#c77dff',
                orange: '#ffb703',
                apple: '#fb6f92',
                pear: '#b8f2e6',
                peach: '#ffc8dd',
                pineapple: '#fdffb6',
                melon: '#caffbf',
                watermelon: '#9bf6ff',
                jackfruit: '#ffd6a5'
            }
        },
        {
            id: 'luxury',
            name: 'Luxo',
            description: 'Dourado, diamantes, coroas e frutas premium',
            price: 1500,
            unlockedByDefault: false,
            assetFolder: 'assets/images/Luxury',
            themeClass: 'skin-luxury',
            colorShift: {
                cherry: '#b8860b',
                strawberry: '#d4af37',
                grape: '#6f2dbd',
                orange: '#ffba08',
                apple: '#f5cb5c',
                pear: '#c9ada7',
                peach: '#ffd166',
                pineapple: '#f4d35e',
                melon: '#b7e4c7',
                watermelon: '#95d5b2',
                jackfruit: '#caa94a'
            }
        }
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

    getUnlockedIds: function () {
        const stored = localStorage.getItem(this.storageKeys.unlocked);

        if (!stored) {
            return ['classic'];
        }

        try {
            return Array.from(new Set(['classic'].concat(JSON.parse(stored))));
        } catch (error) {
            return ['classic'];
        }
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

        if (!pack || this.isUnlocked(packId)) {
            return false;
        }

        const coins = this.getCoins();

        if (coins < pack.price) {
            return false;
        }

        this.setCoins(coins - pack.price);
        this.saveUnlockedIds(this.getUnlockedIds().concat(packId));
        this.setActive(packId);
        return true;
    },

    setActive: function (packId) {
        if (!this.isUnlocked(packId)) {
            return false;
        }

        localStorage.setItem(this.storageKeys.active, packId);
        return true;
    },

    getFruitView: function (fruit) {
        const activePack = this.getActivePack();
        return this.getFruitViewForPack(activePack, fruit);
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
        if (!pack.assetFolder) {
            return null;
        }

        const fileName = fruit.image.split('/').pop();
        const path = `${pack.assetFolder}/${fileName}`;

        return this.assetAvailability[path] ? path : null;
    },

    preloadAssets: function (fruits) {
        if (typeof Image === 'undefined') {
            return Promise.resolve();
        }

        const checks = [];

        this.packs.forEach(pack => {
            if (!pack.assetFolder) {
                return;
            }

            fruits.forEach(fruit => {
                const fileName = fruit.image.split('/').pop();
                const path = `${pack.assetFolder}/${fileName}`;

                checks.push(new Promise(resolve => {
                    const img = new Image();

                    img.onload = () => {
                        this.assetAvailability[path] = true;
                        resolve();
                    };
                    img.onerror = () => {
                        this.assetAvailability[path] = false;
                        resolve();
                    };
                    img.src = path;
                }));
            });
        });

        return Promise.all(checks);
    },

    getCoinsForScore: function (score) {
        return Math.floor(score / 10);
    }
};
