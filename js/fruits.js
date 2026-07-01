var SuikaGame = SuikaGame || {};

SuikaGame.fruits = {
    imageSize: 1024,
    spriteFillScale: 1.2,
    spawnableCount: 5,

    types: [
        { id: 'cherry', name: 'Cereja', image: 'assets/images/cherries_emoji.png', color: '#ef476f', radius: 19, baseRadius: 19, score: 1 },
        { id: 'strawberry', name: 'Morango', image: 'assets/images/strawberry_emoji.png', color: '#f94144', radius: 29, baseRadius: 29, score: 3 },
        { id: 'grape', name: 'Uva', image: 'assets/images/grapes_emoji.png', color: '#7b2cbf', radius: 39, baseRadius: 39, score: 6 },
        { id: 'orange', name: 'Laranja', image: 'assets/images/orange_emoji.png', color: '#f8961e', radius: 49, baseRadius: 49, score: 10 },
        { id: 'apple', name: 'Maçã', image: 'assets/images/apple_emoji.png', color: '#d62828', radius: 59, baseRadius: 59, score: 15 },
        { id: 'pear', name: 'Pêra', image: 'assets/images/pear_emoji.png', color: '#90be6d', radius: 69, baseRadius: 69, score: 21 },
        { id: 'peach', name: 'Pêssego', image: 'assets/images/peach_emoji.png', color: '#ffb4a2', radius: 79, baseRadius: 79, score: 28 },
        { id: 'pineapple', name: 'Abacaxi', image: 'assets/images/pineapple_emoji.png', color: '#f9c74f', radius: 89, baseRadius: 89, score: 36 },
        { id: 'melon', name: 'Melão', image: 'assets/images/melon_emoji.png', color: '#80ed99', radius: 99, baseRadius: 99, score: 45 },
        { id: 'watermelon', name: 'Melancia', image: 'assets/images/watermelon_emoji.png', color: '#43aa8b', radius: 109, baseRadius: 109, score: 55 },
        { id: 'jackfruit', name: 'Jaca', image: 'assets/images/jackfruit_emoji.png', color: '#b5a642', radius: 128, baseRadius: 128, score: 89, hiddenFromEvolution: true }
    ],

    currentFruit: null,
    nextFruitIndex: 0,

    createFruitBody: function (x, y, fruitData) {
        const view = SuikaGame.skins.getFruitView(fruitData);
        const scale = this.getSpriteScale(fruitData);

        return Matter.Bodies.circle(x, y, fruitData.radius, {
            restitution: 0.25,
            friction: 0.08,
            frictionAir: 0.002,
            density: 0.001,
            isFruit: true,
            fruitType: fruitData.name,
            fruitIndex: this.types.indexOf(fruitData),
            render: {
                fillStyle: view.color,
                sprite: {
                    texture: view.image,
                    xScale: scale,
                    yScale: scale
                }
            }
        });
    },

    getSpriteScale: function (fruitData) {
        return ((fruitData.radius * 2) / this.imageSize) * this.spriteFillScale;
    },

    getColorForFruit: function (fruitData) {
        return SuikaGame.skins.getFruitView(fruitData).color || '#ffffff';
    },

    createFruitPreview: function (fruitData, size) {
        const view = SuikaGame.skins.getFruitView(fruitData);
        const img = document.createElement('img');

        img.src = view.image;
        img.alt = fruitData.name;
        img.width = size;
        img.height = size;
        img.loading = 'eager';
        img.onerror = function () {
            img.src = fruitData.image;
        };

        return img;
    },

    createNewFruit: function () {
        const fruitData = this.types[this.nextFruitIndex];

        this.currentFruit = this.createFruitBody(SuikaGame.config.dropPosition, 80, fruitData);
        this.currentFruit.isStatic = true;

        Matter.World.add(SuikaGame.config.engine.world, this.currentFruit);

        this.nextFruitIndex = Math.floor(Math.random() * this.spawnableCount);
        this.updateNextFruitPreview();

        SuikaGame.config.canDropFruit = true;
    },

    updateNextFruitPreview: function () {
        const previewElement = document.getElementById('next-fruit-preview');
        const nextFruit = this.types[this.nextFruitIndex];

        previewElement.innerHTML = '';
        previewElement.style.backgroundColor = this.getColorForFruit(nextFruit);
        previewElement.title = nextFruit.name;
        previewElement.appendChild(this.createFruitPreview(nextFruit, 38));
    },

    updateFruitSizes: function (multiplier) {
        for (let i = 0; i < this.types.length; i++) {
            this.types[i].radius = this.types[i].baseRadius * multiplier;
        }
    }
};
