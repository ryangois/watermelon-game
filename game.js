// Configurações do jogo
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const WALL_THICKNESS = 20;

// Configuração das frutas
const FRUITS = [
    { name: 'Cereja', emoji: '🍒', radius: 20, score: 1 },
    { name: 'Morango', emoji: '🍓', radius: 30, score: 3 },
    { name: 'Uva', emoji: '🍇', radius: 40, score: 6 },
    { name: 'Tangerina', emoji: '🍊', radius: 50, score: 10 },
    { name: 'Maçã', emoji: '🍎', radius: 60, score: 15 },
    { name: 'Pêra', emoji: '🍐', radius: 70, score: 21 },
    { name: 'Pêssego', emoji: '🍑', radius: 80, score: 28 },
    { name: 'Abacaxi', emoji: '🍍', radius: 90, score: 36 },
    { name: 'Melão', emoji: '🍈', radius: 100, score: 45 },
    { name: 'Melancia', emoji: '🍉', radius: 110, score: 55 }
];

// Variáveis do jogo
let engine, render, runner;
let currentFruit, nextFruitIndex;
let score = 0;
let gameOver = false;
let dropPosition = GAME_WIDTH / 2;
let canDropFruit = true;

// Inicializar o jogo
window.onload = function() {
    // Configurar Matter.js
    const { Engine, Render, Runner, Bodies, World, Body, Events, Composite } = Matter;
    
    // Criar engine
    engine = Engine.create({
        gravity: { x: 0, y: 1, scale: 0.001 }
    });
    
    // Criar renderizador
    render = Render.create({
        element: document.getElementById('game-container'),
        engine: engine,
        canvas: document.getElementById('game-canvas'),
        options: {
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
            wireframes: false,
            background: '#f4f4f4'
        }
    });
    
    // Iniciar renderizador
    Render.run(render);
    
    // Criar runner
    runner = Runner.create();
    Runner.run(runner, engine);
    
    // Criar paredes
    const walls = [
        // Base
        Bodies.rectangle(GAME_WIDTH/2, GAME_HEIGHT + WALL_THICKNESS/2, GAME_WIDTH, WALL_THICKNESS, { 
            isStatic: true,
            render: { fillStyle: '#333' }
        }),
        // Parede esquerda
        Bodies.rectangle(-WALL_THICKNESS/2, GAME_HEIGHT/2, WALL_THICKNESS, GAME_HEIGHT, { 
            isStatic: true,
            render: { fillStyle: '#333' }
        }),
        // Parede direita
        Bodies.rectangle(GAME_WIDTH + WALL_THICKNESS/2, GAME_HEIGHT/2, WALL_THICKNESS, GAME_HEIGHT, { 
            isStatic: true,
            render: { fillStyle: '#333' }
        })
    ];
    
    // Adicionar paredes ao mundo
    World.add(engine.world, walls);
    
    // Linha de game over (invisível)
    const gameOverLine = Bodies.rectangle(GAME_WIDTH/2, 150, GAME_WIDTH, 2, {
        isStatic: true,
        isSensor: true,
        render: { 
            fillStyle: 'rgba(255,0,0,0.1)',
            lineWidth: 0
        }
    });
    World.add(engine.world, gameOverLine);
    
    // Gerar primeira fruta
    nextFruitIndex = Math.floor(Math.random() * 3); // Começar com uma das 3 menores frutas
    createNewFruit();
    
    // Eventos de mouse/toque
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', dropFruit);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchstart', dropFruit);
    
    // Detectar colisões
    Events.on(engine, 'collisionStart', handleCollision);
    
    // Verificar game over
    Events.on(engine, 'collisionStart', function(event) {
        const pairs = event.pairs;
        
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];
            
            if ((pair.bodyA === gameOverLine || pair.bodyB === gameOverLine) && 
                !gameOver && 
                (pair.bodyA.isFruit || pair.bodyB.isFruit)) {
                
                // Verificar se a fruta está parada ou quase parada
                const fruit = pair.bodyA.isFruit ? pair.bodyA : pair.bodyB;
                
                if (Math.abs(fruit.velocity.y) < 0.5) {
                    setTimeout(function() {
                        if (!gameOver) {
                            gameOver = true;
                            alert(`Game Over! Pontuação: ${score}`);
                            resetGame();
                        }
                    }, 1000);
                }
            }
        }
    });
};

// Criar nova fruta
function createNewFruit() {
    // Atualizar próxima fruta
    document.getElementById('next-fruit').innerHTML = `Próxima: ${FRUITS[nextFruitIndex].emoji}`;
    
    // Criar fruta atual
    const fruitData = FRUITS[nextFruitIndex];
    currentFruit = createFruitBody(dropPosition, 50, fruitData);
    currentFruit.isStatic = true;
    
    // Adicionar ao mundo
    Matter.World.add(engine.world, currentFruit);
    
    // Gerar próxima fruta (uma das 5 menores)
    nextFruitIndex = Math.floor(Math.random() * 5);
    
    canDropFruit = true;
}

