import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js';
import {
    getAuth,
    getRedirectResult,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
    signInWithRedirect,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const firebaseConfig = {
    apiKey: 'AIzaSyC35Yxa2WAQSObNG6ivdbtqtEdXKjpWapY',
    authDomain: 'suika-game-8b434.firebaseapp.com',
    projectId: 'suika-game-8b434',
    storageBucket: 'suika-game-8b434.firebasestorage.app',
    messagingSenderId: '1000783525571',
    appId: '1:1000783525571:web:0e9568b7def5c7a34bd476',
    measurementId: 'G-0LGCMWW51W'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const listeners = new Set();

const SYNC_NUMERIC_MAX_KEYS = ['suikaCoins', 'suikaHighScore'];
const SYNC_UNION_LIST_KEYS = ['suikaUnlockedSkins', 'suikaUnlockedSkinPacks', 'suikaUnlockedThemePacks', 'suikaUnlockedTracks', 'suikaMedals'];
const SYNC_ACTIVE_SELECTION_KEYS = ['suikaActiveSkin', 'suikaActiveTheme', 'suikaActiveTrack'];
const SYNCED_KEYS = SYNC_NUMERIC_MAX_KEYS.concat(SYNC_UNION_LIST_KEYS, SYNC_ACTIVE_SELECTION_KEYS, ['suikaPowers', 'suikaStats']);

let currentUser = null;
let currentStatus = 'loading';
let currentError = null;
let syncedUid = null;
let applyingRemoteState = false;
let pushTimer = null;

provider.setCustomParameters({
    prompt: 'select_account'
});

isAnalyticsSupported()
    .then(supported => {
        if (supported) getAnalytics(app);
    })
    .catch(() => {});

function parseJsonSafe(value, fallback) {
    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }
}

function snapshotLocalState() {
    const snapshot = {};
    SYNCED_KEYS.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) snapshot[key] = value;
    });
    return snapshot;
}

function writeLocalState(snapshot) {
    applyingRemoteState = true;
    try {
        Object.keys(snapshot).forEach(key => localStorage.setItem(key, snapshot[key]));
    } finally {
        applyingRemoteState = false;
    }
}

function mergeSnapshots(local, remote) {
    const merged = {};

    SYNC_NUMERIC_MAX_KEYS.forEach(key => {
        merged[key] = String(Math.max(parseInt(local[key] || '0', 10), parseInt(remote[key] || '0', 10)));
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
            mergedPowers[id] = Math.max(localPowers[id] || 0, remotePowers[id] || 0);
        });
        merged.suikaPowers = JSON.stringify(mergedPowers);
    }

    if (local.suikaStats !== undefined || remote.suikaStats !== undefined) {
        const localStats = parseJsonSafe(local.suikaStats, {});
        const remoteStats = parseJsonSafe(remote.suikaStats, {});
        const localBestFruitIndex = typeof localStats.bestFruitIndex === 'number' ? localStats.bestFruitIndex : -1;
        const remoteBestFruitIndex = typeof remoteStats.bestFruitIndex === 'number' ? remoteStats.bestFruitIndex : -1;
        merged.suikaStats = JSON.stringify({
            gamesPlayed: Math.max(localStats.gamesPlayed || 0, remoteStats.gamesPlayed || 0),
            bestScore: Math.max(localStats.bestScore || 0, remoteStats.bestScore || 0),
            bestFruitIndex: Math.max(localBestFruitIndex, remoteBestFruitIndex),
            bestFruitId: remoteBestFruitIndex > localBestFruitIndex ? remoteStats.bestFruitId : localStats.bestFruitId
        });
    }

    return merged;
}

function pushCloudState(uid) {
    setDoc(doc(db, 'users', uid), snapshotLocalState(), { merge: true }).catch(error => {
        console.warn('Suika sync: falha ao enviar progresso', error);
    });
}

function schedulePush() {
    if (!currentUser) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => pushCloudState(currentUser.uid), 1500);
}

