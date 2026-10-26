"use client";
import { usePathname } from "next/navigation";

/**
 * L'espace d'administration a sa propre interface : on y masque l'en-tête, le pied de page
 * et le bandeau public. Les éléments sont rendus côté serveur et passés en props.
 */
export function SiteChrome({ header, footer, banner, children }: { header: React.ReactNode; footer: React.ReactNode; banner: React.ReactNode; children: React.ReactNode }) {
  const isAdmin = usePathname().startsWith("/admin");
  if (isAdmin) return <>{children}</>;
  return (
    <>
      {header}
      {children}
      {footer}
      {/* Réserve la hauteur du bandeau fixe pour qu'il ne masque jamais le pied de page. */}
      <div aria-hidden="true" className="h-24 sm:h-16" />
      {banner}
    </>
  );
}
