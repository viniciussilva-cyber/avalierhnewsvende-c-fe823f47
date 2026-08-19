CREATE TABLE public.candidate_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id text NOT NULL,
  gestor_email text NOT NULL,
  gestor_name text NOT NULL DEFAULT '',
  feedback text NOT NULL DEFAULT '',
  decision text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (candidate_id, gestor_email)
);
GRANT ALL ON public.candidate_feedback TO service_role;
ALTER TABLE public.candidate_feedback ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.candidate_ai (
  candidate_id text PRIMARY KEY,
  job_profile text NOT NULL DEFAULT '',
  analysis text NOT NULL DEFAULT '',
  score integer,
  shared boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.candidate_ai TO service_role;
ALTER TABLE public.candidate_ai ENABLE ROW LEVEL SECURITY;