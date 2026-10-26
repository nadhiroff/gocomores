import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CountUp } from "@/components/site/count-up";
import { cn } from "@/lib/utils";

/** En-tête de page admin : fil d'Ariane, titre, description et actions. */
export function PageHeader({
  title,
  description,
  actions,
  crumbs,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  crumbs?: { href: string; label: string }[];
}) {
  return (
    <header className="mb-8">
      {crumbs && (
        <nav aria-label="Fil d'Ariane" className="mb-2">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            {crumbs.map((c) => (
              <li key={c.href} className="flex items-center gap-1">
                <Link href={c.href} className="rounded hover:text-foreground hover:underline">{c.label}</Link>
                <ChevronRight className="size-4" aria-hidden="true" />
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/** Carte de contenu (section) de l'admin. */
export function Panel({ title, description, actions, className, children, id }: { title?: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; className?: string; children: React.ReactNode; id?: string }) {
  return (
    <section aria-labelledby={title && id ? id : undefined} className={cn("rounded-2xl border bg-card p-5 shadow-[0_1px_2px_rgb(0_0_0/0.04)] sm:p-6", className)}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 id={id} className="text-lg font-bold">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

const TONES = {
  green: "bg-[#E3F4E9] text-[#00702B] dark:bg-[#123321] dark:text-[#5EE08F]",
  yellow: "bg-[#FFF6CC] text-[#6B5600] dark:bg-[#332B00] dark:text-[#FFD100]",
  red: "bg-[#FDE4E7] text-[#B0102A] dark:bg-[#3A0D14] dark:text-[#FF8A96]",
  blue: "bg-[#E1EAFA] text-[#003DA5] dark:bg-[#0E1E3D] dark:text-[#8FB3FF]",
} as const;
export type Tone = keyof typeof TONES;

export function StatCard({ label, value, icon: Icon, tone, href, hint }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; tone: Tone; href?: string; hint?: string }) {
  const body = (
    <>
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110", TONES[tone])}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-muted-foreground">{label}</span>
        <span className="block text-2xl font-bold tabular-nums">{typeof value === "number" ? <CountUp value={value} duration={900} /> : value}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
    </>
  );
  const cls = "group flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-[0_1px_2px_rgb(0_0_0/0.04)]";
  return href ? (
    <Link href={href} className={cn(cls, "admin-lift hover:border-primary/60")}>{body}</Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function Pill({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-none", TONES[tone], className)}>{children}</span>;
}

export function EmptyNote({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="grid place-items-center gap-2 rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
      <Icon className="size-8" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
