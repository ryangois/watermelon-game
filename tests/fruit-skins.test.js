import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function game() {
    const context = vm.createContext({
        localStorage: { getItem: () => null },
        Matter: { Bodies: { circle: (x, y, radius, options) => ({ x, y, radius, ...options }) } }
    });
    for (const name of ['sprite-metrics', 'skins', 'fruits']) {
        vm.runInContext(fs.readFileSync(new URL(`../js/${name}.js`, import.meta.url), 'utf8'), context);
    }
    return context.SuikaGame;
}

test('all 99 fruit costumes have assets and consistent visible area at every size', () => {
    const g = game();
    for (const pack of g.skins.packs) {
        for (const fruit of g.fruits.types) {
            const path = pack.assetFolder ? `${pack.assetFolder}/${fruit.image.split('/').pop()}` : fruit.image;
            assert.ok(fs.existsSync(new URL(`../${path}`, import.meta.url)), path);
            const geometry = g.spriteMetrics[path];
            assert.ok(geometry?.radius > 0, path);
            assert.ok(geometry.xOffset > 0 && geometry.xOffset < 1, path);
            assert.ok(geometry.yOffset > 0 && geometry.yOffset < 1, path);
            for (const multiplier of [0.9, 1, 1.15]) {
                const sized = { ...fruit, radius: fruit.baseRadius * multiplier };
                const scale = g.fruits.getSpriteScale(sized, path);
                assert.ok(Math.abs(geometry.radius * scale - sized.radius * 1.02) < 0.001, path);
            }
        }
    }
});

test('costumes keep collision size and center the visible artwork', () => {
    const g = game();
    const fruit = g.fruits.types[4];
    const path = `assets/images/Halloween/${fruit.image.split('/').pop()}`;
    g.skins.getFruitView = () => ({ image: path, color: '#f00' });
    const body = g.fruits.createFruitBody(100, 200, fruit);
    assert.equal(body.radius, fruit.radius);
    assert.equal(body.render.sprite.xOffset, g.spriteMetrics[path].xOffset);
    assert.equal(body.render.sprite.yOffset, g.spriteMetrics[path].yOffset);
});
