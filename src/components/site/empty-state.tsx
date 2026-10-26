import type { ReactNode } from "react";

export function EmptyState({ icon, title, children }: { icon?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-12 text-center">
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <p className="font-serif text-xl font-semibold">{title}</p>
      {children && <div className="max-w-md text-muted-foreground">{children}</div>}
    </div>
  );
}
