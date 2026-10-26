import Link from "next/link";
import { ExternalLink, ImageOff, MapPin, Pencil, Plus, Search } from "lucide-react";
import { EmptyNote, PageHeader, Pill } from "@/components/admin/ui";
import { PlaceImage } from "@/components/site/place-image";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect } from "@/components/ui/input";
import { prisma } from "@/lib/db";
import { islandColor } from "@/lib/island-colors";
import { getCategories, getIslands } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Lieux" };

type Row = {
  id: number; slug: string; name: string; status: "VERIFIED" | "TO_CONFIRM"; coverImage: string | null; coverAlt: string | null; updatedAt: Date;
  island: { slug: string; localName: string; color: string }; category: { name: string }; _count: { images: number };
};

export default async function AdminPlaces({ searchParams }: { searchParams: Promise<{ q?: string; ile?: string; categorie?: string; statut?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 100) ?? "";
  const status = sp.statut === "VERIFIED" || sp.statut === "TO_CONFIRM" ? sp.statut : "";
  const [islands, categories, rows, total] = await Promise.all([
    getIslands(),
    getCategories(),
    prisma.place.findMany({
      where: {
        ...(q ? { OR: [{ name: { contains: q } }, { summary: { contains: q } }] } : {}),
        ...(sp.ile ? { island: { slug: sp.ile } } : {}),
        ...(sp.categorie ? { category: { slug: sp.categorie } } : {}),
        ...(status ? { status } : {}),
      },
      include: { island: { select: { slug: true, localName: true, color: true } }, category: { select: { name: true } }, _count: { select: { images: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.place.count(),
  ]);
  const places = rows as unknown as Row[];
  const filtered = !!(q || sp.ile || sp.categorie || status);
  const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

  return (
    <>
      <PageHeader
        title="Lieux"
        description={`${total as number} lieu${(total as number) > 1 ? "x" : ""} sur le site. Cliquez sur un lieu pour modifier son contenu ou ses photos.`}
        actions={<Button asChild><Link href="/admin/lieux/nouveau"><Plus aria-hidden="true" /> Nouveau lieu</Link></Button>}
      />

      <form method="get" role="search" className="mb-6 grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <div className="relative">
          <label htmlFor="f-q" className="sr-only">Rechercher un lieu</label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id="f-q" name="q" type="search" placeholder="Rechercher un lieu…" defaultValue={q} className="pl-10" />
        </div>
        <div>
          <label htmlFor="f-ile" className="sr-only">Île</label>
          <NativeSelect id="f-ile" name="ile" defaultValue={sp.ile ?? ""}>
            <option value="">Îles</option>
            {islands.map((i) => <option key={i.id} value={i.slug}>{i.localName}</option>)}
          </NativeSelect>
        </div>
        <div>
          <label htmlFor="f-cat" className="sr-only">Catégorie</label>
          <NativeSelect id="f-cat" name="categorie" defaultValue={sp.categorie ?? ""}>
            <option value="">Catégories</option>
            {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </NativeSelect>
        </div>
        <div>
          <label htmlFor="f-st" className="sr-only">Statut</label>
          <NativeSelect id="f-st" name="statut" defaultValue={status}>
            <option value="">Statuts</option>
            <option value="VERIFIED">Vérifiés</option>
            <option value="TO_CONFIRM">À confirmer</option>
          </NativeSelect>
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="secondary" className="flex-1">Filtrer</Button>
          {filtered && <Button asChild variant="ghost"><Link href="/admin/lieux">Effacer</Link></Button>}
        </div>
      </form>

      {places.length ? (
        <ul className="admin-stagger grid gap-3">
          {places.map((p) => (
            <li key={p.id} className="admin-lift group flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-3 pr-4 hover:border-primary/50 sm:flex-nowrap">
              <Link href={`/admin/lieux/${p.id}`} className="flex min-w-0 flex-1 items-center gap-4" aria-label={`Modifier ${p.name}`}>
                <span className="relative block aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:w-28">
                  {p.coverImage ? (
                    <PlaceImage src={p.coverImage} alt="" fill sizes="112px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <span className="grid h-full place-items-center text-muted-foreground"><ImageOff className="size-6" aria-hidden="true" /></span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-base font-bold">{p.name}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: islandColor(p.island) }} />
                      {p.island.localName}
                    </span>
                    <span>{p.category.name}</span>
                    <span>{p._count.images} photo{p._count.images > 1 ? "s" : ""}</span>
                    <span>Modifié le {fmt.format(p.updatedAt)}</span>
                  </span>
                </span>
              </Link>
              <div className="flex items-center gap-2">
                {p.status === "VERIFIED" ? <Pill tone="green">Vérifié</Pill> : <Pill tone="yellow">À confirmer</Pill>}
                <Button asChild variant="ghost" size="icon" aria-label={`Voir ${p.name} sur le site (nouvel onglet)`}>
                  <a href={`/destinations/${p.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden="true" /></a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/lieux/${p.id}`}><Pencil aria-hidden="true" /> Modifier<span className="sr-only"> {p.name}</span></Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyNote icon={MapPin}>{filtered ? "Aucun lieu ne correspond à ces filtres." : "Aucun lieu pour l'instant. Créez le premier !"}</EmptyNote>
      )}
    </>
  );
}
