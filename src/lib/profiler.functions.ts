import { createServerFn } from "@tanstack/react-start";
import {
  QUESTIONS,
  scoreAnswers,
  dominantProfile,
  toPercentages,
  competencies,
  indicators,
  talentZones,
  PROFILES,
  type ProfileKey,
  type Scores,
  type BlockAnswer,
} from "./profiler";

export interface ProfilerEmployee {
  id: string;
  fullName: string;
  email: string;
  position: string;
  sector: string;
  leaderEmail: string;
  active: boolean;
  canReassess: boolean;
  photoUrl: string;
  createdAt: number;
}

export interface ProfilerAssessment {
  id: string;
  employeeId: string;
  scores: Scores;
  dominant: ProfileKey;
  answers: Record<string, any>;
  notes: string;
  updatedAt: number;
}

function toJson(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as never;
}

function norm(v: string | null | undefined): string {
  return (v ?? "").trim().toLowerCase();
}

function assertInternalEmail(email: string) {
  if (!norm(email).endsWith("@vende-c.com")) {
    throw new Error("E-mail não autorizado.");
  }
}

type EmployeeRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  position: string | null;
  sector: string | null;
  leader_email: string | null;
  active: boolean | null;
  can_reassess: boolean | null;
  photo_url: string | null;
  created_at: string;
};

const EMPLOYEE_COLS =
  "id, full_name, email, position, sector, leader_email, active, can_reassess, photo_url, created_at";

function mapEmployee(r: EmployeeRow): ProfilerEmployee {
  return {
    id: r.id,
    fullName: r.full_name ?? "",
    email: r.email ?? "",
    position: r.position ?? "",
    sector: r.sector ?? "",
    leaderEmail: r.leader_email ?? "",
    active: r.active ?? true,
    canReassess: r.can_reassess ?? false,
    photoUrl: r.photo_url ?? "",
    createdAt: new Date(r.created_at).getTime(),
  };
}

type AssessmentRow = {
  id: string;
  employee_id: string;
  score_executor: number | null;
  score_comunicador: number | null;
  score_planejador: number | null;
  score_analista: number | null;
  dominant: string | null;
  answers: unknown;
  notes: string | null;
  updated_at: string;
};

const ASSESSMENT_COLS =
  "id, employee_id, score_executor, score_comunicador, score_planejador, score_analista, dominant, answers, notes, updated_at";

function mapAssessment(r: AssessmentRow): ProfilerAssessment {
  return {
    id: r.id,
    employeeId: r.employee_id,
    scores: {
      executor: r.score_executor ?? 0,
      comunicador: r.score_comunicador ?? 0,
      planejador: r.score_planejador ?? 0,
      analista: r.score_analista ?? 0,
    },
    dominant: (r.dominant as ProfileKey) ?? "executor",
    answers: (r.answers as Record<string, any>) ?? {},
    notes: r.notes ?? "",
    updatedAt: new Date(r.updated_at).getTime(),
  };
}

/** ---------------- Colaboradores ---------------- */

export const listProfilerEmployees = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProfilerEmployee[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("profiler_employees")
      .select(EMPLOYEE_COLS)
      .order("full_name", { ascending: true });
    if (error) throw new Error(error.message);
    return ((data ?? []) as EmployeeRow[]).map(mapEmployee);
  },
);

export const getProfilerEmployee = createServerFn({ method: "GET" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }): Promise<ProfilerEmployee | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("profiler_employees")
      .select(EMPLOYEE_COLS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? mapEmployee(row as EmployeeRow) : null;
  });

export const saveProfilerEmployee = createServerFn({ method: "POST" })
  .validator(
    (d: {
      actorEmail: string;
      id?: string;
      fullName: string;
      email: string;
      position: string;
      sector: string;
      leaderEmail: string;
      active: boolean;
      photoUrl: string;
    }) => d,
  )
  .handler(async ({ data }): Promise<{ id: string }> => {
    assertInternalEmail(data.actorEmail);
    if (!data.fullName?.trim()) throw new Error("Informe o nome do colaborador.");

    const payload = {
      full_name: data.fullName.trim().slice(0, 200),
      email: norm(data.email).slice(0, 200),
      position: (data.position ?? "").trim().slice(0, 200),
      sector: (data.sector ?? "").trim().slice(0, 200),
      leader_email: norm(data.leaderEmail).slice(0, 200),
      active: data.active,
      photo_url: (data.photoUrl ?? "").slice(0, 2000),
      updated_at: new Date().toISOString(),
    };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.id) {
      const { error } = await supabaseAdmin
        .from("profiler_employees")
        .update(payload)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }

    const { data: row, error } = await supabaseAdmin
      .from("profiler_employees")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id };
  });

