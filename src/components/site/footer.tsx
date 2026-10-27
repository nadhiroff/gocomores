import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { SITE } from "@/lib/site";

const COLS = [
  {
    title: "Explorer",
    links: [
      { href: "/destinations", label: "Destinations" },
      { href: "/carte", label: "Carte" },
      { href: "/avis", label: "Avis des visiteurs" },
      { href: "/infos-voyageurs", label: "Infos voyageurs" },
    ],
  },
  {
    title: "GoComores",
    links: [
      { href: "/a-propos", label: "À propos" },
      { href: "/contact", label: "Contact" },
      { href: "/contact#suggerer", label: "Suggérer un lieu" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/mentions-legales", label: "Mentions légales" },
      { href: "/confidentialite", label: "Confidentialité" },
      { href: "/credits-photos", label: "Crédits photos" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">{SITE.tagline}. Un projet personnel, sans publicité, sans cookie de suivi.</p>
        </div>
        {COLS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-foreground">{col.title}</h2>
            <ul className="mt-3 space-y-0.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link prefetch={false} href={l.href} className="inline-flex min-h-11 items-center text-[0.9375rem] text-muted-foreground transition-colors hover:text-foreground hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t">
        <p className="container-page py-5 text-sm text-muted-foreground">© 2026 {SITE.name}. Tous droits réservés. Site indépendant, non affilié à une administration.</p>
      </div>
    </footer>
  );
}
