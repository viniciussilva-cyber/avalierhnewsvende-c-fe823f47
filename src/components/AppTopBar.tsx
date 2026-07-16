import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, LogOut, Sparkles } from "lucide-react";
import { logout, useAuth } from "@/lib/auth";
import { useRole } from "@/lib/roles";
import { useQueryClient } from "@tanstack/react-query";

interface AppTopBarProps {
  moduleLabel: string;
  backTo?: string;
  backLabel?: string;
}

/**
 * Shared header used on every /app/* screen. Shows the current module,
 * a "back to modules" link, current user role, and a sign-out button.
 */
export function AppTopBar({ moduleLabel, backTo = "/app", backLabel = "Módulos" }: AppTopBarProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { role } = useRole(user);

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    navigate({ to: "/admin", replace: true });
  };

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-header/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-3">
          <Link
            to={backTo}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {backLabel}
          </Link>
          <span className="hidden text-muted-foreground/40 sm:inline">/</span>
          <span className="hidden items-center gap-1.5 text-sm font-semibold text-foreground sm:inline-flex">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {moduleLabel}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {role && (
            <span className="hidden rounded-full border border-border bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:inline-block">
              {role === "rh" ? "Recrutador (RH)" : "Gestor"}
            </span>
          )}
          {user?.email && (
            <span className="hidden max-w-[180px] truncate text-xs text-muted-foreground md:inline">
              {user.email}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </div>
    </div>
  );
}
