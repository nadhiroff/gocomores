import Link from "next/link";
import { LogOut } from "lucide-react";
import { logout } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin";

export const metadata = { robots: { index: false, follow: false } };

const LINKS = [
  { href: "/admin", label: "Lieux" },
  { href: "/admin/avis", label: "Avis" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/alerte", label: "Bandeau d'alerte" },
  { href: "/admin/utilisateurs", label: "Utilisateurs" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <nav aria-label="Administration">
          <ul className="flex flex-wrap gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center rounded-lg px-3.5 font-semibold hover:bg-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            <LogOut aria-hidden="true" /> Déconnexion
          </Button>
        </form>
      </div>
      <div className="pt-8">{children}</div>
    </div>
  );
}
