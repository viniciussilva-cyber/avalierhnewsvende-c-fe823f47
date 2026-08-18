import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, LogOut, Search, User as UserIcon, Users } from "lucide-react";
import { useState } from "react";
import { PageTransition, StaggerItem } from "@/components/PageTransition";
import { listCandidates, type Candidate } from "@/lib/candidates";
import { areaMatches } from "@/lib/managers";
import { gestorSignOut, useGestorSession } from "@/lib/gestor-auth";

export const Route = createFileRoute("/rs/painel")({
  head: () => ({
    meta: [
      { title: "Candidatos para avaliar · R&S VENDE-C" },
      {
        name: "description",
        content: "Lista de candidatos da sua área aguardando parecer do gestor.",
      },
      { property: "og:title", content: "Candidatos para avaliar · R&S VENDE-C" },
      {
        property: "og:description",
        content: "Lista de candidatos da sua área aguardando parecer do gestor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GestorPanel,
});

function GestorPanel() {
  const navigate = useNavigate();
  const { session, loading } = useGestorSession();
  const [term, setTerm] = useState("");

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/rs", replace: true });
  }, [loading, session, navigate]);

  const { data: candidates, isLoading } = useQuery({
    queryKey: ["candidates"],
    queryFn: listCandidates,
    enabled: !!session,
  });

  const visible = useMemo(() => {
    if (!session || !candidates) return [];
    const { manager, mode } = session;
    const all = mode === "geral" || manager.allAreas;
    const list = all
      ? candidates
      : candidates.filter(
          (c: Candidate) =>
            areaMatches(manager.areas, c.area) ||
            (c.assignedManagers ?? []).includes(manager.email),
        );
    const q = term.trim().toLowerCase();
    return q
      ? list.filter(
          (c) =>
            c.fullName.toLowerCase().includes(q) || (c.area ?? "").toLowerCase().includes(q),
        )
      : list;
  }, [session, candidates, term]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-card">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Users className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{session.manager.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {session.mode === "geral" ? "Recrutador geral" : session.manager.areas.join(" · ")}
            </p>
          </div>
          <button
            onClick={async () => {
              await gestorSignOut();
              navigate({ to: "/rs", replace: true });
            }}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </header>

      <PageTransition className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-bold text-foreground">Candidatos para avaliar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escreva seu parecer e defina se aprova, nega ou deixa em espera.
        </p>

        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar por nome ou vaga…"
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-9 pr-3 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : visible.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Nenhum candidato liberado para você no momento.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((c) => (
              <StaggerItem key={c.id}>
                <Link
                  to="/rs/$id"
                  params={{ id: c.id }}
                  className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-background p-5 transition-colors hover:border-primary/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border bg-secondary">
                      {c.photoUrl ? (
                        <img src={c.photoUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <UserIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{c.fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.area}</p>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </div>
        )}
      </PageTransition>
    </div>
  );
}
