import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/site/empty-state";
import { PageHero } from "@/components/site/page-hero";
import { Pagination } from "@/components/site/pagination";
import { ReviewForm } from "@/components/site/review-form";
import { ReviewItem } from "@/components/site/review-item";
import { StarRating } from "@/components/site/star-rating";
import { formatAverage, formatNumber, plural } from "@/lib/format";
import { getReviewStats, listReviews } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Avis des visiteurs",
  description: "Les avis libres des visiteurs des Comores : notes, commentaires, et formulaire pour partager votre expérience sans compte ni e-mail.",
  alternates: { canonical: "/avis" },
};

export default async function AvisPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const pageNum = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const [stats, list] = await Promise.all([getReviewStats(), listReviews({ page: pageNum, perPage: 10 })]);

  return (
    <>
      <PageHero eyebrow="Avis" title="Ce que disent les visiteurs">
        Des avis libres, publiés immédiatement. Pas de compte, pas d&apos;e-mail demandé.
      </PageHero>

      <div className="container-page grid gap-12 py-12 lg:grid-cols-[22rem_1fr] lg:py-16">
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start" aria-labelledby="synthese">
          <section className="rounded-xl border bg-card p-6">
            <h2 id="synthese" className="font-sans text-lg font-bold">Note moyenne</h2>
            {stats.count > 0 ? (
              <>
                <p className="mt-3 flex flex-wrap items-baseline gap-x-3">
                  <span className="font-serif text-5xl font-bold tabular-nums">{formatAverage(stats.average)}</span>
                  <span className="text-lg text-muted-foreground">· {formatNumber(stats.count)} {plural(stats.count, "avis", "avis")}</span>
                </p>
                <StarRating value={stats.average} size="size-6" className="mt-2" />
                <ul className="mt-6 space-y-2" aria-label="Répartition des notes">
                  {([5, 4, 3, 2, 1] as const).map((n) => {
                    const c = stats.distribution[n];
                    const pct = stats.count ? Math.round((c / stats.count) * 100) : 0;
                    return (
                      <li key={n} className="flex items-center gap-3 text-sm">
                        <span className="w-16 shrink-0 tabular-nums">{n} {n > 1 ? "étoiles" : "étoile"}</span>
                        <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                          <span className="block h-full rounded-full bg-[var(--ylang)]" style={{ width: `${pct}%` }} />
                        </span>
                        <span className="w-8 shrink-0 text-right tabular-nums text-muted-foreground">{c}</span>
                        <span className="sr-only"> ({pct} %)</span>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <p className="mt-3 text-muted-foreground">Pas encore de note : la moyenne apparaîtra dès le premier avis.</p>
            )}
          </section>
        </aside>

        <div className="space-y-12">
          <section aria-labelledby="liste-avis">
            <h2 id="liste-avis" className="text-3xl font-bold">Derniers avis</h2>
            <div className="mt-6 space-y-4">
              {list.reviews.length ? (
                list.reviews.map((r) => <ReviewItem key={r.id} review={r} />)
              ) : (
                <EmptyState icon={<MessageCircle className="size-10" aria-hidden="true" />} title="Aucun avis pour le moment.">
                  Soyez la première personne à partager votre expérience.
                </EmptyState>
              )}
            </div>
            <Pagination page={list.page} pages={list.pages} basePath="/avis" />
          </section>

          <section id="donner-mon-avis" aria-labelledby="titre-form" className="scroll-mt-24 rounded-xl border bg-card p-6 sm:p-8">
            <h2 id="titre-form" className="text-3xl font-bold">Donner mon avis</h2>
            <p className="mt-2 text-muted-foreground">Votre expérience aide les prochains voyageurs.</p>
            <div className="mt-6">
              <ReviewForm />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
