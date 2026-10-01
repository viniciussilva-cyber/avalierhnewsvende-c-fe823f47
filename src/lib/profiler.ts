/**
 * VENDE-C Profiler — perfis comportamentais (estilo DISC).
 *
 * Os quatro perfis usam a linguagem visual da VENDE-C:
 *   Executor (D) · Comunicador (I) · Planejador (S) · Analista (C)
 */
import analistaAsset from "@/assets/mascots/analista.png.asset.json";
import planejadorAsset from "@/assets/mascots/planejador.png.asset.json";
import executorAsset from "@/assets/mascots/executor.png.asset.json";
import comunicadorAsset from "@/assets/mascots/comunicador.png.asset.json";

export type ProfileKey = "executor" | "comunicador" | "planejador" | "analista";

export const PROFILE_KEYS: ProfileKey[] = ["executor", "comunicador", "planejador", "analista"];

export interface ProfileInfo {
  key: ProfileKey;
  label: string;
  phrase: string;
  /** Cor do selo, igual à identidade dos personagens. */
  color: string;
  mascot: string;
  summary: string;
  strengths: string[];
  watchouts: string[];
  bestEnvironment: string;
  howToLead: string;
}

export const PROFILES: Record<ProfileKey, ProfileInfo> = {
  analista: {
    key: "analista",
    label: "Analista",
    phrase: "Observa, analisa e encontra o que outros não veem.",
    color: "#7c3aed",
    mascot: analistaAsset.url,
    summary:
      "Perfil orientado a dados, critério e precisão. Prefere decidir com informação na mão e entrega trabalho consistente e bem fundamentado.",
    strengths: [
      "Rigor técnico e atenção a detalhes",
      "Pensamento crítico e capacidade analítica",
      "Organização de informações e processos",
      "Entrega com alto padrão de qualidade",
    ],
    watchouts: [
      "Pode travar decisões buscando informação demais",
      "Tende ao perfeccionismo em entregas rápidas",
      "Comunicação pode soar distante ou técnica",
    ],
    bestEnvironment:
      "Ambientes com regras claras, tempo para análise e critérios objetivos de qualidade.",
    howToLead:
      "Traga contexto e dados, explique o porquê das decisões e evite mudanças de rota sem justificativa.",
  },
  planejador: {
    key: "planejador",
    label: "Planejador",
    phrase: "Pensa no hoje, projeta o amanhã.",
    color: "#2563eb",
    mascot: planejadorAsset.url,
    summary:
      "Perfil estável, colaborativo e previsível. Sustenta a rotina do time, cuida das pessoas e mantém o combinado de pé.",
    strengths: [
      "Constância e confiabilidade na entrega",
      "Escuta ativa e cuidado com o time",
      "Planejamento e visão de médio prazo",
      "Sustenta processos e rotinas",
    ],
    watchouts: [
      "Resistência inicial a mudanças bruscas",
      "Pode evitar conflitos necessários",
      "Dificuldade em dizer não e priorizar",
    ],
    bestEnvironment: "Times estáveis, com prioridades claras e mudanças comunicadas com antecedência.",
    howToLead:
      "Avise mudanças com antecedência, reconheça a consistência e crie espaço seguro para discordar.",
  },
  executor: {
    key: "executor",
    label: "Executor",
    phrase: "Tira do papel e faz acontecer.",
    color: "#16a34a",
    mascot: executorAsset.url,
    summary:
      "Perfil direto, competitivo e orientado a resultado. Assume o volante, decide rápido e destrava o que está parado.",
    strengths: [
      "Velocidade de decisão e execução",
      "Foco em meta e resultado",
      "Coragem para assumir riscos",
      "Destrava problemas parados",
    ],
    watchouts: [
      "Pode atropelar processos e pessoas",
      "Impaciência com detalhes e ritmos diferentes",
      "Comunicação pode soar dura sob pressão",
    ],
    bestEnvironment: "Metas desafiadoras, autonomia real e pouco engessamento burocrático.",
    howToLead: "Seja direto, combine o resultado esperado e dê autonomia sobre o caminho.",
  },
  comunicador: {
    key: "comunicador",
    label: "Comunicador",
    phrase: "Conecta pessoas, compartilha ideias e gera movimento.",
    color: "#ea580c",
    mascot: comunicadorAsset.url,
    summary:
      "Perfil sociável, entusiasta e persuasivo. Abre portas, engaja o time e transforma ideia em movimento.",
    strengths: [
      "Comunicação e influência",
      "Facilidade em criar rede de relacionamento",
      "Energia e entusiasmo contagiantes",
      "Adaptação rápida a novos contextos",
    ],
    watchouts: [
      "Pode se dispersar entre muitas frentes",
      "Menos apego a detalhe e acompanhamento",
      "Otimismo pode subestimar riscos",
    ],
    bestEnvironment: "Contato com pessoas, variedade de desafios e reconhecimento visível.",
    howToLead: "Dê palco, conecte a entrega a pessoas e ajude a fechar o que foi começado.",
  },
};

