import { Link } from "@tanstack/react-router";
import { Newspaper } from "lucide-react";

export function SiteHeader({ showAdminLink = true }: { showAdminLink?: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-header/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link to="/rh-news" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Newspaper className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-foreground">RH News</span>
            <span className="block text-xs text-muted-foreground">Newsletter interno</span>
          </span>
        </Link>
        {showAdminLink && (
          <Link
            to="/admin"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Acesso moderador
          </Link>
        )}
      </div>
    </header>
  );
}
