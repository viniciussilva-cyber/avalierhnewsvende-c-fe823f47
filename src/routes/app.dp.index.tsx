import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Loader2,
  Plus,
  Search,
  User as UserIcon,
  Briefcase,
  Cake,
  PartyPopper,
  Bell,
  Calendar,
} from "lucide-react";
import { AppTopBar } from "@/components/AppTopBar";
import { PageTransition, StaggerItem } from "@/components/PageTransition";
import { useAuth } from "@/lib/auth";
import { useRole } from "@/lib/roles";
import { firebaseConfigured } from "@/lib/firebase";
import {
  DEPARTMENTS,
  computeNotices,
  listEmployees,
  type Employee,
} from "@/lib/employees";

export const Route = createFileRoute("/app/dp/")({
  head: () => ({ meta: [{ title: "DP — Colaboradores · VENDE-C" }] }),
  component: DpList,
});

function DpList() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useRole(user);
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin", replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!roleLoading && role && role !== "rh") {
      navigate({ to: "/app", replace: true });
    }
  }, [roleLoading, role, navigate]);

  const ready = !loading && !!user && !roleLoading;

  const query = useQuery({
    queryKey: ["employees"],
    queryFn: listEmployees,
    enabled: ready && firebaseConfigured,
  });

  const employees: Employee[] = query.data ?? [];

  const notices = useMemo(() => computeNotices(employees, 14), [employees]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((e) => {
      if (departmentFilter !== "all" && e.department !== departmentFilter) return false;
      if (q && !`${e.fullName} ${e.position} ${e.department}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [employees, departmentFilter, search]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppTopBar moduleLabel="DP · Colaboradores" />

      <PageTransition className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-300">
              Departamento Pessoal
            </span>
            <h1 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">
              Colaboradores
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {employees.length}{" "}
              {employees.length === 1 ? "colaborador cadastrado" : "colaboradores cadastrados"} no total.
            </p>
          </div>
          <Link
            to="/app/dp/novo"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-95"
          >
            <Plus className="h-4 w-4" /> Adicionar colaborador
          </Link>
        </div>

        {/* Notifications panel */}
        <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent p-5">
          <div className="mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4 text-emerald-300" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
              Avisos dos próximos 14 dias
            </h2>
          </div>
          {notices.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum aniversário ou marco de admissão nos próximos 14 dias.
            </p>
          ) : (
            <ul className="space-y-2">
              {notices.map((n, i) => (
                <li
                  key={`${n.employee.id}-${n.kind}-${n.months ?? "b"}`}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      n.kind === "birthday"
                        ? "bg-pink-500/15 text-pink-300"
                        : "bg-emerald-500/15 text-emerald-300"
                    }`}
                  >
                    {n.kind === "birthday" ? (
                      <Cake className="h-4 w-4" />
                    ) : (
                      <PartyPopper className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {n.employee.department}
                      {n.employee.position ? ` · ${n.employee.position}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {n.inDays === 0 ? "hoje" : n.inDays === 1 ? "amanhã" : `${n.inDays}d`}
                  </span>
                  {/* stagger animation offset */}
                  <span className="sr-only">{i}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[1fr_auto]">
          <label className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, cargo, departamento…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 pl-9 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
            />
          </label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          >
            <option value="all">Todos os departamentos</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {query.isLoading ? (
          <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin text-primary" />
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {employees.length === 0
                ? "Nenhum colaborador cadastrado. Clique em 'Adicionar colaborador' para começar."
                : "Nenhum colaborador corresponde aos filtros."}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e, i) => (
              <StaggerItem key={e.id} delay={Math.min(i * 0.04, 0.4)}>
                <EmployeeCard employee={e} />
              </StaggerItem>
            ))}
          </div>
        )}
      </PageTransition>
    </div>
  );
}

function EmployeeCard({ employee }: { employee: Employee }) {
  const admission = employee.admissionDate
    ? new Date(employee.admissionDate + "T00:00:00").toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;
  const birth = employee.birthDate
    ? new Date(employee.birthDate + "T00:00:00").toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      })
    : null;
  return (
    <Link to="/app/dp/$id" params={{ id: employee.id }} className="group block">
      <motion.div
        whileHover={{ y: -3 }}
        className="h-full rounded-2xl border border-border bg-card p-5 transition-colors group-hover:border-emerald-400/50"
      >
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border bg-secondary">
            {employee.photoUrl ? (
              <img src={employee.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <UserIcon className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">{employee.fullName}</p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              <Briefcase className="h-3 w-3" />
              {employee.position || "Cargo não informado"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
            {employee.department || "sem depto"}
          </span>
          <div className="flex items-center gap-3">
            {birth && (
              <span className="inline-flex items-center gap-1">
                <Cake className="h-3 w-3" /> {birth}
              </span>
            )}
            {admission && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {admission}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
