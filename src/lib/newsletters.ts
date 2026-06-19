import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Newsletter, NewsletterStatus } from "./types";

const COL = "newsletters";

function fromDoc(id: string, data: Record<string, unknown>): Newsletter {
  return {
    id,
    title: (data.title as string) ?? "",
    monthYear: (data.monthYear as string) ?? "",
    content: (data.content as string) ?? "",
    status: (data.status as NewsletterStatus) ?? "draft",
    createdAt: (data.createdAt as number) ?? 0,
  };
}

/** All newsletters (drafts + published), newest first. For the moderator panel. */
export async function listNewsletters(): Promise<Newsletter[]> {
  const snap = await getDocs(query(collection(db, COL), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

/** Only published newsletters, newest first. For the public view. */
export async function listPublished(): Promise<Newsletter[]> {
  const snap = await getDocs(
    query(collection(db, COL), where("status", "==", "published"))
  );
  return snap.docs
    .map((d) => fromDoc(d.id, d.data()))
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export async function getNewsletter(slug: string): Promise<Newsletter | null> {
  const ref = doc(db, COL, slug);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return fromDoc(snap.id, snap.data());
}

/** The most recent published newsletter, or null. */
export async function getLatestPublished(): Promise<Newsletter | null> {
  const all = await listPublished();
  return all[0] ?? null;
}

export interface SaveNewsletterInput {
  id: string;
  title: string;
  monthYear: string;
  content: string;
  status: NewsletterStatus;
  createdAt?: number;
}

export async function saveNewsletter(input: SaveNewsletterInput): Promise<void> {
  const ref = doc(db, COL, input.id);
  await setDoc(
    ref,
    {
      title: input.title,
      monthYear: input.monthYear,
      content: input.content,
      status: input.status,
      createdAt: input.createdAt ?? Date.now(),
    },
    { merge: true }
  );
}

export async function deleteNewsletter(slug: string): Promise<void> {
  await deleteDoc(doc(db, COL, slug));
}

/** Build a URL-friendly slug from arbitrary text. */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
