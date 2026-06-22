import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Newspaper, Loader2 } from "lucide-react";
import { login, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Acesso moderador — RH News" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/admin/dashboard", replace: true });
    }
  }, [loading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate({ to: "/admin/dashboard", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "E-mail ou senha inválidos.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-card px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Newspaper className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold text-foreground">RH News</span>
        </Link>

        <div className="rounded-2xl border border-border bg-background p-8">
          <div className="mb-6 flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Acesso moderador</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
                placeholder="nome@vende-c.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Senha</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-input bg-card px-3 py-2.5 pr-10 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
