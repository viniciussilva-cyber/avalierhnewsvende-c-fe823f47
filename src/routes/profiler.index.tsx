import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth";
import { 
  Plus, 
  Search, 
  Trash2, 
  Loader2, 
  RefreshCw,
  Eye,
  Link as LinkIcon,
  ArrowLeft,
  Pencil,
  LogOut,
  Sparkles
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
    meta: [{ title: "Profiler · Perfis comportamentais" }],
  }),
  component: ProfilerDashboard,
});

function ProfilerDashboard() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedLeader, setCopiedLeader] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);

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
          id: editingEmployee?.id,
          actorEmail: user.email,
          fullName,
          email,
          position,
          sector,
          leaderEmail,
          active: true,
          photoUrl: editingEmployee?.photoUrl || "",
        },
      });
    },
    onSuccess: () => {
      toast.success(editingEmployee ? "Colaborador atualizado!" : "Colaborador cadastrado!");
      closeModal();
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
      toast.success("Permissão atualizada!");
      queryClient.invalidateQueries({ queryKey: ["profiler-employees"] });
    },
  });

  const openEditModal = (emp: any) => {
    setEditingEmployee(emp);
    setFullName(emp.fullName || "");
    setEmail(emp.email || "");
    setPosition(emp.position || "");
    setSector(emp.sector || "");
    setLeaderEmail(emp.leaderEmail || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setFullName("");
    setEmail("");
    setPosition("");
    setSector("");
    setLeaderEmail("");
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/profiler/avaliacao/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Link copiado!");
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

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Header Corporativo Elegante */}
      <header className="border-b border-zinc-800/80 bg-[#121214] px-6 py-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <Link to="/app" className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Módulos
          </Link>
          <span className="text-zinc-600">/</span>
          <div className="flex items-center gap-2 text-white font-bold">
            <Sparkles className="h-4 w-4 text-[#ff0068]" />
            Profiler · Perfis comportamentais
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-zinc-800/80 border border-zinc-700/50 px-3 py-1 text-[11px] font-bold text-zinc-300">
            RECRUTADOR (RH)
          </span>
          <span className="text-zinc-300 font-semibold">{user?.email || "vinicius.silva@vende-c.com"}</span>
          <button 
            onClick={() => logout && logout()} 
            className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors ml-2"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl p-6 md:p-10 space-y-8">
        {/* Titulo e Ações */}
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
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#141414] px-4 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition-all"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              {copiedLeader ? "Link copiado!" : "Copiar link do acesso do líder"}
            </button>

            <Link
              to="/app/profiler/lider"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#141414] px-4 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition-all"
            >
              <Eye className="h-3.5 w-3.5" /> Visão do líder
            </Link>

            <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
              <DialogTrigger asChild>
                <button 
                  onClick={() => closeModal()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#18181b] border border-zinc-700/80 px-4 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition-all active:scale-95 shadow-md cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-[#ff0068]" /> Novo colaborador
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-[#141414] border-zinc-800 text-white">
                <DialogHeader>
                  <DialogTitle>{editingEmployee ? "Editar Colaborador" : "Cadastrar Novo Colaborador"}</DialogTitle>
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
                      onClick={closeModal}
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
                      {editingEmployee ? "Atualizar" : "Salvar Colaborador"}
                    </button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, cargo ou setor..."
            className="w-full rounded-xl border border-zinc-800/80 bg-[#121214] py-3.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ff0068]"
          />
        </div>

        {/* Lista de Cards Executivos */}
        {employeesQuery.isLoading ? (
          <div className="flex py-20 justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#ff0068]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#121214]/50 py-16 text-center">
            <p className="text-sm text-zinc-400">
              Nenhum colaborador encontrado. Cadastre o primeiro para gerar o link da avaliação.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((emp) => {
              const assessment = assessments.find((a) => a.employeeId === emp.id);
              const dominantKey = assessment?.dominant ? String(assessment.dominant).toUpperCase().trim() : null;

              return (
                <div
                  key={emp.id}
                  className="flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-[#121214] p-5 shadow-lg hover:border-zinc-700/80 transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {emp.photoUrl ? (
                          <img
                            src={emp.photoUrl}
                            alt={emp.fullName}
                            className="h-11 w-11 rounded-full object-cover border border-zinc-700"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300 border border-zinc-700/60">
                            {getInitials(emp.fullName)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-extrabold text-white text-base leading-tight">{emp.fullName}</h3>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {emp.position || "Sem cargo"} {emp.sector ? `· ${emp.sector}` : ""}
                          </p>
                        </div>
                      </div>

                      {dominantKey && (
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-white">
                          {dominantKey}
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
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        Ver relatório
                      </a>
                    ) : null}

                    <button
                      onClick={() => handleCopyLink(emp.id)}
                      className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <LinkIcon className="h-3 w-3" />
                      {copiedId === emp.id ? "Copiado!" : "Link"}
                    </button>

                    <button
                      onClick={() => openEditModal(emp)}
                      className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Pencil className="h-3 w-3" /> Editar
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
                      className="ml-auto text-zinc-600 hover:text-red-500 transition-colors p-1"
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
