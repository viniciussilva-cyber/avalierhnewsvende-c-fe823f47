import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { saveNewsletter, slugify } from "@/lib/newsletters";
import type { Newsletter, NewsletterStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const schema = z.object({
  monthYear: z.string().trim().min(1, "Informe o mês/ano"),
  title: z.string().trim().min(1, "Informe o título"),
  id: z.string().trim().min(1, "Informe o slug").regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens"),
  content: z.string().trim().min(1, "Escreva o conteúdo"),
  status: z.enum(["draft", "published"]),
});

interface NewsletterFormProps {
  editing: Newsletter | null;
  onSaved: () => void;
}

export function NewsletterForm({ editing, onSaved }: NewsletterFormProps) {
  const queryClient = useQueryClient();
  const [monthYear, setMonthYear] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [status, setStatus] = useState<NewsletterStatus>("draft");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editing) {
      setMonthYear(editing.monthYear);
      setTitle(editing.title);
      setSlug(editing.id);
      setSlugTouched(true);
      setStatus(editing.status);
      setContent(editing.content);
    } else {
      setMonthYear("");
      setTitle("");
      setSlug("");
      setSlugTouched(false);
      setStatus("draft");
      setContent("");
    }
    setErrors({});
  }, [editing]);

  const mutation = useMutation({
    mutationFn: saveNewsletter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
      onSaved();
    },
  });

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched && !editing) setSlug(slugify(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = schema.safeParse({ monthYear, title, id: slug, content, status });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    mutation.mutate({ ...result.data, createdAt: editing?.createdAt });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h2 className="text-lg font-bold text-card-foreground">
        {editing ? "Editar edição" : "Nova edição"}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-card-foreground">Mês / Ano</label>
          <input
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
            placeholder="Ex.: Julho 2026"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
          />
          {errors.monthYear && <p className="mt-1 text-sm text-destructive">{errors.monthYear}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-card-foreground">Status</label>
          <div className="flex gap-2">
            {(["draft", "published"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                  status === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {s === "draft" ? "Rascunho" : "Publicada"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-card-foreground">Título</label>
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Título da edição"
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
        />
        {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-card-foreground">
          Slug (URL amigável)
        </label>
        <input
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          disabled={!!editing}
          placeholder="julho-2026"
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2 disabled:opacity-60"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {editing ? "O slug não pode ser alterado após a criação." : "Usado no link: ?edition=" + (slug || "...")}
        </p>
        {errors.id && <p className="mt-1 text-sm text-destructive">{errors.id}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-card-foreground">Conteúdo</label>
        <RichTextEditor value={content} onChange={setContent} />
        {errors.content && <p className="mt-1 text-sm text-destructive">{errors.content}</p>}
      </div>

      {mutation.isError && (
        <p className="text-sm text-destructive">
          Não foi possível salvar. Verifique a conexão com o Firebase.
        </p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-60"
      >
        {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {editing ? "Salvar alterações" : "Criar edição"}
      </button>
    </form>
  );
}
