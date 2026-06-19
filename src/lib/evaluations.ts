import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Evaluation } from "./types";

const COL = "evaluations";

function fromDoc(id: string, data: Record<string, unknown>): Evaluation {
  return {
    id,
    newsletterId: (data.newsletterId as string) ?? "",
    rating: (data.rating as number) ?? 0,
    name: (data.name as string) ?? "",
    role: (data.role as string) ?? "",
    comment: (data.comment as string) ?? "",
    date: (data.date as number) ?? 0,
  };
}

export async function listEvaluations(newsletterId: string): Promise<Evaluation[]> {
  const snap = await getDocs(
    query(collection(db, COL), where("newsletterId", "==", newsletterId))
  );
  return snap.docs
    .map((d) => fromDoc(d.id, d.data()))
    .sort((a, b) => b.date - a.date);
}

export async function listAllEvaluations(): Promise<Evaluation[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs
    .map((d) => fromDoc(d.id, d.data()))
    .sort((a, b) => b.date - a.date);
}

export interface AddEvaluationInput {
  newsletterId: string;
  rating: number;
  name: string;
  role: string;
  comment?: string;
}

export async function addEvaluation(input: AddEvaluationInput): Promise<void> {
  await addDoc(collection(db, COL), {
    newsletterId: input.newsletterId,
    rating: input.rating,
    name: input.name,
    role: input.role,
    comment: input.comment ?? "",
    date: Date.now(),
  });
}

/** Average rating rounded to one decimal, or null when there are no evaluations. */
export function averageRating(evaluations: Evaluation[]): number | null {
  if (!evaluations.length) return null;
  const sum = evaluations.reduce((acc, e) => acc + e.rating, 0);
  return Math.round((sum / evaluations.length) * 10) / 10;
}
