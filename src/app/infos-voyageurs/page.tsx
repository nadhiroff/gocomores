import type { Metadata } from "next";
import Link from "next/link";
import { Flame, FileText, Info, Wind } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Infos voyageurs",
  description: "Volcan Karthala, saison cyclonique, formalités d'entrée : repères avant de partir aux Comores, à confirmer auprès des sources officielles.",
  alternates: { canonical: "/infos-voyageurs" },
};

export default function InfosVoyageursPage() {
  return (
    <>
      <PageHero eyebrow="Avis aux voyageurs" title="Avant de partir aux Comores">
        Quelques repères pour préparer votre voyage. Ils ne remplacent pas les recommandations officielles.
      </PageHero>

      <div className="container-page max-w-3xl space-y-12 py-14">
        <Alert variant="warning" role="note">
          <Info aria-hidden="true" />
          <p>
            <strong>Contenu à confirmer auprès de sources officielles.</strong> Les situations changent (activité volcanique, météo, règles d&apos;entrée). Consultez les conseils aux voyageurs du ministère des Affaires étrangères de votre pays, l&apos;ambassade ou le consulat des Comores, et les autorités locales avant tout départ.
          </p>
        </Alert>

        <section aria-labelledby="karthala">
          <h2 id="karthala" className="flex items-center gap-3 text-3xl font-bold">
            <Flame className="size-7 text-[var(--island-ngazidja)]" aria-hidden="true" /> Volcan Karthala
          </h2>
          <div className="mt-4 space-y-3 text-lg leading-relaxed">
            <p>Le Karthala (2 361 m), sur Ngazidja, est un volcan actif. Ses éruptions d&apos;avril 2005 et de mai 2006 ont entraîné l&apos;évacuation d&apos;environ 2 000 habitants ; les gaz volcaniques et les coulées de lave sont des risques réels.</p>
            <p>Avant toute ascension, renseignez-vous sur l&apos;activité récente auprès des autorités ou du parc national, et partez avec un guide local. Voir la fiche <Link href="/destinations/mont-karthala" className="font-semibold text-link underline underline-offset-4">Mont Karthala</Link>.</p>
          </div>
        </section>

        <section aria-labelledby="cyclones">
          <h2 id="cyclones" className="flex items-center gap-3 text-3xl font-bold">
            <Wind className="size-7 text-[var(--island-ndzuwani)]" aria-hidden="true" /> Saison cyclonique
          </h2>
          <div className="mt-4 space-y-3 text-lg leading-relaxed">
            <p>Dans le sud-ouest de l&apos;océan Indien, la saison des cyclones s&apos;étend en général de novembre à avril (repère indicatif). Elle peut perturber les vols, les traversées entre îles et l&apos;accès à certains sites.</p>
            <p>Si vous voyagez à cette période, suivez les bulletins météorologiques officiels, prévoyez de la flexibilité dans vos dates et vérifiez les conditions de votre assurance voyage.</p>
          </div>
        </section>

        <section aria-labelledby="formalites">
          <h2 id="formalites" className="flex items-center gap-3 text-3xl font-bold">
            <FileText className="size-7 text-[var(--island-mwali)]" aria-hidden="true" /> Formalités d&apos;entrée
          </h2>
          <div className="mt-4 space-y-3 text-lg leading-relaxed">
            <p>Passeport, visa, justificatifs de séjour, vaccinations recommandées ou exigées : ces conditions dépendent de votre nationalité et évoluent. <strong>Nous ne les publions pas</strong> tant qu&apos;elles ne sont pas confirmées par une source officielle.</p>
            <p>Renseignez-vous directement auprès de l&apos;ambassade ou du consulat des Comores compétent et auprès du ministère des Affaires étrangères de votre pays.</p>
          </div>
        </section>
      </div>
    </>
  );
}
