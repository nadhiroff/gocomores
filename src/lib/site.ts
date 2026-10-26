export const SITE = {
  name: "GoComores",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@example.com",
  tagline: "Le guide indépendant des îles Comores",
  description:
    "GoComores est un guide touristique indépendant des Comores : lieux à visiter de Ngazidja à Mwali, carte, informations pratiques et avis libres des visiteurs.",
} as const;

export const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/destinations", label: "Destinations" },
  { href: "/carte", label: "Carte" },
  { href: "/a-propos", label: "À propos" },
  { href: "/avis", label: "Avis" },
  { href: "/contact", label: "Contact" },
] as const;
