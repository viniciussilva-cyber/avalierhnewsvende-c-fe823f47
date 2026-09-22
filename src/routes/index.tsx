import { createFileRoute, redirect } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "VENDE-C — Plataforma interna" }],
  }),
  beforeLoad: async ({ context }) => {
    // Redirecionamento executado de forma segura tanto no Server quanto no Client
    throw redirect({
      to: "/admin",
      replace: true,
    });
  },
  component: HomeGate,
});

function HomeGate() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
