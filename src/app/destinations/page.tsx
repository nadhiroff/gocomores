import type { Metadata } from "next";
import Link from "next/link";
import { Search, SearchX } from "lucide-react";
import { EmptyState } from "@/components/site/empty-state";
import { PageHero } from "@/components/site/page-hero";
import { PlaceCard } from "@/components/site/place-card";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNumber, plural } from "@/lib/format";
import { getCategories, getIslands, listPlaces } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const revalidate = 60;

type SP = Promise<{ ile?: string; categorie?: string; q?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = !!(sp.ile || sp.categorie || sp.q);
  return {
    title: "Destinations",
    description: "Tous les lieux à visiter aux Comores : volcan Karthala, médinas, plages et parc marin, par île et par catégorie.",
    alternates: { canonical: "/destinations" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function DestinationsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const [islands, categories] = await Promise.all([getIslands(), getCategories()]);

  // Valeurs d'URL validées : un slug inconnu est ignoré.
  const ile = islands.some((i) => i.slug === sp.ile) ? sp.ile : undefined;
  const categorie = categories.some((c) => c.slug === sp.categorie) ? sp.categorie : undefined;
  const q = (sp.q ?? "").trim().slice(0, 80) || undefined;

  const places = await listPlaces({ ile, categorie, q });
  const hasFilters = !!(ile || categorie || q);

  const chipHref = (slug?: string) => {
    const p = new URLSearchParams();
    if (slug) p.set("ile", slug);
    if (categorie) p.set("categorie", categorie);
    if (q) p.set("q", q);
    const s = p.toString();
    return s ? `/destinations?${s}` : "/destinations";
  };
  const chip = "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition-colors";

  return (
    <>
      <PageHero eyebrow="Destinations" title="Explorez les îles">
        Ngazidja, Ndzuwani, Mwali : filtrez par île ou par catégorie. Chaque fiche indique ce qui est vérifié et ce qui reste à confirmer.
      </PageHero>

      <section className="section container-page !pt-10">
        <form action="/destinations" method="get" role="search" aria-label="Filtrer les destinations" className="rounded-xl border bg-card p-5 shadow-[var(--shadow-sm)]">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.4fr_auto] md:items-end">
            <div>
              <Label htmlFor="f-ile">Île</Label>
              <NativeSelect id="f-ile" name="ile" defaultValue={ile ?? ""}>
                <option value="">Toutes les îles</option>
                {islands.map((i) => (
                  <option key={i.id} value={i.slug}>
                    {i.localName} ({i.name})
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div>
              <Label htmlFor="f-cat">Catégorie</Label>
              <NativeSelect id="f-cat" name="categorie" defaultValue={categorie ?? ""}>
                <option value="">Toutes les catégories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div>
              <Label htmlFor="f-q">Recherche</Label>
              <Input id="f-q" name="q" type="search" defaultValue={q ?? ""} maxLength={80} placeholder="Ex. : plage, volcan, Moroni" enterKeyHint="search" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="default">
                <Search aria-hidden="true" /> Filtrer
              </Button>
              {hasFilters && (
                <Button asChild variant="ghost">
                  <Link href="/destinations">Réinitialiser</Link>
                </Button>
              )}
            </div>
          </div>
        </form>

        <nav aria-label="Filtrer par île" className="mt-5">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link prefetch={false} href={chipHref()} aria-current={!ile ? "true" : undefined} className={cn(chip, !ile ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent")}>
                Toutes
              </Link>
            </li>
            {islands.map((i) => (
              <li key={i.id}>
                <Link prefetch={false} href={chipHref(i.slug)} aria-current={ile === i.slug ? "true" : undefined} className={cn(chip, ile === i.slug ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent")}>
                  {i.localName}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p role="status" aria-live="polite" className="mt-8 text-lg font-semibold">
          {formatNumber(places.length)} {plural(places.length, "lieu trouvé", "lieux trouvés")}
        </p>

        {places.length ? (
          <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 2xl:grid-cols-4">
            {places.map((p, i) => (
              <li key={p.id}>
                <PlaceCard place={p} priority={i < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5">
            <EmptyState icon={<SearchX className="size-10" aria-hidden="true" />} title="Aucun lieu ne correspond à votre recherche.">
              <p>Essayez un autre mot-clé, ou retirez un filtre.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/destinations">Voir toutes les destinations</Link>
              </Button>
            </EmptyState>
          </div>
        )}
      </section>
    </>
  );
}
