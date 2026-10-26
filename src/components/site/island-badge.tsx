import { islandColorVar } from "@/lib/islands";
import type { IslandInfo } from "@/lib/types";

export function IslandBadge({ island, showLocal = true }: { island: IslandInfo; showLocal?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: islandColorVar(island.slug) }}>
      <svg viewBox="0 0 10 10" className="size-2.5" aria-hidden="true">
        <circle cx="5" cy="5" r="5" fill="currentColor" />
      </svg>
      <span>
        {island.localName}
        {showLocal && <span className="font-normal text-muted-foreground"> · {island.name}</span>}
      </span>
    </span>
  );
}
