import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <section className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
      <div className="max-w-lg space-y-5">
        <Compass className="mx-auto size-14 text-[var(--island-ngazidja)]" aria-hidden="true" />
        <p className="eyebrow">Erreur 404</p>
        <h1 className="text-4xl font-bold sm:text-5xl">Cette page s&apos;est perdue en mer</h1>
        <p className="text-lg text-muted-foreground">
          L&apos;adresse demandée n&apos;existe pas ou a été déplacée. Retournez à l&apos;accueil ou explorez les destinations.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button asChild variant="cta" size="lg">
            <Link href="/destinations">Voir les destinations</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
