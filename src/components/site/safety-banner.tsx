import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { getActiveAlert } from "@/lib/queries";

/** Bandeau fixe en bas, alimenté par la table site_alerts. Le pied de page réserve l'espace nécessaire. */
export async function SafetyBanner() {
  const alert = await getActiveAlert();
  if (!alert) return null;
  const internal = alert.link?.startsWith("/");
  return (
    <aside
      role="region"
      aria-label="Avis aux voyageurs"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/15 bg-[#082F49] text-white shadow-[0_-6px_20px_rgb(0_0_0/0.25)]"
    >
      <div className="container-page flex min-h-14 flex-wrap items-center gap-x-4 gap-y-1 py-2 text-sm">
        <ShieldAlert className="size-5 shrink-0 text-[#FDBA74]" aria-hidden="true" />
        <p className="flex-1 basis-60 leading-snug">{alert.message}</p>
        {alert.link &&
          (internal ? (
            <Link href={alert.link} className="inline-flex min-h-11 items-center font-semibold text-[#FDBA74] underline underline-offset-4 hover:text-white">
              Informations pratiques
            </Link>
          ) : (
            <a href={alert.link} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold text-[#FDBA74] underline underline-offset-4 hover:text-white">
              Consulter la source <span className="sr-only">(nouvel onglet)</span>
            </a>
          ))}
      </div>
    </aside>
  );
}
