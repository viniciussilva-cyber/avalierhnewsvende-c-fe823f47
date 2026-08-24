import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Search, Users, Briefcase, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { AppTopBar } from "@/components/AppTopBar";
import { PageTransition, StaggerItem } from "@/components/PageTransition";
import { useAuth } from "@/lib/auth";
import { useRole } from "@/lib/roles";
import { firebaseConfigured } from "@/lib/firebase";
import { JOB_STATUSES, listJobs, type Job, type JobStatus } from "@/lib/jobs";
import { listCandidates } from "@/lib/candidates";

export const Route = createFileRoute("/app/rs/")({
  head: () => ({
    meta: [
      { title: "R&S — Vagas · VENDE-C" },
      {
        name: "description",
        content: "Vagas abertas da VENDE-C, candidatos e análises de compatibilidade por IA.",
      },
      { property: "og:title", content: "R&S — Vagas · VENDE-C" },
      {
        property: "og:description",
        content: "Vagas abertas da VENDE-C, candidatos e análises de compatibilidade por IA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JobsList,
});

export const JOB_STATUS_LABEL: Record<JobStatus, string> = Object.fromEntries(
  JOB_STATUSES.map((s) => [s.id, s.label]),
) as Record<JobStatus, string>;

export const JOB_STATUS_STYLES: Record<JobStatus, string> = {
  aberta: "bg-emerald-500/15 text-emerald-300",
  em_andamento: "bg-primary/15 text-primary",
  congelada: "bg-amber-500/15 text-amber-300",
  fechada: "bg-secondary text-muted-foreground",
};

function JobsList() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { role } = useRole(user);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin", replace: true });
  }, [loading, user, navigate]);

  const ready = !loading && !!user;

  const jobsQuery = useQuery({
    queryKey: ["jobs"],
    queryFn: listJobs,
    enabled: ready && firebaseConfigured,
  });

  const candidatesQuery = useQuery({
    queryKey: ["candidates"],
    queryFn: listCandidates,
    enabled: ready && firebaseConfigured,
  });

  const jobs: Job[] = jobsQuery.data ?? [];

  const countByJob = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of candidatesQuery.data ?? []) {
      if (!c.jobId) continue;
      map.set(c.jobId, (map.get(c.jobId) ?? 0) + 1);
    }
    return map;
  }, [candidatesQuery.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((j) => {
      if (statusFilter !== "all" && j.status !== statusFilter) return false;
      if (q && !`${j.title} ${j.team}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [jobs, statusFilter, search]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppTopBar moduleLabel="R&S · Recrutamento" />

      <PageTransition className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
              Recrutamento &amp; Seleção
            </span>
            <h1 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">Vagas</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {jobs.length} {jobs.length === 1 ? "vaga criada" : "vagas criadas"}. Abra uma vaga para
              cadastrar e comparar os candidatos.
            </p>
          </div>
          {role === "rh" && (
            <Link
              to="/app/rs/vaga/nova"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-95"
            >
              <Plus className="h-4 w-4" /> Criar vaga
            </Link>
          )}
        </div>

        <div className="mt-8 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[1fr_auto]">
          <label className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cargo ou time…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 pl-9 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          >
            <option value="all">Todos os status</option>
            {JOB_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {jobsQuery.isLoading ? (
          <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin text-primary" />
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {jobs.length === 0
                ? role === "rh"
                  ? "Nenhuma vaga criada ainda. Clique em 'Criar vaga' para começar — depois você adiciona os candidatos dentro dela."
                  : "Nenhuma vaga criada ainda."
                : "Nenhuma vaga corresponde aos filtros selecionados."}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((j, i) => (
              <StaggerItem key={j.id} delay={Math.min(i * 0.04, 0.4)}>
                <JobCard job={j} candidates={countByJob.get(j.id) ?? 0} />
              </StaggerItem>
            ))}
          </div>
        )}
      </PageTransition>
    </div>
  );
}

function JobCard({ job, candidates }: { job: Job; candidates: number }) {
  return (
    <Link to="/app/rs/vaga/$jobId" params={{ jobId: job.id }} className="group block">
      <motion.div
        whileHover={{ y: -3 }}
        className="h-full rounded-2xl border border-border bg-card p-5 transition-colors group-hover:border-primary/40"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-foreground">{job.title}</p>
            <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              <Briefcase className="h-3 w-3" /> {job.team || "Time não definido"}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${JOB_STATUS_STYLES[job.status]}`}
          >
            {JOB_STATUS_LABEL[job.status]}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-primary" />
            {candidates} {candidates === 1 ? "candidato" : "candidatos"}
          </span>
          {job.salary && (
            <span className="inline-flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" /> {job.salary}
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
