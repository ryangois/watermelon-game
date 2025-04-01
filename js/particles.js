var SuikaGame = SuikaGame || {};

SuikaGame.particles = {

    activeParticles: [],

    Particle: class {
        constructor(x, y, color, size) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.size = size || Math.random() * 5 + 2;
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * 6 - 3;
            this.gravity = 0.1;
            this.life = 1.0; // Vida total da partícula (1.0 = 100%)
            this.decay = Math.random() * 0.02 + 0.02; // Taxa de decaimento
        }

        update() {
            this.speedY += this.gravity;
            this.x += this.speedX;
            this.y += this.speedY;
            this.life -= this.decay;
            return this.life > 0;
        }

        draw(ctx) {
            ctx.globalAlpha = this.life;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    },

    createParticles: function (x, y, color, count) {
        const particleCount = count || 15;
        for (let i = 0; i < particleCount; i++) {
            this.activeParticles.push(new this.Particle(x, y, color));
        }
    },

    updateParticles: function () {
        if (!SuikaGame.config.render || !SuikaGame.config.render.context) return;

        for (let i = this.activeParticles.length - 1; i >= 0; i--) {
            const particle = this.activeParticles[i];
            const isAlive = particle.update();

            if (isAlive) {
                particle.draw(SuikaGame.config.render.context);
            } else {
                this.activeParticles.splice(i, 1);
            }
        }
    }
};
