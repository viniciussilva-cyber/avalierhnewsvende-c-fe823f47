import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, ArrowLeft } from "lucide-react";
import { ProfilerReport } from "@/components/profiler/ProfilerReport";
import { getProfilerAssessment, getProfilerEmployee } from "@/lib/profiler.functions";

export const Route = createFileRoute("/app/profiler/colaborador/$employeeId")({
  head: () => ({
    meta: [{ title: "Relatório Comportamental · Profiler VENDE-C" }],
  }),
  component: EmployeeReport,
});

function EmployeeReport() {
  const { employeeId } = Route.useParams();

  const fetchEmployee = useServerFn(getProfilerEmployee);
  const fetchAssessment = useServerFn(getProfilerAssessment);

  const employeeQuery = useQuery({
    queryKey: ["profiler-employee-report", employeeId],
    queryFn: () => fetchEmployee({ data: { id: employeeId } }),
  });

  const assessmentQuery = useQuery({
    queryKey: ["profiler-assessment-report", employeeId],
    queryFn: () => fetchAssessment({ data: { employeeId } }),
  });

  if (employeeQuery.isLoading || assessmentQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff0068]" />
      </div>
    );
  }

  const employee = employeeQuery.data;
  const assessment = assessmentQuery.data;

  if (!employee) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center text-white">
        <h1 className="text-xl font-bold">Colaborador não encontrado</h1>
        <a href="/app/profiler" className="mt-4 text-xs font-semibold text-[#ff0068] hover:underline">
          ← Voltar ao Dashboard
        </a>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center text-white">
        <h1 className="text-xl font-bold">Avaliação ainda não realizada</h1>
        <p className="mt-2 text-xs text-zinc-400">
          {employee.fullName} ainda não respondeu ao teste comportamental.
        </p>
        <a href="/app/profiler" className="mt-4 text-xs font-semibold text-[#ff0068] hover:underline">
          ← Voltar ao Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <a
          href="/app/profiler"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#141414] px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar aos Colaboradores
        </a>

        <ProfilerReport
          name={employee.fullName}
          position={employee.position}
          sector={employee.sector}
          scores={assessment.scores}
        />
      </div>
    </div>
  );
}
