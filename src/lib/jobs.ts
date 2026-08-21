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
import { areaMatches, type Manager } from "./managers";

export const JOB_STATUSES = [
  { id: "aberta", label: "Aberta" },
  { id: "em_andamento", label: "Em andamento" },
  { id: "congelada", label: "Congelada" },
  { id: "fechada", label: "Fechada" },
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number]["id"];

export interface Job {
  id: string;
  /** Cargo da vaga. */
  title: string;
  /** Time / área em que a pessoa vai entrar. */
  team: string;
  /** Faixa salarial da vaga. */
  salary: string;
  /** Perfil ideal usado pela IA para analisar cada candidato. */
  idealProfile: string;
  /** Gestores responsáveis pela vaga (e-mails corporativos). */
  managerEmails: string[];
  status: JobStatus;
  createdAt: number;
  updatedAt: number;
}

const COL = "jobs";

function fromDoc(id: string, data: Record<string, unknown>): Job {
  return {
    id,
    title: (data.title as string) ?? "",
    team: (data.team as string) ?? "",
    salary: (data.salary as string) ?? "",
    idealProfile: (data.idealProfile as string) ?? "",
    managerEmails: Array.isArray(data.managerEmails) ? (data.managerEmails as string[]) : [],
    status: (data.status as JobStatus) ?? "aberta",
    createdAt: (data.createdAt as number) ?? 0,
    updatedAt: (data.updatedAt as number) ?? 0,
  };
}

export async function listJobs(): Promise<Job[]> {
  const snap = await getDocs(query(collection(db, COL), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function getJob(id: string): Promise<Job | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return fromDoc(snap.id, snap.data());
}

export type SaveJobInput = Omit<Job, "createdAt" | "updatedAt"> & { createdAt?: number };

export async function saveJob(input: SaveJobInput): Promise<void> {
  const now = Date.now();
  await setDoc(
    doc(db, COL, input.id),
    {
      title: input.title,
      team: input.team,
      salary: input.salary,
      idealProfile: input.idealProfile,
      managerEmails: input.managerEmails ?? [],
      status: input.status,
      createdAt: input.createdAt ?? now,
      updatedAt: now,
    },
    { merge: true },
  );
}

export async function deleteJob(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export function newJobId(title: string): string {
  const slug = title
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${slug || "vaga"}-${suffix}`;
}

/** True when the manager may see this job (explicit assignment or matching area). */
export function jobVisibleToManager(job: Job, manager: Manager, allAreas: boolean): boolean {
  if (allAreas || manager.allAreas) return true;
  if ((job.managerEmails ?? []).includes(manager.email)) return true;
  return areaMatches(manager.areas, job.team) || areaMatches(manager.areas, job.title);
}
