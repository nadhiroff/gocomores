import { AlertForm } from "@/components/admin/alert-form";
import { PageHeader, Panel } from "@/components/admin/ui";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Bandeau d'alerte" };

export default async function AdminAlert() {
  const a = (await prisma.siteAlert.findFirst({ orderBy: { id: "desc" } })) as { message: string; link: string | null; active: boolean } | null;
  return (
    <>
      <PageHeader title="Bandeau d'alerte" description="Message affiché en bas de toutes les pages publiques lorsqu'il est actif : météo, sécurité, événement…" />
      <Panel>
        <AlertForm
          message={a?.message ?? "Avis aux voyageurs : consultez les recommandations officielles avant de partir."}
          link={a?.link ?? "/infos-voyageurs"}
          active={a?.active ?? true}
        />
      </Panel>
    </>
  );
}
