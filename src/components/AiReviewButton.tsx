import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Wand2 } from "lucide-react";
import { reviewText, type ReviewKind } from "@/lib/rs.functions";

interface Props {
  kind: ReviewKind;
  value: string;
  onChange: (next: string) => void;
  label?: string;
}

/** Botão que pede à IA para revisar/organizar um texto (parecer, resumo, observações). */
export function AiReviewButton({ kind, value, onChange, label = "Revisar com IA" }: Props) {
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!value.trim()) {
      toast.error("Escreva algo antes de pedir a revisão da IA.");
      return;
    }
    setLoading(true);
    try {
      const res = await reviewText({ data: { kind, text: value } });
      onChange(res.text);
      toast.success("Texto revisado pela IA.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "A IA não conseguiu revisar o texto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={run}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-2 text-xs font-medium text-fuchsia-300 transition-colors hover:bg-fuchsia-500/20 disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
