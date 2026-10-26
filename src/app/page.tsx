import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ChevronDown, MessageSquareHeart, ShieldCheck } from "lucide-react";
import { ComorosFlag } from "@/components/site/comoros-flag";
import { CountUp } from "@/components/site/count-up";
import { EmptyState } from "@/components/site/empty-state";
import { JsonLd } from "@/components/site/json-ld";
import { PlaceCard } from "@/components/site/place-card";
import { ReviewItem } from "@/components/site/review-item";
import { StarRating } from "@/components/site/star-rating";
import { Button } from "@/components/ui/button";
import { formatAverage } from "@/lib/format";
import { HERO_PHOTO } from "@/lib/photo-credits";
import { getHomeStats, getReviewStats, listPlaces, listReviews } from "@/lib/queries";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

const COMMITMENTS = [
  {
    n: "01",
    icon: BadgeCheck,
    title: "Fiabilité",
    text: "Chaque lieu indique s'il a été vérifié, et à quelle date. Ce qui n'est pas confirmé est signalé « Information à confirmer » : jamais présenté comme un fait.",
  },
  {
    n: "02",
    icon: ShieldCheck,
    title: "Sécurité",
    text: "Aucun cookie de suivi, aucun outil d'analyse tiers. Un bandeau rappelle de consulter les recommandations officielles (volcan, saison cyclonique, formalités) avant de partir.",
  },
  {
    n: "03",
    icon: MessageSquareHeart,
    title: "Avis libres",
    text: "Pas de compte, pas d'e-mail, pas de filtre préalable : votre avis est publié tout de suite. Seuls les contenus illicites ou injurieux sont retirés après coup.",
  },
];

