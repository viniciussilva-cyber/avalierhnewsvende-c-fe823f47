import React from "react";
import { PROFILES, type ProfileKey, type Scores, toPercentages } from "@/lib/profiler";
import { CheckCircle2, Zap, AlertTriangle, Building2, HeartHandshake, Printer } from "lucide-react";

interface ProfilerReportProps {
  name: string;
  position?: string;
  sector?: string;
  scores: Scores;
  celebrate?: boolean;
}

// Imagens Oficiais dos Mascotes VENDE-C
const MASCOTS_OFFICIAL: Record<ProfileKey, string> = {
  executor: "/mascots/executor.png",
  comunicador: "/mascots/comunicador.png",
  planejador: "/mascots/planejador.png",
  analista: "/mascots/analista.png",
};

const REPORT_DETAILS: Record<
  ProfileKey,
  {
    tagline: string;
    descriptionLong: string;
    hexColor: string;
    textClass: string;
    borderClass: string;
    bgClass: string;
    barClass: string;
    pontosFortes: string[];
    pontosAtencao: string[];
    comportamento: Record<string, string>;
    ambienteIdeal: string;
    comoLiderar: string;
  }
> = {
  executor: {
    tagline: "Tira do papel e faz acontecer.",
    descriptionLong:
      "Perfil direto, competitivo e orientado a resultado. Assume o volante, decide rápido e destrava o que está parado.",
    hexColor: "#22c55e",
    textClass: "text-emerald-400",
    borderClass: "border-emerald-500/50",
    bgClass: "bg-emerald-500/10",
    barClass: "bg-emerald-500",
    pontosFortes: [
      "Velocidade de decisão e execução",
      "Foco em meta e resultado",
      "Coragem para assumir riscos",
      "Destrava problemas parados",
    ],
    pontosAtencao: [
      "Pode atropelar processos e pessoas",
      "Impaciência com detalhes e ritmos diferentes",
      "Comunicação pode soar dura sob pressão",
    ],
    comportamento: {
      "SOB PRESSÃO": "Acelera, assume o controle e pode atropelar etapas.",
      "EM CONFLITOS": "Confronta direto e busca resolver rápido.",
      "AO DECIDIR": "Decide rápido, com pouca informação, e ajusta depois.",
      "AO COMUNICAR": "Objetivo e direto; pode soar duro.",
      "DIANTE DE MUDANÇAS": "Abraça a mudança se ela acelera o resultado.",
      "AO DELEGAR": "Delega o resultado e cobra o prazo.",
      "AO RECEBER FEEDBACK": "Aceita se for direto e ligado a resultado.",
      "COM PRAZOS APERTADOS": "Prioriza entrega e corta o que julgar acessório.",
      "NO TRABALHO EM EQUIPE": "Puxa a frente e define o rumo.",
    },
    ambienteIdeal: "Metas desafiadoras, autonomia real e pouco engessamento burocrático.",
    comoLiderar: "Seja direto, combine o resultado esperado e dê autonomia sobre o caminho.",
  },
  comunicador: {
    tagline: "Conecta pessoas, compartilha ideias e gera movimento.",
    descriptionLong:
      "Perfil carismático, persuasivo e altamente sociável. Entusiasma equipes, vende visões e articula parcerias com facilidade.",
    hexColor: "#f97316",
    textClass: "text-orange-400",
    borderClass: "border-orange-500/50",
    bgClass: "bg-orange-500/10",
    barClass: "bg-orange-500",
    pontosFortes: [
      "Facilidade de comunicação e engajamento",
      "Poder de persuasão e otimismo",
      "Rede de contatos ativa (networking)",
      "Capacidade de contagiar o time",
    ],
    pontosAtencao: [
      "Dificuldade com rotinas repetitivas",
      "Pode prometer mais do que consegue entregar no prazo",
      "Perda de foco e dispersão com detalhes",
    ],
    comportamento: {
      "SOB PRESSÃO": "Busca apoio interpessoal e tenta usar o otimismo.",
      "EM CONFLITOS": "Desarma com bom humor e diálogo informal.",
      "AO DECIDIR": "Envolve as pessoas e decide com intuição.",
      "AO COMUNICAR": "Expressivo, empolgado e envolvente.",
      "DIANTE DE MUDANÇAS": "Empolga-se com as novidades e contagia os outros.",
      "AO DELEGAR": "Delega entusiasmando a pessoa sobre a missão.",
      "AO RECEBER FEEDBACK": "Leva para o lado pessoal se não for acolhedor.",
      "COM PRAZOS APERTADOS": "Mobiliza o time pra ajudar a entregar junto.",
      "NO TRABALHO EM EQUIPE": "Integra e anima o grupo constantemente.",
    },
    ambienteIdeal: "Ambiente dinâmico, colaborativo, leve e com interação constante.",
    comoLiderar: "Dê reconhecimento público, valorize as ideias e apoie no acompanhamento de detalhes.",
  },
  planejador: {
    tagline: "Pensa no hoje, projeta o amanhã.",
    descriptionLong:
      "Perfil estável, metodológico e confiável. Garante consistência, mantém o ambiente em harmonia e cumpre compromissos com lealdade.",
    hexColor: "#38bdf8",
    textClass: "text-sky-400",
    borderClass: "border-sky-500/50",
    bgClass: "bg-sky-500/10",
    barClass: "bg-sky-500",
    pontosFortes: [
      "Constância e ritmo previsível",
      "Escuta ativa e empatia elevada",
      "Lealdade e espírito cooperativo",
      "Capacidade de organização e processo",
    ],
    pontosAtencao: [
      "Resistência a mudanças bruscas e sem aviso",
      "Dificuldade para dizer 'não' ou confrontar",
      "Lentidão para tomar decisões sob pressão",
    ],
    comportamento: {
      "SOB PRESSÃO": "Busca estabilidade e prefere desacelerar para não errar.",
      "EM CONFLITOS": "Evita o confronto direto, buscando pacificar.",
      "AO DECIDIR": "Pondera impactos no grupo e busca consenso.",
      "AO COMUNICAR": "Calmo, escuta mais do que fala, passa segurança.",
      "DIANTE DE MUDANÇAS": "Precisa de tempo para processar e se adaptar.",
      "AO DELEGAR": "Instrui passo a passo e acompanha com paciência.",
      "AO RECEBER FEEDBACK": "Absorve em silêncio e busca melhorar devagar.",
      "COM PRAZOS APERTADOS": "Mantém o ritmo firme, tentando não surtar.",
      "NO TRABALHO EM EQUIPE": "Sustenta a rotina e dá apoio prático a todos.",
    },
    ambienteIdeal: "Ambiente calmo, com rotina estruturada, previsibilidade e cooperação.",
    comoLiderar: "Avise sobre mudanças com antecedência, ofereça suporte e evite pressões agressivas.",
  },
  analista: {
    tagline: "Observa, analisa e encontra o que outros não veem.",
    descriptionLong:
      "Perfil preciso, criterioso e disciplinado. Focado em qualidade, dados e regras bem definidas para garantir padrão de excelência.",
    hexColor: "#c084fc",
    textClass: "text-purple-400",
    borderClass: "border-purple-500/50",
    bgClass: "bg-purple-500/10",
    barClass: "bg-purple-500",
    pontosFortes: [
      "Atenção minuciosa aos detalhes e dados",
      "Alto padrão de qualidade e precisão",
      "Pensamento crítico e fundamentado",
      "Disciplina com normas e processos",
    ],
    pontosAtencao: [
      "Perfeccionismo excessivo que trava entregas",
      "Centralização de tarefas por medo de erros terceiros",
      "Postura defensiva diante de críticas",
    ],
    comportamento: {
      "SOB PRESSÃO": "Aprofunda-se nos dados e fica mais rígido com prazos.",
      "EM CONFLITOS": "Usa fatos, regras e dados lógicos para se defender.",
      "AO DECIDIR": "Analisa minuciosamente todos os prós e contras.",
      "AO COMUNICAR": "Formal, técnico, exato e focado no conteúdo.",
      "DIANTE DE MUDANÇAS": "Exige justificativa técnica e plano claro.",
      "AO DELEGAR": "Especifica regras e exige padrão rigoroso.",
      "AO RECEBER FEEDBACK": "Pede fatos concretos e analisa a coerência.",
      "COM PRAZOS APERTADOS": "Foca no essencial sem abrir mão do padrão de qualidade.",
      "NO TRABALHO EM EQUIPE": "Garante a precisão e revisa as entregas do time.",
    },
    ambienteIdeal: "Ambiente organizedo, com diretrizes claras, poucas interrupções e foco na qualidade.",
    comoLiderar: "Forneça informações precisas, respeite seu tempo de análise e reconheça o rigor técnico.",
  },
};

