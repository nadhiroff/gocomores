import { deleteReview } from "@/actions/admin";
import { Pagination } from "@/components/site/pagination";
import { StarRating } from "@/components/site/star-rating";
import { Button } from "@/components/ui/button";
import { formatDateLong } from "@/lib/format";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Avis" };

export default async function AdminReviews({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const per = 20;
  const [rows, total] = await Promise.all([
    prisma.review.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * per, take: per, include: { place: { select: { name: true } } } }),
    prisma.review.count(),
  ]);
  const reviews = rows as unknown as { id: number; authorName: string; rating: number; comment: string; createdAt: Date; place: { name: string } | null }[];
  return (
    <>
      <h1 className="text-3xl font-bold">Avis ({total as number})</h1>
      <ul className="mt-6 space-y-4">
        {reviews.map((r) => (
          <li key={r.id} className="rounded-xl border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{r.authorName} <span className="font-normal text-muted-foreground">· {formatDateLong(r.createdAt)}{r.place ? ` · ${r.place.name}` : ""}</span></p>
              <StarRating value={r.rating} />
            </div>
            <p className="mt-2 whitespace-pre-line break-words">{r.comment}</p>
            <form action={deleteReview} className="mt-3">
              <input type="hidden" name="id" value={r.id} />
              <Button type="submit" variant="destructive" size="sm">Supprimer<span className="sr-only"> l&apos;avis de {r.authorName}</span></Button>
            </form>
          </li>
        ))}
        {!reviews.length && <li className="text-muted-foreground">Aucun avis.</li>}
      </ul>
      <Pagination page={page} pages={Math.max(1, Math.ceil((total as number) / per))} basePath="/admin/avis" />
    </>
  );
}
