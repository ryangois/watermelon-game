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
const provider = new GoogleAuthProvider();
const listeners = new Set();

let currentUser = null;
let currentStatus = 'loading';
let currentError = null;

isAnalyticsSupported()
    .then(supported => {
        if (supported) getAnalytics(app);
    })
    .catch(() => {});

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

async function login() {
    setState('signing-in', currentUser, null);

    try {
        if (shouldUseRedirect()) {
            await signInWithRedirect(auth, provider);
            return null;
        }

        const result = await signInWithPopup(auth, provider);
        return getPublicUser(result.user);
    } catch (error) {
        setState(currentUser ? 'signed-in' : 'signed-out', currentUser, error);
        throw error;
    }
}

async function logout() {
    setState('signing-out', currentUser, null);
    await signOut(auth);
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
    getUser: () => currentUser,
    getStatus: () => currentStatus
};

window.dispatchEvent(new CustomEvent('suika-auth-ready'));

getRedirectResult(auth).catch(error => {
    setState('signed-out', null, error);
});

onAuthStateChanged(auth, user => {
    setState(user ? 'signed-in' : 'signed-out', getPublicUser(user), null);
});
