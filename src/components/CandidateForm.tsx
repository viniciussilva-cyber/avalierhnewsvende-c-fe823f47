import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, Upload, User as UserIcon, X } from "lucide-react";
import { uploadEditorImage } from "@/lib/storage";
import {
  CANDIDATE_STATUSES,
  newCandidateId,
  saveCandidate,
  type Candidate,
  type CandidateStatus,
} from "@/lib/candidates";

const schema = z.object({
  fullName: z.string().trim().min(2, "Informe o nome completo.").max(120),
  salaryExpectation: z.string().trim().max(60).optional().or(z.literal("")),
  area: z.string().trim().min(1, "Selecione a área."),
  resumeUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^https?:\/\//i.test(v),
      "Cole um link começando com http(s)://",
    ),
  photoUrl: z.string().trim().max(600).optional().or(z.literal("")),
  rhSummary: z.string().max(4000).optional().or(z.literal("")),
  experience: z.string().max(6000).optional().or(z.literal("")),
  rhNotes: z.string().max(4000).optional().or(z.literal("")),
  status: z.enum(["triagem", "entrevista_rh", "avaliacao_gestor", "aprovado", "reprovado"]),
});

interface Props {
  existing?: Candidate;
  onSaved: (id: string) => void;
}

export function CandidateForm({ existing, onSaved }: Props) {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(existing?.fullName ?? "");
  const [salaryExpectation, setSalaryExpectation] = useState(existing?.salaryExpectation ?? "");
  const [area, setArea] = useState(existing?.area ?? "");
  const [resumeUrl, setResumeUrl] = useState(existing?.resumeUrl ?? "");
  const [photoUrl, setPhotoUrl] = useState(existing?.photoUrl ?? "");
  const [rhSummary, setRhSummary] = useState(existing?.rhSummary ?? "");
  const [experience, setExperience] = useState(existing?.experience ?? "");
  const [rhNotes, setRhNotes] = useState(existing?.rhNotes ?? "");
  const [status, setStatus] = useState<CandidateStatus>(existing?.status ?? "triagem");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = schema.parse({
        fullName,
        salaryExpectation,
        area,
        resumeUrl,
        photoUrl,
        rhSummary,
        experience,
        rhNotes,
        status,
      });
      const id = existing?.id ?? newCandidateId(parsed.fullName);
      await saveCandidate({
        id,
        fullName: parsed.fullName,
        salaryExpectation: parsed.salaryExpectation || "",
        area: parsed.area,
        resumeUrl: parsed.resumeUrl || "",
        photoUrl: parsed.photoUrl || "",
        rhSummary: parsed.rhSummary || "",
        experience: parsed.experience || "",
        rhNotes: parsed.rhNotes || "",
        status: parsed.status,
        createdAt: existing?.createdAt,
      });
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["candidate", id] });
      toast.success(existing ? "Candidato atualizado!" : "Candidato cadastrado!");
      onSaved(id);
    },
    onError: (err: unknown) => {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message ?? "Verifique os campos.");
        return;
      }
      const code = (err as { code?: string })?.code ?? "";
      const message = err instanceof Error ? err.message : String(err);
      console.error("[CandidateForm] save failed", code, err);
      if (code.includes("permission-denied")) {
        setError(
          "Permissão negada pelo banco de dados. As regras do Firestore precisam ser publicadas com a coleção 'candidates' (arquivo firestore.rules do projeto).",
        );
      } else {
        setError(`Não foi possível salvar: ${message}`);
      }
    },
  });

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadEditorImage(file);
      setPhotoUrl(url);
      toast.success("Foto enviada!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao enviar foto.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        mutation.mutate();
      }}
      className="space-y-6"
    >
      {/* Foto */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Foto de perfil
        </label>
        <div className="mt-3 flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border bg-secondary">
            {photoUrl ? (
              <img src={photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <UserIcon className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap gap-2">
              <label
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary ${
                  uploading ? "pointer-events-none opacity-60" : ""
                }`}
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {uploading ? "Enviando…" : "Enviar imagem"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = "";
                  }}
                />
              </label>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl("")}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary"
                >
                  <X className="h-3.5 w-3.5" /> Remover
                </button>
              )}
            </div>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="…ou cole uma URL da foto"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
            />
          </div>
        </div>
      </div>

      {/* Dados básicos */}
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
        <Field label="Nome completo *">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          />
        </Field>
        <Field label="Pretensão salarial">
          <input
            value={salaryExpectation}
            onChange={(e) => setSalaryExpectation(e.target.value)}
            placeholder="R$ 5.000"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
          />
        </Field>
        <Field label="Vaga / Área de interesse *">
          <input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            required
            placeholder="Ex.: Comercial - Corp"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
          />
        </Field>
        <Field label="Status do processo *">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as CandidateStatus)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          >
            {CANDIDATE_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Link do currículo (Google Drive)" className="sm:col-span-2">
          <input
            type="url"
            value={resumeUrl}
            onChange={(e) => setResumeUrl(e.target.value)}
            placeholder="https://drive.google.com/…"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
          />
        </Field>
      </div>

      {/* Área do RH */}
      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
            Área do RH
          </span>
          <span className="text-xs text-muted-foreground">Editável apenas por moderadores</span>
        </div>
        <Field label="Resumo/Histórico da conversa de entrevista">
          <textarea
            rows={4}
            value={rhSummary}
            onChange={(e) => setRhSummary(e.target.value)}
            className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          />
        </Field>
        <Field label="Experiências profissionais anteriores">
          <textarea
            rows={5}
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          />
        </Field>
        <Field label="Observações gerais do RH">
          <textarea
            rows={3}
            value={rhNotes}
            onChange={(e) => setRhNotes(e.target.value)}
            className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          />
        </Field>
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
          {existing ? "Salvar alterações" : "Cadastrar candidato"}
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
