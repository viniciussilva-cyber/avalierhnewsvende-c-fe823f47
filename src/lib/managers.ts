/**
 * Gestores (managers) allowed to access the standalone R&S portal (/rs).
 *
 * Access is by corporate e-mail only (no password) — this portal is internal
 * and only exposes candidate data for the manager's own area.
 */

export interface Manager {
  name: string;
  email: string;
  /** Areas this manager is responsible for (matched against candidate.area). */
  areas: string[];
  /** When true the manager sees every candidate. */
  allAreas?: boolean;
  /** When true the manager may also choose to sign in as moderator (RH). */
  canModerate?: boolean;
}

export const MANAGERS: Manager[] = [
  { name: "Adriano Souza Gomes", email: "adriano.gomes@vende-c.com", areas: ["Designer"] },
  {
    name: "Aline Cunha Andrade",
    email: "aline.andrade@vende-c.com",
    areas: ["Eventos", "Experiência do Cliente"],
  },
  { name: "Amanda Cordeiro Faria", email: "amanda.faria@vende-c.com", areas: ["Treinamentos"] },
  { name: "André Clemente da Silva Januzzi", email: "andre@vende-c.com", areas: ["Audiovisual"] },
  {
    name: "Débora Macedo de Queiroz Guilhermetti",
    email: "debora@vende-c.com",
    areas: ["Administrativo", "Financeiro"],
  },
  { name: "Elias Gun Hee Choi", email: "elias.choi@vende-c.com", areas: ["Operações"] },
  {
    name: "Gabriela Ramos de Oliveira",
    email: "gabriela.ramos@vende-c.com",
    areas: ["Comercial - Corp"],
  },
  {
    name: "Gustavo Santos Solia",
    email: "gustavo.solia@vende-c.com",
    areas: ["Comercial - Solia"],
  },
  {
    name: "Gustavo Schaefer",
    email: "gustavo.schaefer@vende-c.com",
    areas: ["Comercial - Schaefer"],
  },
  {
    name: "Henrique Paulino Ferreira",
    email: "henrique@vende-c.com",
    areas: ["Marketing", "Growth"],
  },
  {
    name: "Lucas Izan Oliveira Rodrigues",
    email: "lucas.izan@vende-c.com",
    areas: ["Recursos Humanos"],
    canModerate: true,
  },
  {
    name: "Lucas Quissak Bartelega Peixoto",
    email: "lucas@vende-c.com",
    areas: ["CEO"],
    allAreas: true,
  },
  {
    name: "Luis Felipe Rossi",
    email: "felipe.rossi@vende-c.com",
    areas: ["Treinamentos - Rossi"],
  },
  {
    name: "Maria Fernanda de Souza Peroni",
    email: "fernanda.peroni@vende-c.com",
    areas: ["Treinamentos - MAFE"],
  },
  { name: "Natália Pedrozo de Abreu", email: "natalia@vende-c.com", areas: ["Social Media"] },
  { name: "Ninotchka Karenina Deckert Weimer", email: "ni@vende-c.com", areas: ["Corporativo"] },
  { name: "Roberta Gandra de Oliveira Rocha", email: "roberta.gandra@vende-c.com", areas: ["Eventos"] },
  { name: "Ulisses Carneiro Galasse", email: "ulisses@vende-c.com", areas: ["Comercial"] },
];

export function findManager(email: string | null | undefined): Manager | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return MANAGERS.find((m) => m.email === normalized) ?? null;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** True when a candidate's free-text area matches one of the manager's areas. */
export function areaMatches(managerAreas: string[], candidateArea: string): boolean {
  const c = normalize(candidateArea || "");
  if (!c) return false;
  return managerAreas.some((a) => {
    const m = normalize(a);
    return !!m && (c === m || c.includes(m) || m.includes(c));
  });
}

/** Stable document id for a manager's feedback (e-mails can't be doc ids). */
export function managerDocId(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
}
