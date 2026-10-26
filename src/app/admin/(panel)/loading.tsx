/** Affiché instantanément pendant le chargement d'une page admin (navigation perçue comme immédiate). */
export default function AdminLoading() {
  return (
    <div role="status" aria-label="Chargement" className="animate-pulse space-y-6">
      <div className="space-y-3">
        <div className="h-8 w-56 rounded-lg bg-muted" />
        <div className="h-4 w-80 max-w-full rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl border bg-card" />
        ))}
      </div>
      <div className="h-80 rounded-2xl border bg-card" />
      <span className="sr-only">Chargement…</span>
    </div>
  );
}
