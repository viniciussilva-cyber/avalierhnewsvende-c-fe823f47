import React from "react";
import { PROFILES, type ProfileKey, type Scores, toPercentages } from "@/lib/profiler";
import { Award, CheckCircle2, User, Target, BarChart2 } from "lucide-react";

interface ProfilerReportProps {
  name: string;
  position?: string;
  sector?: string;
  scores: Scores;
  celebrate?: boolean;
}

export function ProfilerReport({ name, position, sector, scores, celebrate }: ProfilerReportProps) {
  const pct = toPercentages(scores || { executor: 0, comunicador: 0, planejador: 0, analista: 0 });

  // Descobre o perfil dominante
  let dominantKey: ProfileKey = "executor";
  let maxVal = -1;
  (Object.keys(pct) as ProfileKey[]).forEach((key) => {
    if ((pct[key] || 0) > maxVal) {
      maxVal = pct[key] || 0;
      dominantKey = key;
    }
  });

  const dominantInfo = PROFILES[dominantKey] || { label: dominantKey, description: "" };

  const profileColors: Record<ProfileKey, { bg: string; text: string; border: string; bar: string }> = {
    executor: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", bar: "bg-emerald-500" },
    comunicador: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30", bar: "bg-orange-500" },
    planejador: { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/30", bar: "bg-sky-500" },
    analista: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30", bar: "bg-purple-500" },
  };

  const currentColor = profileColors[dominantKey];

  return (
    <div className="space-y-8 text-white">
      {celebrate && (
        <div className="rounded-2xl border border-zinc-800 bg-[#141414] p-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-[#ff0068]" />
          <h2 className="mt-3 text-2xl font-black">Avaliação Concluída com Sucesso!</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Parabéns, {name.split(" ")[0]}! Seu mapeamento comportamental foi processado.
          </p>
        </div>
      )}

      {/* Cartão de Identificação do Perfil Dominante */}
      <div className={`rounded-3xl border ${currentColor.border} ${currentColor.bg} p-8 text-center shadow-xl`}>
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          PERFIL COMPORTAMENTAL PREDOMINANTE
        </span>
        <h1 className={`mt-2 text-4xl font-black tracking-tight ${currentColor.text}`}>
          {dominantInfo.label}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-zinc-300 leading-relaxed">
          {dominantInfo.description}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-zinc-400">
          <span className="flex items-center gap-1.5 rounded-full bg-zinc-900/80 px-3 py-1 border border-zinc-800">
            <User className="h-3.5 w-3.5 text-[#ff0068]" /> {name}
          </span>
          {position && (
            <span className="flex items-center gap-1.5 rounded-full bg-zinc-900/80 px-3 py-1 border border-zinc-800">
              <Target className="h-3.5 w-3.5 text-[#ff0068]" /> {position}
            </span>
          )}
        </div>
      </div>

      {/* Gráfico de Distribuição dos Perfis */}
      <div className="rounded-3xl border border-zinc-800 bg-[#141414] p-8 space-y-6">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-[#ff0068]" />
          <h3 className="text-lg font-bold text-white">Distribuição do Perfil (DISC)</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(PROFILES) as ProfileKey[]).map((key) => {
            const pInfo = PROFILES[key];
            const percentage = pct[key] || 0;
            const pColor = profileColors[key];

            return (
              <div key={key} className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-bold ${pColor.text}`}>{pInfo.label}</span>
                  <span className="font-extrabold text-white">{percentage}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div className={`h-full ${pColor.bar} transition-all duration-500`} style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
