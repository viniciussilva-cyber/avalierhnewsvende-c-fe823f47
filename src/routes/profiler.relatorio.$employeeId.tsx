import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { AppTopBar } from "@/components/AppTopBar";
import { PageTransition } from "@/components/PageTransition";
import { ProfilerReport } from "@/components/profiler/ProfilerReport";
import { useAuth } from "@/lib/auth";
import { getProfilerAssessment, getProfilerEmployee } from "@/lib/profiler.functions";

export const Route = createFileRoute("/profiler/relatorio/$employeeId")({
  head: () => ({
    meta: [
      { title: "Relatório do colaborador · Profiler VENDE-C" },
      {
        name: "description",
        content: "Relatório comportamental completo do colaborador avaliado no Profiler VENDE-C.",
      },
      { property: "og:title", content: "Relatório do colaborador · Profiler VENDE-C" },
      {
        property: "og:description",
        content: "Relatório comportamental completo do colaborador avaliado no Profiler VENDE-C.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EmployeeReport,
});

function EmployeeReport() {
  const { employeeId } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin", replace: true });
  }, [loading, user, navigate]);

  const ready = !loading && !!user;

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
  const assessment = assessmentQuery.data;

  return (
    <div className="min-h-screen bg-background">
      <AppTopBar
        moduleLabel="Profiler · Relatório"
        backTo="/app/profiler"
        backLabel="Colaboradores"
      />
      <PageTransition className="mx-auto max-w-4xl px-6 py-10">
        {!employee ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center text-sm text-muted-foreground">
            Colaborador não encontrado.
          </p>
        ) : !assessment ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {employee.fullName} ainda não respondeu a avaliação. Copie o link no painel e envie
              para o colaborador.
            </p>
          </div>
        ) : (
          <ProfilerReport
            name={employee.fullName}
            position={employee.position}
            sector={employee.sector}
            scores={assessment.scores}
            photoUrl={(employee as any)?.photoUrl}
          />
        )}
      </PageTransition>
    </div>
  );
}