/** ---------------- Questionário ---------------- */

export interface QuestionOption {
  profile: ProfileKey;
  text: string;
}

export interface Question {
  id: number;
  title: string;
  options: QuestionOption[];
}

/** Blocos "mais parecido / menos parecido comigo". */
export const QUESTIONS: Question[] = [
  {
    id: 1,
    title: "Ao encarar um prazo apertado",
    options: [
      { profile: "executor", text: "Acelero o ritmo e cobro resultado imediato de mim e dos outros" },
      { profile: "comunicador", text: "Busco animar o time e mantenho o clima leve mesmo sob pressão" },
      { profile: "planejador", text: "Sigo o ritmo que já vinha seguindo, sem me alterar" },
      { profile: "analista", text: "Reviso o plano com calma antes de agir, mesmo com o relógio correndo" },
    ],
  },
  {
    id: 2,
    title: "Numa reunião de equipe",
    options: [
      { profile: "executor", text: "Vou direto ao ponto e proponho a decisão" },
      { profile: "comunicador", text: "Falo bastante, envolvo todo mundo na conversa" },
      { profile: "planejador", text: "Escuto mais do que falo, espero minha vez" },
      { profile: "analista", text: "Anoto os detalhes e questiono pontos que não ficaram claros" },
    ],
  },
  {
    id: 3,
    title: "Diante de uma mudança repentina de planos",
    options: [
      { profile: "executor", text: "Vejo como oportunidade de assumir o controle da situação" },
      { profile: "comunicador", text: "Me adapto rápido e tento contagiar os outros com otimismo" },
      { profile: "planejador", text: "Preciso de um tempo para me ajustar, prefiro previsibilidade" },
      { profile: "analista", text: "Quero entender o motivo da mudança antes de aceitar" },
    ],
  },
  {
    id: 4,
    title: "Ao tomar uma decisão importante",
    options: [
      { profile: "executor", text: "Decido rápido, com base no resultado que quero alcançar" },
      { profile: "comunicador", text: "Busco gerar entusiasmo no grupo em torno da escolha que defendo" },
      { profile: "planejador", text: "Prefiro buscar consenso com o grupo, mesmo que leve mais tempo" },
      { profile: "analista", text: "Levanto dados e analiso prós e contras com cuidado" },
    ],
  },
  {
    id: 5,
    title: "Recebendo uma crítica ou feedback",
    options: [
      { profile: "executor", text: "Encaro de frente e já penso no que fazer diferente" },
      { profile: "comunicador", text: "Comento logo com alguém por perto e sigo animado(a)" },
      { profile: "planejador", text: "Levo a sério e prefiro processar em silêncio" },
      { profile: "analista", text: "Peço exemplos concretos para entender exatamente o que errei" },
    ],
  },
  {
    id: 6,
    title: "Em situação de conflito",
    options: [
      { profile: "executor", text: "Confronto diretamente, prefiro resolver logo" },
      { profile: "comunicador", text: "Tento amenizar com bom humor ou conversa" },
      { profile: "planejador", text: "Evito o confronto, busco manter a harmonia" },
      { profile: "analista", text: "Analiso os fatos antes de tomar partido" },
    ],
  },
  {
    id: 7,
    title: "No dia a dia de trabalho",
    options: [
      { profile: "executor", text: "Gosto de ambientes com desafio e meta clara pra bater" },
      { profile: "comunicador", text: "Prefiro dias com bastante troca e conversa com o time" },
      { profile: "planejador", text: "Gosto de manter o mesmo ritmo, sem sobressaltos" },
      { profile: "analista", text: "Prefiro caprichar nos detalhes a entregar rápido e com falhas" },
    ],
  },
  {
    id: 8,
    title: "Ao errar em alguma tarefa",
    options: [
      { profile: "executor", text: "Sigo em frente rápido, não gosto de ficar remoendo" },
      { profile: "comunicador", text: "Comento abertamente, não escondo o erro" },
      { profile: "planejador", text: "Fico incomodado, mas evito criar alarde" },
      { profile: "analista", text: "Investigo a fundo o que causou o erro para não repetir" },
    ],
  },
  {
    id: 9,
    title: "Em relação a regras e processos",
    options: [
      { profile: "executor", text: "Sigo as regras até onde elas não travam o resultado" },
      { profile: "comunicador", text: "Sigo as regras, mas não abro mão de manter um bom clima com todo mundo" },
      { profile: "planejador", text: "Sigo as regras como forma de manter a ordem" },
      { profile: "analista", text: "Sigo as regras à risca, questiono quando não fazem sentido" },
    ],
  },
  {
    id: 10,
    title: "Liderando ou influenciando outras pessoas",
    options: [
      { profile: "executor", text: "Dou direção clara e cobro entrega" },
      { profile: "comunicador", text: "Inspiro e motivo pelo entusiasmo" },
      { profile: "planejador", text: "Apoio e dou suporte constante ao time" },
      { profile: "analista", text: "Oriento com base em dados e processos bem definidos" },
    ],
  },
  {
    id: 11,
    title: "Ao começar um projeto novo",
    options: [
      { profile: "executor", text: "Já penso nas metas finais e no impacto" },
      { profile: "comunicador", text: "Já penso em quem vou envolver e como vender a ideia" },
      { profile: "planejador", text: "Prefiro ir no ritmo que já conheço, sem pressa pra mudar a forma de trabalhar" },
      { profile: "analista", text: "Levanto todas as informações antes de dar o primeiro passo" },
    ],
  },
  {
    id: 12,
    title: "Sob estresse prolongado",
    options: [
      { profile: "executor", text: "Fico impaciente e mais direto do que de costume" },
      { profile: "comunicador", text: "Fico mais falante e busco apoio social" },
      { profile: "planejador", text: "Me fecho um pouco, evito mudanças adicionais" },
      { profile: "analista", text: "Fico mais crítico e exigente com detalhes" },
    ],
  },
];

