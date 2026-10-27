import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CategoryIcon } from "@/components/site/category-icon";
import { IslandBadge } from "@/components/site/island-badge";
import { PlaceImage } from "@/components/site/place-image";
import { PlacePlaceholder } from "@/components/site/place-placeholder";
import { VerificationBadge } from "@/components/site/verification-badge";
import type { PlaceCardData } from "@/lib/types";

export function PlaceCard({ place, priority = false }: { place: PlaceCardData; priority?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-[var(--shadow-sm)] transition-shadow duration-200 hover:shadow-[var(--shadow-lg)] focus-within:shadow-[var(--shadow-lg)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {place.coverImage ? (
          <PlaceImage
            src={place.coverImage}
            alt={place.coverAlt ?? place.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 352px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <PlacePlaceholder color={place.island.color} icon={place.category.icon} name={place.name} className="transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100" />
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm">
          <CategoryIcon name={place.category.icon} className="size-3.5" />
          {place.category.name}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <IslandBadge island={place.island} showLocal={false} />
        <h3 className="font-serif text-xl font-semibold leading-snug">
          {/* Pas de préchargement automatique : une page de lieux affiche jusqu'à 18 cartes (pages pré-générées, rapides au clic). */}
          <Link
            prefetch={false}
            href={`/destinations/${place.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-offset-4"
          >
            {place.name}
          </Link>
        </h3>
        <p className="line-clamp-3 text-[0.9375rem] text-muted-foreground">{place.summary}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-2">
          <VerificationBadge status={place.status} verifiedAt={place.verifiedAt} />
          {place.googleMapsUrl && (
            <a
              href={place.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-flex min-h-11 items-center gap-1 rounded-md px-1 text-sm font-semibold text-link underline-offset-4 hover:underline"
            >
              Google Maps
              <ArrowUpRight className="size-4" aria-hidden="true" />
              <span className="sr-only"> — {place.name} (nouvel onglet)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