// Criar corpo da fruta
function createFruitBody(x, y, fruitData) {
    return Matter.Bodies.circle(x, y, fruitData.radius, {
        restitution: 0.3,
        friction: 0.05,
        density: 0.001,
        isFruit: true,
        fruitType: fruitData.name,
        fruitIndex: FRUITS.indexOf(fruitData),
        render: {
            sprite: {
                texture: createFruitTexture(fruitData.emoji, fruitData.radius * 2),
                xScale: 1,
                yScale: 1
            }
        }
    });
}

// Criar textura da fruta
function createFruitTexture(emoji, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size * 1.5;
    canvas.height = size * 1.5;
    const ctx = canvas.getContext('2d');
    
    // Fundo circular
    ctx.beginPath();
    ctx.arc(size * 0.75, size * 0.75, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = getColorForEmoji(emoji);
    ctx.fill();
    
    // Texto emoji
    ctx.font = `${size * 0.8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, size * 0.75, size * 0.75);
    
    return canvas.toDataURL();
}

// Obter cor para emoji
function getColorForEmoji(emoji) {
    const colors = {
        '🍒': '#ffcccc', '🍓': '#ffcccc', '🍇': '#e0d7ff',
        '🍊': '#ffe0b3', '🍎': '#ffcccc', '🍐': '#d4ffcc',
        '🍑': '#ffd9cc', '🍍': '#ffffcc', '🍈': '#ccffcc',
        '🍉': '#ffcccc'
    };
    
    return colors[emoji] || '#ffffff';
}

// Mover fruta com o mouse
function handleMouseMove(e) {
    if (currentFruit && currentFruit.isStatic && !gameOver) {
        const rect = document.getElementById('game-canvas').getBoundingClientRect();
        dropPosition = e.clientX - rect.left;
        
        // Limitar dentro das bordas
        dropPosition = Math.max(FRUITS[nextFruitIndex].radius, 
                               Math.min(GAME_WIDTH - FRUITS[nextFruitIndex].radius, dropPosition));
        
        Matter.Body.setPosition(currentFruit, { 
            x: dropPosition, 
            y: currentFruit.position.y 
        });
    }
}

// Mover fruta com toque
function handleTouchMove(e) {
    e.preventDefault();
    if (currentFruit && currentFruit.isStatic && !gameOver) {
        const rect = document.getElementById('game-canvas').getBoundingClientRect();
        dropPosition = e.touches[0].clientX - rect.left;
        
        // Limitar dentro das bordas
        dropPosition = Math.max(FRUITS[nextFruitIndex].radius, 
                               Math.min(GAME_WIDTH - FRUITS[nextFruitIndex].radius, dropPosition));
        
        Matter.Body.setPosition(currentFruit, { 
            x: dropPosition, 
            y: currentFruit.position.y 
        });
    }
}

// Soltar fruta
function dropFruit(e) {
    if (currentFruit && currentFruit.isStatic && canDropFruit && !gameOver) {
        canDropFruit = false;
        Matter.Body.setStatic(currentFruit, false);
        
        // Esperar um pouco antes de criar a próxima fruta
        setTimeout(createNewFruit, 500);
    }
}

// Lidar com colisões
function handleCollision(event) {
    const pairs = event.pairs;
    
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        
        // Verificar se ambos os corpos são frutas
        if (pair.bodyA.isFruit && pair.bodyB.isFruit) {
            const fruitA = pair.bodyA;
            const fruitB = pair.bodyB;
            
            // Verificar se são do mesmo tipo
            if (fruitA.fruitIndex === fruitB.fruitIndex) {
                // Verificar se já não foram marcados para remoção
                if (!fruitA.toRemove && !fruitB.toRemove && fruitA.fruitIndex < FRUITS.length - 1) {
                    // Marcar para remoção
                    fruitA.toRemove = true;
                    fruitB.toRemove = true;
                    
                    // Calcular posição média
                    const midX = (fruitA.position.x + fruitB.position.x) / 2;
                    const midY = (fruitA.position.y + fruitB.position.y) / 2;
                    
                    // Criar fruta maior
                    const newFruitIndex = fruitA.fruitIndex + 1;
                    const newFruit = createFruitBody(midX, midY, FRUITS[newFruitIndex]);
                    
                    // Atualizar pontuação
                    score += FRUITS[newFruitIndex].score;
                    document.getElementById('score').innerHTML = `Pontos: ${score}`;
                    
                    // Remover frutas antigas e adicionar nova
                    setTimeout(function() {
                        Matter.World.remove(engine.world, [fruitA, fruitB]);
                        Matter.World.add(engine.world, newFruit);
                    }, 100);
                }
            }
        }
    }
}

// Resetar jogo
function resetGame() {
    // Limpar todas as frutas
    const bodies = Matter.Composite.allBodies(engine.world);
    for (let i = 0; i < bodies.length; i++) {
        if (bodies[i].isFruit) {
            Matter.World.remove(engine.world, bodies[i]);
        }
    }
    
    // Resetar variáveis
    score = 0;
    document.getElementById('score').innerHTML = `Pontos: 0`;
    gameOver = false;
    
    // Criar nova fruta
    nextFruitIndex = Math.floor(Math.random() * 3);
    createNewFruit();
}
