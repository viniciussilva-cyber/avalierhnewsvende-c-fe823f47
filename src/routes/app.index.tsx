import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Newspaper, Users, Loader2, LogOut, Sparkles, ArrowRight, IdCard } from "lucide-react";
import { logout, useAuth } from "@/lib/auth";
import { useRole } from "@/lib/roles";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "VENDE-C — Módulos" }] }),
  component: AppHub,
});

const modules = [
  {
    id: "rh-news",
    to: "/admin/dashboard" as const,
    label: "RH News",
    tag: "Newsletter interno",
    description: "Publique e acompanhe as edições da newsletter interna e as notas dos colaboradores.",
    icon: Newspaper,
    gradient: "from-primary/25 via-primary/5 to-transparent",
    accent: "text-primary",
    allowGestor: false,
  },
  {
    id: "rs",
    to: "/app/rs" as const,
    label: "R&S",
    tag: "Recrutamento & Seleção",
    description: "Crie vagas, cadastre candidatos e receba a avaliação dos gestores da área.",
    icon: Users,
    gradient: "from-fuchsia-500/25 via-fuchsia-500/5 to-transparent",
    accent: "text-fuchsia-300",
    allowGestor: true,
  },
] as const;

function AppHub() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useRole(user);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/admin", replace: true });
    }
  }, [loading, user, navigate]);

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    navigate({ to: "/admin", replace: true });
  };

  if (loading || !user || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between border-b border-border bg-header px-6 py-3">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" /> VENDE-C · Plataforma interna
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
            {role === "rh" ? "Recrutador (RH)" : "Gestor de área"}
          </span>
          <h1 className="mt-4 text-balance text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
            Seja Bem-vindo{user.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}.
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            Tudo que o RH do VENDE-C precisa em um só lugar.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => {
            const disabled = role === "gestor" && !m.allowGestor;
            const card = (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={disabled ? undefined : { y: -4 }}
                className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-colors ${
                  disabled ? "opacity-50" : "hover:border-primary/40"
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${m.gradient} opacity-60 transition-opacity group-hover:opacity-100`}
                  aria-hidden
                />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-xl bg-background/60 backdrop-blur ${m.accent}`}>
                      <m.icon className="h-6 w-6" />
                    </span>
                    {!disabled && (
                      <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    )}
                  </div>
                  <p className="mt-6 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {m.tag}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-foreground">{m.label}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
                  {disabled && (
                    <p className="mt-4 text-xs font-medium text-muted-foreground/80">
                      Acesso restrito ao RH.
                    </p>
                  )}
                </div>
              </motion.div>
            );

            if (disabled) return <div key={m.id}>{card}</div>;
            return (
              <Link key={m.id} to={m.to}>
                {card}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
