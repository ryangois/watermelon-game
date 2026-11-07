var SuikaGame = SuikaGame || {};

SuikaGame.physics = {
    fruitsOverLine: new Map(),

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
            element: document.querySelector('.fruit-vessel'),
            engine: SuikaGame.config.engine,
            canvas: document.getElementById('game-canvas'),
            options: {
                width: SuikaGame.config.GAME_WIDTH,
                height: SuikaGame.config.GAME_HEIGHT,
                wireframes: false,
                background: SuikaGame.skins.getActiveTheme().vars['--canvas-bg']
            }
        });

        this.updateRenderResolution();
        window.addEventListener('resize', () => this.updateRenderResolution());
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
            SuikaGame.physics.drawFruitRadiusOverlay();
        });
    },

    updateRenderResolution: function () {
        const render = SuikaGame.config.render;
        if (!render) return;
        const ratio = Math.min(3, Math.max(1, window.devicePixelRatio || 1));
        if (render.options.pixelRatio !== ratio) {
            Matter.Render.setPixelRatio(render, ratio);
        }
        // Matter sets fixed CSS dimensions when changing the backing resolution.
        // Keep the responsive pot size and pointer coordinates unchanged.
        render.canvas.style.width = '100%';
        render.canvas.style.height = 'auto';
        render.context.imageSmoothingEnabled = true;
        render.context.imageSmoothingQuality = 'high';
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
                    render: { fillStyle: SuikaGame.skins.getActiveTheme().vars['--danger-line'] }
                }
            )
        ];

        World.add(SuikaGame.config.engine.world, walls);
    },

    setupCollisionEvents: function () {
        const { Events, Composite } = Matter;
        const engine = SuikaGame.config.engine;

        Events.on(SuikaGame.config.engine, 'collisionStart', function (event) {
            for (let i = 0; i < event.pairs.length; i++) {
                const pair = event.pairs[i];

                if (pair.bodyA.isFruit && pair.bodyB.isFruit) {
                    SuikaGame.game.handleFruitCollision(pair.bodyA, pair.bodyB);
                }
            }
        });

        Events.on(engine, 'afterUpdate', () => {
            if (!SuikaGame.config.gameActive || SuikaGame.config.gameOver || SuikaGame.config.paused) return;
            const line = this.getGameOverLine();
            if (!line) return;
            const now = engine.timing.timestamp;
            if (line.isLineHidden) {
                if (now < SuikaGame.config.lineInvisibleUntil) return;
                line.isLineHidden = false;
                SuikaGame.config.lineInvisibleUntil = 0;
                this.applyTheme();
            }

            const bodies = Composite.allBodies(engine.world);
            const above = bodies.filter(body => body.isFruit && !body.isStatic && !body.toRemove &&
                body.position.y + body.circleRadius < line.position.y);
            for (const body of this.fruitsOverLine.keys()) {
                if (!above.includes(body)) this.fruitsOverLine.delete(body);
            }

            let longest = 0;
            for (const body of above) {
                if (!this.fruitsOverLine.has(body)) this.fruitsOverLine.set(body, now);
                longest = Math.max(longest, Math.round(now - this.fruitsOverLine.get(body)));
            }
            const limit = SuikaGame.config.DIFFICULTY_LEVELS[SuikaGame.config.currentDifficulty].dangerSeconds * 1000;
            if (longest >= limit) {
                this.clearLineWarnings();
                SuikaGame.game.endGame();
                return;
            }
            // Ignore momentary crossings while a dropped fruit is falling.
            this.updateLineWarning(longest >= 500 ? Math.ceil((limit - longest) / 1000) : 0);
        });
    },

    updateLineWarning: function (seconds) {
        if (seconds === this.warningSeconds) return;
        this.warningSeconds = seconds;
        document.getElementById('line-warning').textContent = seconds ? 'Fruta acima da linha · ' + seconds + ' s' : '';
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

        const line = this.getGameOverLine();
        if (line && !line.isLineHidden) {
            line.render.fillStyle = SuikaGame.skins.getActiveTheme().vars['--danger-line'];
        }
    },

    getGameOverLine: function () {
        if (!SuikaGame.config.engine) return null;
        return Matter.Composite.allBodies(SuikaGame.config.engine.world)
            .find(body => body.isGameOverLine) || null;
    },

    hideGameOverLine: function (durationMs) {
        const line = this.getGameOverLine();
        if (!line) return;

        SuikaGame.config.lineInvisibleUntil = SuikaGame.config.engine.timing.timestamp + durationMs;
        line.isLineHidden = true;
        line.render.fillStyle = 'rgba(0, 0, 0, 0)';
        this.clearLineWarnings();
    },

    clearLineWarnings: function () {
        this.fruitsOverLine.clear();
        this.updateLineWarning(0);
    },

    drawFruitRadiusOverlay: function () {
        if (!SuikaGame.skins.isFruitRadiusOverlayEnabled() || !SuikaGame.config.render) {
            return;
        }

        const { Composite } = Matter;
        const render = SuikaGame.config.render;
        const context = render.context;
        const fruits = Composite.allBodies(SuikaGame.config.engine.world)
            .filter(body => body.isFruit && body.circleRadius && !body.toRemove);

        context.save();
        context.lineWidth = 2;
        context.strokeStyle = 'rgba(47, 38, 31, 0.72)';
        context.fillStyle = 'rgba(255, 255, 255, 0.12)';

        fruits.forEach(fruit => {
            context.beginPath();
            context.arc(fruit.position.x, fruit.position.y, fruit.circleRadius, 0, Math.PI * 2);
            context.fill();
            context.stroke();
        });

        context.restore();
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

        if (!currentFruit || !currentFruit.isStatic || SuikaGame.config.gameOver || SuikaGame.config.paused) {
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

    dropFruit: function (event) {
        if (!SuikaGame.config.gameActive || SuikaGame.config.paused) return;
        if (SuikaGame.game.handleBombSelectionPointer(event)) {
            return;
        }

        const currentFruit = SuikaGame.fruits.currentFruit;

        if (!currentFruit || !currentFruit.isStatic || !SuikaGame.config.canDropFruit || SuikaGame.config.gameOver || SuikaGame.config.paused) {
            return;
        }

        SuikaGame.config.canDropFruit = false;
        Matter.Body.setStatic(currentFruit, false);
        SuikaGame.ui.haptic(18);

        setTimeout(function () {
            if (!SuikaGame.config.gameOver && SuikaGame.config.gameActive) {
                SuikaGame.fruits.createNewFruit();
            }
        }, 500);
    }
};
