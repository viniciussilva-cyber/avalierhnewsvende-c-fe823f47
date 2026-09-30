import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, Loader2, Sparkles, ShieldCheck, Mail, FileText, ArrowLeft } from "lucide-react";
import { listProfilerEmployees, listProfilerAssessments } from "@/lib/profiler.functions";

export const Route = createFileRoute("/app/profiler/lider")({
  head: () => ({
    meta: [{ title: "Acesso do Líder · Profiler VENDE-C" }],
  }),
  component: LeaderPortalPage,
});

const PROFILE_CONFIG: Record<
  string,
  {
    label: string;
    textColor: string;
    borderColor: string;
    bgColor: string;
    ringColor: string;
  }
> = {
  EXECUTOR: {
    label: "EXECUTOR",
    textColor: "#4ade80",
    borderColor: "rgba(34, 197, 94, 0.4)",
    bgColor: "rgba(34, 197, 94, 0.08)",
    ringColor: "#22c55e",
  },
  COMUNICADOR: {
    label: "COMUNICADOR",
    textColor: "#fb923c",
    borderColor: "rgba(249, 115, 22, 0.4)",
    bgColor: "rgba(249, 115, 22, 0.08)",
    ringColor: "#f97316",
  },
  PLANEJADOR: {
    label: "PLANEJADOR",
    textColor: "#38bdf8",
    borderColor: "rgba(56, 189, 248, 0.4)",
    bgColor: "rgba(56, 189, 248, 0.08)",
    ringColor: "#38bdf8",
  },
  ANALISTA: {
    label: "ANALISTA",
    textColor: "#c084fc",
    borderColor: "rgba(168, 85, 247, 0.4)",
    bgColor: "rgba(168, 85, 247, 0.08)",
    ringColor: "#a855f7",
  },
};

function LeaderPortalPage() {
  const [leaderEmailInput, setLeaderEmailInput] = useState("");
  const [activeEmail, setActiveEmail] = useState<string | null>(null);

  const fetchEmployees = useServerFn(listProfilerEmployees);
  const fetchAssessments = useServerFn(listProfilerAssessments);

  const employeesQuery = useQuery({
    queryKey: ["profiler-employees-leader"],
    queryFn: () => fetchEmployees(),
  });

  const assessmentsQuery = useQuery({
    queryKey: ["profiler-assessments-leader"],
    queryFn: () => fetchAssessments(),
  });

  const allEmployees = employeesQuery.data ?? [];
  const allAssessments = assessmentsQuery.data ?? [];

  const norm = (e: string) => e.trim().toLowerCase();

  const isCEO = activeEmail && (norm(activeEmail) === "lucas@vende-c.com" || norm(activeEmail) === "lucas.quissak@vende-c.com");

  const myEmployees = allEmployees.filter((emp) => {
    if (!activeEmail) return false;
    if (isCEO) return true;
    return norm(emp.leaderEmail || "").includes(norm(activeEmail));
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Topbar Padronizada */}
      <header className="border-b border-zinc-800/80 bg-[#121214] px-6 py-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <Link to="/app/profiler" className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Módulos
          </Link>
          <span className="text-zinc-600">/</span>
          <div className="flex items-center gap-2 text-white font-bold">
            <Sparkles className="h-4 w-4 text-[#ff0068]" />
            Profiler · Visão do Líder
          </div>
        </div>

        {activeEmail && (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300 font-semibold">{activeEmail}</span>
            <button onClick={() => setActiveEmail(null)} className="text-zinc-400 hover:text-white underline ml-2">
              Sair
            </button>
          </div>
        )}
      </header>

      <div className="mx-auto max-w-6xl p-6 md:p-10 space-y-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#ff0068]">PERFIL COMPORTAMENTAL</p>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mt-1">Painel dos Liderados</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Digite seu e-mail corporativo de líder para acessar os relatórios comportamentais da sua equipe.
          </p>
        </div>

        {!activeEmail ? (
          <div className="mx-auto max-w-md rounded-3xl border border-zinc-800 bg-[#141414] p-8 shadow-2xl text-center space-y-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 mx-auto text-[#ff0068]">
              <Mail className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Identificação do Líder</h2>
              <p className="text-xs text-zinc-400 mt-1">Insira seu e-mail corporativo cadastrado (ex: andre@vende-c.com)</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (leaderEmailInput.trim()) {
                  setActiveEmail(leaderEmailInput.trim());
                }
              }}
              className="space-y-4"
            >
              <input
                type="email"
                required
                value={leaderEmailInput}
                onChange={(e) => setLeaderEmailInput(e.target.value)}
                placeholder="seu.email@vende-c.com"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ff0068]"
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-[#ff0068] py-3 text-sm font-bold text-white shadow-lg shadow-[#ff0068]/25 hover:opacity-90 transition-all"
              >
                Acessar Liderados
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {employeesQuery.isLoading || assessmentsQuery.isLoading ? (
              <div className="flex py-20 justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#ff0068]" />
              </div>
            ) : myEmployees.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#141414]/50 py-16 text-center">
                <p className="text-sm text-zinc-400">
                  Nenhum liderado encontrado para o e-mail <strong>{activeEmail}</strong>.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myEmployees.map((emp) => {
                  const assessment = allAssessments.find((a) => a.employeeId === emp.id);
                  const dominantKey = assessment?.dominant ? String(assessment.dominant).toUpperCase().trim() : null;
                  const config = dominantKey ? PROFILE_CONFIG[dominantKey] : null;

                  return (
                    <div
                      key={emp.id}
                      className="flex flex-col justify-between rounded-2xl border p-5 shadow-lg transition-all"
                      style={{
                        backgroundColor: config ? config.bgColor : "#141414",
                        borderColor: config ? config.borderColor : "rgba(39, 39, 42, 0.9)",
                      }}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {emp.photoUrl ? (
                              <img
                                src={emp.photoUrl}
                                alt={emp.fullName}
                                className="h-11 w-full max-w-[44px] rounded-full object-cover"
                                style={{ boxShadow: config ? `0 0 0 2px ${config.ringColor}` : "0 0 0 2px #3f3f46" }}
                              />
                            ) : (
                              <div
                                className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800 text-xs font-black text-white"
                                style={{ boxShadow: config ? `0 0 0 2px ${config.ringColor}` : "0 0 0 2px #3f3f46" }}
                              >
                                {getInitials(emp.fullName)}
                              </div>
                            )}

                            <div>
                              <h3 className="font-extrabold text-white text-base leading-tight">{emp.fullName}</h3>
                              <p className="text-xs text-zinc-400 mt-0.5">
                                {emp.position || "Sem cargo"} {emp.sector ? `· ${emp.sector}` : ""}
                              </p>
                            </div>
                          </div>

                          {config && (
                            <span className="text-[12px] font-black uppercase tracking-wider" style={{ color: config.textColor }}>
                              {config.label}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 flex items-center gap-2 pt-4 border-t border-zinc-800/60">
                        {assessment ? (
                          <a
                            href={`/app/profiler/colaborador/${emp.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full text-center rounded-lg border border-zinc-700/80 bg-zinc-800/80 px-3.5 py-2 text-xs font-bold text-white hover:bg-zinc-700 transition-colors"
                          >
                            Ver relatório
                          </a>
                        ) : (
                          <span className="text-xs text-amber-400 font-semibold py-2">Pendente de resposta</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
