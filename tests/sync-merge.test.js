import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeSnapshots, pickSyncedKeys, planSync } from '../js/sync-merge.js';

const parse = value => JSON.parse(value);

test('coins and high score keep the larger value', () => {
    const merged = mergeSnapshots(
        { suikaCoins: '10', suikaHighScore: '900' },
        { suikaCoins: '500', suikaHighScore: '300' }
    );
    assert.equal(merged.suikaCoins, '500');
    assert.equal(merged.suikaHighScore, '900');
});

test('corrupted numbers never produce NaN', () => {
    const merged = mergeSnapshots({ suikaCoins: 'abc' }, { suikaCoins: '40' });
    assert.equal(merged.suikaCoins, '40');
    assert.equal(mergeSnapshots({}, {}).suikaCoins, '0');
});

test('unlock lists are unioned without duplicates', () => {
    const merged = mergeSnapshots(
        { suikaUnlockedSkinPacks: JSON.stringify(['classic', 'halloween']) },
        { suikaUnlockedSkinPacks: JSON.stringify(['classic', 'ocean']) }
    );
    assert.deepEqual(parse(merged.suikaUnlockedSkinPacks).sort(), ['classic', 'halloween', 'ocean']);
});

test('corrupted lists are treated as empty instead of crashing', () => {
    const merged = mergeSnapshots(
        { suikaMedals: 'null', suikaUnlockedTracks: '{"a":1}' },
        { suikaMedals: JSON.stringify(['first-game']), suikaUnlockedTracks: 'not json' }
    );
    assert.deepEqual(parse(merged.suikaMedals), ['first-game']);
    assert.deepEqual(parse(merged.suikaUnlockedTracks), []);
});

test('active selection prefers this device, falls back to cloud', () => {
    const merged = mergeSnapshots(
        { suikaActiveSkin: 'halloween' },
        { suikaActiveSkin: 'ocean', suikaActiveTheme: 'candy' }
    );
    assert.equal(merged.suikaActiveSkin, 'halloween');
    assert.equal(merged.suikaActiveTheme, 'candy');
    assert.equal('suikaActiveTrack' in merged, false);
});

test('power counts keep the larger count per power', () => {
    const merged = mergeSnapshots(
        { suikaPowers: JSON.stringify({ 'small-bomb': 2, 'hide-line': 1 }) },
        { suikaPowers: JSON.stringify({ 'small-bomb': 1, 'cherry-rain': 3 }) }
    );
    assert.deepEqual(parse(merged.suikaPowers), { 'small-bomb': 2, 'hide-line': 1, 'cherry-rain': 3 });
});

test('stats keep the best of each and the matching best fruit', () => {
    const merged = mergeSnapshots(
        { suikaStats: JSON.stringify({ gamesPlayed: 12, bestScore: 400, bestFruitIndex: 5, bestFruitId: 'pear' }) },
        { suikaStats: JSON.stringify({ gamesPlayed: 3, bestScore: 1200, bestFruitIndex: 9, bestFruitId: 'watermelon' }) }
    );
    assert.deepEqual(parse(merged.suikaStats), { gamesPlayed: 12, bestScore: 1200, bestFruitIndex: 9, bestFruitId: 'watermelon' });
});

test('merging is idempotent, so repeated syncs never inflate progress', () => {
    const local = { suikaCoins: '50', suikaMedals: JSON.stringify(['a']), suikaPowers: JSON.stringify({ x: 1 }) };
    const remote = { suikaCoins: '70', suikaMedals: JSON.stringify(['b']), suikaPowers: JSON.stringify({ x: 2 }) };
    const once = mergeSnapshots(local, remote);
    assert.deepEqual(mergeSnapshots(once, remote), once);
});

test('pickSyncedKeys drops unknown and empty fields', () => {
    assert.deepEqual(
        pickSyncedKeys({ suikaCoins: 5, suikaMuted: 'true', suikaMedals: null, extra: 'x' }),
        { suikaCoins: '5' }
    );
});

test('first sign-in on a device merges guest progress', () => {
    const plan = planSync({ local: { suikaCoins: '80' }, remote: { suikaCoins: '20' }, uid: 'B', lastUid: null });
    assert.equal(plan.mode, 'merge');
    assert.equal(plan.snapshot.suikaCoins, '80');
});

test('signing back into the same account merges', () => {
    const plan = planSync({ local: { suikaCoins: '80' }, remote: { suikaCoins: '20' }, uid: 'A', lastUid: 'A' });
    assert.equal(plan.mode, 'merge');
    assert.equal(plan.snapshot.suikaCoins, '80');
});

test('switching to another account replaces local progress with that account cloud copy', () => {
    const plan = planSync({
        local: { suikaCoins: '9000', suikaUnlockedSkinPacks: JSON.stringify(['luxury']) },
        remote: { suikaCoins: '15', suikaMuted: 'true' },
        uid: 'B',
        lastUid: 'A'
    });
    assert.equal(plan.mode, 'replace');
    assert.deepEqual(plan.snapshot, { suikaCoins: '15' });
});
