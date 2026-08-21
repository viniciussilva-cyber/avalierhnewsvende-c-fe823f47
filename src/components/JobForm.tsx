import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { MANAGERS } from "@/lib/managers";
import { JOB_STATUSES, newJobId, saveJob, type Job, type JobStatus } from "@/lib/jobs";

const schema = z.object({
  title: z.string().trim().min(2, "Informe o cargo da vaga.").max(120),
  team: z.string().trim().min(1, "Informe o time/área da vaga.").max(120),
  salary: z.string().trim().max(80).optional().or(z.literal("")),
  idealProfile: z.string().trim().max(20000).optional().or(z.literal("")),
  status: z.enum(["aberta", "em_andamento", "congelada", "fechada"]),
});

interface Props {
  existing?: Job;
  onSaved: (id: string) => void;
}

export function JobForm({ existing, onSaved }: Props) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(existing?.title ?? "");
  const [team, setTeam] = useState(existing?.team ?? "");
  const [salary, setSalary] = useState(existing?.salary ?? "");
  const [idealProfile, setIdealProfile] = useState(existing?.idealProfile ?? "");
  const [status, setStatus] = useState<JobStatus>(existing?.status ?? "aberta");
  const [managerEmails, setManagerEmails] = useState<string[]>(existing?.managerEmails ?? []);
  const [error, setError] = useState<string | null>(null);

  const toggleManager = (email: string) =>
    setManagerEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email],
    );

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = schema.parse({ title, team, salary, idealProfile, status });
      const id = existing?.id ?? newJobId(parsed.title);
      await saveJob({
        id,
        title: parsed.title,
        team: parsed.team,
        salary: parsed.salary || "",
        idealProfile: parsed.idealProfile || "",
        managerEmails,
        status: parsed.status,
        createdAt: existing?.createdAt,
      });
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      toast.success(existing ? "Vaga atualizada!" : "Vaga criada!");
      onSaved(id);
    },
    onError: (err: unknown) => {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message ?? "Verifique os campos.");
        return;
      }
      const code = (err as { code?: string })?.code ?? "";
      const message = err instanceof Error ? err.message : String(err);
      if (code.includes("permission-denied")) {
        setError(
          "Permissão negada pelo banco de dados. As regras do Firestore precisam ser publicadas com a coleção 'jobs' (arquivo firestore.rules do projeto).",
        );
      } else {
        setError(`Não foi possível salvar: ${message}`);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        mutation.mutate();
      }}
      className="space-y-6"
    >
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
        <Field label="Cargo da vaga *">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ex.: Analista Comercial"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
          />
        </Field>
        <Field label="Time / área *">
          <input
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            required
            placeholder="Ex.: Comercial - Corp"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
          />
        </Field>
        <Field label="Salário / faixa salarial">
          <input
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="R$ 4.000 – R$ 6.000"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
          />
        </Field>
        <Field label="Status da vaga *">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as JobStatus)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          >
            {JOB_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-400">
          Perfil ideal da vaga (usado pela IA)
        </span>
        <p className="mt-1 text-xs text-muted-foreground">
          Descreva o time em que a pessoa entra, a cultura da VENDE-C, o líder direto, hard e soft
          skills e os desafios do cargo. A IA compara automaticamente cada candidato com este perfil.
        </p>
        <textarea
          rows={7}
          value={idealProfile}
          onChange={(e) => setIdealProfile(e.target.value)}
          placeholder="Ex.: Vaga de Analista Comercial no time Corp, líder direto Gabriela (perfil analítico e exigente com processo). Cultura: alta performance, autonomia, ritmo acelerado…"
          className="mt-3 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-amber-400/40 placeholder:text-muted-foreground focus:ring-2"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Gestores responsáveis pela vaga
        </span>
        <p className="mt-1 text-xs text-muted-foreground">
          Eles verão esta vaga e os candidatos dela no portal do gestor.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {MANAGERS.map((m) => (
            <label
              key={m.email}
              className="flex cursor-pointer items-start gap-2 rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:bg-secondary"
            >
              <input
                type="checkbox"
                checked={managerEmails.includes(m.email)}
                onChange={() => toggleManager(m.email)}
                className="mt-0.5 h-3.5 w-3.5 accent-[color:var(--color-primary)]"
              />
              <span className="min-w-0">
                <span className="block truncate font-medium">{m.name}</span>
                <span className="block truncate text-[10px] text-muted-foreground">
                  {m.areas.join(" · ")}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {existing ? "Salvar alterações" : "Criar vaga"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
