import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogIn, Sparkles } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { leaderSignIn, useLeaderSession } from "@/lib/profiler-leaders";

export const Route = createFileRoute("/profiler/")({
  head: () => ({
    meta: [
      { title: "Profiler — Acesso do líder · VENDE-C" },
      {
        name: "description",
        content: "Líderes VENDE-C acessam com o e-mail corporativo os perfis do próprio time.",
      },
      { property: "og:title", content: "Profiler — Acesso do líder · VENDE-C" },
      {
        property: "og:description",
        content: "Líderes VENDE-C acessam com o e-mail corporativo os perfis do próprio time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LeaderLogin,
});

function LeaderLogin() {
  const navigate = useNavigate();
  const { leader, loading } = useLeaderSession();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redireciona automaticamente se já houver uma sessão válida carregada
  useEffect(() => {
    if (!loading && leader) {
      navigate({ to: "/profiler/time", replace: true });
    }
  }, [loading, leader, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // 1. Grava no localStorage e valida o e-mail do líder
      leaderSignIn(email);

      // 2. Navega imediatamente para a tela do time sem esperar ciclo do React
      navigate({ to: "/profiler/time", replace: true });
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-card px-6">
      <PageTransition className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold text-foreground">Profiler · VENDE-C</span>
        </div>

        <div className="rounded-2xl border border-border bg-background p-8">
          <h1 className="text-lg font-bold text-foreground">Acesso do líder</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Entre com seu e-mail corporativo para ver o perfil comportamental do seu time.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                placeholder="nome@vende-c.com"
                className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
                disabled={isSubmitting}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="h-4 w-4" /> {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </PageTransition>
    </div>
  );
}
