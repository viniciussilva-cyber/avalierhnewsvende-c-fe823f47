import { useState } from "react";
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
  celebrate?: boolean;
}

export function ProfilerReport({ name, position, sector, scores, celebrate }: ProfilerReportProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const pct = toPercentages(scores);
  const dominant = dominantProfile(scores);
  const ranked = rankProfiles(scores);
  const info = PROFILES[dominant];
  const comps = competencies(pct);
  const zones = talentZones(pct);
  const inds = indicators(dominant);
  const topZones = zones.slice(0, 5);

  // Função para exportar como PDF direto
  const exportPDF = () => {
    setIsExporting(true);
    const element = document.getElementById("relatorio-vende-c");
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Perfil_${name.replace(/\s+/g, "_")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    const runPDF = () => {
      (window as any).html2pdf().set(opt).from(element).save().then(() => {
        setIsExporting(false);
        setIsModalOpen(false);
      });
    };

    if ((window as any).html2pdf) {
      runPDF();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = runPDF;
      document.body.appendChild(script);
    }
  };

  // Função para exportar como Imagem (PNG) direto
  const exportPNG = () => {
    setIsExporting(true);
    const element = document.getElementById("relatorio-vende-c");

    const runPNG = () => {
      (window as any).html2canvas(element, { scale: 2, useCORS: true }).then((canvas: any) => {
        const link = document.createElement("a");
        link.download = `Perfil_${name.replace(/\s+/g, "_")}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        setIsExporting(false);
        setIsModalOpen(false);
      });
    };

    if ((window as any).html2canvas) {
      runPNG();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      script.onload = runPNG;
      document.body.appendChild(script);
    }
  };

  return (
    <>
      {/* Botão de Exportar */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" x2="12" y1="15" y2="3"/>
          </svg>
          Exportar Relatório
        </button>
      </div>

      {/* MODAL DE EXPORTAÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0a0a0a] p-6 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold">Exportar Relatório Visual</h3>
              <button onClick={() => !isExporting && setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              Exporta o resultado da avaliação — {name} — exatamente como está na tela.
            </p>

            <div className="space-y-3">
              {/* Botão PDF */}
              <button 
                onClick={exportPDF}
                disabled={isExporting}
                className="flex w-full items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-left transition hover:bg-zinc-800 disabled:opacity-50"
              >
                <div className="rounded-lg bg-red-500/10 p-2 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                </div>
                <div>
                  <h4 className="font-medium text-zinc-100">{isExporting ? "Gerando PDF..." : "Exportar como PDF"}</h4>
                  <p className="text-xs text-zinc-400">O relatório em tela, em formato A4</p>
                </div>
              </button>

              {/* Botão PNG */}
              <button 
                onClick={exportPNG}
                disabled={isExporting}
                className="flex w-full items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-left transition hover:bg-zinc-800 disabled:opacity-50"
              >
                <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
                <div>
                  <h4 className="font-medium text-zinc-100">{isExporting ? "Gerando Imagem..." : "Exportar como Imagem (PNG)"}</h4>
                  <p className="text-xs text-zinc-400">O relatório em tela, em alta resolução</p>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* CONTEÚDO DO RELATÓRIO - Envolvido pela div relatorio-vende-c */}
      <div id="relatorio-vende-c" className="space-y-8 bg-background p-2 rounded-xl">
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
    </>
  );
}
