import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth";
import { 
  Plus, 
  Search, 
  UserCheck, 
  Copy, 
  Check, 
  Trash2, 
  ExternalLink, 
  Loader2, 
  RefreshCw 
} from "lucide-react";
import { toast } from "sonner";
import {
  listProfilerEmployees,
  listProfilerAssessments,
  saveProfilerEmployee,
  deleteProfilerEmployee,
  toggleReassessmentPermission,
  type ProfilerEmployee,
} from "@/lib/profiler.functions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/app/profiler/")({
  head: () => ({
    meta: [{ title: "Profiler · Gestão de Colaboradores" }],
  }),
  component: ProfilerDashboard,
});

function ProfilerDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados do Formulário
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [sector, setSector] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");

  const fetchEmployees = useServerFn(listProfilerEmployees);
  const fetchAssessments = useServerFn(listProfilerAssessments);
  const saveEmployeeFn = useServerFn(saveProfilerEmployee);
  const deleteEmployeeFn = useServerFn(deleteProfilerEmployee);
  const toggleReassessFn = useServerFn(toggleReassessmentPermission);

  const employeesQuery = useQuery({
    queryKey: ["profiler-employees"],
    queryFn: () => fetchEmployees(),
  });

  const assessmentsQuery = useQuery({
    queryKey: ["profiler-assessments"],
    queryFn: () => fetchAssessments(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.email) throw new Error("Sessão inválida.");
      return await saveEmployeeFn({
        data: {
          actorEmail: user.email,
          fullName,
          email,
          position,
          sector,
          leaderEmail,
          active: true,
          photoUrl: "",
        },
      });
    },
    onSuccess: () => {
      toast.success("Colaborador cadastrado com sucesso!");
      setIsModalOpen(false);
      setFullName("");
      setEmail("");
      setPosition("");
      setSector("");
      setLeaderEmail("");
      queryClient.invalidateQueries({ queryKey: ["profiler-employees"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erro ao salvar colaborador.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.email) throw new Error("Sessão inválida.");
      return await deleteEmployeeFn({ data: { actorEmail: user.email, id } });
    },
    onSuccess: () => {
      toast.success("Colaborador removido.");
      queryClient.invalidateQueries({ queryKey: ["profiler-employees"] });
    },
  });

  const toggleReassessMutation = useMutation({
    mutationFn: async ({ employeeId, canReassess }: { employeeId: string; canReassess: boolean }) => {
      if (!user?.email) throw new Error("Sessão inválida.");
      return await toggleReassessFn({
        data: { actorEmail: user.email, employeeId, canReassess },
      });
    },
    onSuccess: () => {
      toast.success("Permissão atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["profiler-employees"] });
    },
  });

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/profiler/avaliacao/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Link de avaliação copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const employees = employeesQuery.data ?? [];
  const assessments = assessmentsQuery.data ?? [];

  const filtered = employees.filter((e) =>
    [e.fullName, e.position, e.sector].some((field) =>
      field.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Perfil Comportamental
            </p>
            <h1 className="text-3xl font-extrabold text-foreground">Colaboradores</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {employees.length} colaboradores cadastrados. Copie o link da avaliação e envie para quem vai responder.
            </p>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90 active:scale-95">
                <Plus className="h-4 w-4" /> Novo colaborador
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Colaborador</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMutation.mutate();
                }}
                className="space-y-4 pt-4"
              >
                <div>
                  <label className="text-xs font-semibold text-foreground">Nome completo *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: João Silva"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">E-mail do colaborador</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="joao@vende-c.com"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground">Cargo</label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Ex: Executivo de Vendas"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground">Setor</label>
                    <input
                      type="text"
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      placeholder="Ex: Comercial"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">E-mail do Líder Direto</label>
                  <input
                    type="email"
                    value={leaderEmail}
                    onChange={(e) => setLeaderEmail(e.target.value)}
                    placeholder="lider@vende-c.com"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    {saveMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Salvar Colaborador
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, cargo ou setor..."
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Tabela / Lista */}
        {employeesQuery.isLoading ? (
          <div className="flex py-20 justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum colaborador encontrado. Cadastre o primeiro para gerar o link da avaliação.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((emp) => {
              const hasAssessment = assessments.some((a) => a.employeeId === emp.id);

              return (
                <div
                  key={emp.id}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-foreground">{emp.fullName}</h3>
                        <p className="text-xs text-muted-foreground">
                          {emp.position || "Sem cargo"} {emp.sector ? `· ${emp.sector}` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteMutation.mutate(emp.id)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        title="Excluir colaborador"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      <strong>Líder:</strong> {emp.leaderEmail || "Não informado"}
                    </p>

                    <div className="pt-2">
                      {hasAssessment ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-500">
                          <UserCheck className="h-3 w-3" /> Avaliação Concluída
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-500">
                          Pendente de resposta
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2 border-t border-border/60 pt-4">
                    <button
                      onClick={() => handleCopyLink(emp.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                    >
                      {copiedId === emp.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" /> Link Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copiar Link da Avaliação
                        </>
                      )}
                    </button>

                    {hasAssessment && (
                      <button
                        onClick={() =>
                          toggleReassessMutation.mutate({
                            employeeId: emp.id,
                            canReassess: !emp.canReassess,
                          })
                        }
                        className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors ${
                          emp.canReassess
                            ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                            : "border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        <RefreshCw className="h-3 w-3" />
                        {emp.canReassess ? "Liberado para refazer" : "Liberar novo teste"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
