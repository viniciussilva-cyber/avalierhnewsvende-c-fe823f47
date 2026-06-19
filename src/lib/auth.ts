/**
 * Hardcoded moderator access (front-end only, as requested).
 *
 * NOTE: This is client-side protection. There is no Firebase Auth backing it,
 * so it gates the UI but not direct database writes. Tighten Firestore rules
 * and/or add real auth later if stronger protection is needed.
 */
const ALLOWED_EMAILS = ["vinicius.silva@vende-c.com", "lucas.izan@vende-c.com"];
const PASSWORD = "rh2026!";
const STORAGE_KEY = "rhnews_mod_session";

export function login(email: string, password: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (ALLOWED_EMAILS.includes(normalized) && password === PASSWORD) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, normalized);
    }
    return true;
  }
  return false;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

export function currentModerator(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  return currentModerator() !== null;
}
