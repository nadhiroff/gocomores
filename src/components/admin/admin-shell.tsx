"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { ExternalLink, Images, LayoutDashboard, LogOut, Mail, MapPin, Megaphone, Menu, Star, Users, X } from "lucide-react";
import { logout } from "@/actions/admin";
import { ComorosFlag } from "@/components/site/comoros-flag";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/lieux", label: "Lieux", icon: MapPin },
  { href: "/admin/medias", label: "Médiathèque", icon: Images },
  { href: "/admin/avis", label: "Avis", icon: Star },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/alerte", label: "Bandeau d'alerte", icon: Megaphone },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
] as const;

export type AdminCounts = Partial<Record<(typeof NAV)[number]["href"], number>>;

function Brand() {
  return (
    <Link href="/admin" className="admin-brand flex min-h-11 items-center gap-3 rounded-lg">
      <ComorosFlag className="admin-wave-hover h-8 w-auto rounded-[3px] shadow-sm ring-1 ring-white/20" />
      <span className="leading-tight">
        <span className="block text-lg font-bold tracking-tight">
          Go<span className="text-flag-yellow">Comores</span>
        </span>
        <span className="block text-xs font-medium uppercase tracking-[0.14em] text-sidebar-muted">Administration</span>
      </span>
    </Link>
  );
}

function NavList({ counts, onNavigate }: { counts: AdminCounts; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-1">
      {NAV.map(({ href, label, icon: Icon, ...rest }) => {
        const active = "exact" in rest ? pathname === href : pathname.startsWith(href);
        const count = counts[href];
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-[0.9375rem] font-medium transition-colors",
                active ? "bg-sidebar-active text-white" : "text-sidebar-foreground/85 hover:bg-white/5 hover:text-white",
              )}
            >
              {active && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-1 rounded-r bg-flag-yellow" />}
              <Icon className={cn("size-5 shrink-0 transition-transform duration-200", !active && "group-hover:scale-110")} aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {!!count && (
                <span className="admin-pop rounded-full bg-flag-yellow px-2 py-0.5 text-xs font-bold text-[#1a1600]">
                  {count}
                  <span className="sr-only"> à traiter</span>
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SidebarFooter({ userName }: { userName: string }) {
  return (
    <div className="space-y-2 border-t border-white/10 pt-4">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-[0.9375rem] font-medium text-sidebar-foreground/85 hover:bg-white/5 hover:text-white"
      >
        <ExternalLink className="size-5" aria-hidden="true" /> Voir le site <span className="sr-only">(nouvel onglet)</span>
      </a>
      <div className="flex items-center gap-2 rounded-lg bg-white/5 p-2 pl-3">
        <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-flag-yellow font-bold text-[#1a1600]">
          {userName.trim().charAt(0).toUpperCase() || "A"}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{userName}</span>
        <ThemeToggle className="text-sidebar-foreground hover:bg-white/10 hover:text-white" />
        <form action={logout}>
          <Button type="submit" variant="ghost" size="icon" aria-label="Se déconnecter" className="text-sidebar-foreground hover:bg-white/10 hover:text-white">
            <LogOut aria-hidden="true" />
          </Button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({ userName, counts, children }: { userName: string; counts: AdminCounts; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <div className="admin-theme min-h-dvh bg-background text-foreground">
      <div aria-hidden="true" className="flag-stripe fixed inset-x-0 top-0 z-50 h-1" />

      {/* Barre latérale (ordinateur) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-sidebar px-4 pb-4 pt-6 text-sidebar-foreground lg:flex">
        <Brand />
        <nav aria-label="Administration" className="mt-8 flex-1 overflow-y-auto">
          <NavList counts={counts} />
        </nav>
        <SidebarFooter userName={userName} />
      </aside>

      {/* Barre supérieure (mobile) */}
      <div className="sticky top-1 z-40 flex h-16 items-center justify-between bg-sidebar px-4 text-sidebar-foreground lg:hidden">
        <Brand />
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <Button variant="ghost" size="icon" aria-label="Ouvrir le menu d'administration" className="text-sidebar-foreground hover:bg-white/10 hover:text-white">
              <Menu aria-hidden="true" />
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
            <Dialog.Content
              aria-describedby={undefined}
              className="admin-theme fixed inset-y-0 left-0 z-50 flex w-[min(19rem,88vw)] flex-col bg-sidebar px-4 pb-4 pt-5 text-sidebar-foreground shadow-2xl data-[state=open]:animate-in data-[state=open]:slide-in-from-left"
            >
              <div className="flex items-center justify-between">
                <Dialog.Title className="sr-only">Menu d&apos;administration</Dialog.Title>
                <Brand />
                <Dialog.Close asChild>
                  <Button variant="ghost" size="icon" aria-label="Fermer le menu" className="text-sidebar-foreground hover:bg-white/10 hover:text-white">
                    <X aria-hidden="true" />
                  </Button>
                </Dialog.Close>
              </div>
              <nav aria-label="Administration (mobile)" className="mt-6 flex-1 overflow-y-auto">
                <NavList counts={counts} onNavigate={() => setOpen(false)} />
              </nav>
              <SidebarFooter userName={userName} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <div className="lg:pl-72">
        {/* La clé relance l'animation d'entrée à chaque changement de page. */}
        <div key={pathname} className="admin-page mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-10">{children}</div>
      </div>
    </div>
  );
}
