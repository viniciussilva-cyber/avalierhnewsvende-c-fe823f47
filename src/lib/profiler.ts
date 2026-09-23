export type ProfileKey = 'executor' | 'comunicador' | 'planejador' | 'analista';

export const PROFILE_KEYS: ProfileKey[] = ['executor', 'comunicador', 'planejador', 'analista'];

export interface DiscOption {
  id: string;
  text: string;
  profile: ProfileKey;
}

export interface DiscQuestionBlock {
  id: number;
  title: string;
  options: DiscOption[];
}

// Estrutura de resposta por bloco: qual foi escolhido como Mais (most) e Menos (least)
export type BlockAnswer = {
  most: ProfileKey;
  least?: ProfileKey;
};

export const QUESTIONS: DiscQuestionBlock[] = [
  {
    id: 1,
    title: "Ao encarar um prazo apertado",
    options: [
      { id: "1_d", profile: "executor", text: "Acelero o ritmo e cobro resultado imediato de mim e dos outros" },
      { id: "1_i", profile: "comunicador", text: "Busco animar o time e mantenho o clima leve mesmo sob pressão" },
      { id: "1_s", profile: "planejador", text: "Sigo o ritmo que já vinha seguindo, sem me alterar" },
      { id: "1_c", profile: "analista", text: "Reviso o plano com calma antes de agir, mesmo com o relógio correndo" }
    ]
  },
  {
    id: 2,
    title: "Numa reunião de equipe",
    options: [
      { id: "2_d", profile: "executor", text: "Vou direto ao ponto e proponho a decisão" },
      { id: "2_i", profile: "comunicador", text: "Falo bastante, envolvo todo mundo na conversa" },
      { id: "2_s", profile: "planejador", text: "Escuto mais do que falo, espero minha vez" },
      { id: "2_c", profile: "analista", text: "Anoto os detalhes e questiono pontos que não ficaram claros" }
    ]
  },
  {
    id: 3,
    title: "Diante de uma mudança repentina de planos",
    options: [
      { id: "3_d", profile: "executor", text: "Vejo como oportunidade de assumir o controle da situação" },
      { id: "3_i", profile: "comunicador", text: "Me adapto rápido e tento contagiar os outros com otimismo" },
      { id: "3_s", profile: "planejador", text: "Preciso de um tempo para me ajustar, prefiro previsibilidade" },
      { id: "3_c", profile: "analista", text: "Quero entender o motivo da mudança antes de aceitar" }
    ]
  },
  {
    id: 4,
    title: "Ao tomar uma decisão importante",
    options: [
      { id: "4_d", profile: "executor", text: "Decido rápido, com base no resultado que quero alcançar" },
      { id: "4_i", profile: "comunicador", text: "Busco gerar entusiasmo no grupo em torno da escolha que defendo" },
      { id: "4_s", profile: "planejador", text: "Prefiro buscar consenso com o grupo, mesmo que leve mais tempo" },
      { id: "4_c", profile: "analista", text: "Levanto dados e analiso prós e contras com cuidado" }
    ]
  },
  {
    id: 5,
    title: "Recebendo uma crítica ou feedback",
    options: [
      { id: "5_d", profile: "executor", text: "Encaro de frente e já penso no que fazer diferente" },
      { id: "5_i", profile: "comunicador", text: "Comento logo com alguém por perto e sigo animado(a)" },
      { id: "5_s", profile: "planejador", text: "Levo a sério e prefiro processar em silêncio" },
      { id: "5_c", profile: "analista", text: "Peço exemplos concretos para entender exatamente o que errei" }
    ]
  },
  {
    id: 6,
    title: "Em situação de conflito",
    options: [
      { id: "6_d", profile: "executor", text: "Confronto diretamente, prefiro resolver logo" },
      { id: "6_i", profile: "comunicador", text: "Tento amenizar com bom humor ou conversa" },
      { id: "6_s", profile: "planejador", text: "Evito o confronto, busco manter a harmonia" },
      { id: "6_c", profile: "analista", text: "Analiso os fatos antes de tomar partido" }
    ]
  },
  {
    id: 7,
    title: "No dia a dia de trabalho",
    options: [
      { id: "7_d", profile: "executor", text: "Gosto de ambientes com desafio e meta clara pra bater" },
      { id: "7_i", profile: "comunicador", text: "Prefiro dias com bastante troca e conversa com o time" },
      { id: "7_s", profile: "planejador", text: "Gosto de manter o mesmo ritmo, sem sobressaltos" },
      { id: "7_c", profile: "analista", text: "Prefiro caprichar nos detalhes a entregar rápido e com falhas" }
    ]
  },
  {
    id: 8,
    title: "Ao errar em alguma tarefa",
    options: [
      { id: "8_d", profile: "executor", text: "Sigo em frente rápido, não gosto de ficar remoendo" },
      { id: "8_i", profile: "comunicador", text: "Comento abertamente, não escondo o erro" },
      { id: "8_s", profile: "planejador", text: "Fico incomodado, mas evito criar alarde" },
      { id: "8_c", profile: "analista", text: "Investigo a fundo o que causou o erro para não repetir" }
    ]
  },
  {
    id: 9,
    title: "Em relação a regras e processos",
    options: [
      { id: "9_d", profile: "executor", text: "Sigo as regras até onde elas não travam o resultado" },
      { id: "9_i", profile: "comunicador", text: "Sigo as regras, mas não abro mão de manter um bom clima com todo mundo" },
      { id: "9_s", profile: "planejador", text: "Sigo as regras como forma de manter a ordem" },
      { id: "9_c", profile: "analista", text: "Sigo as regras à risca, questiono quando não fazem sentido" }
    ]
  },
  {
    id: 10,
    title: "Liderando ou influenciando outras pessoas",
    options: [
      { id: "10_d", profile: "executor", text: "Dou direção clara e cobro entrega" },
      { id: "10_i", profile: "comunicador", text: "Inspiro e motivo pelo entusiasmo" },
      { id: "10_s", profile: "planejador", text: "Apoio e dou suporte constante ao time" },
      { id: "10_c", profile: "analista", text: "Oriento com base em dados e processos bem definidos" }
    ]
  },
  {
    id: 11,
    title: "Ao começar um projeto novo",
    options: [
      { id: "11_d", profile: "executor", text: "Já penso nas metas finais e no impacto" },
      { id: "11_i", profile: "comunicador", text: "Já penso em quem vou envolver e como vender a ideia" },
      { id: "11_s", profile: "planejador", text: "Prefiro ir no ritmo que já conheço, sem pressa pra mudar a forma de trabalhar" },
      { id: "11_c", profile: "analista", text: "Levanto todas as informações antes de dar o primeiro passo" }
    ]
  },
  {
    id: 12,
    title: "Sob estresse prolongado",
    options: [
      { id: "12_d", profile: "executor", text: "Fico impaciente e mais direto do que de costume" },
      { id: "12_i", profile: "comunicador", text: "Fico mais falante e busco apoio social" },
      { id: "12_s", profile: "planejador", text: "Me fecho um pouco, evito mudanças adicionais" },
      { id: "12_c", profile: "analista", text: "Fico mais crítico e exigente com detalhes" }
    ]
  }
];

