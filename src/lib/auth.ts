/**
 * Real moderator authentication backed by Firebase Auth (email/password).
 *
 * The previous hardcoded session has been replaced. Accounts must be created
 * in the Firebase Console → Authentication → Users. Backend protection is
 * enforced by the Firestore Security Rules (see firestore.rules) which only
 * allow writes from the approved moderator e-mails.
 */
import { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth, firebaseConfigured } from "./firebase";

/** Friendly error messages for the most common Firebase Auth error codes. */
function authErrorMessage(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/user-disabled":
      return "Esta conta foi desativada.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "E-mail ou senha inválidos.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente mais tarde.";
    case "auth/network-request-failed":
      return "Falha de conexão. Verifique sua internet.";
    default:
      return "Não foi possível entrar. Tente novamente.";
  }
}

/** Sign in with email/password. Throws an Error with a friendly message. */
export async function login(email: string, password: string): Promise<void> {
  if (!firebaseConfigured) {
    throw new Error("Firebase não configurado.");
  }
  try {
    await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  } catch (err) {
    const code = (err as { code?: string })?.code ?? "";
    throw new Error(authErrorMessage(code));
  }
}

export async function logout(): Promise<void> {
  if (!firebaseConfigured) return;
  await firebaseSignOut(auth);
}

/**
 * React hook exposing the current Firebase Auth state.
 * `loading` is true until the initial auth state has resolved.
 */
export function useAuth(): { user: User | null; loading: boolean } {
  const [user, setUser] = useState<User | null>(() => auth?.currentUser ?? null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseConfigured) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
}
