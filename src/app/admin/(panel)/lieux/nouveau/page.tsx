import { PlaceForm } from "@/components/admin/place-form";
import { PageHeader } from "@/components/admin/ui";
import { getCategories, getIslands } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Nouveau lieu" };

export default async function NewPlace() {
  const [islands, categories] = await Promise.all([getIslands(), getCategories()]);
  return (
    <>
      <PageHeader
        crumbs={[{ href: "/admin/lieux", label: "Lieux" }]}
        title="Nouveau lieu"
        description="Remplissez les onglets dans l'ordre que vous voulez, puis cliquez sur « Créer le lieu »."
      />
      <PlaceForm
        islands={islands}
        categories={categories}
        values={{ id: null, name: "", slug: "", islandId: "", categoryId: "", summary: "", history: "", lat: "", lng: "", googleMapsUrl: "", status: "TO_CONFIRM", verifiedAt: "", practical: {} }}
      />
    </>
  );
}
