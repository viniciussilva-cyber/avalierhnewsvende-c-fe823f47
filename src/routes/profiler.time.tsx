import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Home, Loader2, LogOut, Search, Sparkles } from "lucide-react";
import { PageTransition, StaggerItem } from "@/components/PageTransition";
import { PROFILES, PROFILE_KEYS, toPercentages } from "@/lib/profiler";
import { listProfilerAssessments, listProfilerEmployees } from "@/lib/profiler.functions";
import { leadsEmployee, leaderSignOut, useLeaderSession } from "@/lib/profiler-leaders";

export const Route = createFileRoute("/profiler/time")({
  head: () => ({
    meta: [
      { title: "Meu time — Profiler · VENDE-C" },
      {
        name: "description",
        content: "Perfil comportamental de cada pessoa liderada por você no VENDE-C.",
      },
      { property: "og:title", content: "Meu time — Profiler · VENDE-C" },
      {
        property: "og:description",
        content: "Perfil comportamental de cada pessoa liderada por você no VENDE-C.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LeaderTeam,
});

function LeaderTeam() {
  const navigate = useNavigate();
  const { leader, loading } = useLeaderSession();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loading && !leader) navigate({ to: "/profiler", replace: true });
  }, [loading, leader, navigate]);

  const ready = !loading && !!leader;

  const employeesQuery = useQuery({
    queryKey: ["profiler-employees"],
    queryFn: () => listProfilerEmployees(),
    enabled: ready,
  });

  const assessmentsQuery = useQuery({
    queryKey: ["profiler-assessments"],
    queryFn: () => listProfilerAssessments(),
    enabled: ready,
  });

  // Filtra primeiro quem é do time do líder
  const team = useMemo(() => {
    if (!leader) return [];
    return (employeesQuery.data ?? []).filter((e) => leadsEmployee(leader, e.leaderEmail));
  }, [employeesQuery.data, leader]);

  // Filtra novamente baseado na barra de pesquisa (Nome, E-mail, Cargo ou Setor)
  // Tratamento blindado contra campos null ou undefined
  const filteredTeam = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return team;
    
    return team.filter((e) => {
      const name = (e.fullName ?? "").toLowerCase();
      const email = (e.email ?? "").toLowerCase();
      const position = (e.position ?? "").toLowerCase();
      const sector = (e.sector ?? "").toLowerCase();

      return (
        name.includes(q) ||
        email.includes(q) ||
        position.includes(q) ||
        sector.includes(q)
      );
    });
  }, [team, searchQuery]);

  const assessmentByEmployee = useMemo(() => {
    const map = new Map<string, NonNullable<typeof assessmentsQuery.data>[number]>();
    for (const a of assessmentsQuery.data ?? []) if (!map.has(a.employeeId)) map.set(a.employeeId, a);
    return map;
  }, [assessmentsQuery.data]);

  if (!ready || employeesQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 border-b border-border bg-header/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Profiler · {leader!.team}
          </span>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[180px] truncate text-xs text-muted-foreground sm:inline">
              {leader!.email}
            </span>
            {leader!.isEscape && (
              <Link
                to="/app"
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Home className="h-3.5 w-3.5" /> Início
              </Link>
            )}
            <button
              onClick={() => {
                leaderSignOut();
                navigate({ to: "/profiler", replace: true });
              }}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </div>
      </div>

      <PageTransition className="mx-auto max-w-5xl px-6 py-10">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          Perfil comportamental
        </span>
        <h1 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">Meu time</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {team.length} {team.length === 1 ? "pessoa" : "pessoas"} sob sua liderança.
        </p>

        {/* BARRA DE PESQUISA DO LÍDER */}
        {team.length > 0 && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-4">
            <label className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar colaborador por nome, e-mail, cargo ou setor..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 pl-9 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
              />
            </label>
          </div>
        )}

        {team.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum colaborador vinculado ao seu e-mail. Peça ao RH para informar você como líder
              direto no cadastro.
            </p>
          </div>
        ) : filteredTeam.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum colaborador encontrado com essa pesquisa.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {filteredTeam.map((e, i) => {
              const assessment = assessmentByEmployee.get(e.id);
              const pct = assessment ? toPercentages(assessment.scores) : null;
              const profile = assessment ? PROFILES[assessment.dominant] : null;
              return (
                <StaggerItem key={e.id} delay={Math.min(i * 0.04, 0.4)}>
                  <Link
                    to="/profiler/relatorio/$employeeId"
                    params={{ employeeId: e.id }}
                    className="block h-full rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-bold text-foreground">{e.fullName}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {e.position || e.sector || "Cargo não informado"}
                        </p>
                        {/* E-mail do colaborador em destaque */}
                        {e.email && (
                          <p className="mt-0.5 truncate text-[11px] font-medium text-primary/80">
                            {e.email}
                          </p>
                        )}
                      </div>
                      {profile ? (
                        <span
                          className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                          style={{ backgroundColor: `${profile.color}22`, color: profile.color }}
                        >
                          {profile.label}
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Pendente
                        </span>
                      )}
                    </div>

                    {pct && (
                      <div className="mt-5 space-y-2">
                        {PROFILE_KEYS.map((k) => (
                          <div key={k} className="flex items-center gap-2">
                            <span className="w-24 text-[11px] text-muted-foreground">
                              {PROFILES[k].label}
                            </span>
                            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                              <span
                                className="block h-full rounded-full"
                                style={{ width: `${pct[k]}%`, backgroundColor: PROFILES[k].color }}
                              />
                            </span>
                            <span className="w-9 text-right text-[11px] text-muted-foreground">
                              {pct[k]}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Link>
                </StaggerItem>
              );
            })}
          </div>
        )}
      </PageTransition>
    </div>
  );
}
