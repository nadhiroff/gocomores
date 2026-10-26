import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { VerificationBadge } from "@/components/site/verification-badge";
import { Button } from "@/components/ui/button";
import { listPlaces } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Lieux" };

export default async function AdminPlaces() {
  const places = await listPlaces();
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Lieux ({places.length})</h1>
        <Button asChild variant="cta">
          <Link href="/admin/lieux/nouveau"><Plus aria-hidden="true" /> Nouveau lieu</Link>
        </Button>
      </div>
      <div className="relative mt-6 overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <caption className="sr-only">Liste des lieux</caption>
          <thead className="border-b bg-muted/60">
            <tr>
              <th scope="col" className="p-3">Nom</th>
              <th scope="col" className="p-3">Île</th>
              <th scope="col" className="p-3">Catégorie</th>
              <th scope="col" className="p-3">Statut</th>
              <th scope="col" className="p-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {places.map((p) => (
              <tr key={p.id}>
                <th scope="row" className="p-3 font-semibold">{p.name}</th>
                <td className="p-3">{p.island.localName}</td>
                <td className="p-3">{p.category.name}</td>
                <td className="p-3"><VerificationBadge status={p.status} verifiedAt={p.verifiedAt} /></td>
                <td className="p-3 text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/lieux/${p.id}`}><Pencil aria-hidden="true" /> Modifier<span className="sr-only"> {p.name}</span></Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
