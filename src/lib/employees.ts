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

export type EmployeeKind = "interno" | "terceiro";

export const DEPARTMENTS = [
  "ADMINISTRATIVO",
  "AUDIOVISUAL",
  "COMERCIAL - CORP",
  "COMERCIAL - SCHAEFER",
  "COMERCIAL - SOLIA",
  "COMERCIAL GERAL",
  "CVFI",
  "DESIGNER",
  "EVENTOS",
  "EXPERIÊNCIA DO CLIENTE",
  "GERAL",
  "MARKETING",
  "OPERAÇÕES",
  "RECURSOS HUMANOS",
  "SOCIAL MEDIA",
  "TREINAMENTOS",
  "TREINAMENTOS - MAFE",
  "TREINAMENTOS - ROSSI",
];

export const THIRD_PARTY_DEPARTMENTS = [
  "CARBONO",
  "FACILITIES",
  "PATRIMÔNIO",
  "SEGURANÇA",
  "TECNOLOGIA",
  "SELETO",
  "TERCEIRO",
];

export function departmentsFor(kind: EmployeeKind): string[] {
  return kind === "terceiro" ? THIRD_PARTY_DEPARTMENTS : DEPARTMENTS;
}

export interface Employee {
  id: string;
  photoUrl?: string;
  fullName: string;
  department: string;
  position: string;
  /** Vínculo: colaborador interno ou terceiro */
  kind: EmployeeKind;
  /** ISO date (YYYY-MM-DD) */
  birthDate: string;
  /** ISO date (YYYY-MM-DD) */
  admissionDate: string;
  createdAt: number;
  updatedAt: number;
}

const COL = "employees";

function fromDoc(id: string, data: Record<string, unknown>): Employee {
  return {
    id,
    photoUrl: (data.photoUrl as string) || undefined,
    fullName: (data.fullName as string) ?? "",
    department: (data.department as string) ?? "",
    position: (data.position as string) ?? "",
    kind: (data.kind as EmployeeKind) === "terceiro" ? "terceiro" : "interno",
    birthDate: (data.birthDate as string) ?? "",
    admissionDate: (data.admissionDate as string) ?? "",
    createdAt: (data.createdAt as number) ?? 0,
    updatedAt: (data.updatedAt as number) ?? 0,
  };
}


export async function listEmployees(): Promise<Employee[]> {
  const snap = await getDocs(query(collection(db, COL), orderBy("fullName", "asc")));
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function getEmployee(id: string): Promise<Employee | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return fromDoc(snap.id, snap.data());
}

export type SaveEmployeeInput = Omit<Employee, "createdAt" | "updatedAt"> & {
  createdAt?: number;
};

export async function saveEmployee(input: SaveEmployeeInput): Promise<void> {
  const now = Date.now();
  await setDoc(
    doc(db, COL, input.id),
    {
      photoUrl: input.photoUrl ?? "",
      fullName: input.fullName,
      department: input.department,
      position: input.position,
      kind: input.kind,

      birthDate: input.birthDate,
      admissionDate: input.admissionDate,
      createdAt: input.createdAt ?? now,
      updatedAt: now,
    },
    { merge: true }
  );
}

export async function deleteEmployee(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export function newEmployeeId(fullName: string): string {
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
  return `${slug || "colaborador"}-${suffix}`;
}

/* ---------------- Notifications ----------------- */

export interface EmployeeNotice {
  employee: Employee;
  kind: "birthday" | "anniversary";
  /** Days from today (0 = today, 1 = tomorrow, …) */
  inDays: number;
  message: string;
  /** For anniversaries, the number of complete months on that day (e.g. 3, 6, 12, 24…). */
  months?: number;
}

/** Returns days between today and the next occurrence of month/day (0 today, 1 tomorrow…) */
function daysUntilNext(month: number, day: number): { inDays: number; date: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisYear = new Date(today.getFullYear(), month, day);
  const target = thisYear >= today ? thisYear : new Date(today.getFullYear() + 1, month, day);
  const inDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  return { inDays, date: target };
}

function parseISO(iso: string): Date | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

/** Milestone months to celebrate for work anniversaries. */
const MILESTONE_MONTHS = [1, 3, 6, 9, 12, 18, 24, 36, 48, 60, 72, 84, 96, 108, 120];

/** Build daily notices for the next `windowDays` days (default 7). */
export function computeNotices(employees: Employee[], windowDays = 7): EmployeeNotice[] {
  const out: EmployeeNotice[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const emp of employees) {
    // Birthdays
    const bd = parseISO(emp.birthDate);
    if (bd) {
      const { inDays, date } = daysUntilNext(bd.getMonth(), bd.getDate());
      if (inDays <= windowDays) {
        const age = date.getFullYear() - bd.getFullYear();
        out.push({
          employee: emp,
          kind: "birthday",
          inDays,
          message:
            inDays === 0
              ? `Hoje é aniversário de ${emp.fullName} 🎂 (${age} anos)`
              : inDays === 1
                ? `Amanhã é aniversário de ${emp.fullName} 🎂 (${age} anos)`
                : `Em ${inDays} dias é aniversário de ${emp.fullName} 🎂 (${age} anos)`,
        });
      }
    }

    // Work anniversaries — check each milestone falling inside the window.
    const ad = parseISO(emp.admissionDate);
    if (ad) {
      for (const m of MILESTONE_MONTHS) {
        const milestone = new Date(ad.getFullYear(), ad.getMonth() + m, ad.getDate());
        const diff = Math.round((milestone.getTime() - today.getTime()) / 86400000);
        if (diff < 0 || diff > windowDays) continue;
        const label = m % 12 === 0 ? `${m / 12} ${m === 12 ? "ano" : "anos"}` : `${m} meses`;
        out.push({
          employee: emp,
          kind: "anniversary",
          inDays: diff,
          months: m,
          message:
            diff === 0
              ? `Hoje ${emp.fullName} completa ${label} de VENDE-C 🎉`
              : diff === 1
                ? `Amanhã ${emp.fullName} completa ${label} de VENDE-C 🎉`
                : `Em ${diff} dias ${emp.fullName} completa ${label} de VENDE-C 🎉`,
        });
      }
    }
  }

  return out.sort((a, b) => a.inDays - b.inDays);
}
