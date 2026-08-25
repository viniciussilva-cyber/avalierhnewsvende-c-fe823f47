import { createServerFn } from "@tanstack/react-start";
import { findManager } from "./managers";

export type Decision = "aprovado" | "negado" | "espera" | null;

export interface FeedbackRow {
  gestorEmail: string;
  gestorName: string;
  feedback: string;
  decision: Decision;
  updatedAt: number;
}

export interface AiAnalysisRow {
  jobProfile: string;
  analysis: string;
  score: number | null;
  shared: boolean;
  updatedAt: number;
}

function normEmail(v: string): string {
  return (v ?? "").trim().toLowerCase();
}

/** ---------------- Parecer do gestor ---------------- */

export const listFeedback = createServerFn({ method: "GET" })
  .inputValidator((d: { candidateId: string }) => d)
  .handler(async ({ data }): Promise<FeedbackRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("candidate_feedback")
      .select("gestor_email, gestor_name, feedback, decision, updated_at")
      .eq("candidate_id", data.candidateId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      gestorEmail: r.gestor_email,
      gestorName: r.gestor_name ?? "",
      feedback: r.feedback ?? "",
      decision: (r.decision as Decision) ?? null,
      updatedAt: new Date(r.updated_at).getTime(),
    }));
  });

export const saveFeedback = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      candidateId: string;
      gestorEmail: string;
      gestorName: string;
      feedback: string;
      decision: Decision;
    }) => d,
  )
  .handler(async ({ data }) => {
    const email = normEmail(data.gestorEmail);
    const isManager = !!findManager(email);
    const isRh = email.endsWith("@vende-c.com");
    if (!email || (!isManager && !isRh)) {
      throw new Error("E-mail não autorizado a registrar avaliação.");
    }
    if (!data.candidateId) throw new Error("Candidato inválido.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("candidate_feedback").upsert(
      {
        candidate_id: data.candidateId,
        gestor_email: email,
        gestor_name: (data.gestorName ?? "").slice(0, 160),
        feedback: (data.feedback ?? "").slice(0, 20000),
        decision: data.decision,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "candidate_id,gestor_email" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** ---------------- Análise de IA ---------------- */

export const getAiAnalysis = createServerFn({ method: "GET" })
  .inputValidator((d: { candidateId: string; forGestor?: boolean }) => d)
  .handler(async ({ data }): Promise<AiAnalysisRow | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("candidate_ai")
      .select("job_profile, analysis, score, shared, updated_at")
      .eq("candidate_id", data.candidateId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    if (data.forGestor && !row.shared) return null;
    return {
      jobProfile: data.forGestor ? "" : (row.job_profile ?? ""),
      analysis: row.analysis ?? "",
      score: row.score,
      shared: row.shared,
      updatedAt: new Date(row.updated_at).getTime(),
    };
  });

export const setAiShared = createServerFn({ method: "POST" })
  .inputValidator((d: { candidateId: string; shared: boolean }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("candidate_ai")
      .update({ shared: data.shared, updated_at: new Date().toISOString() })
      .eq("candidate_id", data.candidateId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const generateAiAnalysis = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      candidateId: string;
      jobProfile: string;
      candidate: {
        fullName: string;
        area: string;
        salaryExpectation: string;
        rhSummary: string;
        experience: string;
        rhNotes: string;
      };
    }) => d,
  )
  .handler(async ({ data }): Promise<AiAnalysisRow> => {
    if (!data.jobProfile?.trim()) {
      throw new Error("Descreva o perfil ideal da vaga antes de gerar a análise.");
    }
    const { chat } = await import("./rs-ai.server");

    const system =
      "Você é um especialista sênior em Recrutamento e Seleção da VENDE-C. " +
      "Analise a compatibilidade entre um candidato e o perfil ideal de uma vaga (time, cultura, líder direto). " +
      "Responda em português do Brasil, de forma objetiva e estruturada, usando exatamente estas seções: " +
      "1) Nota de compatibilidade (0 a 100) — comece a resposta com a linha 'COMPATIBILIDADE: <número>'; " +
      "2) Resumo executivo; 3) Pontos fortes; 4) Pontos de atenção e riscos; " +
      "5) Fit cultural e com o líder direto; 6) Perguntas recomendadas para a próxima entrevista; " +
      "7) Recomendação final. Nunca invente informações que não estejam nos dados fornecidos.";

    const c = data.candidate;
    const user = [
      "### PERFIL IDEAL DA VAGA",
      data.jobProfile,
      "",
      "### CANDIDATO",
      `Nome: ${c.fullName}`,
      `Área / vaga de interesse: ${c.area}`,
      `Pretensão salarial: ${c.salaryExpectation || "não informada"}`,
      "",
      "Resumo da entrevista com o RH:",
      c.rhSummary || "(não informado)",
      "",
      "Experiências profissionais:",
      c.experience || "(não informado)",
      "",
      "Observações do RH:",
      c.rhNotes || "(não informado)",
    ].join("\n");

    const analysis = await chat(system, user);
    const match = analysis.match(/COMPATIBILIDADE:\s*(\d{1,3})/i);
    const score = match ? Math.min(100, Number(match[1])) : null;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("candidate_ai").upsert(
      {
        candidate_id: data.candidateId,
        job_profile: data.jobProfile,
        analysis,
        score,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "candidate_id" },
    );
    if (error) throw new Error(error.message);

    const { data: row } = await supabaseAdmin
      .from("candidate_ai")
      .select("shared")
      .eq("candidate_id", data.candidateId)
      .maybeSingle();

    return {
      jobProfile: data.jobProfile,
      analysis,
      score,
      shared: row?.shared ?? false,
      updatedAt: Date.now(),
    };
  });

/** ---------------- Revisão de texto por IA ---------------- */

export type ReviewKind = "parecer" | "rhSummary" | "rhNotes";

const REVIEW_PROMPTS: Record<ReviewKind, string> = {
  parecer:
    "Revise o parecer de um gestor sobre um candidato. Deixe o texto claro, profissional, objetivo e imparcial, " +
    "corrigindo gramática e organizando as ideias em parágrafos curtos. Mantenha o sentido e as opiniões originais.",
  rhSummary:
    "Revise o resumo de uma entrevista feita pelo RH com um candidato. Deixe o texto claro, profissional e bem " +
    "estruturado, corrigindo gramática e organizando as informações. Não invente dados.",
  rhNotes:
    "Revise as observações internas do RH sobre um candidato. Deixe o texto claro, profissional e objetivo, " +
    "corrigindo gramática e removendo repetições. Não invente dados.",
};

export const reviewText = createServerFn({ method: "POST" })
  .inputValidator((d: { kind: ReviewKind; text: string }) => d)
  .handler(async ({ data }): Promise<{ text: string }> => {
    const text = (data.text ?? "").trim();
    if (text.length < 10) throw new Error("Escreva um pouco mais antes de pedir a revisão da IA.");
    const { chat } = await import("./rs-ai.server");
    const system =
      `${REVIEW_PROMPTS[data.kind] ?? REVIEW_PROMPTS.parecer} ` +
      "Responda em português do Brasil apenas com o texto revisado, sem comentários, títulos ou aspas.";
    const revised = await chat(system, text.slice(0, 20000));
    return { text: revised };
  });
