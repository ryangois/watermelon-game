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

// Reuses this module's ?v= query so the cache-busting version lives in one fewer place.
const { SYNCED_KEYS, planSync } = await import(new URL(`./sync-merge.js${new URL(import.meta.url).search}`, import.meta.url));

const LAST_SYNCED_UID_KEY = 'suikaLastSyncedUid';
const LOGOUT_FLUSH_TIMEOUT_MS = 3000;

let currentUser = null;
let currentStatus = 'loading';
let currentError = null;
let syncedUid = null;
let cloudReadyUid = null;
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

function snapshotLocalState() {
    const snapshot = {};
    SYNCED_KEYS.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) snapshot[key] = value;
    });
    return snapshot;
}

function writeLocalState(snapshot, replace) {
    applyingRemoteState = true;
    try {
        SYNCED_KEYS.forEach(key => {
            if (snapshot[key] !== undefined) localStorage.setItem(key, snapshot[key]);
            else if (replace) localStorage.removeItem(key);
        });
    } finally {
        applyingRemoteState = false;
    }
}

// Pushing before the first pull for this account finishes would overwrite cloud data with unmerged local data.
function canPush() {
    return Boolean(currentUser) && cloudReadyUid === currentUser.uid;
}

function pushCloudState(uid) {
    return setDoc(doc(db, 'users', uid), snapshotLocalState(), { merge: true }).catch(error => {
        console.warn('Suika sync: falha ao enviar progresso', error);
    });
}

function schedulePush() {
    if (!canPush()) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => {
        pushTimer = null;
        if (canPush()) pushCloudState(currentUser.uid);
    }, 1500);
}

function flushPush() {
    if (!pushTimer) return Promise.resolve();
    clearTimeout(pushTimer);
    pushTimer = null;
    return canPush() ? pushCloudState(currentUser.uid) : Promise.resolve();
}

async function pullAndMergeCloudState(uid) {
    try {
        const snapshotRef = doc(db, 'users', uid);
        const remoteDoc = await getDoc(snapshotRef);
        if (!currentUser || currentUser.uid !== uid) return;

        const { mode, snapshot } = planSync({
            local: snapshotLocalState(),
            remote: remoteDoc.exists() ? remoteDoc.data() : {},
            uid,
            lastUid: localStorage.getItem(LAST_SYNCED_UID_KEY)
        });

        writeLocalState(snapshot, mode === 'replace');
        localStorage.setItem(LAST_SYNCED_UID_KEY, uid);
        cloudReadyUid = uid;
        window.dispatchEvent(new CustomEvent('suika-sync-complete', { detail: { mode } }));
        await setDoc(snapshotRef, snapshot, { merge: true });
    } catch (error) {
        console.warn('Suika sync: falha ao sincronizar progresso', error);
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushPush();
});
window.addEventListener('pagehide', () => flushPush());

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
        await Promise.race([flushPush(), new Promise(resolve => setTimeout(resolve, LOGOUT_FLUSH_TIMEOUT_MS))]);
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
        cloudReadyUid = null;
        clearTimeout(pushTimer);
        pushTimer = null;
    }
});
