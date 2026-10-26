import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Compass, ExternalLink, MapPin, Ticket, CalendarRange } from "lucide-react";
import { JsonLd } from "@/components/site/json-ld";
import { MiniMap } from "@/components/map/mini-map";
import { CategoryIcon } from "@/components/site/category-icon";
import { EmptyState } from "@/components/site/empty-state";
import { IslandBadge } from "@/components/site/island-badge";
import { PlaceImage } from "@/components/site/place-image";
import { PlacePlaceholder } from "@/components/site/place-placeholder";
import { ReviewForm } from "@/components/site/review-form";
import { ReviewItem } from "@/components/site/review-item";
import { StarRating } from "@/components/site/star-rating";
import { VerificationBadge } from "@/components/site/verification-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAverage, formatDate } from "@/lib/format";
import { islandLetter } from "@/lib/islands";
import { getPlaceBySlug, getReviewStats, listReviews } from "@/lib/queries";
import { SITE } from "@/lib/site";
import type { PracticalInfo } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);
  if (!place) return { title: "Lieu introuvable", robots: { index: false } };
  const image = place.coverImage ?? undefined;
  return {
    title: place.name,
    description: place.summary,
    alternates: { canonical: `/destinations/${place.slug}` },
    openGraph: {
      type: "article",
      title: `${place.name} — ${place.island.localName}`,
      description: place.summary,
      url: `${SITE.url}/destinations/${place.slug}`,
      images: image ? [{ url: image, alt: place.coverAlt ?? place.name }] : undefined,
    },
  };
}

const PRACTICAL_ROWS: { key: keyof PracticalInfo; label: string; icon: typeof Compass }[] = [
  { key: "access", label: "Accès", icon: Compass },
  { key: "hours", label: "Horaires", icon: Clock },
  { key: "fares", label: "Tarifs", icon: Ticket },
  { key: "bestPeriod", label: "Meilleure période", icon: CalendarRange },
];

