import { motion } from "framer-motion";
import {
  PROFILES,
  PROFILE_KEYS,
  competencies,
  dominantProfile,
  indicators,
  rankProfiles,
  talentZones,
  toPercentages,
  type Scores,
} from "@/lib/profiler";

interface ProfilerReportProps {
  name: string;
  position?: string;
  sector?: string;
  scores: Scores;
  /** Mostra o bloco de boas-vindas ao colaborador que acabou de responder. */
  celebrate?: boolean;
}

export function ProfilerReport({ name, position, sector, scores, celebrate }: ProfilerReportProps) {
  const pct = toPercentages(scores);
  const dominant = dominantProfile(scores);
  const ranked = rankProfiles(scores);
  const info = PROFILES[dominant];
  const comps = competencies(pct);
  const zones = talentZones(pct);
  const inds = indicators(dominant);
  const topZones = zones.slice(0, 5);

  return (
    // Adicionado estilo para forçar a impressão das cores de fundo no PDF
    <div className="space-y-8" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
      
      {/* Botão de Baixar PDF que some na hora da impressão */}
      <div className="flex justify-end print:hidden mb-2">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" x2="12" y1="15" y2="3"/>
          </svg>
          Baixar Relatório em PDF
        </button>
      </div>

      {/* Cabeçalho + personagem predominante */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-10"
      >
        <div
          className="absolute inset-0 opacity-25"
          style={{ background: `radial-gradient(120% 90% at 85% 0%, ${info.color}55, transparent 65%)` }}
          aria-hidden
        />
        <div className="relative grid items-center gap-8 sm:grid-cols-[1fr_auto]">
          <div>
            {celebrate && (
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                Avaliação concluída
              </p>
            )}
            <h1 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">{name}</h1>
            {(position || sector) && (
              <p className="mt-1 text-sm text-muted-foreground">
                {[position, sector].filter(Boolean).join(" · ")}
              </p>
            )}

            <div className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold"
              style={{ backgroundColor: `${info.color}22`, color: info.color }}
            >
              Perfil predominante: {info.label}
            </div>
            <p className="mt-4 max-w-lg text-lg font-semibold text-foreground">{info.phrase}</p>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">{info.summary}</p>
          </div>

          <motion.img
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            src={info.mascot}
            alt={`Personagem ${info.label} da VENDE-C`}
            className="mx-auto h-64 w-auto object-contain drop-shadow-2xl sm:h-80"
          />
        </div>
      </motion.section>

      {/* Distribuição dos quatro perfis */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-lg font-bold text-foreground">Distribuição do seu perfil</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Todo mundo tem um pouco dos quatro. O que muda é a intensidade de cada um.
        </p>
        <div className="mt-6 space-y-4">
          {ranked.map((key) => {
            const p = PROFILES[key];
            return (
              <div key={key}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-semibold text-foreground">{p.label}</span>
                  <span className="tabular-nums font-bold" style={{ color: p.color }}>
                    {pct[key]}%
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct[key]}%` }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pontos fortes / atenção */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold text-foreground">Pontos fortes</h2>
          <ul className="mt-4 space-y-2.5">
            {info.strengths.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: info.color }} />
                {s}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold text-foreground">Pontos de atenção</h2>
          <ul className="mt-4 space-y-2.5">
            {info.watchouts.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
                {s}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Competências */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-lg font-bold text-foreground">Competências</h2>
        <div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {comps.map((c) => (
            <div key={c.label}>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">{c.label}</span>
                <span className="tabular-nums font-semibold text-foreground">{c.value}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full" style={{ width: `${c.value}%`, backgroundColor: info.color }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Como a pessoa se comporta */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-lg font-bold text-foreground">Como esse perfil se comporta</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {inds.map((i) => (
            <div key={i.label} className="rounded-2xl border border-border bg-background/50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">{i.label}</p>
              <p className="mt-2 text-sm text-muted-foreground">{i.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Zonas de talento */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-lg font-bold text-foreground">Onde esse perfil rende mais</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Áreas com maior afinidade natural — não são limites, são pontos de partida.
        </p>
        <div className="mt-6 space-y-3">
          {topZones.map((z) => (
            <div key={z.label} className="flex items-center gap-4">
              <span className="w-56 shrink-0 truncate text-sm text-foreground">{z.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full" style={{ width: `${z.value}%`, backgroundColor: info.color }} />
              </div>
              <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums text-muted-foreground">
                {z.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Ambiente e liderança */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold text-foreground">Ambiente ideal</h2>
          <p className="mt-3 text-sm text-muted-foreground">{info.bestEnvironment}</p>
        </section>
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold text-foreground">Como liderar esse perfil</h2>
          <p className="mt-3 text-sm text-muted-foreground">{info.howToLead}</p>
        </section>
      </div>

      {/* Os quatro personagens */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-lg font-bold text-foreground">Os quatro perfis VENDE-C</h2>
        <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {PROFILE_KEYS.map((key) => {
            const p = PROFILES[key];
            const isMain = key === dominant;
            return (
              <div
                key={key}
                className={`rounded-2xl border p-4 text-center transition-colors ${
                  isMain ? "border-transparent" : "border-border opacity-60"
                }`}
                style={isMain ? { backgroundColor: `${p.color}18`, borderColor: `${p.color}66` } : undefined}
              >
                <img
                  src={p.mascot}
                  alt={`Personagem ${p.label}`}
                  className={`mx-auto w-auto object-contain ${isMain ? "h-40" : "h-28"}`}
                />
                <p className="mt-3 text-sm font-bold" style={{ color: p.color }}>
                  {p.label}
                </p>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">{p.phrase}</p>
                <p className="mt-2 text-xs font-semibold tabular-nums text-foreground">{pct[key]}%</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
