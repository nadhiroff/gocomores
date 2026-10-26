import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Éditeur, hébergement, propriété intellectuelle et responsabilité du site GoComores.",
  alternates: { canonical: "/mentions-legales" },
};

const TODO = "rounded bg-[#FEF3C7] px-1.5 py-0.5 text-[#78350F]";

export default function MentionsLegalesPage() {
  return (
    <>
      <PageHero eyebrow="Légal" title="Mentions légales" />
      <div className="container-page max-w-3xl space-y-10 py-14 text-[1.0625rem] leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_p]:mt-3">
        <section>
          <h2>Éditeur du site</h2>
          <p>{SITE.name} est un projet personnel et non commercial, édité à titre individuel par <span className={TODO}>[À REMPLIR : nom et prénom de l&apos;éditeur]</span>.</p>
          <p>Contact : <a className="font-semibold text-link underline underline-offset-4 [overflow-wrap:anywhere]" href={`mailto:${SITE.email}`}>{SITE.email}</a> ou via la <Link className="font-semibold text-link underline underline-offset-4" href="/contact">page de contact</Link>.</p>
          <p>Directeur de la publication : <span className={TODO}>[À REMPLIR]</span>.</p>
        </section>
        <section>
          <h2>Hébergement</h2>
          <p><span className={TODO}>[À REMPLIR : nom, adresse et site de l&apos;hébergeur]</span></p>
        </section>
        <section>
          <h2>Propriété intellectuelle</h2>
          <p>Les textes et la mise en page de {SITE.name} sont originaux et protégés. Toute reproduction sans autorisation écrite est interdite, sauf courte citation avec mention de la source.</p>
          <p>Les photos des lieux proviennent de Wikimedia Commons et restent la propriété de leurs auteurs. Elles sont utilisées sous licences libres (Creative Commons ou domaine public) : auteurs et licences sont détaillés sur la page <Link className="font-semibold text-link underline underline-offset-4" href="/credits-photos">Crédits photos</Link>.</p>
          <p>Les fonds de carte proviennent d&apos;OpenStreetMap et de ses contributeurs (licence ODbL).</p>
          <p>Les photos proposées par des visiteurs ne sont publiées qu&apos;avec l&apos;accord de leur auteur, qui est crédité.</p>
        </section>
        <section>
          <h2>Contenus des visiteurs</h2>
          <p>Les avis sont publiés immédiatement sous la responsabilité de leurs auteurs. Tout contenu illicite, diffamatoire ou injurieux peut être retiré sur signalement via la page de contact.</p>
        </section>
        <section>
          <h2>Responsabilité</h2>
          <p>Nous apportons le plus grand soin aux informations publiées et signalons celles qui restent « à confirmer ». Elles peuvent néanmoins être incomplètes ou dépassées : consultez toujours les sources officielles avant de voyager. {SITE.name} ne saurait être tenu responsable des conséquences d&apos;un voyage préparé à partir de ce seul site.</p>
          <p>Les liens vers des sites tiers (Google Maps, par exemple) sont fournis à titre indicatif ; leur contenu n&apos;engage pas {SITE.name}.</p>
        </section>
        <p className="text-sm text-muted-foreground">Les mentions encadrées en jaune sont à compléter par l&apos;éditeur avant la mise en ligne.</p>
      </div>
    </>
  );
}