export default async function PlacePage({ params }: { params: Params }) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);
  if (!place) notFound();

  const [stats, reviews] = await Promise.all([getReviewStats(place.id), listReviews({ placeId: place.id, perPage: 5 })]);
  const gallery = place.images.length ? place.images : place.coverImage ? [{ id: 0, url: place.coverImage, alt: place.coverAlt ?? place.name, order: 0 }] : [];
  const paragraphs = place.history.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  const absolute = (u: string) => (u.startsWith("http") ? u : `${SITE.url}${u}`);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristAttraction",
          name: place.name,
          description: place.summary,
          url: `${SITE.url}/destinations/${place.slug}`,
          image: gallery.map((g) => absolute(g.url)),
          touristType: place.category.name,
          geo: { "@type": "GeoCoordinates", latitude: place.lat, longitude: place.lng },
          address: { "@type": "PostalAddress", addressLocality: place.island.localName, addressCountry: "KM" },
          containedInPlace: { "@type": "Place", name: place.island.name },
          ...(stats.count
            ? { aggregateRating: { "@type": "AggregateRating", ratingValue: Number(stats.average.toFixed(1)), reviewCount: stats.count, bestRating: 5, worstRating: 1 } }
            : {}),
        }}
      />

      <article>
        <header className="border-b bg-card">
          <div className="container-page py-8 sm:py-12">
            <nav aria-label="Fil d'Ariane" className="text-sm text-muted-foreground">
              <ol className="flex flex-wrap items-center gap-x-2">
                <li><Link href="/destinations" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">Destinations</Link></li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="font-medium text-foreground">{place.name}</li>
              </ol>
            </nav>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
              <IslandBadge island={place.island} />
              <Badge variant="outline">
                <CategoryIcon name={place.category.icon} className="size-3.5" /> {place.category.name}
              </Badge>
              <VerificationBadge status={place.status} verifiedAt={place.verifiedAt} />
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold sm:text-5xl">{place.name}</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{place.summary}</p>
          </div>
        </header>

        {gallery.length === 0 && (
          <div className="container-page py-8">
            <div className="h-56 overflow-hidden rounded-xl sm:h-72">
              <PlacePlaceholder color={place.island.color} icon={place.category.icon} large />
            </div>
          </div>
        )}
        {gallery.length > 0 && (
          <section aria-label="Galerie photos" className="container-page py-8">
            <ul className="grid gap-3 sm:grid-cols-3 sm:grid-rows-2">
              {gallery.slice(0, 3).map((img, i) => (
                <li key={img.id} className={i === 0 ? "sm:col-span-2 sm:row-span-2" : ""}>
                  <div className={`relative overflow-hidden rounded-xl bg-muted ${i === 0 ? "aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-96" : "aspect-[4/3]"}`}>
                    <PlaceImage
                      src={img.url}
                      alt={img.alt}
                      fill
                      priority={i === 0}
                      sizes={i === 0 ? "(min-width: 1024px) 768px, 100vw" : "(min-width: 1024px) 384px, 50vw"}
                      className="object-cover"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="container-page grid gap-12 pb-16 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-12">
            <section aria-labelledby="histoire">
              <h2 id="histoire" className="text-3xl font-bold">Histoire et contexte</h2>
              <div className="mt-4 space-y-4 text-[1.0625rem] leading-relaxed">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>

            <section aria-labelledby="infos">
              <h2 id="infos" className="text-3xl font-bold">Infos pratiques</h2>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                {PRACTICAL_ROWS.map(({ key, label, icon: Icon }) => {
                  const f = place.practical[key];
                  const uncertain = !f || f.toConfirm || !f.value;
                  return (
                    <div key={key} className="rounded-xl border bg-card p-5">
                      <dt className="flex items-center gap-2 font-semibold">
                        <Icon className="size-5 text-[var(--island-ndzuwani)]" aria-hidden="true" />
                        {label}
                      </dt>
                      <dd className="mt-2 space-y-2 text-[0.9375rem]">
                        {f?.value && <p>{f.value}</p>}
                        {uncertain && (
                          <Badge variant="toConfirm">Information à confirmer</Badge>
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </section>

            <section aria-labelledby="avis-lieu">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 id="avis-lieu" className="text-3xl font-bold">Avis sur ce lieu</h2>
                {stats.count > 0 && (
                  <p className="flex items-center gap-2">
                    <StarRating value={stats.average} size="size-5" />
                    <span className="font-semibold tabular-nums">{formatAverage(stats.average)}</span>
                    <span className="text-muted-foreground">· {stats.count} avis</span>
                  </p>
                )}
              </div>
              <div className="mt-5 space-y-4">
                {reviews.reviews.length ? (
                  reviews.reviews.map((r) => <ReviewItem key={r.id} review={r} />)
                ) : (
                  <EmptyState title="Aucun avis pour le moment.">Soyez la première personne à partager votre expérience.</EmptyState>
                )}
              </div>
              <div className="mt-8 rounded-xl border bg-card p-6">
                <h3 className="text-2xl font-semibold">Donner mon avis</h3>
                <div className="mt-5">
                  <ReviewForm placeSlug={place.slug} placeName={place.name} />
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start" aria-label="Localisation">
            <section aria-labelledby="coords" className="space-y-4 rounded-xl border bg-card p-5">
              <h2 id="coords" className="flex items-center gap-2 font-sans text-lg font-bold">
                <MapPin className="size-5 text-[var(--island-ngazidja)]" aria-hidden="true" /> Coordonnées
              </h2>
              <p className="font-mono text-sm tabular-nums">
                {place.lat.toFixed(5)}, {place.lng.toFixed(5)}
              </p>
              {place.status === "TO_CONFIRM" && <Badge variant="toConfirm">Position à confirmer</Badge>}
              <MiniMap lat={place.lat} lng={place.lng} color={place.island.color} letter={islandLetter(place.island.slug)} label={`${place.name}, ${place.island.localName}`} />
              {place.googleMapsUrl && (
                <Button asChild variant="outline" className="w-full">
                  <a href={place.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    Ouvrir dans Google Maps <ExternalLink aria-hidden="true" />
                    <span className="sr-only">(nouvel onglet)</span>
                  </a>
                </Button>
              )}
              <Button asChild variant="ghost" className="w-full">
                <Link href="/carte">Voir sur la carte complète</Link>
              </Button>
            </section>
            {place.verifiedAt && (
              <p className="text-sm text-muted-foreground">Fiche vérifiée le {formatDate(place.verifiedAt)}. Une erreur ? <Link href="/contact#signaler" className="font-semibold text-link underline underline-offset-4">Signalez-la</Link>.</p>
            )}
          </aside>
        </div>
      </article>
    </>
  );
}
