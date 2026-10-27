import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({ page, pages, basePath, params = {} }: { page: number; pages: number; basePath: string; params?: Record<string, string> }) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams(params);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const items = Array.from({ length: pages }, (_, i) => i + 1).filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1);
  const btn = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors";
  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link prefetch={false} href={href(page - 1)} rel="prev" className={cn(btn, "bg-card hover:bg-accent")}>
          <ChevronLeft className="size-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Précédent</span>
        </Link>
      )}
      {items.map((p, i) => (
        <span key={p} className="contents">
          {i > 0 && items[i - 1] !== p - 1 && <span aria-hidden="true" className="px-1 text-muted-foreground">…</span>}
          <Link
            prefetch={false}
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={`Page ${p}`}
            className={cn(btn, p === page ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent")}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < pages && (
        <Link prefetch={false} href={href(page + 1)} rel="next" className={cn(btn, "bg-card hover:bg-accent")}>
          <span className="sr-only sm:not-sr-only sm:mr-1">Suivant</span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </nav>
  );
}
