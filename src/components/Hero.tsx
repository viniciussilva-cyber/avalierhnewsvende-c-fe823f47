import { Star } from "lucide-react";
import heroImg from "@/assets/vende-c.jpg";

interface HeroProps {
  monthYear?: string;
  title?: string;
  average: number | null;
  evaluationsCount?: number;
  onCta?: () => void;
  ctaLabel?: string;
}

export function Hero({
  monthYear,
  title,
  average,
  evaluationsCount = 0,
  onCta,
  ctaLabel = "Ler e avaliar",
}: HeroProps) {
  return (
    <section className="relative isolate overflow-hidden">
      <img
        src={heroImg}
        alt=""
        width={1600}
        height={900}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-background" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-start gap-6 px-6 py-20 sm:py-28">
        {monthYear && (
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
            {monthYear}
          </span>
        )}

        <h1 className="text-balance text-4xl font-extrabold leading-tight text-white sm:text-5xl">
          {title ?? "Newsletter interno"}
        </h1>

        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-sm">
          <Star className="h-6 w-6 fill-primary text-primary" />
          <div>
            <p className="text-2xl font-bold text-white">
              {average !== null ? average.toFixed(1) : "—"}
              <span className="text-sm font-normal text-muted-foreground"> / 10</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Nota média geral
              {evaluationsCount > 0
                ? ` · ${evaluationsCount} avaliação${evaluationsCount > 1 ? "es" : ""}`
                : ""}
            </p>
          </div>
        </div>

        {onCta && (
          <button
            onClick={onCta}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-95"
          >
            {ctaLabel}
          </button>
        )}
      </div>
    </section>
  );
}
