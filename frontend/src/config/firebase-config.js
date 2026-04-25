// This file contains the hardcoded Firebase configuration keys for the frontend build.
// These are public client-side keys and are safe to be included in the JS bundle.

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAmKtStpWyJzocpg0EUKcReklBL3srMaE0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "promptwars-02-54bf8.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "promptwars-02-54bf8",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "promptwars-02-54bf8.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "76853460573",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:76853460573:web:8a783652bbef61edf817b4"
};