export interface Scores {
  executor: number;
  comunicador: number;
  planejador: number;
  analista: number;
}

export const PROFILES: Record<ProfileKey, { label: string; description: string }> = {
  executor: { label: "Executor", description: "Focado em resultados, direto e decisivo." },
  comunicador: { label: "Comunicador", description: "Persuasivo, entusiasmado e sociável." },
  planejador: { label: "Planejador", description: "Estável, paciente e orientativo." },
  analista: { label: "Analista", description: "Preciso, analítico e focado em qualidade." },
};

export function scoreAnswers(answers: Record<string, ProfileKey | BlockAnswer>): Scores {
  const scores: Scores = { executor: 0, comunicador: 0, planejador: 0, analista: 0 };
  
  Object.values(answers).forEach((value) => {
    if (typeof value === 'string') {
      if (scores[value] !== undefined) scores[value] += 1;
    } else if (value && typeof value === 'object') {
      const most = value.most;
      if (most && scores[most] !== undefined) {
        scores[most] += 1;
      }
    }
  });

  return scores;
}

export function dominantProfile(scores: Scores): ProfileKey {
  let highestKey: ProfileKey = "executor";
  let highestValue = -1;

  (Object.keys(scores) as ProfileKey[]).forEach((key) => {
    if (scores[key] > highestValue) {
      highestValue = scores[key];
      highestKey = key;
    }
  });

  return highestKey;
}

export function rankProfiles(scores: Scores): { key: ProfileKey; score: number; percentage: number }[] {
  const pct = toPercentages(scores);
  return PROFILE_KEYS.map((key) => ({
    key,
    score: scores[key] || 0,
    percentage: pct[key] || 0,
  })).sort((a, b) => b.score - a.score);
}

export function toPercentages(scores: Scores): Scores {
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  return {
    executor: Math.round((scores.executor / total) * 100),
    comunicador: Math.round((scores.comunicador / total) * 100),
    planejador: Math.round((scores.planejador / total) * 100),
    analista: Math.round((scores.analista / total) * 100),
  };
}

export function competencies(pct: Scores) {
  return {
    focoResultados: pct.executor,
    comunicacao: pct.comunicador,
    planejamento: pct.planejador,
    qualidade: pct.analista,
  };
}

export function indicators(dominant: ProfileKey) {
  return {
    perfilPredominante: PROFILES[dominant]?.label || dominant,
  };
}

export function talentZones(pct: Scores) {
  return {
    lideranca: pct.executor,
    relacionamento: pct.comunicador,
    estabilidade: pct.planejador,
    organizacao: pct.analista,
  };
}
