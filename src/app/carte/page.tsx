import type { Metadata } from "next";
import { MapExplorer } from "@/components/map/map-explorer";
import type { MapPlace } from "@/components/map/types";
import { getCategories, getIslands, listPlaces } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Carte",
  description: "Carte interactive des lieux à visiter aux Comores, avec filtres par île et par catégorie, et bouton « Ma position ».",
  alternates: { canonical: "/carte" },
};

export default async function CartePage() {
  const [places, islands, categories] = await Promise.all([listPlaces(), getIslands(), getCategories()]);
  const mapPlaces: MapPlace[] = places.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    summary: p.summary,
    lat: p.lat,
    lng: p.lng,
    verified: p.status === "VERIFIED",
    island: { slug: p.island.slug, name: p.island.name, localName: p.island.localName, color: p.island.color },
    category: { slug: p.category.slug, name: p.category.name },
  }));
  return (
    <MapExplorer
      places={mapPlaces}
      islands={islands.map((i) => ({ slug: i.slug, label: i.localName, color: i.color }))}
      categories={categories.map((c) => ({ slug: c.slug, label: c.name }))}
    />
  );
}
