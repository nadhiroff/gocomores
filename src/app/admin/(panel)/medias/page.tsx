import Link from "next/link";
import { ArrowLeft, ImageOff, Images, Pencil } from "lucide-react";
import { PhotoManager } from "@/components/admin/photo-manager";
import { EmptyNote, PageHeader, Panel, Pill } from "@/components/admin/ui";
import { PlaceImage } from "@/components/site/place-image";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/input";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Médiathèque" };

type Row = { id: number; name: string; coverImage: string | null; island: { localName: string }; images: { id: number; url: string; alt: string }[] };

export default async function AdminMedia({ searchParams }: { searchParams: Promise<{ lieu?: string; filtre?: string }> }) {
  const sp = await searchParams;
  const rows = (await prisma.place.findMany({
    select: { id: true, name: true, coverImage: true, island: { select: { localName: true } }, images: { orderBy: [{ order: "asc" }, { id: "asc" }], select: { id: true, url: true, alt: true } } },
    orderBy: { name: "asc" },
  })) as unknown as Row[];
  const selected = rows.find((r) => r.id === Number(sp.lieu));
  const total = rows.reduce((n, r) => n + r.images.length, 0);
  const withoutPhoto = rows.filter((r) => !r.images.length).length;
  const onlyEmpty = sp.filtre === "sans-photo";
  const list = onlyEmpty ? rows.filter((r) => !r.images.length) : [...rows].sort((a, b) => Number(!!a.images.length) - Number(!!b.images.length));

  return (
    <>
      <PageHeader
        crumbs={selected ? [{ href: "/admin/medias", label: "Médiathèque" }] : undefined}
        title={selected ? `Photos — ${selected.name}` : "Médiathèque"}
        description={selected ? "Ajoutez, réordonnez, décrivez ou supprimez les photos de ce lieu." : `${total} photo${total > 1 ? "s" : ""} sur ${rows.length} lieux. Choisissez un lieu pour gérer ses photos.`}
        actions={
          selected ? (
            <>
              <Button asChild variant="ghost"><Link href="/admin/medias"><ArrowLeft aria-hidden="true" /> Tous les lieux</Link></Button>
              <Button asChild variant="outline"><Link href={`/admin/lieux/${selected.id}`}><Pencil aria-hidden="true" /> Modifier le lieu</Link></Button>
            </>
          ) : undefined
        }
      />

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-4">
        <div className="min-w-60 flex-1">
          <label htmlFor="m-lieu" className="mb-1.5 block text-sm font-semibold">Gérer les photos de…</label>
          <NativeSelect id="m-lieu" name="lieu" defaultValue={selected?.id ?? ""}>
            <option value="" disabled>Choisir un lieu…</option>
            {rows.map((r) => <option key={r.id} value={r.id}>{r.name} — {r.island.localName} ({r.images.length})</option>)}
          </NativeSelect>
        </div>
        <Button type="submit">Ouvrir</Button>
      </form>

      {selected ? (
        <Panel>
          <PhotoManager key={selected.id} placeId={selected.id} placeName={selected.name} initial={selected.images} />
        </Panel>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filtre">
            <Button asChild size="sm" variant={onlyEmpty ? "ghost" : "secondary"}><Link href="/admin/medias" aria-current={!onlyEmpty ? "true" : undefined}>Tous les lieux</Link></Button>
            <Button asChild size="sm" variant={onlyEmpty ? "secondary" : "ghost"}><Link href="/admin/medias?filtre=sans-photo" aria-current={onlyEmpty ? "true" : undefined}>Sans photo ({withoutPhoto})</Link></Button>
          </div>
          {list.length ? (
            <ul className="admin-stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/medias?lieu=${r.id}`} className="admin-lift group block overflow-hidden rounded-2xl border bg-card hover:border-primary/60">
                    <span className="grid aspect-[16/9] grid-cols-3 grid-rows-2 gap-0.5 bg-muted">
                      {r.images.length ? (
                        r.images.slice(0, 3).map((img, i, shown) => (
                          <span key={img.id} className={cn("relative overflow-hidden", i === 0 ? (shown.length === 1 ? "col-span-3 row-span-2" : "col-span-2 row-span-2") : shown.length === 2 && "row-span-2")}>
                            <PlaceImage src={img.url} alt="" fill sizes={i === 0 ? "260px" : "130px"} className="object-cover transition-transform duration-500 group-hover:scale-105" />
                          </span>
                        ))
                      ) : (
                        <span className="col-span-3 row-span-2 grid place-items-center gap-1 text-muted-foreground">
                          <ImageOff className="size-7" aria-hidden="true" />
                        </span>
                      )}
                    </span>
                    <span className="flex items-center justify-between gap-2 p-3">
                      <span className="min-w-0">
                        <span className="block truncate font-bold">{r.name}</span>
                        <span className="block text-sm text-muted-foreground">{r.island.localName}</span>
                      </span>
                      {r.images.length ? <Pill tone="blue">{r.images.length} photo{r.images.length > 1 ? "s" : ""}</Pill> : <Pill tone="red">Aucune photo</Pill>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyNote icon={Images}>{onlyEmpty ? "Tous les lieux ont au moins une photo." : "Aucun lieu pour l'instant."}</EmptyNote>
          )}
        </>
      )}
    </>
  );
}
