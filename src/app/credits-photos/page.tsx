import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { PlaceImage } from "@/components/site/place-image";
import { PHOTO_CREDITS } from "@/lib/photo-credits";

export const metadata: Metadata = {
  title: "Crédits photos",
  description: "Auteurs, licences et sources des photos utilisées sur GoComores.",
  alternates: { canonical: "/credits-photos" },
};

const LINK = "font-semibold text-link underline underline-offset-4";

export default function CreditsPhotosPage() {
  return (
    <>
      <PageHero eyebrow="Légal" title="Crédits photos">
        <p>
          Les photos de ce site proviennent de Wikimedia Commons. Elles appartiennent à leurs auteurs et sont réutilisées
          selon leur licence (Creative Commons ou domaine public), sans modification autre qu&apos;un redimensionnement.
        </p>
      </PageHero>
      <div className="container-page py-14">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PHOTO_CREDITS.map((c) => (
            <li key={c.src} className="overflow-hidden rounded-xl border bg-card">
              <div className="relative aspect-[4/3] bg-muted">
                <PlaceImage src={c.src} alt="" fill sizes="(min-width: 1024px) 352px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              </div>
              <dl className="space-y-1 p-4 text-sm [&_dt]:sr-only">
                <dt>Titre</dt>
                <dd className="font-semibold text-foreground">{c.title}</dd>
                <dt>Auteur</dt>
                <dd className="text-muted-foreground">{c.author}</dd>
                <dt>Licence et source</dt>
                <dd className="flex flex-wrap gap-x-3">
                  {c.licenseUrl ? (
                    <a className={LINK} href={c.licenseUrl} rel="license noopener" target="_blank">
                      {c.license}
                    </a>
                  ) : (
                    <span>{c.license}</span>
                  )}
                  <a className={LINK} href={c.source} rel="noopener" target="_blank">
                    Source
                  </a>
                </dd>
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
