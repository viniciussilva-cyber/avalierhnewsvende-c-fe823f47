import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useRole } from "@/lib/roles";
import { AppTopBar } from "@/components/AppTopBar";
import { PageTransition } from "@/components/PageTransition";
import { CandidateForm } from "@/components/CandidateForm";
import { firebaseConfigured } from "@/lib/firebase";
import { getJob } from "@/lib/jobs";

export const Route = createFileRoute("/app/rs/vaga/$jobId_/novo")({
  head: () => ({
    meta: [
      { title: "Novo candidato na vaga · R&S VENDE-C" },
      {
        name: "description",
        content: "Cadastre um candidato dentro da vaga e receba a análise de compatibilidade da IA.",
      },
      { property: "og:title", content: "Novo candidato na vaga · R&S VENDE-C" },
      {
        property: "og:description",
        content: "Cadastre um candidato dentro da vaga e receba a análise de compatibilidade da IA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewCandidateInJob,
});

function NewCandidateInJob() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useRole(user);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin", replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!roleLoading && role && role !== "rh") navigate({ to: "/app/rs", replace: true });
  }, [roleLoading, role, navigate]);

  const jobQuery = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => getJob(jobId),
    enabled: !loading && !!user && firebaseConfigured,
  });

  if (loading || roleLoading || !user || jobQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const job = jobQuery.data ?? undefined;

  return (
    <div className="min-h-screen bg-background">
      <AppTopBar moduleLabel="R&S · Novo candidato" backTo="/app/rs" backLabel="Vagas" />
      <PageTransition className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
            {job ? `Vaga: ${job.title}` : "Novo cadastro"}
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-foreground">Adicionar candidato</h1>
          {job?.idealProfile ? (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              Ao salvar, a IA compara este candidato com o perfil ideal da vaga.
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              Esta vaga ainda não tem perfil ideal cadastrado — edite a vaga para habilitar a análise
              automática da IA.
            </p>
          )}
        </div>
        <CandidateForm
          job={job}
          onSaved={(id: string) => navigate({ to: "/app/rs/$id", params: { id } })}
        />
      </PageTransition>
    </div>
  );
}