/** ---------------- Cálculo ---------------- */

export interface Scores {
  executor: number;
  comunicador: number;
  planejador: number;
  analista: number;
}

export const EMPTY_SCORES: Scores = {
  executor: 0,
  comunicador: 0,
  planejador: 0,
  analista: 0,
};

/**
 * Converte as respostas em pontuação bruta.
 * Formato atual: chaves "<id>m" (mais parecido) e "<id>l" (menos parecido).
 * Mais = 2 pontos, não marcada = 1, menos = 0. Chaves antigas ("<id>") valem 1.
 */
export function scoreAnswers(answers: Record<string, ProfileKey>): Scores {
  const s: Scores = { ...EMPTY_SCORES };
  for (const [key, value] of Object.entries(answers)) {
    if (!value || !(value in s)) continue;
    if (/^\d+$/.test(key)) s[value] += 1;
  }
  for (const q of QUESTIONS) {
    const most = answers[`${q.id}m`];
    const least = answers[`${q.id}l`];
    if (!most || !least) continue;
    for (const o of q.options) {
      if (o.profile === most) s[o.profile] += 2;
      else if (o.profile !== least) s[o.profile] += 1;
    }
  }
  return s;
}

/** Bloco respondido = tem "mais" e "menos" diferentes. */
export function isBlockAnswered(answers: Record<string, ProfileKey>, id: number): boolean {
  const m = answers[`${id}m`];
  const l = answers[`${id}l`];
  return !!m && !!l && m !== l;
}

