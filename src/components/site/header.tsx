"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Button } from "@/components/ui/button";
import { NAV } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div aria-hidden="true" className="flag-stripe h-1" />
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-lg px-3.5 text-[0.9375rem] font-medium transition-colors hover:bg-accent",
                    isActive(item.href) ? "text-foreground underline decoration-[var(--island-ngazidja)] decoration-2 underline-offset-8" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Ouvrir le menu">
                <Menu aria-hidden="true" />
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 lg:hidden" />
              <Dialog.Content
                className="fixed inset-y-0 right-0 z-50 flex w-[min(20rem,88vw)] flex-col gap-2 bg-background p-5 shadow-2xl data-[state=open]:animate-in data-[state=open]:slide-in-from-right lg:hidden"
                aria-describedby={undefined}
              >
                <div className="flex items-center justify-between">
                  <Dialog.Title className="font-serif text-lg font-semibold">Menu</Dialog.Title>
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="icon" aria-label="Fermer le menu">
                      <X aria-hidden="true" />
                    </Button>
                  </Dialog.Close>
                </div>
                <nav aria-label="Navigation mobile">
                  <ul className="mt-2 flex flex-col">
                    {NAV.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          aria-current={isActive(item.href) ? "page" : undefined}
                          className={cn(
                            "flex min-h-12 items-center rounded-lg px-3 text-lg font-medium hover:bg-accent",
                            isActive(item.href) && "bg-secondary font-semibold",
                          )}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
