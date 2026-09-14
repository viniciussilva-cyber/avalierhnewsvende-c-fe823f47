import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Search, Link2, Check, Trash2, IdCard, X } from "lucide-react";
import { AppTopBar } from "@/components/AppTopBar";
import { PageTransition, StaggerItem } from "@/components/PageTransition";
import { useAuth } from "@/lib/auth";
import { useRole } from "@/lib/roles";
import { PROFILES } from "@/lib/profiler";
import {
  listProfilerEmployees,
  listProfilerAssessments,
  saveProfilerEmployee,
  deleteProfilerEmployee,
  type ProfilerEmployee,
} from "@/lib/profiler.functions";

export const Route = createFileRoute("/app/profiler/")({
  head: () => ({
    meta: [
      { title: "Profiler — Perfis comportamentais · VENDE-C" },
      {
        name: "description",
        content: "Cadastre colaboradores, envie o questionário e acompanhe os perfis do time.",
      },
      { property: "og:title", content: "Profiler — Perfis comportamentais · VENDE-C" },
      {
        property: "og:description",
        content: "Cadastre colaboradores, envie o questionário e acompanhe os perfis do time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilerPanel,
});

const emptyForm = {
  id: "",
  fullName: "",
  email: "",
  position: "",
  sector: "",
  leaderEmail: "",
  active: true,
  photoUrl: "",
};

function ProfilerPanel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useRole(user);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<typeof emptyForm | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin", replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!loading && !roleLoading && user && role === "gestor") {
      navigate({ to: "/profiler", replace: true });
    }
  }, [loading, roleLoading, user, role, navigate]);

  const ready = !loading && !!user && role === "rh";

  const employeesQuery = useQuery({
    queryKey: ["profiler-employees"],
    queryFn: () => listProfilerEmployees(),
    enabled: ready,
  });
  const assessmentsQuery = useQuery({
    queryKey: ["profiler-assessments"],
    queryFn: () => listProfilerAssessments(),
    enabled: ready,
  });

  const dominantByEmployee = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of assessmentsQuery.data ?? []) {
      if (!map.has(a.employeeId)) map.set(a.employeeId, a.dominant);
    }
    return map;
  }, [assessmentsQuery.data]);

  const employees: ProfilerEmployee[] = employeesQuery.data ?? [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      `${e.fullName} ${e.email} ${e.position} ${e.sector}`.toLowerCase().includes(q),
    );
  }, [employees, search]);

  const saveMutation = useMutation({
    mutationFn: (values: typeof emptyForm) =>
      saveProfilerEmployee({
        data: {
          actorEmail: user?.email ?? "",
          ...(values.id ? { id: values.id } : {}),
          fullName: values.fullName,
          email: values.email,
          position: values.position,
          sector: values.sector,
          leaderEmail: values.leaderEmail,
          active: values.active,
          photoUrl: values.photoUrl,
        },
      }),
    onSuccess: () => {
      setForm(null);
      setError("");
      queryClient.invalidateQueries({ queryKey: ["profiler-employees"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      deleteProfilerEmployee({ data: { actorEmail: user?.email ?? "", id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profiler-employees"] }),
    onError: (e: Error) => setError(e.message),
  });

  const copyLink = async (id: string) => {
    const url = `${window.location.origin}/profiler/avaliacao/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      window.prompt("Copie o link da avaliação:", url);
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppTopBar moduleLabel="Profiler · Perfis comportamentais" />

      <PageTransition className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
              Perfil comportamental
            </span>
            <h1 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">Colaboradores</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {employees.length} {employees.length === 1 ? "colaborador" : "colaboradores"} cadastrados.
              Copie o link da avaliação e envie para quem vai responder.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/profiler"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40"
            >
              <IdCard className="h-4 w-4" /> Visão do líder
            </Link>
            <button
              onClick={() => {
                setError("");
                setForm({ ...emptyForm });
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-95"
            >
              <Plus className="h-4 w-4" /> Novo colaborador
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {form && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {form.id ? "Editar colaborador" : "Novo colaborador"}
              </h2>
              <button
                onClick={() => setForm(null)}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Nome completo">
                <input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="E-mail">
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Cargo">
                <input
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Setor / Time">
                <input
                  value={form.sector}
                  onChange={(e) => setForm({ ...form, sector: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="E-mail do líder direto">
                <input
                  value={form.leaderEmail}
                  onChange={(e) => setForm({ ...form, leaderEmail: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Foto (URL)">
                <input
                  value={form.photoUrl}
                  onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                  className={inputClass}
                />
              </Field>
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4 accent-[hsl(var(--primary))]"
              />
              Colaborador ativo
            </label>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => saveMutation.mutate(form)}
                disabled={saveMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
              </button>
              <button
                onClick={() => setForm(null)}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-border bg-card p-4">
          <label className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, cargo ou setor…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 pl-9 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
            />
          </label>
        </div>

        {employeesQuery.isLoading ? (
          <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin text-primary" />
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum colaborador encontrado. Cadastre o primeiro para gerar o link da avaliação.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e, i) => {
              const dominant = dominantByEmployee.get(e.id);
              const profile = dominant ? PROFILES[dominant as keyof typeof PROFILES] : null;
              return (
                <StaggerItem key={e.id} delay={Math.min(i * 0.04, 0.4)}>
                  <div className="h-full rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-bold text-foreground">{e.fullName}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {e.position || "Cargo não informado"} · {e.sector || "Sem setor"}
                        </p>
                      </div>
                      {profile ? (
                        <span
                          className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                          style={{ backgroundColor: `${profile.color}22`, color: profile.color }}
                        >
                          {profile.label}
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Pendente
                        </span>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <Link
                        to="/app/profiler/colaborador/$employeeId"
                        params={{ employeeId: e.id }}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40"
                      >
                        Ver relatório
                      </Link>
                      <button
                        onClick={() => copyLink(e.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {copied === e.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" /> Copiado
                          </>
                        ) : (
                          <>
                            <Link2 className="h-3.5 w-3.5" /> Link
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setError("");
                          setForm({
                            id: e.id,
                            fullName: e.fullName,
                            email: e.email,
                            position: e.position,
                            sector: e.sector,
                            leaderEmail: e.leaderEmail,
                            active: e.active,
                            photoUrl: e.photoUrl,
                          });
                        }}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Remover ${e.fullName}?`)) deleteMutation.mutate(e.id);
                        }}
                        className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                        aria-label="Remover colaborador"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </div>
        )}
      </PageTransition>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
