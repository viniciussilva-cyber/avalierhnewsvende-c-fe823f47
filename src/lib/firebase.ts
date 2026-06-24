import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

/**
 * Firebase Web config.
 *
 * These keys are publishable (safe to keep in the codebase) — the real
 * protection comes from your Firestore Security Rules.
 *
 * 👉 Replace the placeholder values below with your project's config from:
 *    Firebase Console → Project settings → General → Your apps → SDK setup.
 */
const firebaseConfig = {
  apiKey: "AIzaSyDjkQvOgOClV7T1_kYQUgad_5_aaQ7-F_Q",
  authDomain: "avalie-rh-news.firebaseapp.com",
  projectId: "avalie-rh-news",
  storageBucket: "avalie-rh-news.firebasestorage.app",
  messagingSenderId: "578422633995",
  appId: "1:578422633995:web:ce98089ed34a83e7d6790e",
};

export const firebaseConfigured = !firebaseConfig.apiKey.startsWith("YOUR_");

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