/** Percentual de cada perfil (0–100), somando 100. */
export function toPercentages(scores: Scores): Record<ProfileKey, number> {
  const total = PROFILE_KEYS.reduce((acc, k) => acc + (scores[k] ?? 0), 0);
  if (total <= 0) return { executor: 25, comunicador: 25, planejador: 25, analista: 25 };
  const raw = PROFILE_KEYS.map((k) => ({ k, v: ((scores[k] ?? 0) / total) * 100 }));
  const rounded = raw.map((r) => ({ k: r.k, v: Math.round(r.v) }));
  // Ajusta o arredondamento para somar exatamente 100.
  const diff = 100 - rounded.reduce((a, r) => a + r.v, 0);
  if (diff !== 0) {
    const idx = rounded.reduce((best, r, i) => (r.v > rounded[best]!.v ? i : best), 0);
    rounded[idx]!.v += diff;
  }
  return Object.fromEntries(rounded.map((r) => [r.k, r.v])) as Record<ProfileKey, number>;
}

export function dominantProfile(scores: Scores): ProfileKey {
  return PROFILE_KEYS.reduce((best, k) => ((scores[k] ?? 0) > (scores[best] ?? 0) ? k : best), "executor");
}

/** Ordena os perfis do mais forte para o mais fraco. */
export function rankProfiles(scores: Scores): ProfileKey[] {
  return [...PROFILE_KEYS].sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0));
}

type Weights = Partial<Record<ProfileKey, number>>;

function weighted(pct: Record<ProfileKey, number>, w: Weights): number {
  let sum = 0;
  let total = 0;
  for (const k of PROFILE_KEYS) {
    const weight = w[k] ?? 0;
    sum += (pct[k] ?? 0) * weight;
    total += weight;
  }
  if (total === 0) return 0;
  // Normaliza para 0–100 (um perfil puro alinhado à competência = 100).
  return Math.max(0, Math.min(100, Math.round((sum / total) * 2.2)));
}

/** ---------------- Competências (20) ---------------- */

const COMPETENCY_DEFS: { label: string; weights: Weights }[] = [
  { label: "Foco em resultados", weights: { executor: 3, comunicador: 1 } },
  { label: "Tomada de decisão", weights: { executor: 3, analista: 2 } },
  { label: "Liderança", weights: { executor: 3, comunicador: 2 } },
  { label: "Negociação", weights: { comunicador: 3, executor: 2 } },
  { label: "Comunicação", weights: { comunicador: 4 } },
  { label: "Relacionamento interpessoal", weights: { comunicador: 3, planejador: 2 } },
  { label: "Influência e persuasão", weights: { comunicador: 4, executor: 1 } },
  { label: "Trabalho em equipe", weights: { planejador: 3, comunicador: 2 } },
  { label: "Empatia", weights: { planejador: 3, comunicador: 2 } },
  { label: "Estabilidade emocional", weights: { planejador: 4 } },
  { label: "Escuta ativa", weights: { planejador: 3, analista: 2 } },
  { label: "Organização", weights: { analista: 3, planejador: 2 } },
  { label: "Atenção a detalhes", weights: { analista: 4 } },
  { label: "Análise crítica", weights: { analista: 4 } },
  { label: "Qualidade e precisão", weights: { analista: 4, planejador: 1 } },
  { label: "Planejamento", weights: { planejador: 3, analista: 3 } },
  { label: "Adaptabilidade", weights: { comunicador: 3, executor: 2 } },
  { label: "Iniciativa", weights: { executor: 3, comunicador: 2 } },
  { label: "Resiliência", weights: { planejador: 3, executor: 2 } },
  { label: "Aprendizado contínuo", weights: { analista: 3, comunicador: 2 } },
];

export interface Competency {
  label: string;
  value: number;
}

export function competencies(pct: Record<ProfileKey, number>): Competency[] {
  return COMPETENCY_DEFS.map((c) => ({ label: c.label, value: weighted(pct, c.weights) }));
}

/** ---------------- Indicadores situacionais (9) ---------------- */

