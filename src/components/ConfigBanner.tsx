import { AlertTriangle } from "lucide-react";
import { firebaseConfigured } from "@/lib/firebase";

export function ConfigBanner() {
  if (firebaseConfigured) return null;
  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-6 py-3 text-center text-sm text-amber-300">
      <AlertTriangle className="mr-2 inline h-4 w-4" />
      Firebase ainda não configurado. Cole suas chaves em{" "}
      <code className="rounded bg-black/40 px-1">src/lib/firebase.ts</code> para ativar o banco de dados.
    </div>
  );
}