async function pullAndMergeCloudState(uid) {
    try {
        const snapshotRef = doc(db, 'users', uid);
        const remoteDoc = await getDoc(snapshotRef);
        const merged = mergeSnapshots(snapshotLocalState(), remoteDoc.exists() ? remoteDoc.data() : {});

        writeLocalState(merged);
        await setDoc(snapshotRef, merged, { merge: true });
        window.dispatchEvent(new CustomEvent('suika-sync-complete'));
    } catch (error) {
        console.warn('Suika sync: falha ao sincronizar progresso', error);
    }
}

const nativeSetItem = localStorage.setItem.bind(localStorage);
localStorage.setItem = function (key, value) {
    nativeSetItem(key, value);
    if (!applyingRemoteState && SYNCED_KEYS.includes(key)) schedulePush();
};

function getPublicUser(user) {
    if (!user) return null;

    return {
        uid: user.uid,
        name: user.displayName || user.email || 'Jogador',
        email: user.email || '',
        photoURL: user.photoURL || ''
    };
}

function emit() {
    const payload = {
        user: currentUser,
        status: currentStatus,
        error: currentError
    };

    listeners.forEach(listener => listener(payload));
}

function setState(status, user, error) {
    currentStatus = status;
    currentUser = user || null;
    currentError = error || null;
    emit();
}

function shouldUseRedirect() {
    const isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    return isCoarsePointer || isStandalone;
}

function getLocalAuthUrl() {
    if (window.location.hostname !== '127.0.0.1') return '';
    const url = new URL(window.location.href);
    url.hostname = 'localhost';
    url.searchParams.set('login', 'google');
    return url.toString();
}

function consumeRequestedLogin() {
    const url = new URL(window.location.href);
    if (url.searchParams.get('login') !== 'google') return false;

    url.searchParams.delete('login');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    return true;
}

function getErrorCode(error) {
    return error && error.code ? error.code : '';
}

function shouldFallbackToRedirect(error) {
    const code = getErrorCode(error);
    return code.includes('popup-blocked')
        || code.includes('operation-not-supported-in-this-environment')
        || code.includes('web-storage-unsupported');
}

async function login() {
    const localAuthUrl = getLocalAuthUrl();

    if (localAuthUrl) {
        window.location.assign(localAuthUrl);
        return null;
    }

    setState('signing-in', currentUser, null);

    try {
        if (shouldUseRedirect()) {
            await signInWithRedirect(auth, provider);
            return null;
        }

        try {
            const result = await signInWithPopup(auth, provider);
            return getPublicUser(result.user);
        } catch (error) {
            if (!shouldFallbackToRedirect(error)) throw error;
            await signInWithRedirect(auth, provider);
            return null;
        }
    } catch (error) {
        setState(currentUser ? 'signed-in' : 'signed-out', currentUser, error);
        throw error;
    }
}

async function logout() {
    setState('signing-out', currentUser, null);

    try {
        await signOut(auth);
    } catch (error) {
        setState('signed-in', currentUser, error);
        throw error;
    }
}

function listen(listener) {
    listeners.add(listener);
    listener({
        user: currentUser,
        status: currentStatus,
        error: currentError
    });

    return function unsubscribe() {
        listeners.delete(listener);
    };
}

window.SuikaAuth = {
    login,
    logout,
    listen,
    getLocalAuthUrl,
    getErrorCode,
    getUser: () => currentUser,
    getStatus: () => currentStatus
};

window.dispatchEvent(new CustomEvent('suika-auth-ready'));

let requestedLogin = consumeRequestedLogin();

getRedirectResult(auth).catch(error => {
    if (!currentUser) setState('signed-out', null, error);
});

onAuthStateChanged(auth, user => {
    setState(user ? 'signed-in' : 'signed-out', getPublicUser(user), null);
    if (!user && requestedLogin) {
        requestedLogin = false;
        login().catch(() => {});
    }
    if (user && syncedUid !== user.uid) {
        syncedUid = user.uid;
        pullAndMergeCloudState(user.uid);
    } else if (!user) {
        syncedUid = null;
    }
});
