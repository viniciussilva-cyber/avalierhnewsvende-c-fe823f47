import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  Plus,
  Search,
  User as UserIcon,
  Briefcase,
  DollarSign,
} from "lucide-react";
import { motion } from "framer-motion";
import { AppTopBar } from "@/components/AppTopBar";
import { PageTransition, StaggerItem } from "@/components/PageTransition";
import { useAuth } from "@/lib/auth";
import { useRole } from "@/lib/roles";
import { firebaseConfigured } from "@/lib/firebase";
import {
  CANDIDATE_AREAS,
  CANDIDATE_STATUSES,
  listCandidates,
  type Candidate,
  type CandidateStatus,
} from "@/lib/candidates";

export const Route = createFileRoute("/app/rs/")({
  head: () => ({ meta: [{ title: "R&S — Candidatos · VENDE-C" }] }),
  component: RsList,
});

const STATUS_LABEL: Record<CandidateStatus, string> = Object.fromEntries(
  CANDIDATE_STATUSES.map((s) => [s.id, s.label])
) as Record<CandidateStatus, string>;

const STATUS_STYLES: Record<CandidateStatus, string> = {
  triagem: "bg-secondary text-muted-foreground",
  entrevista_rh: "bg-primary/15 text-primary",
  avaliacao_gestor: "bg-fuchsia-500/15 text-fuchsia-300",
  aprovado: "bg-emerald-500/15 text-emerald-300",
  reprovado: "bg-destructive/15 text-destructive",
};

function RsList() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { role } = useRole(user);
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin", replace: true });
  }, [loading, user, navigate]);

  const ready = !loading && !!user;

  const query = useQuery({
    queryKey: ["candidates"],
    queryFn: listCandidates,
    enabled: ready && firebaseConfigured,
  });

  const candidates: Candidate[] = query.data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return candidates.filter((c) => {
      if (areaFilter !== "all" && c.area !== areaFilter) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (q && !`${c.fullName} ${c.area}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [candidates, areaFilter, statusFilter, search]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppTopBar moduleLabel="R&S · Recrutamento" />

      <PageTransition className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
              Recrutamento & Seleção
            </span>
            <h1 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">
              Candidatos
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {candidates.length}{" "}
              {candidates.length === 1 ? "candidato cadastrado" : "candidatos cadastrados"} no total.
            </p>
          </div>
          {role === "rh" && (
            <Link
              to="/app/rs/novo"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-95"
            >
              <Plus className="h-4 w-4" /> Adicionar candidato
            </Link>
          )}
        </div>

        <div className="mt-8 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[1fr_auto_auto]">
          <label className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou vaga…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 pl-9 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
            />
          </label>
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          >
            <option value="all">Todas as áreas</option>
            {CANDIDATE_AREAS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          >
            <option value="all">Todos os status</option>
            {CANDIDATE_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        {query.isLoading ? (
          <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin text-primary" />
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {candidates.length === 0
                ? role === "rh"
                  ? "Nenhum candidato cadastrado ainda. Clique em 'Adicionar candidato' para começar."
                  : "Nenhum candidato cadastrado ainda."
                : "Nenhum candidato corresponde aos filtros selecionados."}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c, i) => (
              <StaggerItem key={c.id} delay={Math.min(i * 0.04, 0.4)}>
                <CandidateCard candidate={c} />
              </StaggerItem>
            ))}
          </div>
        )}
      </PageTransition>
    </div>
  );
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <Link
      to="/app/rs/$id"
      params={{ id: candidate.id }}
      className="group block"
    >
      <motion.div
        whileHover={{ y: -3 }}
        className="h-full rounded-2xl border border-border bg-card p-5 transition-colors group-hover:border-primary/40"
      >
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border bg-secondary">
            {candidate.photoUrl ? (
              <img
                src={candidate.photoUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <UserIcon className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">{candidate.fullName}</p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              <Briefcase className="h-3 w-3" />
              {candidate.area || "Área não definida"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${STATUS_STYLES[candidate.status]}`}
          >
            {STATUS_LABEL[candidate.status]}
          </span>
          {candidate.salaryExpectation && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              {candidate.salaryExpectation}
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