export function ProfilerReport({ name, position, sector, scores, celebrate }: ProfilerReportProps) {
  const pct = toPercentages(scores || { executor: 0, comunicador: 0, planejador: 0, analista: 0 });

  let dominantKey: ProfileKey = "executor";
  let maxVal = -1;
  (Object.keys(pct) as ProfileKey[]).forEach((key) => {
    if ((pct[key] ?? 0) > maxVal) {
      maxVal = pct[key] ?? 0;
      dominantKey = key;
    }
  });

  const mainDetails = REPORT_DETAILS[dominantKey] || REPORT_DETAILS.executor;

  const calculateCompetencies = (p: Scores) => {
    const e = p.executor || 0;
    const c = p.comunicador || 0;
    const s = p.planejador || 0;
    const a = p.analista || 0;

    return [
      { label: "Foco em resultados", value: Math.round(e * 0.98 + c * 0.1) },
      { label: "Liderança", value: Math.round(e * 0.95 + c * 0.3) },
      { label: "Tomada de decisão", value: Math.round(e * 0.9 + a * 0.2) },
      { label: "Negociação", value: Math.round(c * 0.8 + e * 0.6) },
      { label: "Comunicação", value: Math.round(c * 0.98 + e * 0.1) },
      { label: "Influência e persuasão", value: Math.round(c * 0.92 + e * 0.3) },
      { label: "Empatia", value: Math.round(s * 0.85 + c * 0.4) },
      { label: "Escuta ativa", value: Math.round(s * 0.9 + a * 0.3) },
      { label: "Atenção a detalhes", value: Math.round(a * 0.98 + s * 0.2) },
      { label: "Qualidade e precisão", value: Math.round(a * 0.98 + s * 0.1) },
      { label: "Adaptabilidade", value: Math.round(c * 0.7 + e * 0.5) },
      { label: "Resiliência", value: Math.round(e * 0.85 + s * 0.3) },
      { label: "Relacionamento interpessoal", value: Math.round(c * 0.95 + s * 0.3) },
      { label: "Trabalho em equipe", value: Math.round(s * 0.9 + c * 0.4) },
      { label: "Estabilidade emocional", value: Math.round(s * 0.92 + a * 0.2) },
      { label: "Organização", value: Math.round(a * 0.8 + s * 0.5) },
      { label: "Análise crítica", value: Math.round(a * 0.95 + e * 0.2) },
      { label: "Planejamento", value: Math.round(s * 0.8 + a * 0.5) },
      { label: "Iniciativa", value: Math.round(e * 0.98 + c * 0.3) },
      { label: "Aprendizado contínuo", value: Math.round(a * 0.8 + s * 0.3) },
    ].map((comp) => ({ ...comp, value: Math.min(100, Math.max(0, comp.value)) }));
  };

  const competenciesList = calculateCompetencies(pct);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-10 text-white font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
        .font-modern {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        @media print {
          body {
            background-color: #0a0a0b !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Barra Superior de Exportação (Oculta ao gerar o PDF) */}
      <div className="no-print flex items-center justify-between rounded-2xl border border-zinc-800 bg-[#141414] p-4 shadow-md font-modern">
        <span className="text-xs font-semibold text-zinc-400">
          Relatório Mapeado · VENDE-C
        </span>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-xl bg-[#ff0068] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#ff0068]/25 hover:opacity-90 transition-all active:scale-95 cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          Baixar Relatório (PDF / Imprimir)
        </button>
      </div>

      {celebrate && (
        <div className="rounded-2xl border border-zinc-800 bg-[#141414] p-6 text-center font-modern">
          <CheckCircle2 className="mx-auto h-12 w-12 text-[#ff0068]" />
          <h2 className="mt-3 text-2xl font-bold">Avaliação Concluída com Sucesso!</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Obrigado, {name.split(" ")[0]}. Seu perfil foi mapeado e disponibilizado.
          </p>
        </div>
      )}

      {/* Cartão de Topo */}
      <div 
        className="rounded-3xl border bg-[#141414] p-6 md:p-8 space-y-6 relative overflow-hidden shadow-2xl transition-all"
        style={{ borderColor: mainDetails.hexColor }}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col md:flex-row items-center gap-6 w-full">
            <div className="flex h-72 md:h-80 w-full md:w-64 shrink-0 items-center justify-center p-2">
              <img
                src={MASCOTS_OFFICIAL[dominantKey]}
                alt={`Mascote 3D ${PROFILES[dominantKey].label}`}
                className="h-full w-full object-contain drop-shadow-2xl"
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight font-modern">{name}</h1>
              <p className="text-base font-semibold text-zinc-400 mt-2 font-modern">
                {position || "Colaborador"} {sector ? `· ${sector}` : ""}
              </p>
              <div className="mt-4 inline-flex items-center gap-2">
                <span 
                  className="text-sm font-bold uppercase tracking-wider font-modern"
                  style={{ color: mainDetails.hexColor }}
                >
                  Perfil predominantemente: {PROFILES[dominantKey].label}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-[#1a1a1a] p-6">
          <h2 className="text-2xl font-bold text-[#ff0068] font-modern">{mainDetails.tagline}</h2>
          <p className="mt-2 text-sm text-zinc-300 leading-relaxed font-modern">{mainDetails.descriptionLong}</p>
        </div>
      </div>

      {/* Distribuição do Perfil */}
      <div className="rounded-3xl border border-zinc-800 bg-[#141414] p-8 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white font-modern uppercase tracking-wider">Distribuição do seu perfil</h3>
          <p className="text-xs text-zinc-400 mt-1 font-modern">
            Todo mundo tem um pouco dos quatro. O que muda é a intensidade de cada um.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(PROFILES) as ProfileKey[]).map((key) => {
            const pInfo = PROFILES[key];
            const pDet = REPORT_DETAILS[key];
            const percentage = pct[key] ?? 0;
            const isDominant = key === dominantKey;

            return (
              <div
                key={key}
                className="rounded-2xl border p-5 transition-all"
                style={{
                  borderColor: isDominant ? pDet.hexColor : "rgba(39, 39, 42, 0.8)",
                  backgroundColor: isDominant ? `${pDet.hexColor}15` : "rgba(24, 24, 27, 0.4)",
                }}
              >
                <div className="flex items-center justify-between font-modern">
                  <span 
                    className="text-sm font-bold uppercase"
                    style={{ color: isDominant ? pDet.hexColor : "#a1a1aa" }}
                  >
                    {pInfo.label}
                  </span>
                  <span className="text-lg font-extrabold text-white">{percentage}%</span>
                </div>
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: pDet.hexColor 
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pontos Fortes e Pontos de Atenção */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-zinc-800 bg-[#141414] p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <Zap className="h-5 w-5" />
            <h3 className="text-lg font-bold text-white font-modern uppercase">Pontos fortes</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-zinc-300 font-modern">
            {mainDetails.pontosFortes.map((pf, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{pf}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-[#141414] p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-lg font-bold text-white font-modern uppercase">Pontos de atenção</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-zinc-300 font-modern">
            {mainDetails.pontosAtencao.map((pa, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{pa}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Competências */}
      <div className="rounded-3xl border border-zinc-800 bg-[#141414] p-8 space-y-6">
        <h3 className="text-xl font-bold text-white font-modern uppercase tracking-wider">Competências</h3>

        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 font-modern">
          {competenciesList.map((comp, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300">{comp.label}</span>
                <span className="font-bold text-zinc-400">{comp.value}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full bg-[#ff0068] transition-all duration-300"
                  style={{ width: `${comp.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Como esse perfil se comporta */}
      <div className="rounded-3xl border border-zinc-800 bg-[#141414] p-8 space-y-6">
        <h3 className="text-xl font-bold text-white font-modern uppercase tracking-wider">Como esse perfil se comporta</h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 font-modern">
          {Object.entries(mainDetails.comportamento).map(([title, desc], idx) => (
            <div key={idx} className="rounded-2xl border border-zinc-800 bg-[#1a1a1a] p-4 space-y-1.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#ff0068]">{title}</span>
              <p className="text-xs text-zinc-300 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ambiente Ideal e Como Liderar */}
      <div className="grid gap-6 md:grid-cols-2 font-modern">
        <div className="rounded-3xl border border-zinc-800 bg-[#141414] p-6 space-y-3">
          <div className="flex items-center gap-2 text-[#ff0068]">
            <Building2 className="h-5 w-5" />
            <h3 className="text-lg font-bold text-white uppercase">Ambiente ideal</h3>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">{mainDetails.ambienteIdeal}</p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-[#141414] p-6 space-y-3">
          <div className="flex items-center gap-2 text-sky-400">
            <HeartHandshake className="h-5 w-5" />
            <h3 className="text-lg font-bold text-white uppercase">Como liderar esse perfil</h3>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">{mainDetails.comoLiderar}</p>
        </div>
      </div>

      {/* Os Quatro Perfis VENDE-C no Rodapé */}
      <div className="rounded-3xl border border-zinc-800 bg-[#141414] p-8 space-y-6 font-modern">
        <h3 className="text-xl font-bold text-white uppercase tracking-wider">Os quatro perfis VENDE-C</h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(PROFILES) as ProfileKey[]).map((key) => {
            const pInfo = PROFILES[key];
            const pDet = REPORT_DETAILS[key];
            const percentage = pct[key] ?? 0;
            const isDominant = key === dominantKey;

            return (
              <div
                key={key}
                className="flex flex-col items-center justify-between rounded-2xl border p-5 text-center transition-all"
                style={{
                  borderColor: isDominant ? pDet.hexColor : "rgba(39, 39, 42, 0.8)",
                  backgroundColor: isDominant ? `${pDet.hexColor}15` : "rgba(24, 24, 27, 0.3)",
                }}
              >
                <div className="flex flex-col items-center space-y-2 w-full">
                  <div className="flex h-44 w-full items-center justify-center p-1">
                    <img
                      src={MASCOTS_OFFICIAL[key]}
                      alt={`Mascote Oficial ${pInfo.label}`}
                      className="h-full w-full object-contain drop-shadow-md"
                    />
                  </div>
                  <h4 
                    className="text-base font-extrabold uppercase"
                    style={{ color: pDet.hexColor }}
                  >
                    {pInfo.label}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-snug">{pDet.tagline}</p>
                </div>
                <div className="mt-4 text-xl font-extrabold text-white">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