export default async function HomePage() {
  const [places, stats, reviewStats, latest] = await Promise.all([
    listPlaces({}, 6),
    getHomeStats(),
    getReviewStats(),
    listReviews({ perPage: 3 }),
  ]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE.name,
          url: SITE.url,
          inLanguage: "fr",
          description: SITE.description,
        }}
      />

      {/* HERO */}
      <section className="hero-aurora relative isolate flex min-h-[calc(100dvh-4rem)] flex-col justify-center overflow-hidden text-white">
        {/* Le cœlacanthe, « fossile vivant » des eaux comoriennes, en fond décoratif. */}
        <div aria-hidden="true" className="hero-photo absolute inset-0 -z-20 lg:left-[38%]">
          <Image
            src={HERO_PHOTO.src}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 70vw, 100vw"
            className="object-cover object-center opacity-35 lg:opacity-80"
          />
        </div>
        <div className="container-page py-20">
          <div className="fade-up flex items-center gap-3">
            <ComorosFlag className="h-7 w-auto rounded-sm shadow-md ring-1 ring-white/30" />
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#FFD100]">Bienvenue aux Comores</p>
          </div>
          <h1 className="fade-up-2 mt-5 max-w-3xl text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">Découvrez les Comores</h1>
          <p className="fade-up-3 mt-6 max-w-xl text-lg text-white/90 sm:text-xl">
            Les îles à visiter, de Ngazidja à Mwali. Carte, infos pratiques et avis des visiteurs.
          </p>
          <div className="fade-up-3 mt-9 flex flex-wrap gap-3">
            <Button asChild variant="cta" size="lg">
              <Link href="/destinations">
                Voir les destinations <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="onDark" size="lg">
              <Link href="/a-propos">En savoir plus</Link>
            </Button>
          </div>
        </div>
        <a href="#decouvrir" className="scroll-cue absolute bottom-6 left-1/2 inline-flex min-h-11 -translate-x-1/2 flex-col items-center gap-1 rounded-lg px-4 text-xs font-semibold uppercase tracking-widest text-white/90 hover:text-white">
          Défiler
          <ChevronDown className="size-5" aria-hidden="true" />
        </a>
        <p className="absolute bottom-2 right-3 hidden text-xs text-white/60 sm:block">
          Cœlacanthe (Latimeria chalumnae) · Photo : {HERO_PHOTO.author},{" "}
          <Link href="/credits-photos" className="underline underline-offset-2 hover:text-white">
            {HERO_PHOTO.license}
          </Link>
        </p>
      </section>

      {/* À DÉCOUVRIR */}
      <section id="decouvrir" className="section container-page">
        <p className="eyebrow">À découvrir</p>
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Des lieux pour chaque voyage</h2>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">Volcans, médinas, plages et réserves marines : une sélection de lieux, chacun avec son niveau de vérification.</p>
        {places.length ? (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {places.map((p, i) => (
              <li key={p.id}>
                <PlaceCard place={p} priority={i < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10">
            <EmptyState title="Aucune destination pour le moment">Les premiers lieux arrivent bientôt.</EmptyState>
          </div>
        )}
        <div className="mt-10 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/destinations">Voir toutes les destinations</Link>
          </Button>
        </div>
      </section>

      {/* CHIFFRES */}
      <section aria-label="GoComores en chiffres" className="bg-[#0C4A6E] text-white dark:bg-[#0B2A40]">
        <dl className="container-page grid grid-cols-2 gap-x-6 gap-y-10 py-14 text-center lg:grid-cols-4">
          {[
            { v: stats.verified, s: "", l: stats.verified > 1 ? "Lieux vérifiés" : "Lieu vérifié" },
            { v: stats.islands, s: "", l: "Îles à explorer" },
            { v: 100, s: " %", l: "Avis libres" },
            { v: 0, s: "", l: "Cookie de suivi" },
          ].map((s) => (
            <div key={s.l} className="flex flex-col-reverse gap-2">
              <dt className="text-sm font-medium uppercase tracking-wider text-white/85">{s.l}</dt>
              <dd className="font-serif text-5xl font-bold tabular-nums text-[#FFD100] sm:text-6xl">
                <CountUp value={s.v} suffix={s.s} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ENGAGEMENTS */}
      <section className="section container-page">
        <p className="eyebrow">Nos engagements</p>
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Pourquoi GoComores ?</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3 lg:gap-8">
          {COMMITMENTS.map((c) => (
            <li key={c.n} className="rounded-xl border bg-card p-7 shadow-[var(--shadow-sm)]">
              <div className="flex items-center justify-between">
                <span className="font-serif text-4xl font-bold text-[var(--island-ngazidja)]" aria-hidden="true">{c.n}</span>
                <c.icon className="size-7 text-[var(--island-ndzuwani)]" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-2xl font-semibold">
                <span className="sr-only">{c.n}. </span>
                {c.title}
              </h3>
              <p className="mt-3 text-muted-foreground">{c.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* AVIS */}
      <section className="bg-secondary/60 dark:bg-secondary/30">
        <div className="section container-page">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Avis des visiteurs</p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Votre avis compte</h2>
            </div>
            {reviewStats.count > 0 && (
              <p className="flex items-center gap-3 text-lg">
                <StarRating value={reviewStats.average} size="size-5" />
                <span className="font-semibold tabular-nums">{formatAverage(reviewStats.average)}</span>
                <span className="text-muted-foreground">· {reviewStats.count} avis</span>
              </p>
            )}
          </div>
          <div className="mt-8">
            {latest.reviews.length ? (
              <ul className="grid gap-5 md:grid-cols-3 lg:gap-8">
                {latest.reviews.map((r) => (
                  <li key={r.id}>
                    <ReviewItem review={r} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="Aucun avis pour le moment.">Soyez la première personne à partager votre expérience.</EmptyState>
            )}
          </div>
          <div className="mt-8 flex flex-col items-start gap-3">
            <Button asChild variant="cta" size="lg">
              <Link href="/avis#donner-mon-avis">Donner mon avis</Link>
            </Button>
            <p className="text-sm text-muted-foreground">Moins d&apos;une minute · Aucun e-mail demandé · Votre nom ou pseudo sera visible</p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="hero-aurora text-white">
        <div className="container-page flex flex-col items-center gap-6 py-20 text-center">
          <h2 className="max-w-2xl text-3xl font-bold sm:text-5xl">Prêt à découvrir les Comores ?</h2>
          <p className="max-w-xl text-lg text-white/90">Une question, un lieu à suggérer, une photo à proposer : écrivez-nous.</p>
          <Button asChild variant="cta" size="lg">
            <Link href="/contact">
              Nous contacter <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
