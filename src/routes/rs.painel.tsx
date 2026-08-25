import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, DollarSign, Loader2, LogOut, Search, Users } from "lucide-react";
import { PageTransition, StaggerItem } from "@/components/PageTransition";
import { listCandidates } from "@/lib/candidates";
import { jobVisibleToManager, JOB_STATUSES, listJobs, type Job, type JobStatus } from "@/lib/jobs";
import { gestorSignOut, useGestorSession } from "@/lib/gestor-auth";

export const Route = createFileRoute("/rs/painel")({
  head: () => ({
    meta: [
      { title: "Vagas para avaliar · R&S VENDE-C" },
      {
        name: "description",
        content: "Vagas da sua área e candidatos aguardando a sua avaliação.",
      },
      { property: "og:title", content: "Vagas para avaliar · R&S VENDE-C" },
      {
        property: "og:description",
        content: "Vagas da sua área e candidatos aguardando a sua avaliação.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GestorPanel,
});

const JOB_STATUS_LABEL: Record<JobStatus, string> = Object.fromEntries(
  JOB_STATUSES.map((s) => [s.id, s.label]),
) as Record<JobStatus, string>;

function GestorPanel() {
  const navigate = useNavigate();
  const { session, loading } = useGestorSession();
  const [term, setTerm] = useState("");

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/rs", replace: true });
  }, [loading, session, navigate]);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: listJobs,
    enabled: !!session,
  });

  const { data: candidates } = useQuery({
    queryKey: ["candidates"],
    queryFn: listCandidates,
    enabled: !!session,
  });

  const countByJob = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of candidates ?? []) {
      if (!c.jobId) continue;
      map.set(c.jobId, (map.get(c.jobId) ?? 0) + 1);
    }
    return map;
  }, [candidates]);

  const visible = useMemo(() => {
    if (!session || !jobs) return [];
    const all = session.mode === "geral" || session.manager.allAreas;
    const list = jobs.filter((j: Job) => jobVisibleToManager(j, session.manager, all));
    const q = term.trim().toLowerCase();
    return q
      ? list.filter((j) => `${j.title} ${j.team}`.toLowerCase().includes(q))
      : list;
  }, [session, jobs, term]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-card">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Users className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{session.manager.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {session.mode === "geral" ? "Recrutador geral" : session.manager.areas.join(" · ")}
            </p>
          </div>
          <button
            onClick={async () => {
              await gestorSignOut();
              navigate({ to: "/rs", replace: true });
            }}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </header>

      <PageTransition className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-bold text-foreground">Suas vagas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Abra uma vaga para ver os candidatos e enviar sua avaliação ao RH.
        </p>

        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar por cargo ou time…"
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-9 pr-3 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : visible.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Nenhuma vaga disponível para o seu acesso no momento.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {visible.map((j, i) => (
              <StaggerItem key={j.id} delay={Math.min(i * 0.05, 0.4)}>
                <Link
                  to="/rs/vaga/$jobId"
                  params={{ jobId: j.id }}
                  className="block h-full rounded-2xl border border-border bg-background p-5 transition-colors hover:border-primary/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-foreground">{j.title}</p>
                      <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                        <Briefcase className="h-3 w-3" /> {j.team}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {JOB_STATUS_LABEL[j.status]}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      {countByJob.get(j.id) ?? 0}{" "}
                      {(countByJob.get(j.id) ?? 0) === 1 ? "candidato" : "candidatos"}
                    </span>
                    {j.salary && (
                      <span className="inline-flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" /> {j.salary}
                      </span>
                    )}
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </div>
        )}
      </PageTransition>
    </div>
  );
}
