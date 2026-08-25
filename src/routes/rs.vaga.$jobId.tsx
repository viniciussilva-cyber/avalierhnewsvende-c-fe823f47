import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  DollarSign,
  Loader2,
  User as UserIcon,
} from "lucide-react";
import { PageTransition, StaggerItem } from "@/components/PageTransition";
import { DecisionBadge } from "@/components/FeedbackDecision";
import { listCandidates, listGestorFeedback } from "@/lib/candidates";
import { getJob, jobVisibleToManager } from "@/lib/jobs";
import { managerDocId } from "@/lib/managers";
import { useGestorSession } from "@/lib/gestor-auth";

export const Route = createFileRoute("/rs/vaga/$jobId")({
  head: () => ({
    meta: [
      { title: "Candidatos da vaga · R&S VENDE-C" },
      { name: "description", content: "Candidatos da vaga aguardando a sua avaliação." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GestorJob,
});

function GestorJob() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const { session, loading } = useGestorSession();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/rs", replace: true });
  }, [loading, session, navigate]);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => getJob(jobId),
    enabled: !!session,
  });

  const { data: candidates } = useQuery({
    queryKey: ["candidates"],
    queryFn: listCandidates,
    enabled: !!session,
  });

  const list = useMemo(
    () => (candidates ?? []).filter((c) => c.jobId === jobId),
    [candidates, jobId],
  );

  if (loading || isLoading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const allowed =
    !!job &&
    jobVisibleToManager(job, session.manager, session.mode === "geral" || !!session.manager.allAreas);

  if (!allowed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-card px-6 text-center">
        <p className="text-sm text-muted-foreground">
          Esta vaga não está disponível para o seu acesso.
        </p>
        <Link
          to="/rs/painel"
          className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary"
        >
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-card">
      <PageTransition className="mx-auto max-w-4xl px-6 py-8">
        <Link
          to="/rs/painel"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar às vagas
        </Link>

        <div className="mt-5 rounded-2xl border border-border bg-background p-6">
          <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> {job.team}
            </span>
            {job.salary && (
              <span className="inline-flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" /> {job.salary}
              </span>
            )}
          </div>
        </div>

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Candidatos ({list.length})
        </h2>

        {list.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Nenhum candidato cadastrado nesta vaga ainda.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {list.map((c, i) => (
              <StaggerItem key={c.id} delay={Math.min(i * 0.05, 0.4)}>
                <CandidateRow
                  id={c.id}
                  name={c.fullName}
                  photoUrl={c.photoUrl}
                  salary={c.salaryExpectation}
                  gestorUid={managerDocId(session.manager.email)}
                />
              </StaggerItem>
            ))}
          </div>
        )}
      </PageTransition>
    </div>
  );
}

function CandidateRow({
  id,
  name,
  photoUrl,
  salary,
  gestorUid,
}: {
  id: string;
  name: string;
  photoUrl?: string;
  salary: string;
  gestorUid: string;
}) {
  const { data: feedback } = useQuery({
    queryKey: ["candidate-feedback", id],
    queryFn: () => listGestorFeedback(id),
  });
  const own = feedback?.find((f) => f.gestorUid === gestorUid);

  return (
    <Link
      to="/rs/$id"
      params={{ id }}
      className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4 transition-colors hover:border-primary/50"
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border bg-secondary">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <UserIcon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        {salary && <p className="truncate text-xs text-muted-foreground">{salary}</p>}
      </div>
      {own ? (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
          <CheckCircle2 className="h-3 w-3" /> Avaliação enviada
        </span>
      ) : (
        <span className="shrink-0 rounded-full border border-border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Aguardando você
        </span>
      )}
      <DecisionBadge value={own?.decision ?? null} />
    </Link>
  );
}
