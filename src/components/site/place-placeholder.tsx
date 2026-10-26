import { CategoryIcon } from "@/components/site/category-icon";
import { textOn } from "@/lib/islands";
import { cn } from "@/lib/utils";

/**
 * Visuel de remplacement quand un lieu n'a pas encore de photo : dégradé à la couleur de l'île,
 * motif discret et pictogramme de la catégorie. Purement décoratif.
 */
export function PlacePlaceholder({ color, icon, name, className, large = false }: { color: string; icon: string; name?: string; className?: string; large?: boolean }) {
  const base = /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#0C4A6E";
  const fg = textOn(base);
  return (
    <div
      aria-hidden="true"
      className={cn("relative grid h-full w-full place-items-center overflow-hidden", className)}
      style={{ background: `linear-gradient(135deg, ${base} 0%, color-mix(in srgb, ${base} 45%, #082f49) 100%)`, color: fg }}
    >
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="absolute -right-10 -top-10 size-48 rounded-full bg-white/15 blur-2xl" />
      <div className="relative flex flex-col items-center gap-3 px-6 text-center">
        <CategoryIcon name={icon} className={large ? "size-16" : "size-11"} />
        {name && <span className={cn("max-w-md font-serif font-semibold leading-tight", large ? "text-3xl" : "text-lg")}>{name}</span>}
      </div>
    </div>
  );
}
