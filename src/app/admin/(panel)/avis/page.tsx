import { MapPin, Star, Trash2 } from "lucide-react";
import { deleteReview } from "@/actions/admin";
import { EmptyNote, PageHeader, StatCard } from "@/components/admin/ui";
import { Pagination } from "@/components/site/pagination";
import { Button } from "@/components/ui/button";
import { formatDateLong } from "@/lib/format";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Avis" };

export default async function AdminReviews({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const per = 20;
  const [rows, total, agg] = await Promise.all([
    prisma.review.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * per, take: per, include: { place: { select: { name: true } } } }),
    prisma.review.count(),
    prisma.review.aggregate({ _avg: { rating: true } }),
  ]);
  const reviews = rows as unknown as { id: number; authorName: string; rating: number; comment: string; createdAt: Date; place: { name: string } | null }[];
  const avg = (agg as unknown as { _avg: { rating: number | null } })._avg.rating;
  return (
    <>
      <PageHeader title="Avis des visiteurs" description="Les avis sont publiés immédiatement. Supprimez ceux qui sont abusifs, hors sujet ou publicitaires." />
      <div className="admin-stagger mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Avis publiés" value={total as number} icon={Star} tone="yellow" />
        <StatCard label="Note moyenne" value={avg ? `${avg.toFixed(1).replace(".", ",")} / 5` : "—"} icon={Star} tone="green" />
      </div>
      {reviews.length ? (
        <ul className="admin-stagger space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="admin-lift rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-secondary font-bold text-secondary-foreground">{r.authorName.charAt(0).toUpperCase()}</span>
                  <div>
                    <p className="font-semibold">{r.authorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateLong(r.createdAt)}
                      {r.place && <span className="inline-flex items-center gap-1"> · <MapPin className="size-3.5" aria-hidden="true" />{r.place.name}</span>}
                    </p>
                  </div>
                </div>
                <span aria-label={`Note : ${r.rating} sur 5`} className="text-lg tracking-wider text-[#8A6D00] dark:text-flag-yellow">
                  {"★".repeat(r.rating)}<span className="text-muted-foreground/30">{"★".repeat(5 - r.rating)}</span>
                </span>
              </div>
              <p className="mt-3 whitespace-pre-line break-words">{r.comment}</p>
              <form action={deleteReview} className="mt-3 flex justify-end">
                <input type="hidden" name="id" value={r.id} />
                <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                  <Trash2 aria-hidden="true" /> Supprimer<span className="sr-only"> l&apos;avis de {r.authorName}</span>
                </Button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyNote icon={Star}>Aucun avis pour l&apos;instant.</EmptyNote>
      )}
      <Pagination page={page} pages={Math.max(1, Math.ceil((total as number) / per))} basePath="/admin/avis" />
    </>
  );
}
