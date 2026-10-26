import { notFound } from "next/navigation";
import { deletePlace, deletePlaceImage } from "@/actions/admin";
import { PlaceForm } from "@/components/admin/place-form";
import { PlaceImage } from "@/components/site/place-image";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getCategories, getIslands, getPlaceBySlug } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Modifier un lieu" };

export default async function EditPlace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pid = Number(id);
  if (!Number.isInteger(pid)) notFound();
  const row = (await prisma.place.findUnique({ where: { id: pid }, select: { slug: true, googleMapsUrl: true, coverAlt: true, islandId: true, categoryId: true } })) as
    | { slug: string; googleMapsUrl: string | null; coverAlt: string | null; islandId: number; categoryId: number }
    | null;
  if (!row) notFound();
  const [place, islands, categories] = await Promise.all([getPlaceBySlug(row.slug), getIslands(), getCategories()]);
  if (!place) notFound();

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Modifier : {place.name}</h1>
      <PlaceForm
        islands={islands}
        categories={categories}
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
          coverAlt: row.coverAlt ?? "",
          practical: place.practical,
        }}
      />

      <section aria-labelledby="photos-actuelles" className="mt-12">
        <h2 id="photos-actuelles" className="text-2xl font-bold">Photos actuelles</h2>
        {place.images.length ? (
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {place.images.map((img) => (
              <li key={img.id} className="rounded-xl border bg-card p-3">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                  <PlaceImage src={img.url} alt={img.alt} fill sizes="320px" className="object-cover" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{img.alt}</p>
                <form action={deletePlaceImage} className="mt-2">
                  <input type="hidden" name="id" value={img.id} />
                  <input type="hidden" name="placeId" value={place.id} />
                  <Button type="submit" variant="destructive" size="sm">Supprimer cette photo</Button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-muted-foreground">Aucune photo.</p>
        )}
      </section>

      <section aria-labelledby="zone-danger" className="mt-12 rounded-xl border-2 border-destructive/50 p-6">
        <h2 id="zone-danger" className="text-2xl font-bold">Supprimer ce lieu</h2>
        <p className="mt-2 text-muted-foreground">Action définitive. Les avis liés sont conservés mais détachés du lieu.</p>
        <form action={deletePlace} className="mt-4">
          <input type="hidden" name="id" value={place.id} />
          <Button type="submit" variant="destructive">Supprimer définitivement {place.name}</Button>
        </form>
      </section>
    </>
  );
}
