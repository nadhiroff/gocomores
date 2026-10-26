import type { MetadataRoute } from "next";
import { getAllPlaceSlugs } from "@/lib/queries";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const statics = ["", "/destinations", "/carte", "/a-propos", "/avis", "/contact", "/infos-voyageurs", "/mentions-legales", "/confidentialite", "/credits-photos"].map((p) => ({
    url: `${SITE.url}${p}`,
    lastModified: now,
    changeFrequency: p === "" || p === "/avis" ? ("weekly" as const) : ("monthly" as const),
    priority: p === "" ? 1 : p === "/destinations" ? 0.9 : 0.6,
  }));
  try {
    const places = await getAllPlaceSlugs();
    return [
      ...statics,
      ...places.map((p) => ({ url: `${SITE.url}/destinations/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
    ];
  } catch {
    return statics;
  }
}
