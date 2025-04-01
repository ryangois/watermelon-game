var SuikaGame = SuikaGame || {};

// Configuração e gerenciamento da física do jogo
SuikaGame.physics = {
    // Inicializar o engine de física
    setupEngine: function () {
        // Configurar Matter.js
        const { Engine, Render, Runner, Bodies, World, Events } = Matter;
        // Adicione isso ao arquivo physics.js na função setupEngine
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mousedown', this.dropFruit);
        document.addEventListener('touchmove', this.handleTouchMove);
        document.addEventListener('touchstart', this.dropFruit);

        // Criar engine
        SuikaGame.config.engine = Engine.create({
            gravity: {
                x: 0,
                y: 1,
                scale: SuikaGame.config.DIFFICULTY_LEVELS[SuikaGame.config.currentDifficulty].gravity
            }
        });

        // Criar renderizador
        SuikaGame.config.render = Render.create({
            element: document.getElementById('game-container'),
            engine: SuikaGame.config.engine,
            canvas: document.getElementById('game-canvas'),
            options: {
                width: SuikaGame.config.GAME_WIDTH,
                height: SuikaGame.config.GAME_HEIGHT,
                wireframes: false,
                background: '#ffffff'
            }
        });

        // Iniciar renderizador
        Render.run(SuikaGame.config.render);

        // Criar runner
        SuikaGame.config.runner = Runner.create();
        Runner.run(SuikaGame.config.runner, SuikaGame.config.engine);

        // Criar paredes
        this.createWalls();

        // Configurar eventos de colisão
        this.setupCollisionEvents();
    },



    createWalls: function () {
        const { Bodies, World } = Matter;
        const walls = [
            // Base
            Bodies.rectangle(SuikaGame.config.GAME_WIDTH / 2, SuikaGame.config.GAME_HEIGHT + SuikaGame.config.WALL_THICKNESS / 2, SuikaGame.config.GAME_WIDTH, SuikaGame.config.WALL_THICKNESS, {
                isStatic: true,
                render: { fillStyle: '#333' }
            }),
            // Parede esquerda
            Bodies.rectangle(-SuikaGame.config.WALL_THICKNESS / 2, SuikaGame.config.GAME_HEIGHT / 2, SuikaGame.config.WALL_THICKNESS, SuikaGame.config.GAME_HEIGHT, {
                isStatic: true,
                render: { fillStyle: '#333' }
            }),
            // Parede direita
            Bodies.rectangle(SuikaGame.config.GAME_WIDTH + SuikaGame.config.WALL_THICKNESS / 2, SuikaGame.config.GAME_HEIGHT / 2, SuikaGame.config.WALL_THICKNESS, SuikaGame.config.GAME_HEIGHT, {
                isStatic: true,
                render: { fillStyle: '#333' }
            }),
            // Linha de fim de jogo (invisível)
            Bodies.rectangle(SuikaGame.config.GAME_WIDTH / 2, 100, SuikaGame.config.GAME_WIDTH, 2, {
                isStatic: true,
                isSensor: true,
                render: { fillStyle: 'rgba(255, 0, 0, 0.3)' },
                isGameOverLine: true
            })
        ];
    
        World.add(SuikaGame.config.engine.world, walls);
    },



    setupCollisionEvents: function () {
        const { Events } = Matter;
    
        Events.on(SuikaGame.config.engine, 'collisionStart', function (event) {
            const pairs = event.pairs;
            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i];
                if (pair.bodyA.isFruit && pair.bodyB.isFruit) {
                    SuikaGame.game.handleFruitCollision(pair.bodyA, pair.bodyB);
                }
                
                // Verificar colisão com a linha de fim de jogo
                if ((pair.bodyA.isGameOverLine && pair.bodyB.isFruit && !pair.bodyB.isStatic) || 
                    (pair.bodyB.isGameOverLine && pair.bodyA.isFruit && !pair.bodyA.isStatic)) {
                    // Dar um tempo para a fruta cair antes de encerrar o jogo
                    setTimeout(function() {
                        if (!SuikaGame.config.gameOver) {
                            SuikaGame.game.endGame();
                        }
                    }, 2000);
                }
            }
        });
    },
    

    updateGravity: function (newGravity) {
        SuikaGame.config.engine.gravity.scale = newGravity;
    },

    // Adicione estas funções ao objeto SuikaGame.physics
    handleMouseMove: function (e) {
        if (SuikaGame.fruits.currentFruit && SuikaGame.fruits.currentFruit.isStatic && !SuikaGame.config.gameOver) {
            const rect = document.getElementById('game-canvas').getBoundingClientRect();
            SuikaGame.config.dropPosition = e.clientX - rect.left;

            // Limitar dentro das bordas
            const currentFruitRadius = SuikaGame.fruits.types[SuikaGame.fruits.nextFruitIndex].radius;
            SuikaGame.config.dropPosition = Math.max(currentFruitRadius,
                Math.min(SuikaGame.config.GAME_WIDTH - currentFruitRadius, SuikaGame.config.dropPosition));

            Matter.Body.setPosition(SuikaGame.fruits.currentFruit, {
                x: SuikaGame.config.dropPosition,
                y: SuikaGame.fruits.currentFruit.position.y
            });
        }
    },

    handleTouchMove: function (e) {
        e.preventDefault();
        if (SuikaGame.fruits.currentFruit && SuikaGame.fruits.currentFruit.isStatic && !SuikaGame.config.gameOver) {
            const rect = document.getElementById('game-canvas').getBoundingClientRect();
            SuikaGame.config.dropPosition = e.touches[0].clientX - rect.left;

            // Limitar dentro das bordas
            const currentFruitRadius = SuikaGame.fruits.types[SuikaGame.fruits.nextFruitIndex].radius;
            SuikaGame.config.dropPosition = Math.max(currentFruitRadius,
                Math.min(SuikaGame.config.GAME_WIDTH - currentFruitRadius, SuikaGame.config.dropPosition));

            Matter.Body.setPosition(SuikaGame.fruits.currentFruit, {
                x: SuikaGame.config.dropPosition,
                y: SuikaGame.fruits.currentFruit.position.y
            });
        }
    },

    dropFruit: function (e) {
        if (SuikaGame.fruits.currentFruit && SuikaGame.fruits.currentFruit.isStatic && SuikaGame.config.canDropFruit && !SuikaGame.config.gameOver) {
            SuikaGame.config.canDropFruit = false;
            Matter.Body.setStatic(SuikaGame.fruits.currentFruit, false);

            // Esperar um pouco antes de criar a próxima fruta
            setTimeout(function () {
                SuikaGame.fruits.createNewFruit();
            }, 500);
        }
    }

};