import { PlaceForm } from "@/components/admin/place-form";
import { getCategories, getIslands } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Nouveau lieu" };

export default async function NewPlace() {
  const [islands, categories] = await Promise.all([getIslands(), getCategories()]);
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Nouveau lieu</h1>
      <PlaceForm
        islands={islands}
        categories={categories}
        values={{ id: null, name: "", slug: "", islandId: "", categoryId: "", summary: "", history: "", lat: "", lng: "", googleMapsUrl: "", status: "TO_CONFIRM", verifiedAt: "", coverAlt: "", practical: {} }}
      />
    </>
  );
}
