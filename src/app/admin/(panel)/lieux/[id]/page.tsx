import { notFound } from "next/navigation";
import { DeletePlaceButton } from "@/components/admin/delete-place-button";
import { PlaceForm, type PlaceTab } from "@/components/admin/place-form";
import { PageHeader, Pill } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { getCategories, getIslands, getPlaceBySlug } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Modifier un lieu" };

const TAB_IDS: PlaceTab[] = ["identite", "contenu", "pratique", "carte", "photos"];

export default async function EditPlace({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ onglet?: string }> }) {
  const [{ id }, { onglet }] = await Promise.all([params, searchParams]);
  const pid = Number(id);
  if (!Number.isInteger(pid)) notFound();
  const row = (await prisma.place.findUnique({ where: { id: pid }, select: { slug: true, googleMapsUrl: true, islandId: true, categoryId: true } })) as
    | { slug: string; googleMapsUrl: string | null; islandId: number; categoryId: number }
    | null;
  if (!row) notFound();
  const [place, islands, categories] = await Promise.all([getPlaceBySlug(row.slug), getIslands(), getCategories()]);
  if (!place) notFound();
  const initialTab = TAB_IDS.find((t) => t === onglet) ?? "identite";

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/admin/lieux", label: "Lieux" }]}
        title={place.name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {place.island.localName} · {place.category.name}
            {place.status === "VERIFIED" ? <Pill tone="green">Vérifié</Pill> : <Pill tone="yellow">À confirmer</Pill>}
          </span>
        }
      />
      <PlaceForm
        key={place.id}
        islands={islands}
        categories={categories}
        initialTab={initialTab}
        images={place.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt }))}
        values={{
          id: place.id,
          name: place.name,
          slug: place.slug,
          islandId: row.islandId,
          categoryId: row.categoryId,
          summary: place.summary,
          history: place.history,
          lat: place.lat,
          lng: place.lng,
          googleMapsUrl: row.googleMapsUrl ?? "",
          status: place.status,
          verifiedAt: place.verifiedAt ? place.verifiedAt.toISOString().slice(0, 10) : "",
          practical: place.practical,
        }}
      />

      <section aria-labelledby="zone-danger" className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-destructive/40 bg-card p-5 sm:p-6">
        <div>
          <h2 id="zone-danger" className="text-lg font-bold">Supprimer ce lieu</h2>
          <p className="mt-1 text-sm text-muted-foreground">Action définitive : le lieu et ses photos disparaissent du site. Les avis liés sont conservés mais détachés du lieu.</p>
        </div>
        <DeletePlaceButton id={place.id} name={place.name} />
      </section>
    </>
  );
}
