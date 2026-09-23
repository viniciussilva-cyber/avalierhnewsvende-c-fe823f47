import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, ArrowRight, ArrowLeft, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QUESTIONS, scoreAnswers, type ProfileKey, type BlockAnswer, type Scores } from "@/lib/profiler";
import {
  getProfilerEmployee,
  getProfilerAssessment,
  submitProfilerAssessment,
} from "@/lib/profiler.functions";
import { ProfilerReport } from "@/components/profiler/ProfilerReport";

export const Route = createFileRoute("/profiler/avaliacao/$employeeId")({
  head: () => ({
    meta: [{ title: "Perfil comportamental · VENDE-C Profiler" }],
  }),
  component: AssessmentPage,
});

function AssessmentPage() {
  const { employeeId } = Route.useParams();
  const submit = useServerFn(submitProfilerAssessment);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, BlockAnswer>>({});
  const [done, setDone] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<{ scores: Scores; dominant: ProfileKey } | null>(null);

  const employeeQuery = useQuery({
    queryKey: ["profiler-employee", employeeId],
    queryFn: () => getProfilerEmployee({ data: { id: employeeId } }),
  });

  const previousAssessmentQuery = useQuery({
    queryKey: ["profiler-assessment-existing", employeeId],
    queryFn: () => getProfilerAssessment({ data: { employeeId } }),
  });

  const total = QUESTIONS.length;
  const question = QUESTIONS[step]!;
  
  const completedBlocksCount = Object.values(answers).filter(
    (a) => a?.most && a?.least
  ).length;
  const progress = Math.round((completedBlocksCount / total) * 100);

  const currentScores = useMemo(() => scoreAnswers(answers), [answers]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await submit({
        data: {
          employeeId,
          answers,
          origin: window.location.origin,
        },
      });
      return res;
    },
    onSuccess: (res) => {
      setAssessmentResult({
        scores: res.scores,
        dominant: res.dominant,
      });
      setDone(true);
    },
  });

  const chooseOption = (profile: ProfileKey, type: "most" | "least") => {
    const qId = String(question.id);
    const current = answers[qId] || { most: undefined as any, least: undefined as any };

    let newMost = type === "most" ? profile : current.most;
    let newLeast = type === "least" ? profile : current.least;

    if (type === "most" && current.least === profile) newLeast = undefined;
    if (type === "least" && current.most === profile) newMost = undefined;

    setAnswers((prev) => ({
      ...prev,
      [qId]: { most: newMost, least: newLeast },
    }));
  };

  if (employeeQuery.isLoading || previousAssessmentQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const employee = employeeQuery.data;
  const existingAssessment = previousAssessmentQuery.data;

  if (!employee) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <p className="text-center text-sm text-muted-foreground">
          Este link de avaliação não é válido. Fale com o RH da VENDE-C.
        </p>
      </div>
    );
  }

  if (existingAssessment && !employee.canReassess && !done) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-6 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-foreground">Avaliação já realizada</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Olá, <strong className="text-foreground">{employee.fullName}</strong>. Você já respondeu ao seu teste comportamental.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Caso precise refazer para um novo acompanhamento, solicite a liberação ao RH.
          </p>
        </div>
      </div>
    );
  }

  // EXIBE O RELATÓRIO QUANDO CONCLUÍDO (OU SE JÁ EXISTIA)
  if (done || existingAssessment) {
    const finalScores = assessmentResult?.scores || existingAssessment?.scores || currentScores;

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-4xl px-6 py-10">
          <ProfilerReport
            name={employee.fullName}
            position={employee.position}
            sector={employee.sector}
            scores={finalScores}
            celebrate
          />
        </div>
      </div>
    );
  }

  const currentAnswer = answers[String(question.id)] || {};
  const currentBlockComplete = currentAnswer.most && currentAnswer.least;
  const allAnswered = completedBlocksCount === total;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
          Olá, {employee.fullName.split(" ")[0]}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-foreground sm:text-3xl">
          Descubra seu perfil comportamental
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Em cada bloco, selecione <strong className="text-foreground">1 opção que MAIS se parece com você</strong> e <strong className="text-foreground">1 opção que MENOS se parece com você</strong>.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
          <span className="text-xs font-semibold tabular-nums text-muted-foreground">
            {step + 1}/{total}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="mt-8 space-y-4"
          >
            <h3 className="text-base font-bold text-foreground">{question.title}</h3>

            <div className="space-y-3">
              {question.options.map((o) => {
                const isMost = currentAnswer.most === o.profile;
                const isLeast = currentAnswer.least === o.profile;

                return (
                  <div
                    key={o.profile}
                    className={`flex flex-col gap-3 rounded-2xl border p-4 text-left text-sm transition-all sm:flex-row sm:items-center sm:justify-between ${
                      isMost || isLeast
                        ? "border-primary/60 bg-primary/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <p className="text-foreground/90 leading-relaxed">{o.text}</p>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => chooseOption(o.profile, "most")}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                          isMost
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                            : "border border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        + Mais parecido
                      </button>

                      <button
                        type="button"
                        onClick={() => chooseOption(o.profile, "least")}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                          isLeast
                            ? "bg-foreground text-background shadow-md"
                            : "border border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        - Menos parecido
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </button>

          {step < total - 1 ? (
            <button
              onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
              disabled={!currentBlockComplete}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-30"
            >
              Avançar <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={() => mutation.mutate()}
              disabled={!allAnswered || mutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40"
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Ver meu resultado
            </button>
          )}
        </div>

        {mutation.isError && (
          <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {(mutation.error as Error).message}
          </p>
        )}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="border-b border-border bg-header px-6 py-3">
      <div className="mx-auto flex max-w-4xl items-center gap-2 text-sm font-bold text-foreground">
        <Sparkles className="h-4 w-4 text-primary" /> VENDE-C Profiler
      </div>
    </div>
  );
}
