"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Waves as WavesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="container-page grid min-h-[60vh] place-items-center py-20 text-center" role="alert">
      <div className="max-w-lg space-y-5">
        <WavesIcon className="mx-auto size-14 text-[var(--island-ndzuwani)]" aria-hidden="true" />
        <p className="eyebrow">Erreur 500</p>
        <h1 className="text-4xl font-bold sm:text-5xl">Une vague imprévue</h1>
        <p className="text-lg text-muted-foreground">
          Un problème est survenu de notre côté. Vous pouvez réessayer ; si cela persiste, écrivez-nous.
          {error.digest && <span className="mt-2 block text-sm">Référence : {error.digest}</span>}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button variant="cta" size="lg" onClick={reset}>
            Réessayer
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">Nous contacter</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
