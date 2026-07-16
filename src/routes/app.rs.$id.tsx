import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Loader2,
  User as UserIcon,
  Briefcase,
  DollarSign,
  ExternalLink,
  Pencil,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { AppTopBar } from "@/components/AppTopBar";
import { PageTransition, StaggerItem } from "@/components/PageTransition";
import { CandidateForm } from "@/components/CandidateForm";
import { useAuth } from "@/lib/auth";
import { useRole } from "@/lib/roles";
import { firebaseConfigured } from "@/lib/firebase";
import {
  CANDIDATE_STATUSES,
  deleteCandidate,
  getCandidate,
  listGestorFeedback,
  saveGestorFeedback,
  type CandidateStatus,
} from "@/lib/candidates";

export const Route = createFileRoute("/app/rs/$id")({
  head: () => ({ meta: [{ title: "Candidato · R&S" }] }),
  component: CandidateDetail,
});

const STATUS_LABEL: Record<CandidateStatus, string> = Object.fromEntries(
  CANDIDATE_STATUSES.map((s) => [s.id, s.label])
) as Record<CandidateStatus, string>;

function CandidateDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useRole(user);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin", replace: true });
  }, [loading, user, navigate]);

  const ready = !loading && !!user && !roleLoading;

  const candQuery = useQuery({
    queryKey: ["candidate", id],
    queryFn: () => getCandidate(id),
    enabled: ready && firebaseConfigured,
  });

  const feedbackQuery = useQuery({
    queryKey: ["candidate", id, "feedback"],
    queryFn: () => listGestorFeedback(id),
    enabled: ready && firebaseConfigured,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Candidato removido.");
      navigate({ to: "/app/rs", replace: true });
    },
    onError: () => toast.error("Não foi possível remover."),
  });

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const c = candQuery.data;

  if (candQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppTopBar moduleLabel="R&S · Candidato" backTo="/app/rs" backLabel="Candidatos" />
        <Loader2 className="mx-auto mt-20 h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!c) {
    return (
      <div className="min-h-screen bg-background">
        <AppTopBar moduleLabel="R&S · Candidato" backTo="/app/rs" backLabel="Candidatos" />
        <div className="mx-auto mt-20 max-w-md text-center">
          <p className="text-muted-foreground">Candidato não encontrado.</p>
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
      <AppTopBar moduleLabel="R&S · Candidato" backTo="/app/rs" backLabel="Candidatos" />

      <PageTransition className="mx-auto max-w-4xl px-6 py-10">
        {editing && role === "rh" ? (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">Editar candidato</h1>
              <button
                onClick={() => setEditing(false)}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
              >
                Cancelar
              </button>
            </div>
            <CandidateForm
              existing={c}
              onSaved={() => {
                setEditing(false);
                queryClient.invalidateQueries({ queryKey: ["candidate", id] });
                queryClient.invalidateQueries({ queryKey: ["candidates"] });
              }}
            />
          </div>
        ) : (
          <>
            <motion.header
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex flex-wrap items-start gap-6">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border bg-secondary">
                  {c.photoUrl ? (
                    <img src={c.photoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <UserIcon className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {STATUS_LABEL[c.status]}
                    </span>
                    <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {c.area || "sem área"}
                    </span>
                  </div>
                  <h1 className="mt-3 text-3xl font-extrabold text-foreground">{c.fullName}</h1>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {c.salaryExpectation && (
                      <span className="inline-flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-primary" /> {c.salaryExpectation}
                      </span>
                    )}
                    {c.area && (
                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4 text-primary" /> {c.area}
                      </span>
                    )}
                    {c.resumeUrl && (
                      <a
                        href={c.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" /> Currículo
                      </a>
                    )}
                  </div>
                </div>

                {role === "rh" && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setEditing(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Remover este candidato? Esta ação não pode ser desfeita.")) {
                          deleteMutation.mutate();
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Apagar
                    </button>
                  </div>
                )}
              </div>
            </motion.header>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <StaggerItem delay={0.05}>
                <Section title="Resumo da entrevista (RH)" body={c.rhSummary} />
              </StaggerItem>
              <StaggerItem delay={0.1}>
                <Section title="Experiências profissionais" body={c.experience} />
              </StaggerItem>
              <StaggerItem delay={0.15} className="md:col-span-2">
                <Section title="Observações do RH" body={c.rhNotes} />
              </StaggerItem>
            </div>

            <StaggerItem delay={0.2}>
              <GestorSection
                candidateId={id}
                role={role}
                userUid={user!.uid}
                userName={user!.displayName || user!.email || ""}
                userEmail={user!.email || ""}
                feedback={feedbackQuery.data ?? []}
                loading={feedbackQuery.isLoading}
                onSaved={() =>
                  queryClient.invalidateQueries({ queryKey: ["candidate", id, "feedback"] })
                }
              />
            </StaggerItem>
          </>
        )}
      </PageTransition>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div className="h-full rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {body ? (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{body}</p>
      ) : (
        <p className="mt-3 text-sm italic text-muted-foreground/60">Nada informado.</p>
      )}
    </div>
  );
}

function GestorSection({
  candidateId,
  role,
  userUid,
  userName,
  userEmail,
  feedback,
  loading,
  onSaved,
}: {
  candidateId: string;
  role: "rh" | "gestor" | null;
  userUid: string;
  userName: string;
  userEmail: string;
  feedback: import("@/lib/candidates").GestorFeedback[];
  loading: boolean;
  onSaved: () => void;
}) {
  const own = feedback.find((f) => f.gestorUid === userUid);
  const [text, setText] = useState(own?.feedback ?? "");
  const [approved, setApproved] = useState<boolean | null>(own?.approved ?? null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setText(own?.feedback ?? "");
    setApproved(own?.approved ?? null);
  }, [own?.feedback, own?.approved]);

  const canWrite = role === "gestor" || role === "rh";

  const save = async () => {
    if (!text.trim()) {
      toast.error("Escreva seu parecer antes de salvar.");
      return;
    }
    setSaving(true);
    try {
      await saveGestorFeedback(candidateId, {
        gestorUid: userUid,
        gestorName: userName,
        gestorEmail: userEmail,
        feedback: text.trim(),
        approved,
      });
      toast.success("Parecer salvo!");
      onSaved();
    } catch {
      toast.error("Não foi possível salvar o parecer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-8 rounded-2xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-500/5 to-transparent p-6">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-fuchsia-300" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-fuchsia-300">
          Parecer do gestor
        </h3>
      </div>

      {canWrite && (
        <div className="mb-6 rounded-xl border border-border bg-background/60 p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {own ? "Editando seu parecer" : "Escreva sua avaliação sobre o candidato"}
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Impressões da conversa, aderência ao time, pontos fortes, pontos de atenção…"
            className="w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ApprovalButton
              active={approved === true}
              variant="approve"
              onClick={() => setApproved(approved === true ? null : true)}
            />
            <ApprovalButton
              active={approved === false}
              variant="reject"
              onClick={() => setApproved(approved === false ? null : false)}
            />
            <button
              onClick={save}
              disabled={saving}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Salvar parecer
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
      ) : feedback.length === 0 ? (
        <p className="text-sm italic text-muted-foreground/60">
          Nenhum parecer ainda.
        </p>
      ) : (
        <ul className="space-y-3">
          {feedback.map((f) => (
            <li
              key={f.gestorUid}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {f.gestorName || f.gestorEmail || "Gestor"}
                  </p>
                  {f.gestorEmail && (
                    <p className="text-xs text-muted-foreground">{f.gestorEmail}</p>
                  )}
                </div>
                {f.approved !== null && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                      f.approved
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {f.approved ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" /> Aprovado
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" /> Não aprovado
                      </>
                    )}
                  </span>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {f.feedback}
              </p>
              {f.updatedAt > 0 && (
                <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground/60">
                  atualizado em{" "}
                  {new Date(f.updatedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ApprovalButton({
  active,
  variant,
  onClick,
}: {
  active: boolean;
  variant: "approve" | "reject";
  onClick: () => void;
}) {
  const isApprove = variant === "approve";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
        active
          ? isApprove
            ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300"
            : "border-destructive/60 bg-destructive/15 text-destructive"
          : "border-border text-muted-foreground hover:bg-secondary"
      }`}
    >
      {isApprove ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {isApprove ? "Aprovar para próxima fase" : "Não aprovar"}
    </button>
  );
}
