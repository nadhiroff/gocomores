import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ value, size = "size-4", className }: { value: number; size?: string; className?: string }) {
  const rounded = Math.round(value);
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      <span className="sr-only">Note : {value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} sur 5</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          className={cn(size, n <= rounded ? "fill-[var(--ylang)] text-[var(--ylang)]" : "text-muted-foreground/60")}
        />
      ))}
    </span>
  );
}
