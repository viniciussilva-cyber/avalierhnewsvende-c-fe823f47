import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Loader2,
  User as UserIcon,
  Briefcase,
  Cake,
  Calendar,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { AppTopBar } from "@/components/AppTopBar";
import { PageTransition } from "@/components/PageTransition";
import { EmployeeForm } from "@/components/EmployeeForm";
import { useAuth } from "@/lib/auth";
import { useRole } from "@/lib/roles";
import { firebaseConfigured } from "@/lib/firebase";
import { deleteEmployee, getEmployee } from "@/lib/employees";

export const Route = createFileRoute("/app/dp/$id")({
  head: () => ({ meta: [{ title: "Colaborador · DP" }] }),
  component: EmployeeDetail,
});

function EmployeeDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useRole(user);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin", replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!roleLoading && role && role !== "rh") {
      navigate({ to: "/app", replace: true });
    }
  }, [roleLoading, role, navigate]);

  const ready = !loading && !!user && !roleLoading;

  const empQuery = useQuery({
    queryKey: ["employee", id],
    queryFn: () => getEmployee(id),
    enabled: ready && firebaseConfigured,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Colaborador removido.");
      navigate({ to: "/app/dp", replace: true });
    },
    onError: () => toast.error("Não foi possível remover."),
  });

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const e = empQuery.data;

  if (empQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppTopBar moduleLabel="DP · Colaborador" backTo="/app/dp" backLabel="Colaboradores" />
        <Loader2 className="mx-auto mt-20 h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!e) {
    return (
      <div className="min-h-screen bg-background">
        <AppTopBar moduleLabel="DP · Colaborador" backTo="/app/dp" backLabel="Colaboradores" />
        <div className="mx-auto mt-20 max-w-md text-center">
          <p className="text-muted-foreground">Colaborador não encontrado.</p>
          <Link
            to="/app/dp"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        </div>
      </div>
    );
  }

  const birth = e.birthDate
    ? new Date(e.birthDate + "T00:00:00").toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;
  const admission = e.admissionDate
    ? new Date(e.admissionDate + "T00:00:00").toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <AppTopBar moduleLabel="DP · Colaborador" backTo="/app/dp" backLabel="Colaboradores" />

      <PageTransition className="mx-auto max-w-3xl px-6 py-10">
        {editing ? (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">Editar colaborador</h1>
              <button
                onClick={() => setEditing(false)}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
              >
                Cancelar
              </button>
            </div>
            <EmployeeForm
              existing={e}
              onSaved={() => {
                setEditing(false);
                queryClient.invalidateQueries({ queryKey: ["employee", id] });
                queryClient.invalidateQueries({ queryKey: ["employees"] });
              }}
            />
          </div>
        ) : (
          <motion.header
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex flex-wrap items-start gap-6">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border bg-secondary">
                {e.photoUrl ? (
                  <img src={e.photoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <UserIcon className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                    {e.department || "sem depto"}
                  </span>
                  {e.kind === "terceiro" && (
                    <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                      terceiro
                    </span>
                  )}
                </div>
                <h1 className="mt-3 text-3xl font-extrabold text-foreground">{e.fullName}</h1>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {e.position && (
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-emerald-300" /> {e.position}
                    </span>
                  )}
                  {birth && (
                    <span className="inline-flex items-center gap-1.5">
                      <Cake className="h-4 w-4 text-pink-300" /> {birth}
                    </span>
                  )}
                  {admission && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-emerald-300" /> Admissão: {admission}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary"
                >
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Remover este colaborador?")) {
                      deleteMutation.mutate();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Apagar
                </button>
              </div>
            </div>
          </motion.header>
        )}
      </PageTransition>
    </div>
  );
}
