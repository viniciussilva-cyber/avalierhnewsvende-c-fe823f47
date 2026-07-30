import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, Upload, User as UserIcon, X } from "lucide-react";
import { uploadEditorImage } from "@/lib/storage";
import {
  departmentsFor,
  newEmployeeId,
  saveEmployee,
  type Employee,
  type EmployeeKind,
} from "@/lib/employees";


const schema = z.object({
  fullName: z.string().trim().min(2, "Informe o nome completo.").max(120),
  department: z.string().trim().min(1, "Selecione o departamento."),
  position: z.string().trim().max(120).optional().or(z.literal("")),
  birthDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data de nascimento válida."),
  admissionDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data de admissão válida."),
  photoUrl: z.string().trim().max(600).optional().or(z.literal("")),
});

interface Props {
  existing?: Employee;
  defaultKind?: EmployeeKind;
  onSaved: (id: string) => void;
}

export function EmployeeForm({ existing, defaultKind = "interno", onSaved }: Props) {
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<EmployeeKind>(existing?.kind ?? defaultKind);
  const [fullName, setFullName] = useState(existing?.fullName ?? "");
  const [department, setDepartment] = useState(
    existing?.department ?? departmentsFor(existing?.kind ?? defaultKind)[0]
  );
  const [position, setPosition] = useState(existing?.position ?? "");
  const [birthDate, setBirthDate] = useState(existing?.birthDate ?? "");
  const [admissionDate, setAdmissionDate] = useState(existing?.admissionDate ?? "");
  const [photoUrl, setPhotoUrl] = useState(existing?.photoUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const departmentOptions = departmentsFor(kind);

  const handleKindChange = (next: EmployeeKind) => {
    setKind(next);
    const opts = departmentsFor(next);
    if (!opts.includes(department)) setDepartment(opts[0]);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = schema.parse({
        fullName,
        department,
        position,
        birthDate,
        admissionDate,
        photoUrl,
      });
      const id = existing?.id ?? newEmployeeId(parsed.fullName);
      await saveEmployee({
        id,
        fullName: parsed.fullName,
        department: parsed.department,
        position: parsed.position || "",
        kind,
        birthDate: parsed.birthDate,
        admissionDate: parsed.admissionDate,
        photoUrl: parsed.photoUrl || "",
        createdAt: existing?.createdAt,
      });
      return id;
    },

    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", id] });
      toast.success(existing ? "Colaborador atualizado!" : "Colaborador cadastrado!");
      onSaved(id);
    },
    onError: (err: unknown) => {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message ?? "Verifique os campos.");
      } else {
        setError("Não foi possível salvar. Tente novamente.");
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
          Foto do colaborador
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

      {/* Vínculo */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Vínculo
        </span>
        <div className="flex gap-2">
          {(["interno", "terceiro"] as EmployeeKind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => handleKindChange(k)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                kind === k
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {k === "interno" ? "Colaborador" : "Terceiro"}
            </button>
          ))}
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
        <Field label="Cargo">
          <input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Analista, Coordenador, Estagiário…"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
          />
        </Field>
        <Field label="Departamento *">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          >
            {departmentOptions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </Field>

        <Field label="Data de nascimento *">
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          />
        </Field>
        <Field label="Data de admissão *" className="sm:col-span-2">
          <input
            type="date"
            value={admissionDate}
            onChange={(e) => setAdmissionDate(e.target.value)}
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
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
          {existing ? "Salvar alterações" : "Cadastrar colaborador"}
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
