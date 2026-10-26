import Link from "next/link";
import { COELACANTH_PATH, COELACANTH_TRANSFORM } from "@/components/site/coelacanth";
import { cn } from "@/lib/utils";

/** Le cœlacanthe, emblème naturel des Comores. Même dessin que src/app/icon.svg. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="#0C4A6E" />
      <g transform="translate(4 11.5) scale(0.020833)" fill="#E0F2FE">
        <path transform={COELACANTH_TRANSFORM} d={COELACANTH_PATH} />
      </g>
    </svg>
  );
}

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex min-h-11 items-center gap-2.5 rounded-lg", className)} aria-label="GoComores — accueil">
      <LogoMark />
      <span className={cn("font-serif text-xl font-bold tracking-tight", light ? "text-white" : "text-foreground")}>
        Go<span className={light ? "text-[#FDBA74]" : "text-[var(--island-ngazidja)]"}>Comores</span>
      </span>
    </Link>
  );
}
