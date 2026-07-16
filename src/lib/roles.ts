import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db, firebaseConfigured } from "./firebase";

export type Role = "rh" | "gestor";

/** Emails that are always treated as RH (moderator), even without a users/{uid} doc. */
const RH_ALLOWLIST = [
  "vinicius.silva@vende-c.com",
  "lucas.zan@vende-c.com",
];

export function isRhEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return RH_ALLOWLIST.includes(email.trim().toLowerCase());
}

/**
 * Resolves the current user's role.
 *
 * Precedence:
 *   1. If the email is on the hard-coded RH allowlist → 'rh'.
 *   2. Otherwise, look up `users/{uid}.role` in Firestore.
 *   3. Fallback: any authenticated user is 'gestor'.
 */
export function useRole(user: User | null): { role: Role | null; loading: boolean } {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    if (isRhEmail(user.email)) {
      setRole("rh");
      setLoading(false);
      return;
    }

    if (!firebaseConfigured) {
      setRole("gestor");
      setLoading(false);
      return;
    }

    setLoading(true);
    getDoc(doc(db, "users", user.uid))
      .then((snap) => {
        if (cancelled) return;
        const stored = snap.exists() ? (snap.data().role as Role | undefined) : undefined;
        setRole(stored ?? "gestor");
      })
      .catch(() => {
        if (!cancelled) setRole("gestor");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { role, loading };
}
