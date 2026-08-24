import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  DollarSign,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  User as UserIcon,
  Users,
} from "lucide-react";
import { AppTopBar } from "@/components/AppTopBar";
import { PageTransition, StaggerItem } from "@/components/PageTransition";
import { JobForm } from "@/components/JobForm";
import { useAuth } from "@/lib/auth";
import { useRole } from "@/lib/roles";
import { firebaseConfigured } from "@/lib/firebase";
import { deleteJob, getJob, JOB_STATUSES, type JobStatus } from "@/lib/jobs";
import { MANAGERS } from "@/lib/managers";
import { CANDIDATE_STATUSES, listCandidates, type Candidate } from "@/lib/candidates";

export const Route = createFileRoute("/app/rs/vaga/$jobId")({
  head: () => ({
    meta: [
      { title: "Vaga · R&S VENDE-C" },
      { name: "description", content: "Detalhes da vaga e candidatos vinculados." },
      { property: "og:title", content: "Vaga · R&S VENDE-C" },
      { property: "og:description", content: "Detalhes da vaga e candidatos vinculados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JobDetail,
});

const JOB_STATUS_LABEL: Record<JobStatus, string> = Object.fromEntries(
  JOB_STATUSES.map((s) => [s.id, s.label]),
) as Record<JobStatus, string>;

const CANDIDATE_STATUS_LABEL = Object.fromEntries(
  CANDIDATE_STATUSES.map((s) => [s.id, s.label]),
) as Record<string, string>;

function JobDetail() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useRole(user);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin", replace: true });
  }, [loading, user, navigate]);

  const ready = !loading && !!user && !roleLoading;

  const jobQuery = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => getJob(jobId),
    enabled: ready && firebaseConfigured,
  });

  const candidatesQuery = useQuery({
    queryKey: ["candidates"],
    queryFn: listCandidates,
    enabled: ready && firebaseConfigured,
  });

  const candidates = useMemo(
    () => (candidatesQuery.data ?? []).filter((c) => c.jobId === jobId),
    [candidatesQuery.data, jobId],
  );

  const removeJob = useMutation({
    mutationFn: () => deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Vaga removida.");
      navigate({ to: "/app/rs", replace: true });
    },
    onError: () => toast.error("Não foi possível remover a vaga."),
  });

  if (!ready || jobQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppTopBar moduleLabel="R&S · Vaga" backTo="/app/rs" backLabel="Vagas" />
        <Loader2 className="mx-auto mt-20 h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const job = jobQuery.data;

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <AppTopBar moduleLabel="R&S · Vaga" backTo="/app/rs" backLabel="Vagas" />
        <div className="mx-auto mt-20 max-w-md text-center">
          <p className="text-muted-foreground">Vaga não encontrada.</p>
          <Link
            to="/app/rs"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppTopBar moduleLabel="R&S · Vaga" backTo="/app/rs" backLabel="Vagas" />

      <PageTransition className="mx-auto max-w-5xl px-6 py-10">
        {editing && role === "rh" ? (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">Editar vaga</h1>
              <button
                onClick={() => setEditing(false)}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
              >
                Cancelar
              </button>
            </div>
            <JobForm existing={job} onSaved={() => setEditing(false)} />
          </div>
        ) : (
          <>
            <motion.header
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {JOB_STATUS_LABEL[job.status]}
                  </span>
                  <h1 className="mt-3 text-3xl font-extrabold text-foreground">{job.title}</h1>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-primary" /> {job.team || "Sem time"}
                    </span>
                    {job.salary && (
                      <span className="inline-flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-primary" /> {job.salary}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-primary" /> {candidates.length}{" "}
                      {candidates.length === 1 ? "candidato" : "candidatos"}
                    </span>
                  </div>
                  {(job.managerEmails ?? []).length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.managerEmails.map((email) => (
                        <span
                          key={email}
                          className="rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground"
                        >
                          {MANAGERS.find((m) => m.email === email)?.name ?? email}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/app/rs/vaga/${job.id}`;
                      navigator.clipboard.writeText(url).then(
                        () => toast.success("Link copiado!", { description: url }),
                        () => toast.error("Não foi possível copiar o link."),
                      );
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary"
                  >
                    <Link2 className="h-3.5 w-3.5" /> Copiar link
                  </button>
                  {role === "rh" && (
                    <>
                      <button
                        onClick={() => setEditing(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar vaga
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Remover esta vaga? Os candidatos não serão apagados.")) {
                            removeJob.mutate();
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Apagar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.header>

            {job.idealProfile && (
              <section className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
                <div className="flex items-center gap-2 text-amber-400">
                  <Sparkles className="h-4 w-4" />
                  <h2 className="text-xs font-semibold uppercase tracking-wide">
                    Perfil ideal da vaga · base da análise de IA
                  </h2>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {job.idealProfile}
                </p>
              </section>
            )}

            <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Candidatos desta vaga</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ao cadastrar, a IA compara automaticamente o candidato com o perfil ideal.
                </p>
              </div>
              {role === "rh" && (
                <Link
                  to="/app/rs/vaga/$jobId/novo"
                  params={{ jobId: job.id }}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-95"
                >
                  <Plus className="h-4 w-4" /> Adicionar candidato
                </Link>
              )}
            </div>

            {candidatesQuery.isLoading ? (
              <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin text-primary" />
            ) : candidates.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum candidato nesta vaga ainda.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {candidates.map((c, i) => (
                  <StaggerItem key={c.id} delay={Math.min(i * 0.04, 0.4)}>
                    <CandidateCard candidate={c} />
                  </StaggerItem>
                ))}
              </div>
            )}
          </>
        )}
      </PageTransition>
    </div>
  );
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <Link to="/app/rs/$id" params={{ id: candidate.id }} className="group block">
      <motion.div
        whileHover={{ y: -3 }}
        className="h-full rounded-2xl border border-border bg-card p-5 transition-colors group-hover:border-primary/40"
      >
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border bg-secondary">
            {candidate.photoUrl ? (
              <img src={candidate.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <UserIcon className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">{candidate.fullName}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {CANDIDATE_STATUS_LABEL[candidate.status] ?? candidate.status}
            </p>
          </div>
        </div>
        {candidate.salaryExpectation && (
          <p className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <DollarSign className="h-3 w-3" /> {candidate.salaryExpectation}
          </p>
        )}
      </motion.div>
    </Link>
  );
}
