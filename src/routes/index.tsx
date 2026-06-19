import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { ConfigBanner } from "@/components/ConfigBanner";
import { Hero } from "@/components/Hero";
import { EvaluationForm } from "@/components/EvaluationForm";
import { listPublished } from "@/lib/newsletters";
import { listEvaluations, averageRating } from "@/lib/evaluations";
import { firebaseConfigured } from "@/lib/firebase";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    edition: typeof search.edition === "string" ? search.edition : undefined,
  }),
  head: () => ({
    meta: [
      { title: "RH News — Newsletter interno | VENDE-C" },
      { name: "description", content: "Leia e avalie a newsletter interna de RH da Vende-C." },
      { property: "og:title", content: "RH News — Newsletter interno" },
      { property: "og:description", content: "Leia e avalie a newsletter interna de RH da Vende-C." },
    ],
  }),
  component: PublicView,
});

function PublicView() {
  const { edition } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const formRef = useRef<HTMLDivElement>(null);

  const publishedQuery = useQuery({
    queryKey: ["newsletters", "published"],
    queryFn: listPublished,
  });

  const published = publishedQuery.data ?? [];
  const selected = edition
    ? published.find((n) => n.id === edition) ?? null
    : published[0] ?? null;

  const evaluationsQuery = useQuery({
    queryKey: ["evaluations", selected?.id],
    queryFn: () => listEvaluations(selected!.id),
    enabled: !!selected,
  });

  const evaluations = evaluationsQuery.data ?? [];
  const average = averageRating(evaluations);

  const others = published.filter((n) => n.id !== selected?.id);

  const scrollToForm = () =>
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen bg-background">
      <ConfigBanner />
      <SiteHeader />

      {publishedQuery.isLoading ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !selected ? (
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="text-2xl font-bold text-foreground">Nenhuma edição publicada ainda</h1>
          <p className="mt-3 text-muted-foreground">
            Assim que o RH publicar uma edição, ela aparecerá aqui.
          </p>
        </div>
      ) : (
        <>
          <Hero
            monthYear={selected.monthYear}
            title={selected.title}
            average={average}
            evaluationsCount={evaluations.length}
            onCta={scrollToForm}
          />

          <main className="mx-auto max-w-3xl px-6 py-12">
            <div ref={formRef} className="scroll-mt-20">
              <EvaluationForm newsletterId={selected.id} />
            </div>

            <article className="prose prose-invert mt-12 max-w-none prose-headings:text-foreground prose-a:text-primary">
              <div dangerouslySetInnerHTML={{ __html: selected.content }} />
            </article>
          </main>

          {others.length > 0 && (
            <footer className="border-t border-border bg-card/40">
              <div className="mx-auto max-w-5xl px-6 py-12">
                <h2 className="mb-6 text-lg font-bold text-foreground">Outras edições</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {others.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        navigate({ search: { edition: n.id } });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="group rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/50"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {n.monthYear}
                      </span>
                      <p className="mt-2 font-semibold text-card-foreground group-hover:text-foreground">
                        {n.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </footer>
          )}
        </>
      )}
    </div>
  );
}
