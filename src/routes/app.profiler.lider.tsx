import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, Loader2, Sparkles, ShieldCheck, Mail, FileText } from "lucide-react";
import { listProfilerEmployees, listProfilerAssessments } from "@/lib/profiler.functions";

export const Route = createFileRoute("/app/profiler/lider")({
  head: () => ({
    meta: [{ title: "Acesso do Líder · Profiler VENDE-C" }],
  }),
  component: LeaderPortalPage,
});

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

  // Se for o CEO Lucas Quissak, libera a visualização de todos
  const isCEO = activeEmail && (norm(activeEmail) === "lucas@vende-c.com" || norm(activeEmail) === "lucas.quissak@vende-c.com");

  const myEmployees = allEmployees.filter((emp) => {
    if (!activeEmail) return false;
    if (isCEO) return true;
    return norm(emp.leaderEmail).includes(norm(activeEmail));
  });

  const profileStyleMap: Record<string, { text: string; ring: string; bg: string }> = {
    EXECUTOR: { text: "text-emerald-400 font-black", ring: "ring-2 ring-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30" },
    COMUNICADOR: { text: "text-orange-400 font-black", ring: "ring-2 ring-orange-500", bg: "bg-orange-500/10 border-orange-500/30" },
    PLANEJADOR: { text: "text-sky-400 font-black", ring: "ring-2 ring-sky-500", bg: "bg-sky-500/10 border-sky-500/30" },
    ANALISTA: { text: "text-purple-400 font-black", ring: "ring-2 ring-purple-500", bg: "bg-purple-500/10 border-purple-500/30" },
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background text-white p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff0068]/10 text-[#ff0068] border border-[#ff0068]/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#ff0068]">
              VENDE-C PROFILER
            </p>
            <h1 className="text-3xl font-extrabold text-white">Painel de Acesso do Líder</h1>
          </div>
        </div>

        {/* Formulário de Autenticação do Líder */}
        {!activeEmail ? (
          <div className="mx-auto max-w-md rounded-3xl border border-zinc-800 bg-[#141414] p-8 shadow-2xl text-center space-y-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 mx-auto text-[#ff0068]">
              <Mail className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Identifique-se para continuar</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Digite seu e-mail corporativo de líder para visualizar os relatórios do seu time.
              </p>
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
                placeholder="Ex: andre@vende-c.com"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ff0068]"
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-[#ff0068] py-3 text-sm font-bold text-white shadow-lg shadow-[#ff0068]/25 hover:opacity-90 transition-all"
              >
                Acessar meus liderados
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cabeçalho do Líder Autenticado */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-zinc-800 bg-[#141414] p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-zinc-400">Líder Autenticado:</p>
                  <p className="text-sm font-extrabold text-white">{activeEmail}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveEmail(null)}
                className="text-xs text-zinc-400 underline hover:text-white"
              >
                Trocar e-mail
              </button>
            </div>

            {/* Card dos Liderados */}
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
                  const dominant = assessment?.dominant?.toUpperCase();
                  const style = dominant ? (profileStyleMap[dominant] || { text: "text-white", ring: "ring-2 ring-zinc-700", bg: "bg-zinc-900 border-zinc-800" }) : { text: "text-white", ring: "ring-2 ring-zinc-700", bg: "bg-zinc-900 border-zinc-800" };

                  return (
                    <div
                      key={emp.id}
                      className={`flex flex-col justify-between rounded-2xl border p-5 shadow-lg ${style.bg}`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-xs font-black text-white ${style.ring}`}>
                              {getInitials(emp.fullName)}
                            </div>
                            <div>
                              <h3 className="font-extrabold text-white text-base leading-tight">{emp.fullName}</h3>
                              <p className="text-xs text-zinc-400 mt-0.5">
                                {emp.position || "Sem cargo"} {emp.sector ? `· ${emp.sector}` : ""}
                              </p>
                            </div>
                          </div>

                          {dominant && (
                            <span className={`text-[12px] uppercase tracking-wider ${style.text}`}>
                              {dominant}
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
                            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-zinc-700 transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5" /> Ver relatório completo
                          </a>
                        ) : (
                          <span className="text-xs text-amber-400 font-semibold">
                            Pendente de resposta
                          </span>
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