export const deleteProfilerEmployee = createServerFn({ method: "POST" })
  .validator((d: { actorEmail: string; id: string }) => d)
  .handler(async ({ data }) => {
    assertInternalEmail(data.actorEmail);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("profiler_employees").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleReassessmentPermission = createServerFn({ method: "POST" })
  .validator((d: { actorEmail: string; employeeId: string; canReassess: boolean }) => d)
  .handler(async ({ data }) => {
    assertInternalEmail(data.actorEmail);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiler_employees")
      .update({ can_reassess: data.canReassess, updated_at: new Date().toISOString() })
      .eq("id", data.employeeId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** ---------------- Avaliações ---------------- */

export const listProfilerAssessments = createServerFn({ method: "GET" })
  .validator((d?: { employeeId?: string }) => d)
  .handler(async ({ data }): Promise<ProfilerAssessment[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let query = supabaseAdmin.from("profiler_assessments").select(ASSESSMENT_COLS);
    if (data?.employeeId) {
      query = query.eq("employee_id", data.employeeId);
    }
    const { data: rows, error } = await query.order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((rows ?? []) as AssessmentRow[]).map(mapAssessment);
  });

export const getProfilerAssessment = createServerFn({ method: "GET" })
  .validator((d: { employeeId: string }) => d)
  .handler(async ({ data }): Promise<ProfilerAssessment | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("profiler_assessments")
      .select(ASSESSMENT_COLS)
      .eq("employee_id", data.employeeId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? mapAssessment(row as AssessmentRow) : null;
  });

export const submitProfilerAssessment = createServerFn({ method: "POST" })
  .validator(
    (d: { employeeId: string; answers: Record<string, any>; origin?: string }) => d,
  )
  .handler(async ({ data }): Promise<ProfilerAssessment> => {
    const answeredCount = Object.keys(data.answers ?? {}).length;
    if (answeredCount < QUESTIONS.length) {
      throw new Error("Responda todos os blocos antes de enviar.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: employeeRow, error: empError } = await supabaseAdmin
      .from("profiler_employees")
      .select(EMPLOYEE_COLS)
      .eq("id", data.employeeId)
      .maybeSingle();
    if (empError) throw new Error(empError.message);
    if (!employeeRow) throw new Error("Colaborador não encontrado.");

    const employee = mapEmployee(employeeRow as EmployeeRow);

    const { data: existingAssessments } = await supabaseAdmin
      .from("profiler_assessments")
      .select("id")
      .eq("employee_id", data.employeeId)
      .limit(1);

    const hasPreviousAssessment = (existingAssessments ?? []).length > 0;

    if (hasPreviousAssessment && !employee.canReassess) {
      throw new Error("Você já realizou esta avaliação. Para refazer, solicite liberação ao RH.");
    }

    const scores = scoreAnswers(data.answers);
    const dominant = dominantProfile(scores);
    const pct = toPercentages(scores);

    const payload = {
      employee_id: data.employeeId,
      score_executor: scores.executor,
      score_comunicador: scores.comunicador,
      score_planejador: scores.planejador,
      score_analista: scores.analista,
      dominant,
      answers: toJson(data.answers),
      competencies: toJson(competencies(pct)),
      indicators: toJson(indicators(dominant)),
      talent_zones: toJson(talentZones(pct)),
      updated_at: new Date().toISOString(),
    };

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("profiler_assessments")
      .insert(payload)
      .select("id")
      .single();

    if (insertError) throw new Error(insertError.message);

    await supabaseAdmin
      .from("profiler_employees")
      .update({ can_reassess: false, updated_at: new Date().toISOString() })
      .eq("id", data.employeeId);

    if (employee.leaderEmail) {
      const profileInfo = PROFILES[dominant];
      const baseUrl = data.origin || "https://avalierhnewsvende-c.vercel.app";
      await supabaseAdmin.functions.invoke("rapid-task", {
        body: {
          leaderEmail: employee.leaderEmail,
          employeeName: employee.fullName,
          profileLabel: profileInfo?.label || dominant,
          reportUrl: `${baseUrl}/app/profiler/colaborador/${employee.id}`,
        },
      });
    }

    return {
      id: (inserted as { id: string }).id,
      employeeId: data.employeeId,
      scores,
      dominant,
      answers: data.answers,
      notes: "",
      updatedAt: Date.now(),
    };
  });

export const saveProfilerNotes = createServerFn({ method: "POST" })
  .validator((d: { actorEmail: string; employeeId: string; notes: string }) => d)
  .handler(async ({ data }) => {
    assertInternalEmail(data.actorEmail);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiler_assessments")
      .update({ notes: (data.notes ?? "").slice(0, 20000), updated_at: new Date().toISOString() })
      .eq("employee_id", data.employeeId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
