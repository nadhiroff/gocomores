import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Confidentialité",
  description: "GoComores n'utilise aucun cookie de suivi ni outil d'analyse tiers. Voici les données traitées et vos droits.",
  alternates: { canonical: "/confidentialite" },
};

const TODO = "rounded bg-[#FEF3C7] px-1.5 py-0.5 text-[#78350F]";

export default function ConfidentialitePage() {
  return (
    <>
      <PageHero eyebrow="Légal" title="Politique de confidentialité">
        En bref : pas de cookie de suivi, pas d&apos;analytics, pas de revente de données.
      </PageHero>
      <div className="container-page max-w-3xl space-y-10 py-14 text-[1.0625rem] leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_li]:mt-2 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6">
        <section>
          <h2>Ce que nous ne faisons pas</h2>
          <ul>
            <li>Aucun cookie de suivi ni de publicité.</li>
            <li>Aucun outil d&apos;analyse ou de statistiques tiers.</li>
            <li>Aucune revente ni cession de données.</li>
            <li>Aucune police chargée depuis un service externe : elles sont hébergées avec le site.</li>
          </ul>
        </section>

        <section>
          <h2>Données que vous nous confiez</h2>
          <ul>
            <li><strong>Avis :</strong> pseudo, note et commentaire, affichés publiquement. Aucune adresse e-mail n&apos;est demandée.</li>
            <li><strong>Formulaire de contact :</strong> nom, adresse e-mail, sujet et message, utilisés uniquement pour vous répondre.</li>
            <li><strong>Protection contre les abus :</strong> pour limiter le spam, nous conservons une empreinte chiffrée (HMAC) de votre adresse IP, jamais l&apos;adresse elle-même. Elle ne permet pas de vous identifier ni de vous suivre.</li>
          </ul>
          <p>Durée de conservation : <span className={TODO}>[À REMPLIR : durée de conservation des messages et des empreintes]</span>.</p>
        </section>

        <section>
          <h2>Cartes et géolocalisation</h2>
          <ul>
            <li>Les cartes affichent des tuiles d&apos;OpenStreetMap : en consultant une carte, votre navigateur contacte les serveurs d&apos;OpenStreetMap, qui reçoivent votre adresse IP (voir leur politique de confidentialité).</li>
            <li>Le bouton « Ma position » demande l&apos;accès à votre position uniquement lorsque vous cliquez dessus. Elle reste dans votre navigateur et n&apos;est ni envoyée ni enregistrée par {SITE.name}.</li>
            <li>Les liens « Google Maps » ouvrent un service tiers dans un nouvel onglet, uniquement si vous cliquez.</li>
          </ul>
        </section>

        <section>
          <h2>Stockage local</h2>
          <p>Votre choix de thème clair ou sombre est mémorisé dans le stockage local de votre navigateur, sans être transmis au serveur. Ce n&apos;est pas un cookie de suivi.</p>
        </section>

        <section>
          <h2>Vos droits</h2>
          <p>Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données (par exemple le retrait d&apos;un avis) en écrivant via la <Link className="font-semibold text-link underline underline-offset-4" href="/contact">page de contact</Link> ou à <a className="font-semibold text-link underline underline-offset-4 [overflow-wrap:anywhere]" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
        </section>
      </div>
    </>
  );
}
