import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Cookie, MessageSquareHeart, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Button } from "@/components/ui/button";
import { formatDateLong } from "@/lib/format";
import { prisma } from "@/lib/db";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "À propos",
  description: "La mission de GoComores, ses engagements (fiabilité, sécurité, avis libres) et la personne qui a conçu ce projet indépendant.",
  alternates: { canonical: "/a-propos" },
};

async function lastVerification(): Promise<Date | null> {
  try {
    const row = await prisma.place.findFirst({ where: { status: "VERIFIED", verifiedAt: { not: null } }, orderBy: { verifiedAt: "desc" }, select: { verifiedAt: true } });
    return (row as { verifiedAt: Date | null } | null)?.verifiedAt ?? null;
  } catch {
    return null;
  }
}

export default async function AProposPage() {
  const last = await lastVerification();
  return (
    <>
      <PageHero eyebrow="À propos" title="Un guide indépendant, fait avec soin">
        GoComores aide les voyageurs à préparer leur séjour dans l&apos;archipel, sans publicité ni compte à créer.
      </PageHero>

      <div className="container-page max-w-4xl space-y-16 py-14 lg:py-20">
        <section aria-labelledby="mission">
          <h2 id="mission" className="text-3xl font-bold">Notre mission</h2>
          <div className="mt-4 space-y-4 text-lg leading-relaxed">
            <p>Les Comores sont encore peu documentées pour les voyageurs : informations dispersées, parfois périmées, rarement en français. GoComores rassemble au même endroit les lieux à visiter de Ngazidja, Ndzuwani et Mwali, avec une carte, des informations pratiques et les retours de celles et ceux qui y sont allés.</p>
            <p>Le but n&apos;est pas de tout dire, mais de dire juste : quand une information n&apos;est pas confirmée, le site l&apos;indique clairement.</p>
          </div>
        </section>

        <section aria-labelledby="engagements">
          <h2 id="engagements" className="text-3xl font-bold">Nos engagements</h2>
          <ul className="mt-6 grid gap-5 md:grid-cols-3">
            <li className="rounded-xl border bg-card p-6">
              <BadgeCheck className="size-7 text-[var(--island-mwali)]" aria-hidden="true" />
              <h3 className="mt-3 text-xl font-semibold">Fiabilité</h3>
              <p className="mt-2 text-muted-foreground">
                Chaque lieu porte un statut. « Vérifié le JJ/MM/AAAA » signifie que les informations de base ont été recoupées avec une source ; sinon, la mention « Information à confirmer » s&apos;affiche.
                {last && <> Dernière vérification enregistrée : {formatDateLong(last)}.</>}
              </p>
            </li>
            <li className="rounded-xl border bg-card p-6">
              <ShieldCheck className="size-7 text-[var(--island-ndzuwani)]" aria-hidden="true" />
              <h3 className="mt-3 text-xl font-semibold">Sécurité</h3>
              <p className="mt-2 text-muted-foreground">Un bandeau rappelle de consulter les recommandations officielles avant de partir. Le site ne remplace ni les autorités, ni l&apos;avis d&apos;un professionnel.</p>
            </li>
            <li className="rounded-xl border bg-card p-6">
              <MessageSquareHeart className="size-7 text-[var(--island-ngazidja)]" aria-hidden="true" />
              <h3 className="mt-3 text-xl font-semibold">Avis libres</h3>
              <p className="mt-2 text-muted-foreground">Pas de compte, pas d&apos;e-mail demandé, aucun cookie de suivi, aucune revente de données. Votre avis est publié tel quel ; seuls les contenus illicites sont retirés.</p>
            </li>
          </ul>
          <p className="mt-5 flex items-start gap-2 text-sm text-muted-foreground">
            <Cookie className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Voir le détail dans la <Link href="/confidentialite" className="font-semibold text-link underline underline-offset-4">politique de confidentialité</Link>.
          </p>
        </section>

        <section aria-labelledby="concepteur" className="rounded-2xl border bg-card p-7 sm:p-10">
          <p className="eyebrow">Concepteur</p>
          <h2 id="concepteur" className="mt-1 text-3xl font-bold">Qui est derrière GoComores ?</h2>
          <div className="mt-5 space-y-4 text-lg leading-relaxed">
            {/* À REMPLIR par le concepteur : nom, parcours, lien avec les Comores. */}
            <p>Je m&apos;appelle <strong>[À REMPLIR : votre nom]</strong>. <span className="rounded bg-[#FEF3C7] px-1.5 py-0.5 text-base text-[#78350F]">[À REMPLIR : votre texte à la première personne — d&apos;où vous venez, pourquoi ce site, ce qui vous lie aux îles.]</span></p>
            <p className="font-serif text-2xl font-semibold leading-snug text-[var(--island-ngazidja)]">Ce projet n&apos;est pas une entreprise. C&apos;est un geste.</p>
          </div>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/contact">Me écrire</Link>
          </Button>
        </section>
      </div>
    </>
  );
}
