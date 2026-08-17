/**
 * Lightweight session for the standalone R&S portal (/rs).
 *
 * The gestor signs in with the corporate e-mail only (no password). The
 * e-mail is kept in localStorage, and a Firebase *anonymous* session is
 * created so the Firestore Security Rules (which require an authenticated
 * request) allow reading candidates and writing the parecer.
 */
import { useCallback, useEffect, useState } from "react";
import { signInAnonymously, signOut } from "firebase/auth";
import { auth, firebaseConfigured } from "./firebase";
import { findManager, type Manager } from "./managers";

const EMAIL_KEY = "vendec.rs.email";
const MODE_KEY = "vendec.rs.mode";

/** "area" = only their own area, "geral" = every candidate. */
export type GestorMode = "area" | "geral";

export interface GestorSession {
  manager: Manager;
  mode: GestorMode;
}

function read(): GestorSession | null {
  if (typeof window === "undefined") return null;
  const manager = findManager(window.localStorage.getItem(EMAIL_KEY));
  if (!manager) return null;
  const stored = window.localStorage.getItem(MODE_KEY);
  const mode: GestorMode = stored === "geral" ? "geral" : "area";
  return { manager, mode: manager.allAreas ? "geral" : mode };
}

export async function gestorSignIn(email: string, mode: GestorMode = "area"): Promise<Manager> {
  const manager = findManager(email);
  if (!manager) {
    throw new Error("E-mail não autorizado. Fale com o RH para liberar seu acesso.");
  }
  if (firebaseConfigured && !auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      if (code.includes("operation-not-allowed")) {
        throw new Error(
          "O acesso anônimo do Firebase ainda não está habilitado. Peça ao RH para ativar em Authentication → Sign-in method → Anonymous.",
        );
      }
      throw new Error("Não foi possível iniciar a sessão. Tente novamente.");
    }
  }
  window.localStorage.setItem(EMAIL_KEY, manager.email);
  window.localStorage.setItem(MODE_KEY, manager.allAreas ? "geral" : mode);
  return manager;
}

export async function gestorSignOut(): Promise<void> {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(EMAIL_KEY);
    window.localStorage.removeItem(MODE_KEY);
  }
  if (firebaseConfigured && auth.currentUser?.isAnonymous) {
    await signOut(auth);
  }
}

/** Current gestor session (client-side only). */
export function useGestorSession(): { session: GestorSession | null; loading: boolean; refresh: () => void } {
  const [session, setSession] = useState<GestorSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => setSession(read()), []);

  useEffect(() => {
    const current = read();
    if (current && firebaseConfigured && !auth.currentUser) {
      signInAnonymously(auth)
        .catch(() => undefined)
        .finally(() => {
          setSession(current);
          setLoading(false);
        });
      return;
    }
    setSession(current);
    setLoading(false);
  }, []);

  return { session, loading, refresh };
}
