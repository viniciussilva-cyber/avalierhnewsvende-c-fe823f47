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
  options: QuestionOption[];
}

/** 20 blocos; em cada um a pessoa escolhe a frase que mais tem a ver com ela. */
export const QUESTIONS: Question[] = [
  {
    id: 1,
    options: [
      { profile: "executor", text: "Vou direto ao ponto e decido rápido." },
      { profile: "comunicador", text: "Gosto de conversar e envolver as pessoas." },
      { profile: "planejador", text: "Prefiro ouvir antes de me posicionar." },
      { profile: "analista", text: "Analiso os dados antes de qualquer decisão." },
    ],
  },
  {
    id: 2,
    options: [
      { profile: "executor", text: "Assumo o comando quando algo está parado." },
      { profile: "comunicador", text: "Animo o time quando a energia cai." },
      { profile: "planejador", text: "Mantenho a calma quando tudo aperta." },
      { profile: "analista", text: "Reviso tudo antes de entregar." },
    ],
  },
  {
    id: 3,
    options: [
      { profile: "executor", text: "Prefiro resultado a processo." },
      { profile: "comunicador", text: "Prefiro pessoas a planilhas." },
      { profile: "planejador", text: "Prefiro rotina previsível a improviso." },
      { profile: "analista", text: "Prefiro critério claro a intuição." },
    ],
  },
  {
    id: 4,
    options: [
      { profile: "executor", text: "Corro risco quando vejo oportunidade." },
      { profile: "comunicador", text: "Confio na minha leitura das pessoas." },
      { profile: "planejador", text: "Evito mudanças sem necessidade." },
      { profile: "analista", text: "Só avanço quando o cenário está claro." },
    ],
  },
  {
    id: 5,
    options: [
      { profile: "executor", text: "Fico impaciente com reuniões longas." },
      { profile: "comunicador", text: "Aproveito reuniões para conectar ideias." },
      { profile: "planejador", text: "Uso reuniões para alinhar o time." },
      { profile: "analista", text: "Levo dados preparados para a reunião." },
    ],
  },
  {
    id: 6,
    options: [
      { profile: "executor", text: "Cobro entrega quando o prazo aperta." },
      { profile: "comunicador", text: "Motivo o time quando o prazo aperta." },
      { profile: "planejador", text: "Reorganizo a rotina quando o prazo aperta." },
      { profile: "analista", text: "Reviso o plano quando o prazo aperta." },
    ],
  },
  {
    id: 7,
    options: [
      { profile: "executor", text: "Falo o que penso, mesmo que incomode." },
      { profile: "comunicador", text: "Escolho as palavras para engajar." },
      { profile: "planejador", text: "Evito criar atrito desnecessário." },
      { profile: "analista", text: "Prefiro argumentar com fatos." },
    ],
  },
  {
    id: 8,
    options: [
      { profile: "executor", text: "Gosto de metas difíceis." },
      { profile: "comunicador", text: "Gosto de reconhecimento público." },
      { profile: "planejador", text: "Gosto de estabilidade e segurança." },
      { profile: "analista", text: "Gosto de trabalho bem-feito." },
    ],
  },
  {
    id: 9,
    options: [
      { profile: "executor", text: "Tomo a frente em situações de crise." },
      { profile: "comunicador", text: "Busco aliados em situações de crise." },
      { profile: "planejador", text: "Sustento o time em situações de crise." },
      { profile: "analista", text: "Mapeio as causas em situações de crise." },
    ],
  },
  {
    id: 10,
    options: [
      { profile: "executor", text: "Delego e cobro resultado." },
      { profile: "comunicador", text: "Delego explicando o propósito." },
      { profile: "planejador", text: "Delego acompanhando de perto." },
      { profile: "analista", text: "Delego com instruções detalhadas." },
    ],
  },
  {
    id: 11,
    options: [
      { profile: "executor", text: "Mudança para mim é oportunidade." },
      { profile: "comunicador", text: "Mudança para mim é novidade boa." },
      { profile: "planejador", text: "Mudança para mim precisa de tempo." },
      { profile: "analista", text: "Mudança para mim precisa de justificativa." },
    ],
  },
  {
    id: 12,
    options: [
      { profile: "executor", text: "Prefiro decidir sozinho e seguir." },
      { profile: "comunicador", text: "Prefiro decidir conversando com gente." },
      { profile: "planejador", text: "Prefiro decidir em consenso." },
      { profile: "analista", text: "Prefiro decidir com evidência." },
    ],
  },
  {
    id: 13,
    options: [
      { profile: "executor", text: "Meu ritmo é acelerado." },
      { profile: "comunicador", text: "Meu ritmo é variado e animado." },
      { profile: "planejador", text: "Meu ritmo é constante." },
      { profile: "analista", text: "Meu ritmo é cuidadoso." },
    ],
  },
  {
    id: 14,
    options: [
      { profile: "executor", text: "Erro faz parte, sigo em frente." },
      { profile: "comunicador", text: "Erro eu compartilho e aprendo junto." },
      { profile: "planejador", text: "Erro eu corrijo com calma." },
      { profile: "analista", text: "Erro eu investigo a fundo." },
    ],
  },
  {
    id: 15,
    options: [
      { profile: "executor", text: "Gosto de autonomia total." },
      { profile: "comunicador", text: "Gosto de trabalhar cercado de pessoas." },
      { profile: "planejador", text: "Gosto de saber o que esperar do dia." },
      { profile: "analista", text: "Gosto de regras e padrões definidos." },
    ],
  },
  {
    id: 16,
    options: [
      { profile: "executor", text: "Sou movido por desafio." },
      { profile: "comunicador", text: "Sou movido por conexão." },
      { profile: "planejador", text: "Sou movido por propósito e time." },
      { profile: "analista", text: "Sou movido por excelência." },
    ],
  },
  {
    id: 17,
    options: [
      { profile: "executor", text: "Cobro de mim e dos outros." },
      { profile: "comunicador", text: "Elogio bastante o time." },
      { profile: "planejador", text: "Apoio quem está com dificuldade." },
      { profile: "analista", text: "Aponto o que precisa ser corrigido." },
    ],
  },
  {
    id: 18,
    options: [
      { profile: "executor", text: "Prefiro começar e ajustar no caminho." },
      { profile: "comunicador", text: "Prefiro alinhar com todos e começar." },
      { profile: "planejador", text: "Prefiro combinar tudo antes de começar." },
      { profile: "analista", text: "Prefiro planejar em detalhes antes de começar." },
    ],
  },
  {
    id: 19,
    options: [
      { profile: "executor", text: "Fico incomodado com lentidão." },
      { profile: "comunicador", text: "Fico incomodado com ambiente frio." },
      { profile: "planejador", text: "Fico incomodado com pressão e conflito." },
      { profile: "analista", text: "Fico incomodado com desorganização." },
    ],
  },
  {
    id: 20,
    options: [
      { profile: "executor", text: "Quero ser lembrado pelos resultados." },
      { profile: "comunicador", text: "Quero ser lembrado pelas pessoas que impactei." },
      { profile: "planejador", text: "Quero ser lembrado pela confiança que passei." },
      { profile: "analista", text: "Quero ser lembrado pela qualidade do que fiz." },
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

/** Converte as respostas (id da questão → perfil) em pontuação bruta. */
export function scoreAnswers(answers: Record<string, ProfileKey>): Scores {
  const s: Scores = { ...EMPTY_SCORES };
  for (const value of Object.values(answers)) {
    if (value && value in s) s[value] += 1;
  }
  return s;
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
