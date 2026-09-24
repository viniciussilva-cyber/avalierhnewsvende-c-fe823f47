import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth";
import { 
  Plus, 
  Search, 
  Copy, 
  Trash2, 
  Loader2, 
  RefreshCw,
  Eye,
  Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";
import {
  listProfilerEmployees,
  listProfilerAssessments,
  saveProfilerEmployee,
  deleteProfilerEmployee,
  toggleReassessmentPermission,
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
  const [copiedLeader, setCopiedLeader] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleCopyLeaderLink = () => {
    const url = `${window.location.origin}/app/profiler/lider`;
    navigator.clipboard.writeText(url);
    setCopiedLeader(true);
    toast.success("Link do acesso do líder copiado!");
    setTimeout(() => setCopiedLeader(false), 2000);
  };

  const employees = employeesQuery.data ?? [];
  const assessments = assessmentsQuery.data ?? [];

  const filtered = employees.filter((e) =>
    [e.fullName, e.position, e.sector].some((field) =>
      field.toLowerCase().includes(search.toLowerCase())
    )
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Mapeamento explícito de cores para a tag do perfil
  const profileColorClasses: Record<string, string> = {
    EXECUTOR: "text-emerald-400 font-black",
    COMUNICADOR: "text-orange-400 font-black",
    PLANEJADOR: "text-sky-400 font-black",
    ANALISTA: "text-purple-400 font-black",
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 text-foreground">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#ff0068]">
              PERFIL COMPORTAMENTAL
            </p>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mt-1">Colaboradores</h1>
            <p className="mt-1 text-sm text-zinc-400">
              {employees.length} colaboradores cadastrados. Copie o link da avaliação e envie para quem vai responder.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopyLeaderLink}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#141414] px-4 py-3 text-xs font-bold text-white hover:bg-zinc-800"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              {copiedLeader ? "Link copiado!" : "Copiar link do acesso do líder"}
            </button>

            <Link
              to="/app/profiler"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#141414] px-4 py-3 text-xs font-bold text-white hover:bg-zinc-800"
            >
              <Eye className="h-3.5 w-3.5" /> Visão do líder
            </Link>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center gap-2 rounded-xl bg-[#ff0068] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-[#ff0068]/25 transition-all hover:opacity-90 active:scale-95">
                  <Plus className="h-4 w-4" /> Novo colaborador
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-[#141414] border-zinc-800 text-white">
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
                    <label className="text-xs font-semibold text-zinc-300">Nome completo *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: João Silva"
                      className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ff0068]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-300">E-mail do colaborador</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="joao@vende-c.com"
                      className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ff0068]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-300">Cargo</label>
                      <input
                        type="text"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="Ex: Executivo de Vendas"
                        className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ff0068]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-300">Setor</label>
                      <input
                        type="text"
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        placeholder="Ex: Comercial"
                        className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ff0068]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-300">E-mail do Líder Direto</label>
                    <input
                      type="email"
                      value={leaderEmail}
                      onChange={(e) => setLeaderEmail(e.target.value)}
                      placeholder="lider@vende-c.com"
                      className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ff0068]"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-lg border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saveMutation.isPending}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#ff0068] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {saveMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Salvar Colaborador
                    </button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, cargo ou setor..."
            className="w-full rounded-xl border border-zinc-800/80 bg-[#141414] py-3.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ff0068]"
          />
        </div>

        {/* Lista de Colaboradores */}
        {employeesQuery.isLoading ? (
          <div className="flex py-20 justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#ff0068]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#141414]/50 py-16 text-center">
            <p className="text-sm text-zinc-400">
              Nenhum colaborador encontrado. Cadastre o primeiro para gerar o link da avaliação.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((emp) => {
              const assessment = assessments.find((a) => a.employeeId === emp.id);
              const dominant = assessment?.dominant?.toUpperCase();
              const tagColorClass = dominant ? (profileColorClasses[dominant] || "text-white") : "text-white";

              return (
                <div
                  key={emp.id}
                  className="flex flex-col justify-between rounded-2xl border border-zinc-800/90 bg-[#141414] p-5 shadow-lg transition-all hover:border-zinc-700"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800/80 text-xs font-extrabold text-zinc-300 border border-zinc-700/50">
                          {getInitials(emp.fullName)}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-white text-base leading-tight">{emp.fullName}</h3>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {emp.position || "Sem cargo"} {emp.sector ? `· ${emp.sector}` : ""}
                          </p>
                        </div>
                      </div>

                      {dominant && (
                        <span className={`text-[12px] uppercase tracking-wider ${tagColorClass}`}>
                          {dominant}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 pt-4 border-t border-zinc-800/60">
                    {assessment ? (
                      <a
                        href={`/app/profiler/colaborador/${emp.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-zinc-700/80 bg-zinc-800/80 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-zinc-700 transition-colors"
                      >
                        Ver relatório
                      </a>
                    ) : null}

                    <button
                      onClick={() => handleCopyLink(emp.id)}
                      className="rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
                    >
                      {copiedId === emp.id ? "Copiado!" : "🔗 Link"}
                    </button>

                    {emp.canReassess && (
                      <button
                        onClick={() =>
                          toggleReassessMutation.mutate({
                            employeeId: emp.id,
                            canReassess: false,
                          })
                        }
                        className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-400"
                        title="Liberado para refazer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteMutation.mutate(emp.id)}
                      className="ml-auto text-zinc-600 hover:text-red-500 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
