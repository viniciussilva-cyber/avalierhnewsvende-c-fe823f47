/**
 * Acesso dos líderes ao Profiler.
 *
 * O líder entra apenas com o e-mail corporativo (sem senha) e enxerga somente
 * os colaboradores cujo `leaderEmail` pertence ao seu time. Times com duas
 * lideranças compartilham a mesma lista através de `teamEmails`.
 */
import { useCallback, useEffect, useState } from "react";

export interface ProfilerLeader {
  name: string;
  email: string;
  team: string;
  /** E-mails de liderança cujos colaboradores este líder pode ver. */
  teamEmails: string[];
  /** Quando verdadeiro, enxerga todos os colaboradores. */
  allTeams?: boolean;
  /** Conta de escape do RH: pode voltar para o início da plataforma. */
  isEscape?: boolean;
}

function leader(
  name: string,
  email: string,
  team: string,
  teamEmails?: string[],
  allTeams?: boolean,
  isEscape?: boolean,
): ProfilerLeader {
  return { name, email, team, teamEmails: teamEmails ?? [email], allTeams, isEscape };
}

export const PROFILER_LEADERS: ProfilerLeader[] = [
  leader("Débora Macedo de Queiroz Guilhermetti", "debora@vende-c.com", "Time Administrativo"),
  leader("André Clemente da Silva Januzzi", "andre@vende-c.com", "Time Audiovisual"),
  leader("Ninotchka Karenina Deckert Weimer", "ni@vende-c.com", "Time Comercial - CORP"),
  leader("Gustavo Schaefer", "gustavo.schaefer@vende-c.com", "Time Comercial - Schaefer"),
  leader("Gustavo Santos Solia", "gustavo.solia@vende-c.com", "Time Comercial - Solia"),
  leader("Ulisses Carneiro Galasse", "ulisses@vende-c.com", "Time Comercial Geral"),
  leader("Mayara Pereira Galvão", "mayara.galvao@vende-c.com", "Time CVFI", [
    "mayara.galvao@vende-c.com",
    "gabriela.caroline@vende-c.com",
  ]),
  leader("Gabriela Caroline da Silva", "gabriela.caroline@vende-c.com", "Time CVFI", [
    "mayara.galvao@vende-c.com",
    "gabriela.caroline@vende-c.com",
  ]),
  leader("Adriano Souza Gomes", "adriano.gomes@vende-c.com", "Time Designer"),
  leader("Roberta Gandra de Oliveira Rocha", "roberta.gandra@vende-c.com", "Time Eventos", [
    "roberta.gandra@vende-c.com",
  ]),
  leader(
    "Aline Cunha Andrade",
    "aline.andrade@vende-c.com",
    "Time Experiência do Cliente e Eventos",
    ["aline.andrade@vende-c.com", "roberta.gandra@vende-c.com"],
  ),
  leader("Henrique Paulino Ferreira", "henrique@vende-c.com", "Time Marketing"),
  leader("Elias Gun Hee Choi", "elias.choi@vende-c.com", "Time Operações"),
  leader("Lucas Izan Oliveira Rodrigues", "lucas.izan@vende-c.com", "Time Recursos Humanos"),
  leader("Natália Pedrozo de Abreu", "natalia@vende-c.com", "Time Social Media"),
  leader("Amanda Cordeiro Faria", "amanda.faria@vende-c.com", "Time Treinamentos"),
  leader(
    "Maria Fernanda de Souza Peroni",
    "fernanda.peroni@vende-c.com",
    "Time Treinamentos - MAFE",
  ),
  leader("Luis Felipe Rossi", "felipe.rossi@vende-c.com", "Time Treinamentos - ROSSI"),
  leader("Lucas Quissak Bartelega Peixoto", "lucas@vende-c.com", "CEO · Todos os times", [], true),
  leader("RH VENDE-C", "rh@vende-c.com", "RH · Acesso geral", [], true, true),
];

export function findProfilerLeader(email: string | null | undefined): ProfilerLeader | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return PROFILER_LEADERS.find((l) => l.email === normalized) ?? null;
}

/** True quando o colaborador pertence ao time do líder. */
export function leadsEmployee(leaderSession: ProfilerLeader, employeeLeaderEmail: string): boolean {
  if (leaderSession.allTeams) return true;
  const e = (employeeLeaderEmail ?? "").trim().toLowerCase();
  return !!e && leaderSession.teamEmails.includes(e);
}

const EMAIL_KEY = "vendec.profiler.leader";

function read(): ProfilerLeader | null {
  if (typeof window === "undefined") return null;
  return findProfilerLeader(window.localStorage.getItem(EMAIL_KEY));
}

export function leaderSignIn(email: string): ProfilerLeader {
  const found = findProfilerLeader(email);
  if (!found) {
    throw new Error("E-mail não autorizado. Fale com o RH para liberar seu acesso.");
  }
  window.localStorage.setItem(EMAIL_KEY, found.email);
  return found;
}

export function leaderSignOut(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(EMAIL_KEY);
}

export function useLeaderSession(): { leader: ProfilerLeader | null; loading: boolean } {
  const [leaderSession, setLeaderSession] = useState<ProfilerLeader | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLeaderSession(read());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { leader: leaderSession, loading };
}
