import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { ProfilerReport } from "@/components/profiler/ProfilerReport";
import { getProfilerAssessment, getProfilerEmployee } from "@/lib/profiler.functions";
import { leadsEmployee, useLeaderSession } from "@/lib/profiler-leaders";

export const Route = createFileRoute("/profiler/relatorio/$employeeId")({
  head: () => ({
    meta: [
      { title: "Relatório do colaborador — Profiler · VENDE-C" },
      {
        name: "description",
        content: "Relatório comportamental completo de um colaborador do seu time na VENDE-C.",
      },
      { property: "og:title", content: "Relatório do colaborador — Profiler · VENDE-C" },
      {
        property: "og:description",
        content: "Relatório comportamental completo de um colaborador do seu time na VENDE-C.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LeaderReport,
});

function LeaderReport() {
  const { employeeId } = Route.useParams();
  const navigate = useNavigate();
  const { leader, loading } = useLeaderSession();

  useEffect(() => {
    if (!loading && !leader) navigate({ to: "/profiler", replace: true });
  }, [loading, leader, navigate]);

  const ready = !loading && !!leader;

  const employeeQuery = useQuery({
    queryKey: ["profiler-employee", employeeId],
    queryFn: () => getProfilerEmployee({ data: { id: employeeId } }),
    enabled: ready,
  });
  const assessmentQuery = useQuery({
    queryKey: ["profiler-assessment", employeeId],
    queryFn: () => getProfilerAssessment({ data: { employeeId } }),
    enabled: ready,
  });

  if (!ready || employeeQuery.isLoading || assessmentQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const employee = employeeQuery.data;
  const allowed = !!employee && !!leader && leadsEmployee(leader, employee.leaderEmail);
  const assessment = assessmentQuery.data;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 border-b border-border bg-header/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <Link
            to="/profiler/time"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Meu time
          </Link>
          {leader?.isEscape && (
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Home className="h-3.5 w-3.5" /> Início
            </Link>
          )}
        </div>
      </div>

      <PageTransition className="mx-auto max-w-4xl px-6 py-10">
        {!employee || !allowed ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center text-sm text-muted-foreground">
            Este colaborador não faz parte do seu time.
          </p>
        ) : !assessment ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {employee.fullName} ainda não respondeu a avaliação.
            </p>
          </div>
        ) : (
          <ProfilerReport
            name={employee.fullName}
            position={employee.position}
            sector={employee.sector}
            scores={assessment.scores}
          />
        )}
      </PageTransition>
    </div>
  );
}
