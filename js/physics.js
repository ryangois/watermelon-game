var SuikaGame = SuikaGame || {};

SuikaGame.physics = {
    setupEngine: function () {
        const { Engine, Render, Runner, Events } = Matter;

        SuikaGame.config.engine = Engine.create({
            gravity: {
                x: 0,
                y: 1,
                scale: SuikaGame.config.DIFFICULTY_LEVELS[SuikaGame.config.currentDifficulty].gravity
            }
        });

        SuikaGame.config.render = Render.create({
            element: document.getElementById('game-container'),
            engine: SuikaGame.config.engine,
            canvas: document.getElementById('game-canvas'),
            options: {
                width: SuikaGame.config.GAME_WIDTH,
                height: SuikaGame.config.GAME_HEIGHT,
                wireframes: false,
                background: SuikaGame.skins.getActiveTheme().vars['--canvas-bg']
            }
        });

        Render.run(SuikaGame.config.render);

        SuikaGame.config.runner = Runner.create();
        Runner.run(SuikaGame.config.runner, SuikaGame.config.engine);

        this.createWalls();
        this.setupCollisionEvents();

        const canvas = document.getElementById('game-canvas');
        canvas.addEventListener('mousemove', this.handlePointerMove);
        canvas.addEventListener('mousedown', this.dropFruit);
        canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', this.dropFruit);

        Events.on(SuikaGame.config.render, 'afterRender', function () {
            SuikaGame.particles.updateParticles();
        });
    },

    createWalls: function () {
        const { Bodies, World } = Matter;
        const wallOptions = {
            isStatic: true,
            render: { fillStyle: '#3f3425' }
        };
        const walls = [
            Bodies.rectangle(
                SuikaGame.config.GAME_WIDTH / 2,
                SuikaGame.config.GAME_HEIGHT + SuikaGame.config.WALL_THICKNESS / 2,
                SuikaGame.config.GAME_WIDTH,
                SuikaGame.config.WALL_THICKNESS,
                wallOptions
            ),
            Bodies.rectangle(
                -SuikaGame.config.WALL_THICKNESS / 2,
                SuikaGame.config.GAME_HEIGHT / 2,
                SuikaGame.config.WALL_THICKNESS,
                SuikaGame.config.GAME_HEIGHT,
                wallOptions
            ),
            Bodies.rectangle(
                SuikaGame.config.GAME_WIDTH + SuikaGame.config.WALL_THICKNESS / 2,
                SuikaGame.config.GAME_HEIGHT / 2,
                SuikaGame.config.WALL_THICKNESS,
                SuikaGame.config.GAME_HEIGHT,
                wallOptions
            ),
            Bodies.rectangle(
                SuikaGame.config.GAME_WIDTH / 2,
                SuikaGame.config.gameOverLine,
                SuikaGame.config.GAME_WIDTH,
                2,
                {
                    isStatic: true,
                    isSensor: true,
                    isGameOverLine: true,
                    render: { fillStyle: 'rgba(214, 40, 40, 0.55)' }
                }
            )
        ];

        World.add(SuikaGame.config.engine.world, walls);
    },

    setupCollisionEvents: function () {
        const { Events, Composite } = Matter;
        const fruitsOverLine = new Map();

        Events.on(SuikaGame.config.engine, 'collisionStart', function (event) {
            for (let i = 0; i < event.pairs.length; i++) {
                const pair = event.pairs[i];

                if (pair.bodyA.isFruit && pair.bodyB.isFruit) {
                    SuikaGame.game.handleFruitCollision(pair.bodyA, pair.bodyB);
                }
            }
        });

        Events.on(SuikaGame.config.engine, 'afterUpdate', function () {
            const gameOverLine = Composite.allBodies(SuikaGame.config.engine.world)
                .find(body => body.isGameOverLine);

            if (!gameOverLine || SuikaGame.config.gameOver || !SuikaGame.config.gameActive) {
                return;
            }

            const lineY = gameOverLine.position.y;

            fruitsOverLine.forEach((data, id) => {
                const fruit = data.body;

                if (!Composite.get(SuikaGame.config.engine.world, id, 'body')) {
                    clearInterval(data.interval);
                    fruitsOverLine.delete(id);
                    return;
                }

                if (fruit.position.y + fruit.circleRadius < lineY) {
                    const timeSinceLaunch = Date.now() - data.launchTimestamp;
                    const timeAboveLine = Date.now() - data.timestamp;

                    if (timeSinceLaunch >= 2000 && timeAboveLine >= 5000) {
                        clearInterval(data.interval);
                        fruitsOverLine.clear();
                        SuikaGame.game.endGame();
                    }
                } else {
                    clearInterval(data.interval);
                    fruitsOverLine.delete(id);
                    SuikaGame.physics.restoreFruitRender(fruit);
                }
            });

            Composite.allBodies(SuikaGame.config.engine.world).forEach(body => {
                if (
                    body.isFruit &&
                    !body.isStatic &&
                    !fruitsOverLine.has(body.id) &&
                    body.position.y + body.circleRadius < lineY
                ) {
                    fruitsOverLine.set(body.id, {
                        body: body,
                        timestamp: Date.now(),
                        launchTimestamp: body.launchTimestamp || Date.now(),
                        interval: setInterval(() => {
                            SuikaGame.physics.toggleWarningRender(body);
                        }, 500)
                    });
                }
            });
        });
    },

    toggleWarningRender: function (body) {
        if (!body.render.originalFillStyle) {
            body.render.originalFillStyle = body.render.fillStyle;
            body.render.originalSprite = body.render.sprite ? { ...body.render.sprite } : null;
        }

        if (body.render.fillStyle === 'rgba(214, 40, 40, 0.75)') {
            this.restoreFruitRender(body);
        } else {
            body.render.fillStyle = 'rgba(214, 40, 40, 0.75)';
            body.render.sprite = null;
        }
    },

    restoreFruitRender: function (body) {
        if (!body.render.originalFillStyle) {
            return;
        }

        body.render.fillStyle = body.render.originalFillStyle;

        if (body.render.originalSprite) {
            body.render.sprite = body.render.originalSprite;
        }

        body.render.originalFillStyle = null;
        body.render.originalSprite = null;
    },

    updateGravity: function (newGravity) {
        if (SuikaGame.config.engine) {
            SuikaGame.config.engine.gravity.scale = newGravity;
        }
    },

    applyTheme: function () {
        if (SuikaGame.config.render) {
            SuikaGame.config.render.options.background = SuikaGame.skins.getActiveTheme().vars['--canvas-bg'];
        }
    },

    handlePointerMove: function (e) {
        SuikaGame.physics.moveCurrentFruit(e.clientX);
    },

    handleTouchMove: function (e) {
        e.preventDefault();

        if (e.touches.length > 0) {
            SuikaGame.physics.moveCurrentFruit(e.touches[0].clientX);
        }
    },

    moveCurrentFruit: function (clientX) {
        const currentFruit = SuikaGame.fruits.currentFruit;

        if (!currentFruit || !currentFruit.isStatic || SuikaGame.config.gameOver) {
            return;
        }

        const rect = document.getElementById('game-canvas').getBoundingClientRect();
        const scaleX = SuikaGame.config.GAME_WIDTH / rect.width;
        const currentFruitRadius = SuikaGame.fruits.types[currentFruit.fruitIndex].radius;

        SuikaGame.config.dropPosition = (clientX - rect.left) * scaleX;
        SuikaGame.config.dropPosition = Math.max(
            currentFruitRadius,
            Math.min(SuikaGame.config.GAME_WIDTH - currentFruitRadius, SuikaGame.config.dropPosition)
        );

        Matter.Body.setPosition(currentFruit, {
            x: SuikaGame.config.dropPosition,
            y: currentFruit.position.y
        });
    },

    moveBy: function (deltaX) {
        const canvas = document.getElementById('game-canvas');
        const rect = canvas.getBoundingClientRect();
        const scaleX = SuikaGame.config.GAME_WIDTH / rect.width;
        const currentX = rect.left + (SuikaGame.config.dropPosition / scaleX);

        this.moveCurrentFruit(currentX + deltaX);
    },

    dropFruit: function () {
        const currentFruit = SuikaGame.fruits.currentFruit;

        if (!currentFruit || !currentFruit.isStatic || !SuikaGame.config.canDropFruit || SuikaGame.config.gameOver) {
            return;
        }

        SuikaGame.config.canDropFruit = false;
        currentFruit.launchTimestamp = Date.now();
        Matter.Body.setStatic(currentFruit, false);

        setTimeout(function () {
            if (!SuikaGame.config.gameOver && SuikaGame.config.gameActive) {
                SuikaGame.fruits.createNewFruit();
            }
        }, 500);
    }
};
