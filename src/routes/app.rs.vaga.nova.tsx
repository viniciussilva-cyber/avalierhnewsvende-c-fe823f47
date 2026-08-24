import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useRole } from "@/lib/roles";
import { AppTopBar } from "@/components/AppTopBar";
import { PageTransition } from "@/components/PageTransition";
import { JobForm } from "@/components/JobForm";

export const Route = createFileRoute("/app/rs/vaga/nova")({
  head: () => ({
    meta: [
      { title: "Nova vaga · R&S VENDE-C" },
      { name: "description", content: "Crie uma vaga com cargo, time, salário e perfil ideal." },
      { property: "og:title", content: "Nova vaga · R&S VENDE-C" },
      {
        property: "og:description",
        content: "Crie uma vaga com cargo, time, salário e perfil ideal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewJob,
});

function NewJob() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useRole(user);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin", replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!roleLoading && role && role !== "rh") navigate({ to: "/app/rs", replace: true });
  }, [roleLoading, role, navigate]);

  if (loading || roleLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppTopBar moduleLabel="R&S · Nova vaga" backTo="/app/rs" backLabel="Vagas" />
      <PageTransition className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
            Abertura de vaga
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-foreground">Criar vaga</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Defina cargo, time, salário, gestores e o perfil ideal. Cada candidato cadastrado nesta
            vaga será analisado automaticamente pela IA.
          </p>
        </div>
        <JobForm onSaved={(jobId) => navigate({ to: "/app/rs/vaga/$jobId", params: { jobId } })} />
      </PageTransition>
    </div>
  );
}
