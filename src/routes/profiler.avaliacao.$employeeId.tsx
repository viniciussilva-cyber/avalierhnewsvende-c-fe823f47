import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QUESTIONS, scoreAnswers, PROFILES, type ProfileKey } from "@/lib/profiler";
import { getProfilerEmployee, submitProfilerAssessment } from "@/lib/profiler.functions";
import { ProfilerReport } from "@/components/profiler/ProfilerReport";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profiler/avaliacao/$employeeId")({
  head: () => ({
    meta: [
      { title: "Perfil comportamental · VENDE-C Profiler" },
      {
        name: "description",
        content: "Responda 20 blocos rápidos e descubra seu perfil comportamental na VENDE-C.",
      },
      { property: "og:title", content: "Perfil comportamental · VENDE-C Profiler" },
      {
        property: "og:description",
        content: "Responda 20 blocos rápidos e descubra seu perfil comportamental na VENDE-C.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssessmentPage,
});

function AssessmentPage() {
  const { employeeId } = Route.useParams();
  const submit = useServerFn(submitProfilerAssessment);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ProfileKey>>({});
  const [done, setDone] = useState(false);

  const employeeQuery = useQuery({
    queryKey: ["profiler-employee", employeeId],
    queryFn: () => getProfilerEmployee({ data: { id: employeeId } }),
  });

  const total = QUESTIONS.length;
  const question = QUESTIONS[step]!;
  const progress = Math.round((Object.keys(answers).length / total) * 100);
  const scores = useMemo(() => scoreAnswers(answers), [answers]);

  // Identifica o perfil com maior pontuação para incluir no e-mail
  const dominantProfileKey = useMemo(() => {
    let topKey: ProfileKey = "EXECUTOR";
    let maxScore = -1;
    for (const [key, val] of Object.entries(scores)) {
      if (val > maxScore) {
        maxScore = val;
        topKey = key as ProfileKey;
      }
    }
    return topKey;
  }, [scores]);

  const mutation = useMutation({
    mutationFn: async () => {
      // 1. Salva a avaliação no banco
      const res = await submit({ data: { employeeId, answers } });

      // 2. Dispara o e-mail automático para o líder se o e-mail estiver cadastrado
      const emp = employeeQuery.data;
      if (emp && emp.leaderEmail) {
        const profileInfo = PROFILES[dominantProfileKey];
       // Altere de "send-profiler-report" para "rapid-task"
await supabase.functions.invoke("rapid-task", {
  body: {
    leaderEmail: emp.leaderEmail,
    employeeName: emp.fullName,
    profileLabel: profileInfo?.label || dominantProfileKey,
    reportUrl: `${window.location.origin}/app/profiler/colaborador/${emp.id}`,
  },
});

      return res;
    },
    onSuccess: () => setDone(true),
  });

  const choose = (profile: ProfileKey) => {
    setAnswers((prev) => ({ ...prev, [String(question.id)]: profile }));
    if (step < total - 1) setTimeout(() => setStep((s) => s + 1), 160);
  };

  if (employeeQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const employee = employeeQuery.data;

  if (!employee) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <p className="text-center text-sm text-muted-foreground">
          Este link de avaliação não é válido. Fale com o RH da VENDE-C.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-4xl px-6 py-10">
          <ProfilerReport
            name={employee.fullName}
            position={employee.position}
            sector={employee.sector}
            scores={scores}
            celebrate
          />
          <p className="mt-10 text-center text-xs text-muted-foreground">
            Seu resultado foi enviado ao RH e ao seu líder direto.
          </p>
        </div>
      </div>
    );
  }

  const allAnswered = Object.keys(answers).length === total;

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
          Em cada bloco, escolha a frase que mais tem a ver com você. Não existe resposta certa ou errada.
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
            className="mt-8 space-y-3"
          >
            {question.options.map((o) => {
              const selected = answers[String(question.id)] === o.profile;
              return (
                <button
                  key={o.profile}
                  onClick={() => choose(o.profile)}
                  className={`w-full rounded-2xl border p-4 text-left text-sm transition-all ${
                    selected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {o.text}
                </button>
              );
            })}
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
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
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

        {!allAnswered && step === total - 1 && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Ainda faltam {total - Object.keys(answers).length} blocos para responder.
          </p>
        )}

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