const INDICATOR_DEFS: { label: string; text: Record<ProfileKey, string> }[] = [
  {
    label: "Sob pressão",
    text: {
      executor: "Acelera, assume o controle e pode atropelar etapas.",
      comunicador: "Fala mais, busca apoio e dispersa o foco.",
      planejador: "Se fecha, absorve a tensão e evita expor o desconforto.",
      analista: "Se retrai, revisa tudo e pode travar na análise.",
    },
  },
  {
    label: "Em conflitos",
    text: {
      executor: "Confronta direto e busca resolver rápido.",
      comunicador: "Tenta contornar com conversa e bom humor.",
      planejador: "Evita o embate e busca harmonizar.",
      analista: "Argumenta com fatos e evita o lado emocional.",
    },
  },
  {
    label: "Ao decidir",
    text: {
      executor: "Decide rápido, com pouca informação, e ajusta depois.",
      comunicador: "Decide pelo impacto nas pessoas e pela intuição.",
      planejador: "Decide buscando consenso e evitando ruptura.",
      analista: "Decide com dados, critério e cenário mapeado.",
    },
  },
  {
    label: "Ao comunicar",
    text: {
      executor: "Objetivo e direto; pode soar duro.",
      comunicador: "Envolvente e expansivo; pode se alongar.",
      planejador: "Calmo e acolhedor; pode faltar clareza no não.",
      analista: "Preciso e técnico; pode soar distante.",
    },
  },
  {
    label: "Diante de mudanças",
    text: {
      executor: "Abraça a mudança se ela acelera o resultado.",
      comunicador: "Vibra com a novidade e engaja os outros.",
      planejador: "Precisa de tempo e previsibilidade para aderir.",
      analista: "Precisa entender o porquê e ver o plano.",
    },
  },
  {
    label: "Ao delegar",
    text: {
      executor: "Delega o resultado e cobra o prazo.",
      comunicador: "Delega inspirando; acompanha pouco o detalhe.",
      planejador: "Delega e acompanha de perto, dando suporte.",
      analista: "Delega com instrução detalhada e checa a execução.",
    },
  },
  {
    label: "Ao receber feedback",
    text: {
      executor: "Aceita se for direto e ligado a resultado.",
      comunicador: "Reage ao tom; precisa de reconhecimento junto.",
      planejador: "Absorve em silêncio; precisa de espaço seguro.",
      analista: "Quer exemplos concretos e critérios claros.",
    },
  },
  {
    label: "Com prazos apertados",
    text: {
      executor: "Prioriza entrega e corta o que julgar acessório.",
      comunicador: "Mobiliza gente para dar conta.",
      planejador: "Reorganiza a rotina e sustenta o ritmo.",
      analista: "Tenta manter o padrão de qualidade mesmo com o prazo.",
    },
  },
  {
    label: "No trabalho em equipe",
    text: {
      executor: "Puxa a frente e define o rumo.",
      comunicador: "Conecta as pessoas e mantém o clima.",
      planejador: "Sustenta o time e cuida de quem ficou para trás.",
      analista: "Garante padrão, consistência e checagem.",
    },
  },
];

export interface Indicator {
  label: string;
  text: string;
}

export function indicators(dominant: ProfileKey): Indicator[] {
  return INDICATOR_DEFS.map((i) => ({ label: i.label, text: i.text[dominant] }));
}

/** ---------------- Zonas de talento (13) ---------------- */

const TALENT_ZONE_DEFS: { label: string; weights: Weights }[] = [
  { label: "Gestão e liderança de times", weights: { executor: 3, comunicador: 2 } },
  { label: "Vendas e prospecção", weights: { comunicador: 3, executor: 3 } },
  { label: "Atendimento e experiência do cliente", weights: { comunicador: 3, planejador: 3 } },
  { label: "Marketing e conteúdo", weights: { comunicador: 3, analista: 2 } },
  { label: "Treinamento e facilitação", weights: { comunicador: 3, planejador: 2 } },
  { label: "Projetos e processos", weights: { planejador: 3, analista: 3 } },
  { label: "Financeiro e controladoria", weights: { analista: 4, planejador: 2 } },
  { label: "Dados e análise", weights: { analista: 4 } },
  { label: "Tecnologia e produto", weights: { analista: 3, executor: 2 } },
  { label: "Operações e logística", weights: { planejador: 3, executor: 2 } },
  { label: "Recursos Humanos", weights: { planejador: 3, comunicador: 3 } },
  { label: "Jurídico e compliance", weights: { analista: 4, planejador: 2 } },
  { label: "Inovação e novos negócios", weights: { executor: 3, comunicador: 3 } },
];

export interface TalentZone {
  label: string;
  value: number;
}

export function talentZones(pct: Record<ProfileKey, number>): TalentZone[] {
  return TALENT_ZONE_DEFS.map((z) => ({ label: z.label, value: weighted(pct, z.weights) })).sort(
    (a, b) => b.value - a.value,
  );
}
