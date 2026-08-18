import { CheckCircle2, PauseCircle, XCircle } from "lucide-react";
import type { FeedbackDecision } from "@/lib/candidates";

const OPTIONS: {
  id: Exclude<FeedbackDecision, null>;
  label: string;
  icon: typeof CheckCircle2;
  active: string;
}[] = [
  {
    id: "aprovado",
    label: "Aprovado",
    icon: CheckCircle2,
    active: "border-emerald-500/60 bg-emerald-500/15 text-emerald-300",
  },
  {
    id: "negado",
    label: "Negado",
    icon: XCircle,
    active: "border-destructive/60 bg-destructive/15 text-destructive",
  },
  {
    id: "espera",
    label: "Em espera",
    icon: PauseCircle,
    active: "border-amber-500/60 bg-amber-500/15 text-amber-300",
  },
];

export function DecisionButtons({
  value,
  onChange,
}: {
  value: FeedbackDecision;
  onChange: (next: FeedbackDecision) => void;
}) {
  return (
    <>
      {OPTIONS.map((o) => {
        const Icon = o.icon;
        const isActive = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(isActive ? null : o.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              isActive ? o.active : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {o.label}
          </button>
        );
      })}
    </>
  );
}

export function DecisionBadge({ value }: { value: FeedbackDecision }) {
  const option = OPTIONS.find((o) => o.id === value);
  if (!option) return null;
  const Icon = option.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${option.active}`}
    >
      <Icon className="h-3 w-3" /> {option.label}
    </span>
  );
}
