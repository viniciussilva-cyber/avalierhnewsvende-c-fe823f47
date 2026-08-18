import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LogIn, Users } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { findManager } from "@/lib/managers";
import { gestorSignIn, useGestorSession, type GestorMode } from "@/lib/gestor-auth";

export const Route = createFileRoute("/rs/")({
  head: () => ({
    meta: [
      { title: "R&S — Portal do gestor · VENDE-C" },
      {
        name: "description",
        content: "Acesso dos gestores VENDE-C para avaliar candidatos das suas áreas.",
      },
      { property: "og:title", content: "R&S — Portal do gestor · VENDE-C" },
      {
        property: "og:description",
        content: "Acesso dos gestores VENDE-C para avaliar candidatos das suas áreas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GestorLogin,
});

function GestorLogin() {
  const navigate = useNavigate();
  const { session, loading } = useGestorSession();
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<GestorMode>("area");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/rs/painel", replace: true });
  }, [loading, session, navigate]);

  const manager = findManager(email);
  const showModeChoice = !!manager?.canModerate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await gestorSignIn(email, mode);
      navigate({ to: "/rs/painel", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-card px-6">
      <PageTransition className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Users className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold text-foreground">R&S · VENDE-C</span>
        </div>

        <div className="rounded-2xl border border-border bg-background p-8">
          <h1 className="text-lg font-bold text-foreground">Portal do gestor</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Entre com seu e-mail corporativo para avaliar os candidatos da sua área.
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
              />
            </div>

            {showModeChoice && (
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Como você quer entrar?
                </p>
                <div className="space-y-2">
                  <ModeOption
                    label={`Recrutador da minha área (${manager!.areas.join(", ")})`}
                    active={mode === "area"}
                    onClick={() => setMode("area")}
                  />
                  <ModeOption
                    label="Recrutador geral (todas as áreas)"
                    active={mode === "geral"}
                    onClick={() => setMode("geral")}
                  />
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/admin" })}
                    className="w-full rounded-lg border border-border px-3 py-2 text-left text-xs font-medium text-muted-foreground hover:bg-secondary"
                  >
                    Moderador (editar o site) →
                  </button>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {submitting ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>
      </PageTransition>
    </div>
  );
}

function ModeOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border text-muted-foreground hover:bg-secondary"
      }`}
    >
      {label}
    </button>
  );
}
