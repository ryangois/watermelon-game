var SuikaGame = SuikaGame || {};

// Configuração e gerenciamento da física do jogo
SuikaGame.physics = {
    // Inicializar o engine de física
    setupEngine: function () {
        // Configurar Matter.js
        const { Engine, Render, Runner, Bodies, World, Events } = Matter;
        // Adicione isso ao arquivo physics.js na função setupEngine
        // Substitua os event listeners existentes por:
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mousedown', this.dropFruit);
        document.addEventListener('touchmove', this.handleTouchMove);
        document.addEventListener('touchend', this.dropFruit); // Mudado de touchstart para touchend



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
            // Linha de fim de jogo (abaixo da fruta no topo)
            Bodies.rectangle(SuikaGame.config.GAME_WIDTH / 2, 130, SuikaGame.config.GAME_WIDTH, 2, {
                isStatic: true,
                isSensor: true,
                render: { fillStyle: 'rgba(255, 0, 0, 0.5)' },
                isGameOverLine: true
            })
        ];

        World.add(SuikaGame.config.engine.world, walls);
    },



    setupCollisionEvents: function () {
        const { Events, Composite } = Matter;

        // Mapa para rastrear frutas que estão cruzando a linha
        const fruitsOverLine = new Map();

        Events.on(SuikaGame.config.engine, 'collisionStart', function (event) {
            const pairs = event.pairs;
            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i];

                // Verificar colisões entre frutas
                if (pair.bodyA.isFruit && pair.bodyB.isFruit) {
                    SuikaGame.game.handleFruitCollision(pair.bodyA, pair.bodyB);
                }
            }
        });

        Events.on(SuikaGame.config.engine, 'afterUpdate', function () {
            const gameOverLine = Composite.allBodies(SuikaGame.config.engine.world)
                .find(body => body.isGameOverLine);

            if (!gameOverLine || SuikaGame.config.gameOver) return;

            const lineY = gameOverLine.position.y;

            // Verificar cada fruta no rastreador
            fruitsOverLine.forEach((data, id) => {
                const fruit = data.body;

                // Verificar se a fruta ainda existe no mundo
                if (!Composite.get(SuikaGame.config.engine.world, id, 'body')) {
                    clearInterval(data.interval);
                    fruitsOverLine.delete(id);
                    return;
                }

                const fruitRadius = fruit.circleRadius;
                const fruitBottomY = fruit.position.y + fruitRadius;

                if (fruitBottomY < lineY) {
                    // A fruta está completamente acima da linha
                    const timeElapsedSinceLaunch = Date.now() - data.launchTimestamp;
                    const timeElapsedAboveLine = Date.now() - data.timestamp;

                    // Iniciar o contador apenas 2 segundos após o lançamento
                    if (timeElapsedSinceLaunch >= 2000 && timeElapsedAboveLine >= 5000 && !SuikaGame.config.gameOver) {
                        clearInterval(data.interval);
                        fruitsOverLine.clear();

                        SuikaGame.game.endGame();

                    }
                } else {
                    // A fruta voltou para baixo da linha ou não está completamente acima
                    clearInterval(data.interval);
                    fruitsOverLine.delete(id);

                    // Restaurar a aparência original da fruta
                    if (fruit.render.originalFillStyle) {
                        fruit.render.fillStyle = fruit.render.originalFillStyle;
                        if (fruit.render.originalSprite) {
                            fruit.render.sprite = fruit.render.originalSprite;
                        }
                        fruit.render.originalFillStyle = null;
                        fruit.render.originalSprite = null;
                    }
                }
            });

            // Adicionar frutas novas ao rastreador
            Composite.allBodies(SuikaGame.config.engine.world).forEach(body => {
                if (
                    body.isFruit &&
                    !body.isStatic && // Apenas frutas que já foram lançadas
                    !fruitsOverLine.has(body.id)
                ) {
                    const fruitRadius = body.circleRadius;
                    const fruitBottomY = body.position.y + fruitRadius;

                    if (fruitBottomY < lineY) {
                        fruitsOverLine.set(body.id, {
                            body: body,
                            timestamp: Date.now(), // Quando cruzou a linha
                            launchTimestamp: body.launchTimestamp || Date.now(), // Quando foi lançado
                            interval: setInterval(() => {
                                // Fazer a fruta piscar em vermelho
                                if (!body.render.originalFillStyle) {
                                    body.render.originalFillStyle = body.render.fillStyle;
                                    body.render.originalSprite = body.render.sprite ? { ...body.render.sprite } : null;
                                }

                                if (body.render.fillStyle === 'rgba(255, 0, 0, 0.7)') {
                                    // Voltar para a cor original
                                    body.render.fillStyle = body.render.originalFillStyle;
                                    if (body.render.originalSprite) {
                                        body.render.sprite = body.render.originalSprite;
                                    }
                                } else {
                                    // Mudar para vermelho
                                    body.render.fillStyle = 'rgba(255, 0, 0, 0.7)';
                                    if (body.render.sprite) {
                                        body.render.sprite = null;
                                    }
                                }
                            }, 500) // Piscar a cada 500ms
                        });
                    }
                }
            });
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

    // No arquivo physics.js, modifique:
    handleTouchMove: function (e) {
        e.preventDefault();
        if (SuikaGame.fruits.currentFruit && SuikaGame.fruits.currentFruit.isStatic && !SuikaGame.config.gameOver) {
            const rect = document.getElementById('game-canvas').getBoundingClientRect();
            SuikaGame.config.dropPosition = e.touches[0].clientX - rect.left;

            // Limitar dentro das bordas
            const currentFruitRadius = SuikaGame.fruits.types[SuikaGame.fruits.currentFruit.fruitIndex].radius;
            SuikaGame.config.dropPosition = Math.max(currentFruitRadius,
                Math.min(SuikaGame.config.GAME_WIDTH - currentFruitRadius, SuikaGame.config.dropPosition));

            Matter.Body.setPosition(SuikaGame.fruits.currentFruit, {
                x: SuikaGame.config.dropPosition,
                y: SuikaGame.fruits.currentFruit.position.y
            });
        }
    },

    dropFruit: function (e) {
        // Para dispositivos móveis, só soltar a fruta no touchend
        if (e.type === 'touchend') {
            if (SuikaGame.fruits.currentFruit && SuikaGame.fruits.currentFruit.isStatic && SuikaGame.config.canDropFruit && !SuikaGame.config.gameOver) {
                SuikaGame.config.canDropFruit = false;
                Matter.Body.setStatic(SuikaGame.fruits.currentFruit, false);

                // Esperar um pouco antes de criar a próxima fruta
                setTimeout(function () {
                    SuikaGame.fruits.createNewFruit();
                }, 500);
            }
        }
        // Para mouse, manter o comportamento de clique
        else if (e.type === 'mousedown') {
            if (SuikaGame.fruits.currentFruit && SuikaGame.fruits.currentFruit.isStatic && SuikaGame.config.canDropFruit && !SuikaGame.config.gameOver) {
                SuikaGame.config.canDropFruit = false;
                Matter.Body.setStatic(SuikaGame.fruits.currentFruit, false);

                // Esperar um pouco antes de criar a próxima fruta
                setTimeout(function () {
                    SuikaGame.fruits.createNewFruit();
                }, 500);
            }
        }
    }

}
