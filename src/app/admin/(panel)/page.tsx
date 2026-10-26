import Link from "next/link";
import { CircleCheck, Clock, ImageOff, ImagePlus, Images, Mail, MapPin, Megaphone, Plus, Star, TriangleAlert } from "lucide-react";
import { EmptyNote, PageHeader, Panel, Pill, StatCard } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { islandColor } from "@/lib/island-colors";
import { getIslands } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Tableau de bord" };

type PlaceRow = { id: number; name: string; status: "VERIFIED" | "TO_CONFIRM"; coverImage: string | null; islandId: number; updatedAt: Date; _count: { images: number } };

export default async function AdminDashboard() {
  const session = await requireAdmin();
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const [placeRows, islands, imageCount, reviewAgg, recentReviews, messageCount, newMessages, recentMessages] = await Promise.all([
    prisma.place.findMany({
      select: { id: true, name: true, status: true, coverImage: true, islandId: true, updatedAt: true, _count: { select: { images: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    getIslands(),
    prisma.placeImage.count(),
    prisma.review.aggregate({ _avg: { rating: true }, _count: true }),
    prisma.review.findMany({ orderBy: { createdAt: "desc" }, take: 4, include: { place: { select: { name: true } } } }),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 4, select: { id: true, name: true, subject: true, createdAt: true } }),
  ]);
  const places = placeRows as unknown as PlaceRow[];
  const agg = reviewAgg as unknown as { _avg: { rating: number | null }; _count: number };
  const reviews = recentReviews as unknown as { id: number; authorName: string; rating: number; comment: string; place: { name: string } | null }[];
  const messages = recentMessages as unknown as { id: number; name: string; subject: string; createdAt: Date }[];

  const verified = places.filter((p) => p.status === "VERIFIED").length;
  const noPhoto = places.filter((p) => p._count.images === 0 && !p.coverImage);
  const toConfirm = places.filter((p) => p.status === "TO_CONFIRM");
  const perIsland = islands.map((i) => ({ ...i, count: places.filter((p) => p.islandId === i.id).length }));
  const maxIsland = Math.max(1, ...perIsland.map((i) => i.count));
  const fmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
  const firstName = (session.user?.name ?? "").split(" ")[0];

  const todo = [
    ...noPhoto.map((p) => ({ id: p.id, name: p.name, label: "Aucune photo", tone: "red" as const, icon: ImageOff, href: `/admin/lieux/${p.id}?onglet=photos` })),
    ...toConfirm.map((p) => ({ id: p.id, name: p.name, label: "Infos à confirmer", tone: "yellow" as const, icon: TriangleAlert, href: `/admin/lieux/${p.id}` })),
  ].slice(0, 8);

  return (
    <>
      <PageHeader
        title={firstName ? `Karibu, ${firstName} 👋` : "Tableau de bord"}
        description="Vue d'ensemble de GoComores : ce qui est en ligne, ce qui reste à faire."
        actions={
          <>
            <Button asChild variant="outline"><Link href="/admin/medias"><ImagePlus aria-hidden="true" /> Ajouter des photos</Link></Button>
            <Button asChild><Link href="/admin/lieux/nouveau"><Plus aria-hidden="true" /> Nouveau lieu</Link></Button>
          </>
        }
      />

      <div className="admin-stagger grid gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4">
        <StatCard label="Lieux publiés" value={places.length} icon={MapPin} tone="green" href="/admin/lieux" hint={`${verified} vérifié${verified > 1 ? "s" : ""}`} />
        <StatCard label="Photos" value={imageCount as number} icon={Images} tone="blue" href="/admin/medias" hint={`${noPhoto.length} lieu${noPhoto.length > 1 ? "x" : ""} sans photo`} />
        <StatCard label="Avis" value={agg._count} icon={Star} tone="yellow" href="/admin/avis" hint={agg._avg.rating ? `Note moyenne ${agg._avg.rating.toFixed(1).replace(".", ",")} / 5` : "Aucune note"} />
        <StatCard label="Messages" value={messageCount as number} icon={Mail} tone="red" href="/admin/messages" hint={`${newMessages as number} cette semaine`} />
      </div>

      <div className="admin-stagger mt-6 grid gap-6 lg:grid-cols-5 lg:gap-8">
        <Panel title="À traiter" id="todo" description="Les lieux qui méritent votre attention en priorité." className="lg:col-span-3">
          {todo.length ? (
            <ul className="divide-y">
              {todo.map((t) => (
                <li key={`${t.label}-${t.id}`}>
                  <Link href={t.href} className="group flex min-h-12 items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/60">
                    <t.icon className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="flex-1 font-medium transition-transform duration-200 group-hover:translate-x-1">{t.name}</span>
                    <Pill tone={t.tone}>{t.label}</Pill>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyNote icon={CircleCheck}>Tout est à jour. Beau travail !</EmptyNote>
          )}
        </Panel>

        <Panel title="Lieux par île" id="iles" className="lg:col-span-2">
          <ul className="space-y-4">
            {perIsland.map((i) => (
              <li key={i.id}>
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: islandColor(i) }} />
                    {i.localName} <span className="font-normal text-muted-foreground">({i.name})</span>
                  </span>
                  <span className="tabular-nums font-semibold">{i.count}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div className="admin-bar h-full rounded-full" style={{ width: `${(i.count / maxIsland) * 100}%`, background: islandColor(i) }} />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <Button asChild variant="secondary" size="sm"><Link href="/admin/alerte"><Megaphone aria-hidden="true" /> Bandeau</Link></Button>
            <Button asChild variant="secondary" size="sm"><Link href="/admin/lieux?statut=TO_CONFIRM"><Clock aria-hidden="true" /> À confirmer</Link></Button>
          </div>
        </Panel>

        <Panel title="Derniers avis" id="derniers-avis" className="lg:col-span-3" actions={<Link href="/admin/avis" className="text-sm font-semibold text-link hover:underline">Tout voir</Link>}>
          {reviews.length ? (
            <ul className="divide-y">
              {reviews.map((r) => (
                <li key={r.id} className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-semibold">{r.authorName}{r.place && <span className="font-normal text-muted-foreground"> · {r.place.name}</span>}</span>
                    <span aria-label={`${r.rating} sur 5`} className="font-semibold text-[#8A6D00] dark:text-flag-yellow">{"★".repeat(r.rating)}<span className="text-muted-foreground/40">{"★".repeat(5 - r.rating)}</span></span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.comment}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyNote icon={Star}>Aucun avis pour l&apos;instant.</EmptyNote>
          )}
        </Panel>

        <Panel title="Derniers messages" id="derniers-messages" className="lg:col-span-2" actions={<Link href="/admin/messages" className="text-sm font-semibold text-link hover:underline">Tout voir</Link>}>
          {messages.length ? (
            <ul className="divide-y">
              {messages.map((m) => (
                <li key={m.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{m.subject}</span>
                    <span className="block text-muted-foreground">{m.name}</span>
                  </span>
                  <span className="shrink-0 text-muted-foreground">{fmt.format(m.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyNote icon={Mail}>Aucun message.</EmptyNote>
          )}
        </Panel>
      </div>
    </>
  );
}
