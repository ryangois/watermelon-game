// Namespace global para o jogo
var SuikaGame = SuikaGame || {};

// Configuração e gerenciamento das frutas
SuikaGame.fruits = {
    imageSize: 1024,
    spawnableCount: 5,

    types: [
        { name: 'Cereja', image: 'assets/images/cherries_emoji.png', color: '#ef476f', radius: 20, baseRadius: 20, score: 1 },
        { name: 'Morango', image: 'assets/images/strawberry_emoji.png', color: '#f94144', radius: 30, baseRadius: 30, score: 3 },
        { name: 'Uva', image: 'assets/images/grapes_emoji.png', color: '#7b2cbf', radius: 40, baseRadius: 40, score: 6 },
        { name: 'Laranja', image: 'assets/images/orange_emoji.png', color: '#f8961e', radius: 50, baseRadius: 50, score: 10 },
        { name: 'Maçã', image: 'assets/images/apple_emoji.png', color: '#d62828', radius: 60, baseRadius: 60, score: 15 },
        { name: 'Pêra', image: 'assets/images/pear_emoji.png', color: '#90be6d', radius: 70, baseRadius: 70, score: 21 },
        { name: 'Pêssego', image: 'assets/images/peach_emoji.png', color: '#ffb4a2', radius: 80, baseRadius: 80, score: 28 },
        { name: 'Abacaxi', image: 'assets/images/pineapple_emoji.png', color: '#f9c74f', radius: 90, baseRadius: 90, score: 36 },
        { name: 'Melão', image: 'assets/images/melon_emoji.png', color: '#80ed99', radius: 100, baseRadius: 100, score: 45 },
        { name: 'Melancia', image: 'assets/images/watermelon_emoji.png', color: '#43aa8b', radius: 110, baseRadius: 110, score: 55 },
        { name: 'Jaca', image: 'assets/images/jackfruit_emoji.png', color: '#b5a642', radius: 130, baseRadius: 130, score: 89 }
    ],

    currentFruit: null,
    nextFruitIndex: 0,

    createFruitBody: function (x, y, fruitData) {
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
                fillStyle: fruitData.color,
                sprite: {
                    texture: fruitData.image,
                    xScale: scale,
                    yScale: scale
                }
            }
        });
    },

    getSpriteScale: function (fruitData) {
        return (fruitData.radius * 2) / this.imageSize;
    },

    getColorForFruit: function (fruitData) {
        return fruitData.color || '#ffffff';
    },

    createFruitPreview: function (fruitData, size) {
        const img = document.createElement('img');
        img.src = fruitData.image;
        img.alt = fruitData.name;
        img.width = size;
        img.height = size;
        img.loading = 'eager';
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
        previewElement.style.backgroundColor = nextFruit.color;
        previewElement.title = nextFruit.name;
        previewElement.appendChild(this.createFruitPreview(nextFruit, 36));
    },

    updateFruitSizes: function (multiplier) {
        for (let i = 0; i < this.types.length; i++) {
            this.types[i].radius = this.types[i].baseRadius * multiplier;
        }
    }
};
