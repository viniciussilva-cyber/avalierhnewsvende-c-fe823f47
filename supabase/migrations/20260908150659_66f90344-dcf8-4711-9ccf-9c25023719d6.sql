-- ============ Profiler: colaboradores ============
CREATE TABLE public.profiler_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL DEFAULT '',
  position text NOT NULL DEFAULT '',
  sector text NOT NULL DEFAULT '',
  leader_email text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  photo_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.profiler_employees TO service_role;
ALTER TABLE public.profiler_employees ENABLE ROW LEVEL SECURITY;

-- ============ Profiler: avaliações ============
CREATE TABLE public.profiler_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.profiler_employees(id) ON DELETE CASCADE,
  -- DISC: executor (D), comunicador (I), planejador (S), analista (C)
  score_executor integer NOT NULL DEFAULT 0,
  score_comunicador integer NOT NULL DEFAULT 0,
  score_planejador integer NOT NULL DEFAULT 0,
  score_analista integer NOT NULL DEFAULT 0,
  dominant text NOT NULL DEFAULT '',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  competencies jsonb NOT NULL DEFAULT '[]'::jsonb,
  indicators jsonb NOT NULL DEFAULT '[]'::jsonb,
  talent_zones jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX profiler_assessments_employee_idx
  ON public.profiler_assessments (employee_id, created_at DESC);

GRANT ALL ON public.profiler_assessments TO service_role;
ALTER TABLE public.profiler_assessments ENABLE ROW LEVEL SECURITY;

-- ============ updated_at ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiler_employees_updated_at
  BEFORE UPDATE ON public.profiler_employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER profiler_assessments_updated_at
  BEFORE UPDATE ON public.profiler_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();