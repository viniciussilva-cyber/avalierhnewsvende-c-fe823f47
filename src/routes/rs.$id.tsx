import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  Loader2,
  Pencil,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { DecisionBadge, DecisionButtons } from "@/components/FeedbackDecision";
import { AiReviewButton } from "@/components/AiReviewButton";
import { getAiAnalysis } from "@/lib/rs.functions";
import {
  getCandidate,
  listGestorFeedback,
  saveGestorFeedback,
  type FeedbackDecision,
} from "@/lib/candidates";
import { areaMatches, managerDocId } from "@/lib/managers";
import { getJob, jobVisibleToManager } from "@/lib/jobs";
import { useGestorSession } from "@/lib/gestor-auth";

export const Route = createFileRoute("/rs/$id")({
  head: () => ({
    meta: [
      { title: "Avaliar candidato · R&S VENDE-C" },
      { name: "description", content: "Avaliação do gestor sobre o candidato." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GestorCandidate,
});

function GestorCandidate() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { session, loading } = useGestorSession();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/rs", replace: true });
  }, [loading, session, navigate]);

  const { data: candidate, isLoading } = useQuery({
    queryKey: ["candidate", id],
    queryFn: () => getCandidate(id),
    enabled: !!session,
  });

  const { data: ai } = useQuery({
    queryKey: ["candidate-ai", id, "gestor"],
    queryFn: () => getAiAnalysis({ data: { candidateId: id, forGestor: true } }),
    enabled: !!session,
  });

  const { data: job } = useQuery({
    queryKey: ["job", candidate?.jobId],
    queryFn: () => getJob(candidate!.jobId),
    enabled: !!session && !!candidate?.jobId,
  });

  const { data: feedback, refetch } = useQuery({
    queryKey: ["candidate-feedback", id],
    queryFn: () => listGestorFeedback(id),
    enabled: !!session,
  });

  const uid = session ? managerDocId(session.manager.email) : "";
  const own = feedback?.find((f) => f.gestorUid === uid);

  const [text, setText] = useState("");
  const [decision, setDecision] = useState<FeedbackDecision>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Inicializa os estados locais apenas uma vez para evitar reset durante re-renders
  useEffect(() => {
    if (feedback && !isInitialized) {
      if (own) {
        setText(own.feedback ?? "");
        setDecision(own.decision ?? null);
      }
      setIsInitialized(true);
    }
  }, [feedback, own, isInitialized]);

  if (loading || isLoading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const allAccess = session.mode === "geral" || !!session.manager.allAreas;
  const allowed =
    !!candidate &&
    (allAccess ||
      (!!job && jobVisibleToManager(job, session.manager, allAccess)) ||
      areaMatches(session.manager.areas, candidate.area) ||
      (candidate.assignedManagers ?? []).includes(session.manager.email));

  if (!candidate || !allowed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-card px-6 text-center">
        <p className="text-sm text-muted-foreground">
          Este candidato não está disponível para o seu acesso.
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

  const save = async () => {
    if (!decision && !text.trim()) {
      toast.error("Selecione um status ou escreva sua avaliação antes de enviar.");
      return;
    }
    setSaving(true);
    try {
      await saveGestorFeedback(id, {
        gestorUid: uid,
        gestorName: session.manager.name,
        gestorEmail: session.manager.email,
        feedback: text.trim(),
        decision,
      });
      toast.success("Avaliação enviada ao RH!");
      setEditing(false);
      await refetch();
    } catch (err) {
      console.error("Erro ao salvar avaliação:", err);
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : "Não foi possível enviar a avaliação. Tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-card">
      <PageTransition className="mx-auto max-w-3xl px-6 py-8">
        <Link
          to="/rs/painel"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar às vagas
        </Link>

        <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-background p-6">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border bg-secondary">
            {candidate.photoUrl ? (
              <img src={candidate.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <UserIcon className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-foreground">{candidate.fullName}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" /> {candidate.area}
              </span>
              {candidate.salaryExpectation && (
                <span className="inline-flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" /> {candidate.salaryExpectation}
                </span>
              )}
            </p>
            {candidate.resumeUrl && (
              <a
                href={candidate.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Currículo
              </a>
            )}
          </div>
        </div>

        <InfoBlock title="Resumo da entrevista com o RH" content={candidate.rhSummary} />
        <InfoBlock title="Experiências profissionais" content={candidate.experience} />
        <InfoBlock title="Observações do RH" content={candidate.rhNotes} />

        {/* Análise de IA: aparece só quando o RH libera para o gestor */}
        {ai?.analysis && (
          <section className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
            <div className="flex flex-wrap items-center gap-2 text-amber-500">
              <Sparkles className="h-4 w-4" />
              <h2 className="text-xs font-semibold uppercase tracking-wide">
                Análise de compatibilidade com a vaga (IA)
              </h2>
              {typeof ai.score === "number" && (
                <span className="rounded-full border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold">
                  {ai.score}/100
                </span>
              )}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{ai.analysis}</p>
          </section>
        )}

        {own && !editing ? (
          <section className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6">
            <div className="flex flex-wrap items-center gap-2 text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Sua avaliação foi enviada ao RH</h2>
              <DecisionBadge value={own.decision} />
            </div>
            {own.feedback && (
              <p className="mt-3 whitespace-pre-wrap rounded-xl border border-border bg-background p-4 text-sm text-foreground">
                {own.feedback}
              </p>
            )}
            <button
              onClick={() => {
                setText(own.feedback ?? "");
                setDecision(own.decision ?? null);
                setEditing(true);
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
            >
              <Pencil className="h-3.5 w-3.5" /> Editar avaliação
            </button>
          </section>
        ) : (
          <section className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
              {own ? "Editar sua avaliação" : "Sua avaliação"}
            </h2>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="O que você achou do candidato?"
              className="mt-3 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <AiReviewButton kind="parecer" value={text} onChange={setText} />
              <DecisionButtons value={decision} onChange={setDecision} />
              {own && (
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={save}
                disabled={saving}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Enviar avaliação ao RH
              </button>
            </div>
          </section>
        )}
      </PageTransition>
    </div>
  );
}

function InfoBlock({ title, content }: { title: string; content: string }) {
  if (!content?.trim()) return null;
  return (
    <section className="mt-4 rounded-2xl border border-border bg-background p-6">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{content}</p>
    </section>
  );
}

