// Namespace global para o jogo
var SuikaGame = SuikaGame || {};

// Configuração e gerenciamento das frutas
SuikaGame.fruits = {
    // Lista de frutas disponíveis
    types: [
        { name: 'Cereja', emoji: '🍒', radius: 20, baseRadius: 20, score: 1 },
        { name: 'Morango', emoji: '🍓', radius: 30, baseRadius: 30, score: 3 },
        { name: 'Uva', emoji: '🍇', radius: 40, baseRadius: 40, score: 6 },
        { name: 'Tangerina', emoji: '🍊', radius: 50, baseRadius: 50, score: 10 },
        { name: 'Maçã', emoji: '🍎', radius: 60, baseRadius: 60, score: 15 },
        { name: 'Pêra', emoji: '🍐', radius: 70, baseRadius: 70, score: 21 },
        { name: 'Pêssego', emoji: '🍑', radius: 80, baseRadius: 80, score: 28 },
        { name: 'Abacaxi', emoji: '🍍', radius: 90, baseRadius: 90, score: 36 },
        { name: 'Melão', emoji: '🍈', radius: 100, baseRadius: 100, score: 45 },
        { name: 'Melancia', emoji: '🍉', radius: 110, baseRadius: 110, score: 55 }
    ],
    
    // Fruta atual e próxima
    currentFruit: null,
    nextFruitIndex: 0,
    
    // Criar corpo da fruta para Matter.js
    createFruitBody: function(x, y, fruitData) {
        return Matter.Bodies.circle(x, y, fruitData.radius, {
            restitution: 0.3,
            friction: 0.05,
            density: 0.001,
            isFruit: true,
            fruitType: fruitData.name,
            fruitIndex: SuikaGame.fruits.types.indexOf(fruitData),
            render: {
                sprite: {
                    texture: this.createFruitTexture(fruitData.emoji, fruitData.radius * 2),
                    xScale: 1,
                    yScale: 1
                }
            }
        });
    },
    
    // Criar textura da fruta (canvas para imagem)
    createFruitTexture: function(emoji, size) {
        const canvas = document.createElement('canvas');
        canvas.width = size * 1.5;
        canvas.height = size * 1.5;
        const ctx = canvas.getContext('2d');
        
        // Fundo circular
        ctx.beginPath();
        ctx.arc(size * 0.75, size * 0.75, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = this.getColorForEmoji(emoji);
        ctx.fill();
        
        // Texto emoji
        ctx.font = `${size * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, size * 0.75, size * 0.75);
        
        return canvas.toDataURL();
    },
    
    // Obter cor de fundo para cada emoji
    getColorForEmoji: function(emoji) {
        const colors = {
            '🍒': '#ffcccc', '🍓': '#ffcccc', '🍇': '#e0d7ff',
            '🍊': '#ffe0b3', '🍎': '#ffcccc', '🍐': '#d4ffcc',
            '🍑': '#ffd9cc', '🍍': '#ffffcc', '🍈': '#ccffcc',
            '🍉': '#ffcccc'
        };
        
        return colors[emoji] || '#ffffff';
    },
    
    // Criar nova fruta para o jogador
    createNewFruit: function() {
        // Atualizar visualização da próxima fruta
        this.updateNextFruitPreview();
        
        // Criar fruta atual
        const fruitData = this.types[this.nextFruitIndex];
        this.currentFruit = this.createFruitBody(SuikaGame.config.dropPosition, 50, fruitData);
        this.currentFruit.isStatic = true;
        
        // Adicionar ao mundo
        Matter.World.add(SuikaGame.config.engine.world, this.currentFruit);
        
        // Gerar próxima fruta (uma das 5 menores)
        this.nextFruitIndex = Math.floor(Math.random() * 5);
        
        SuikaGame.config.canDropFruit = true;
    },
    
    updateNextFruitPreview: function() {
        const previewElement = document.getElementById('next-fruit-preview');
        const nextFruit = this.types[this.nextFruitIndex];
        
        // Limpar o conteúdo atual
        previewElement.innerHTML = '';
        previewElement.style.backgroundColor = this.getColorForEmoji(nextFruit.emoji);
        
        // Adicionar o emoji da próxima fruta
        const emojiSpan = document.createElement('span');
        emojiSpan.textContent = nextFruit.emoji;
        emojiSpan.style.fontSize = '24px';
        previewElement.appendChild(emojiSpan);
    }
    
    
    // Ajustar tamanhos das frutas com base na dificuldade
    updateFruitSizes: function(multiplier) {
        for (let i = 0; i < this.types.length; i++) {
            this.types[i].radius = this.types[i].baseRadius * multiplier;
        }
    }
};
