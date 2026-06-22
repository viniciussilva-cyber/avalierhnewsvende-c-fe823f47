import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

export const firebaseConfigured = !firebaseConfig.apiKey.startsWith("YOUR_");

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
