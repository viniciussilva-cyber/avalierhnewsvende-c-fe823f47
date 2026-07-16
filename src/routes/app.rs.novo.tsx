import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useRole } from "@/lib/roles";
import { AppTopBar } from "@/components/AppTopBar";
import { PageTransition } from "@/components/PageTransition";
import { CandidateForm } from "@/components/CandidateForm";

export const Route = createFileRoute("/app/rs/novo")({
  head: () => ({ meta: [{ title: "Novo candidato · R&S" }] }),
  component: NewCandidate,
});

function NewCandidate() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useRole(user);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin", replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!roleLoading && role && role !== "rh") {
      navigate({ to: "/app/rs", replace: true });
    }
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
      <AppTopBar moduleLabel="R&S · Novo candidato" backTo="/app/rs" backLabel="Candidatos" />
      <PageTransition className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
            Novo cadastro
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-foreground">Adicionar candidato</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Preencha o perfil e a área do RH. O gestor da área poderá adicionar seu parecer depois.
          </p>
        </div>
        <CandidateForm
          onSaved={(id) => {
            navigate({ to: "/app/rs/$id", params: { id } });
          }}
        />
      </PageTransition>
    </div>
  );
}
