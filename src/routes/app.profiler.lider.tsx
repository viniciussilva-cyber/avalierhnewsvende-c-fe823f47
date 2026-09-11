import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { AppTopBar } from "@/components/AppTopBar";
import { PageTransition, StaggerItem } from "@/components/PageTransition";
import { useAuth } from "@/lib/auth";
import { useRole } from "@/lib/roles";
import { PROFILES, PROFILE_KEYS, toPercentages } from "@/lib/profiler";
import { listProfilerAssessments, listProfilerEmployees } from "@/lib/profiler.functions";

export const Route = createFileRoute("/app/profiler/lider")({
  head: () => ({
    meta: [
      { title: "Perfis do meu time · Profiler VENDE-C" },
      {
        name: "description",
        content: "Veja o perfil comportamental de cada pessoa do seu time na VENDE-C.",
      },
      { property: "og:title", content: "Perfis do meu time · Profiler VENDE-C" },
      {
        property: "og:description",
        content: "Veja o perfil comportamental de cada pessoa do seu time na VENDE-C.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LeaderView,
});

function LeaderView() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useRole(user);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin", replace: true });
  }, [loading, user, navigate]);

  const ready = !loading && !!user && !roleLoading;

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

  const email = (user?.email ?? "").trim().toLowerCase();

  const team = useMemo(() => {
    const all = employeesQuery.data ?? [];
    if (role === "rh") return all;
    return all.filter((e) => e.leaderEmail.trim().toLowerCase() === email);
  }, [employeesQuery.data, role, email]);

  const assessmentByEmployee = useMemo(() => {
    const map = new Map<string, (typeof assessments)[number]>();
    const assessments = assessmentsQuery.data ?? [];
    for (const a of assessments) if (!map.has(a.employeeId)) map.set(a.employeeId, a);
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
      <AppTopBar moduleLabel="Profiler · Meu time" />

      <PageTransition className="mx-auto max-w-5xl px-6 py-10">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          Perfil comportamental
        </span>
        <h1 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">Meu time</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {team.length} {team.length === 1 ? "pessoa" : "pessoas"} sob sua liderança.
        </p>

        {team.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum colaborador está vinculado ao seu e-mail. Peça ao RH para informar você como
              líder direto no cadastro.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {team.map((e, i) => {
              const assessment = assessmentByEmployee.get(e.id);
              const pct = assessment ? toPercentages(assessment.scores) : null;
              const profile = assessment ? PROFILES[assessment.dominant] : null;
              return (
                <StaggerItem key={e.id} delay={Math.min(i * 0.04, 0.4)}>
                  <Link
                    to="/app/profiler/colaborador/$employeeId"
                    params={{ employeeId: e.id }}
                    className="block h-full rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-bold text-foreground">{e.fullName}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {e.position || "Cargo não informado"}
                        </p>
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
