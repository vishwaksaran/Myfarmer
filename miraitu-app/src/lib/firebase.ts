// Firebase configuration
// You need to replace these with your actual Firebase project credentials
// Get these from: https://console.firebase.google.com > Your Project > Project Settings > Web App

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase (singleton pattern - prevent re-initialization)
function initializeFirebaseApp() {
    if (getApps().length === 0) {
        return initializeApp(firebaseConfig);
    }
    return getApp();
}

const app = initializeFirebaseApp();

// Initialize Firebase Authentication with persistence
export const auth = getAuth(app);

// Set persistence to local storage (only runs client-side)
if (typeof window !== 'undefined') {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.error('Firebase persistence error:', error);
    });
}

// Google Auth Provider (initialize once)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export default app;
