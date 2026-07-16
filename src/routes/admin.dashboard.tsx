import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FileText,
  PlusCircle,
  Star,
  Pencil,
  Trash2,
  Link2,
  LogOut,
  Loader2,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { ConfigBanner } from "@/components/ConfigBanner";
import { Hero } from "@/components/Hero";
import { NewsletterForm } from "@/components/NewsletterForm";
import { useAuth, logout } from "@/lib/auth";
import { firebaseConfigured } from "@/lib/firebase";
import { listNewsletters, deleteNewsletter } from "@/lib/newsletters";
import { listAllEvaluations, averageRating } from "@/lib/evaluations";
import type { Newsletter } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Painel — RH News" }] }),
  component: Dashboard,
});

type Tab = "manage" | "new" | "evaluations";

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("manage");
  const [editing, setEditing] = useState<Newsletter | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/admin", replace: true });
    }
  }, [loading, user, navigate]);

  const ready = !loading && !!user;

  const newslettersQuery = useQuery({
    queryKey: ["newsletters", "all"],
    queryFn: listNewsletters,
    enabled: ready && firebaseConfigured,
  });
  const evaluationsQuery = useQuery({
    queryKey: ["evaluations", "all"],
    queryFn: listAllEvaluations,
    enabled: ready && firebaseConfigured,
  });

  const newsletters = newslettersQuery.data ?? [];
  const evaluations = evaluationsQuery.data ?? [];

  const deleteMutation = useMutation({
    mutationFn: deleteNewsletter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
      toast.success("Edição apagada.");
    },
    onError: () => toast.error("Não foi possível apagar."),
  });

  const latestPublished = newsletters.find((n) => n.status === "published") ?? null;
  const heroEvals = latestPublished
    ? evaluations.filter((e) => e.newsletterId === latestPublished.id)
    : [];

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    navigate({ to: "/admin", replace: true });
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/?edition=${slug}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Link copiado!", { description: url }),
      () => toast.error("Não foi possível copiar o link.")
    );
  };

  const startEdit = (n: Newsletter) => {
    setEditing(n);
    setTab("new");
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
    { id: "manage", label: "Gerenciar edições", icon: FileText },
    { id: "new", label: "Nova edição", icon: PlusCircle },
    { id: "evaluations", label: "Ver avaliações", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background">
      <ConfigBanner />

      <div className="flex items-center justify-between border-b border-border bg-header px-6 py-3">
        <div className="flex items-center gap-3">
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Módulos
          </Link>
          <span className="text-sm font-bold text-foreground">RH News · Painel</span>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>

      <PageTransition>

      <Hero
        monthYear={latestPublished?.monthYear}
        title={latestPublished?.title ?? "RH News"}
        average={averageRating(heroEvals)}
        evaluationsCount={heroEvals.length}
      />

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex flex-wrap gap-2 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                if (t.id !== "new") setEditing(null);
              }}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                tab === t.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "manage" && (
          <ManageTab
            newsletters={newsletters}
            loading={newslettersQuery.isLoading}
            onEdit={startEdit}
            onDelete={(slug) => {
              if (window.confirm("Apagar esta edição? Esta ação não pode ser desfeita.")) {
                deleteMutation.mutate(slug);
              }
            }}
            onCopyLink={copyLink}
          />
        )}

        {tab === "new" && (
          <NewsletterForm
            editing={editing}
            onSaved={() => {
              toast.success(editing ? "Edição atualizada!" : "Edição criada!");
              setEditing(null);
              setTab("manage");
            }}
          />
        )}

        {tab === "evaluations" && (
          <EvaluationsTab
            newsletters={newsletters}
            evaluations={evaluations}
            loading={evaluationsQuery.isLoading}
          />
        )}
      </div>
    </div>
  );
}

function ManageTab({
  newsletters,
  loading,
  onEdit,
  onDelete,
  onCopyLink,
}: {
  newsletters: Newsletter[];
  loading: boolean;
  onEdit: (n: Newsletter) => void;
  onDelete: (slug: string) => void;
  onCopyLink: (slug: string) => void;
}) {
  if (loading) {
    return <Loader2 className="mx-auto mt-8 h-6 w-6 animate-spin text-primary" />;
  }
  if (!newsletters.length) {
    return (
      <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        Nenhuma edição criada ainda. Use a aba “Nova edição”.
      </p>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {newsletters.map((n) => (
        <div key={n.id} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                {n.monthYear}
              </span>
              <p className="mt-1 font-semibold text-card-foreground">{n.title}</p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                n.status === "published"
                  ? "bg-primary/15 text-primary"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              {n.status === "published" ? "Publicada" : "Rascunho"}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => onEdit(n)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Pencil className="h-3.5 w-3.5" /> Editar
            </button>
            <button
              onClick={() => onCopyLink(n.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Link2 className="h-3.5 w-3.5" /> Link
            </button>
            <button
              onClick={() => onDelete(n.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" /> Apagar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function EvaluationsTab({
  newsletters,
  evaluations,
  loading,
}: {
  newsletters: Newsletter[];
  evaluations: import("@/lib/types").Evaluation[];
  loading: boolean;
}) {
  const grouped = useMemo(() => {
    return newsletters
      .map((n) => ({
        newsletter: n,
        items: evaluations.filter((e) => e.newsletterId === n.id),
      }))
      .filter((g) => g.items.length > 0);
  }, [newsletters, evaluations]);

  if (loading) {
    return <Loader2 className="mx-auto mt-8 h-6 w-6 animate-spin text-primary" />;
  }
  if (!grouped.length) {
    return (
      <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        Nenhuma avaliação recebida ainda.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {grouped.map(({ newsletter, items }) => (
        <div key={newsletter.id} className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                {newsletter.monthYear}
              </span>
              <p className="font-semibold text-card-foreground">{newsletter.title}</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2">
              <Star className="h-5 w-5 fill-primary text-primary" />
              <span className="font-bold text-foreground">
                {averageRating(items)?.toFixed(1)}
                <span className="text-xs font-normal text-muted-foreground"> / 10</span>
              </span>
              <span className="text-xs text-muted-foreground">· {items.length}</span>
            </div>
          </div>

          <ul className="divide-y divide-border">
            {items.map((e) => (
              <li key={e.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="font-medium text-card-foreground">{e.name}</span>
                    <span className="text-sm text-muted-foreground"> · {e.role}</span>
                  </div>
                  <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-primary/15 px-2 text-sm font-bold text-primary">
                    {e.rating}
                  </span>
                </div>
                {e.comment && (
                  <p className="mt-1.5 flex items-start gap-1.5 text-sm text-muted-foreground">
                    <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {e.comment}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground/70">
                  {new Date(e.date).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
