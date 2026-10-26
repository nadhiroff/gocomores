import { BadgeCheck, CircleHelp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import type { PlaceStatus } from "@/lib/types";

export function VerificationBadge({ status, verifiedAt }: { status: PlaceStatus; verifiedAt: Date | null }) {
  if (status === "VERIFIED" && verifiedAt) {
    return (
      <Badge variant="verified">
        <BadgeCheck className="size-3.5" aria-hidden="true" />
        Vérifié le {formatDate(verifiedAt)}
      </Badge>
    );
  }
  return (
    <Badge variant="toConfirm">
      <CircleHelp className="size-3.5" aria-hidden="true" />
      Information à confirmer
    </Badge>
  );
}
