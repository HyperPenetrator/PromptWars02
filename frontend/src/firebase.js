/**
 * Firebase Service Layer
 * 
 * Centralizes all Google Firebase integrations:
 * - Authentication (Google Sign-In)
 * - Firestore (Cloud data persistence)
 * - Analytics (User event tracking)
 * - Performance Monitoring (Web vitals)
 * 
 * @module firebase
 */
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getPerformance } from "firebase/performance";
import { firebaseConfig } from "./config/firebase-config";

// ── Initialize Firebase App ──────────────────────────────────────
const app = initializeApp(firebaseConfig);

// ── Google Authentication ────────────────────────────────────────
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ── Cloud Firestore (Data Persistence) ───────────────────────────
const db = getFirestore(app);

// ── Firebase Analytics (Event Tracking) ──────────────────────────
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn("Firebase Analytics not available in this environment.");
}

// ── Firebase Performance Monitoring ──────────────────────────────
let perf = null;
try {
  perf = getPerformance(app);
} catch (e) {
  console.warn("Firebase Performance Monitoring not available.");
}

// ── Auth Functions ───────────────────────────────────────────────
export { auth, provider, db, analytics };

/**
 * Sign in the user with a Google popup.
 * Logs the event to Firebase Analytics.
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  trackEvent('login', { method: 'google' });
  return result;
};

/**
 * Sign out the current user.
 * Logs the event to Firebase Analytics.
 * @returns {Promise<void>}
 */
export const logout = async () => {
  trackEvent('logout');
  return signOut(auth);
};

// ── Analytics Helpers ────────────────────────────────────────────

/**
 * Log a custom event to Firebase Analytics.
 * Safely handles environments where analytics is not available.
 * @param {string} eventName - The name of the event to log.
 * @param {Object} [params] - Optional parameters for the event.
 */
export const trackEvent = (eventName, params = {}) => {
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
};

// ── Firestore Helpers ────────────────────────────────────────────

/**
 * Save user-specific voter data to Cloud Firestore.
 * Creates or overwrites the document at `users/{uid}`.
 * @param {string} uid - The Firebase user ID.
 * @param {Object} data - The voter data object to persist.
 * @returns {Promise<void>}
 */
export const saveUserData = async (uid, data) => {
  if (!uid) return;
  try {
    await setDoc(doc(db, "users", uid), {
      voterData: data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.error("Firestore save error:", e);
  }
};

/**
 * Load user-specific voter data from Cloud Firestore.
 * Falls back to null if no document exists.
 * @param {string} uid - The Firebase user ID.
 * @returns {Promise<Object|null>} The stored voter data, or null.
 */
export const loadUserData = async (uid) => {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data().voterData : null;
  } catch (e) {
    console.error("Firestore load error:", e);
    return null;
  }
};

/**
 * Save the user's chat history to Cloud Firestore.
 * @param {string} uid - The Firebase user ID.
 * @param {Array} messages - The array of chat messages.
 * @returns {Promise<void>}
 */
export const saveChatHistory = async (uid, messages) => {
  if (!uid) return;
  try {
    const recent = messages.slice(-50); // Keep last 50 messages to stay within Firestore limits
    await setDoc(doc(db, "chats", uid), {
      messages: recent,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.error("Firestore chat save error:", e);
  }
};

/**
 * Load the user's chat history from Cloud Firestore.
 * @param {string} uid - The Firebase user ID.
 * @returns {Promise<Array|null>}
 */
export const loadChatHistory = async (uid) => {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, "chats", uid));
    return snap.exists() ? snap.data().messages : null;
  } catch (e) {
    console.error("Firestore chat load error:", e);
    return null;
  }
};
