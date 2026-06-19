import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { CheckCircle2, Loader2, MessageSquareHeart } from "lucide-react";
import { addEvaluation } from "@/lib/evaluations";
import { cn } from "@/lib/utils";

const schema = z.object({
  rating: z.number().min(0).max(10),
  name: z.string().trim().min(1, "Informe seu nome completo").max(120),
  role: z.string().trim().min(1, "Informe seu cargo").max(120),
  comment: z.string().trim().max(1000).optional(),
});

interface EvaluationFormProps {
  newsletterId: string;
}

export function EvaluationForm({ newsletterId }: EvaluationFormProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: addEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations", newsletterId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = schema.safeParse({
      rating: rating ?? -1,
      name,
      role,
      comment: comment || undefined,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (key === "rating") fieldErrors.rating = "Selecione uma nota de 0 a 10";
        else fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    mutation.mutate({ newsletterId, ...result.data });
  };

  if (mutation.isSuccess) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
        <h3 className="mt-4 text-xl font-bold text-card-foreground">Obrigado pela sua avaliação!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Seu feedback ajuda o RH a melhorar cada edição da newsletter.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-6 sm:p-8"
    >
      <div className="mb-6 flex items-center gap-2">
        <MessageSquareHeart className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-card-foreground">Avalie esta edição</h2>
      </div>

      <fieldset className="mb-6">
        <legend className="mb-3 text-sm font-medium text-card-foreground">
          De 0 a 10, que nota você dá?
        </legend>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 11 }, (_, i) => i).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={cn(
                "h-11 w-11 rounded-lg border text-sm font-semibold transition-colors",
                rating === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {n}
            </button>
          ))}
        </div>
        {errors.rating && <p className="mt-2 text-sm text-destructive">{errors.rating}</p>}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-card-foreground">
            Nome completo <span className="text-primary">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
            placeholder="Seu nome"
          />
          {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-card-foreground">
            Cargo <span className="text-primary">*</span>
          </label>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            maxLength={120}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
            placeholder="Seu cargo"
          />
          {errors.role && <p className="mt-1 text-sm text-destructive">{errors.role}</p>}
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-card-foreground">
          Comentários e sugestões de melhoria <span className="text-muted-foreground">(opcional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          rows={4}
          className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
          placeholder="O que você achou? Como podemos melhorar?"
        />
      </div>

      {mutation.isError && (
        <p className="mt-4 text-sm text-destructive">
          Não foi possível enviar sua avaliação. Verifique a conexão com o Firebase e tente novamente.
        </p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-60"
      >
        {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Enviar avaliação
      </button>
    </form>
  );
}
