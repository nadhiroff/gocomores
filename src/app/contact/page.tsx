import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Camera, CircleHelp, Clock, Lightbulb, Mail } from "lucide-react";
import { ContactForm } from "@/components/site/contact-form";
import { PageHero } from "@/components/site/page-hero";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Écrire à GoComores : suggérer un lieu, signaler une erreur, proposer une photo ou poser une question. Réponse sous 24 à 48 h.",
  alternates: { canonical: "/contact" },
};

export const revalidate = 3600;

const CARDS = [
  { id: "suggerer", icon: Lightbulb, title: "Suggérer un lieu", text: "Un site, une plage, un sentier que les visiteurs devraient connaître ? Décrivez-le et dites-nous où le trouver.", subject: "Suggestion de lieu" },
  { id: "signaler", icon: AlertTriangle, title: "Signaler une erreur", text: "Une information inexacte, un horaire qui a changé ? Indiquez la fiche concernée et ce qu'il faut corriger.", subject: "Signalement d'une erreur" },
  { id: "photo", icon: Camera, title: "Proposer une photo", text: "Vous avez une photo dont vous détenez les droits ? Dites-nous pour quel lieu et comment la créditer.", subject: "Proposition de photo" },
  { id: "question", icon: CircleHelp, title: "Une question", text: "Sur le site, le projet ou un voyage aux Comores : posez-la, nous répondrons dès que possible.", subject: "Question" },
];

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ sujet?: string }> }) {
  const sp = await searchParams;
  const known = CARDS.find((c) => c.id === sp.sujet);
  return (
    <>
      <PageHero eyebrow="Contact" title="Écrivez-nous">
        Un message, une idée, une correction. Nous répondons sous 24 à 48 h.
      </PageHero>

      <div className="container-page grid gap-12 py-12 lg:grid-cols-[1fr_1.1fr] lg:py-16">
        <div className="space-y-8">
          <section aria-labelledby="mail">
            <h2 id="mail" className="text-2xl font-bold">Par e-mail</h2>
            <p className="mt-3 flex items-center gap-3 text-lg">
              <Mail className="size-5 text-[var(--island-ndzuwani)]" aria-hidden="true" />
              <a href={`mailto:${SITE.email}`} className="min-w-0 font-semibold text-link underline underline-offset-4 [overflow-wrap:anywhere]">{SITE.email}</a>
            </p>
            <p className="mt-3 flex items-center gap-3 text-muted-foreground">
              <Clock className="size-5" aria-hidden="true" /> Réponse sous 24 à 48 h.
            </p>
          </section>

          <section aria-labelledby="motifs">
            <h2 id="motifs" className="text-2xl font-bold">Pourquoi nous écrire ?</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {CARDS.map((c) => (
                <li key={c.id} id={c.id} className="scroll-mt-24 rounded-xl border bg-card p-5 shadow-[var(--shadow-sm)]">
                  <c.icon className="size-6 text-[var(--island-ngazidja)]" aria-hidden="true" />
                  <h3 className="mt-3 font-sans text-lg font-bold">{c.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{c.text}</p>
                  <Link prefetch={false} href={`/contact?sujet=${c.id}#formulaire`} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-link underline underline-offset-4">
                    Écrire sur ce sujet<span className="sr-only"> : {c.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section id="formulaire" aria-labelledby="form-titre" className="scroll-mt-24 rounded-xl border bg-card p-6 sm:p-8">
          <h2 id="form-titre" className="text-2xl font-bold">Formulaire de contact</h2>
          <p className="mt-2 text-sm text-muted-foreground">Tous les champs sont obligatoires. Votre adresse sert uniquement à vous répondre.</p>
          <div className="mt-6">
            <ContactForm key={known?.id ?? "libre"} defaultSubject={known?.subject ?? ""} />
          </div>
        </section>
      </div>

      <section className="bg-secondary/60 dark:bg-secondary/30">
        <div className="container-page flex flex-col items-center gap-4 py-14 text-center">
          <h2 className="text-3xl font-bold">En attendant, explorez les îles</h2>
          <Button asChild variant="cta" size="lg">
            <Link href="/destinations">Voir les destinations</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
