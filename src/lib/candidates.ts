import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { listFeedback, saveFeedback } from "./rs.functions";


export const CANDIDATE_STATUSES = [
  { id: "triagem", label: "Triagem" },
  { id: "entrevista_rh", label: "Entrevista RH" },
  { id: "avaliacao_gestor", label: "Avaliação do gestor" },
  { id: "aprovado", label: "Aprovado" },
  { id: "reprovado", label: "Reprovado" },
] as const;

export type CandidateStatus = (typeof CANDIDATE_STATUSES)[number]["id"];

export const CANDIDATE_AREAS = [
  "Administrativo",
  "Comercial",
  "Marketing",
  "Financeiro",
  "Operações",
  "Tecnologia",
  "Atendimento",
  "Outro",
];

export interface Candidate {
  id: string;
  /** Vaga a que o candidato pertence. */
  jobId: string;
  photoUrl?: string;
  fullName: string;
  salaryExpectation: string;
  area: string;
  resumeUrl: string;
  rhSummary: string;
  experience: string;
  rhNotes: string;
  status: CandidateStatus;
  /** E-mails de gestores liberados manualmente pelo RH (além da área). */
  assignedManagers: string[];
  createdAt: number;
  updatedAt: number;
}

/** Decisão do gestor sobre o candidato. */
export type FeedbackDecision = "aprovado" | "negado" | "espera" | null;

export const FEEDBACK_DECISIONS = [
  { id: "aprovado", label: "Aprovado" },
  { id: "negado", label: "Negado" },
  { id: "espera", label: "Em espera" },
] as const;

export interface GestorFeedback {
  gestorUid: string;
  gestorName: string;
  gestorEmail: string;
  feedback: string;
  decision: FeedbackDecision;
  /** Compatibilidade com pareceres antigos (true/false/null). */
  approved: boolean | null;
  updatedAt: number;
}

const COL = "candidates";

function fromDoc(id: string, data: Record<string, unknown>): Candidate {
  return {
    id,
    jobId: (data.jobId as string) ?? "",
    photoUrl: (data.photoUrl as string) || undefined,
    fullName: (data.fullName as string) ?? "",
    salaryExpectation: (data.salaryExpectation as string) ?? "",
    area: (data.area as string) ?? "",
    resumeUrl: (data.resumeUrl as string) ?? "",
    rhSummary: (data.rhSummary as string) ?? "",
    experience: (data.experience as string) ?? "",
    rhNotes: (data.rhNotes as string) ?? "",
    status: (data.status as CandidateStatus) ?? "triagem",
    assignedManagers: Array.isArray(data.assignedManagers)
      ? (data.assignedManagers as string[])
      : [],
    createdAt: (data.createdAt as number) ?? 0,
    updatedAt: (data.updatedAt as number) ?? 0,
  };
}

export async function listCandidates(): Promise<Candidate[]> {
  const snap = await getDocs(query(collection(db, COL), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function getCandidate(id: string): Promise<Candidate | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return fromDoc(snap.id, snap.data());
}

export type SaveCandidateInput = Omit<Candidate, "createdAt" | "updatedAt"> & {
  createdAt?: number;
};

export async function saveCandidate(input: SaveCandidateInput): Promise<void> {
  const now = Date.now();
  await setDoc(
    doc(db, COL, input.id),
    {
      jobId: input.jobId ?? "",
      photoUrl: input.photoUrl ?? "",
      fullName: input.fullName,
      salaryExpectation: input.salaryExpectation,
      area: input.area,
      resumeUrl: input.resumeUrl,
      rhSummary: input.rhSummary,
      experience: input.experience,
      rhNotes: input.rhNotes,
      status: input.status,
      assignedManagers: input.assignedManagers ?? [],
      createdAt: input.createdAt ?? now,
      updatedAt: now,
    },
    { merge: true }
  );
}

export async function deleteCandidate(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export function newCandidateId(fullName: string): string {
  const slug = fullName
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${slug || "candidato"}-${suffix}`;
}

/* ---------------- Gestor feedback (Lovable Cloud) ----------------- */

export async function listGestorFeedback(candidateId: string): Promise<GestorFeedback[]> {
  const rows = await listFeedback({ data: { candidateId } });
  return rows.map((r) => ({
    gestorUid: r.gestorEmail,
    gestorName: r.gestorName,
    gestorEmail: r.gestorEmail,
    feedback: r.feedback,
    decision: r.decision,
    approved: r.decision === "aprovado" ? true : r.decision === "negado" ? false : null,
    updatedAt: r.updatedAt,
  }));
}

export async function saveGestorFeedback(
  candidateId: string,
  input: {
    gestorUid?: string;
    gestorName: string;
    gestorEmail: string;
    feedback: string;
    decision: FeedbackDecision;
  }
): Promise<void> {
  await saveFeedback({
    data: {
      candidateId,
      gestorEmail: input.gestorEmail,
      gestorName: input.gestorName,
      feedback: input.feedback,
      decision: input.decision,
    },
  });
}

