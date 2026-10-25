export const SYNC_NUMERIC_MAX_KEYS = ['suikaCoins', 'suikaHighScore'];
export const SYNC_UNION_LIST_KEYS = ['suikaUnlockedSkins', 'suikaUnlockedSkinPacks', 'suikaUnlockedThemePacks', 'suikaUnlockedTracks', 'suikaMedals'];
export const SYNC_ACTIVE_SELECTION_KEYS = ['suikaActiveSkin', 'suikaActiveTheme', 'suikaActiveTrack'];
export const SYNCED_KEYS = SYNC_NUMERIC_MAX_KEYS.concat(SYNC_UNION_LIST_KEYS, SYNC_ACTIVE_SELECTION_KEYS, ['suikaPowers', 'suikaStats']);

function toInt(value) {
    const number = parseInt(value, 10);
    return Number.isFinite(number) ? number : 0;
}

function parseJsonSafe(value, fallback) {
    try {
        const parsed = JSON.parse(value);
        const sameShape = parsed !== null
            && typeof parsed === typeof fallback
            && Array.isArray(parsed) === Array.isArray(fallback);
        return sameShape ? parsed : fallback;
    } catch (error) {
        return fallback;
    }
}

export function mergeSnapshots(local, remote) {
    const merged = {};

    SYNC_NUMERIC_MAX_KEYS.forEach(key => {
        merged[key] = String(Math.max(toInt(local[key]), toInt(remote[key])));
    });

    SYNC_UNION_LIST_KEYS.forEach(key => {
        const localList = parseJsonSafe(local[key], []);
        const remoteList = parseJsonSafe(remote[key], []);
        merged[key] = JSON.stringify(Array.from(new Set(localList.concat(remoteList))));
    });

    SYNC_ACTIVE_SELECTION_KEYS.forEach(key => {
        if (local[key] !== undefined) merged[key] = local[key];
        else if (remote[key] !== undefined) merged[key] = remote[key];
    });

    if (local.suikaPowers !== undefined || remote.suikaPowers !== undefined) {
        const localPowers = parseJsonSafe(local.suikaPowers, {});
        const remotePowers = parseJsonSafe(remote.suikaPowers, {});
        const mergedPowers = {};
        Array.from(new Set(Object.keys(localPowers).concat(Object.keys(remotePowers)))).forEach(id => {
            mergedPowers[id] = Math.max(toInt(localPowers[id]), toInt(remotePowers[id]));
        });
        merged.suikaPowers = JSON.stringify(mergedPowers);
    }

    if (local.suikaStats !== undefined || remote.suikaStats !== undefined) {
        const localStats = parseJsonSafe(local.suikaStats, {});
        const remoteStats = parseJsonSafe(remote.suikaStats, {});
        const localBestFruitIndex = typeof localStats.bestFruitIndex === 'number' ? localStats.bestFruitIndex : -1;
        const remoteBestFruitIndex = typeof remoteStats.bestFruitIndex === 'number' ? remoteStats.bestFruitIndex : -1;
        merged.suikaStats = JSON.stringify({
            gamesPlayed: Math.max(toInt(localStats.gamesPlayed), toInt(remoteStats.gamesPlayed)),
            bestScore: Math.max(toInt(localStats.bestScore), toInt(remoteStats.bestScore)),
            bestFruitIndex: Math.max(localBestFruitIndex, remoteBestFruitIndex),
            bestFruitId: remoteBestFruitIndex > localBestFruitIndex ? remoteStats.bestFruitId : localStats.bestFruitId
        });
    }

    return merged;
}

export function pickSyncedKeys(source) {
    const picked = {};
    SYNCED_KEYS.forEach(key => {
        if (source[key] !== undefined && source[key] !== null) picked[key] = String(source[key]);
    });
    return picked;
}

// Signing into a different account than the one this device last synced replaces local
// progress with that account's cloud copy, so one account's progress never leaks into another.
export function planSync({ local, remote, uid, lastUid }) {
    if (lastUid && lastUid !== uid) {
        return { mode: 'replace', snapshot: pickSyncedKeys(remote) };
    }
    return { mode: 'merge', snapshot: mergeSnapshots(local, pickSyncedKeys(remote)) };
}
