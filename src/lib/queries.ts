import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import {
  parsePractical,
  type CategoryInfo,
  type IslandInfo,
  type PlaceCardData,
  type PlaceDetail,
  type PlaceImageData,
  type ReviewData,
  type ReviewStats,
} from "@/lib/types";

const placeInclude = { island: true, category: true } as const;

function toCard(r: unknown): PlaceCardData {
  const p = r as PlaceCardData;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    summary: p.summary,
    status: p.status,
    verifiedAt: p.verifiedAt,
    googleMapsUrl: p.googleMapsUrl,
    coverImage: p.coverImage,
    coverAlt: p.coverAlt,
    lat: p.lat,
    lng: p.lng,
    island: p.island,
    category: p.category,
  };
}

export const getIslands = cache(async (): Promise<IslandInfo[]> => {
  const rows = await prisma.island.findMany({ orderBy: { id: "asc" } });
  return rows as unknown as IslandInfo[];
});

export const getCategories = cache(async (): Promise<CategoryInfo[]> => {
  const rows = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return rows as unknown as CategoryInfo[];
});

export interface PlaceFilters {
  ile?: string;
  categorie?: string;
  q?: string;
}

export async function listPlaces(filters: PlaceFilters = {}, take?: number): Promise<PlaceCardData[]> {
  const q = filters.q?.trim();
  const rows = await prisma.place.findMany({
    where: {
      ...(filters.ile ? { island: { slug: filters.ile } } : {}),
      ...(filters.categorie ? { category: { slug: filters.categorie } } : {}),
      ...(q ? { OR: [{ name: { contains: q } }, { summary: { contains: q } }] } : {}),
    },
    include: placeInclude,
    orderBy: [{ status: "desc" }, { name: "asc" }],
    take,
  });
  return (rows as unknown[]).map(toCard);
}

// cache() : generateMetadata et la page lisent le même lieu sans doubler la requête.
export const getPlaceBySlug = cache(async (slug: string): Promise<PlaceDetail | null> => {
  const row = await prisma.place.findUnique({
    where: { slug },
    include: { ...placeInclude, images: { orderBy: { order: "asc" } } },
  });
  if (!row) return null;
  const r = row as unknown as PlaceCardData & {
    history: string;
    practicalInfo: unknown;
    images: PlaceImageData[];
  };
  return {
    ...toCard(r),
    history: r.history,
    practical: parsePractical(r.practicalInfo),
    images: r.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt, order: i.order })),
  };
});

export async function getAllPlaceSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  const rows = await prisma.place.findMany({ select: { slug: true, updatedAt: true } });
  return rows as unknown as { slug: string; updatedAt: Date }[];
}

export async function getHomeStats() {
  const [verified, islands, places] = await Promise.all([
    prisma.place.count({ where: { status: "VERIFIED" } }),
    prisma.island.count(),
    prisma.place.count(),
  ]);
  return { verified: verified as number, islands: islands as number, places: places as number };
}

export async function getReviewStats(placeId?: number): Promise<ReviewStats> {
  const where = placeId ? { placeId } : {};
  const groups = (await prisma.review.groupBy({
    by: ["rating"],
    where,
    _count: { _all: true },
  })) as unknown as { rating: number; _count: { _all: number } }[];
  const distribution: ReviewStats["distribution"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let count = 0;
  let sum = 0;
  for (const g of groups) {
    const k = g.rating as 1 | 2 | 3 | 4 | 5;
    if (k >= 1 && k <= 5) {
      distribution[k] = g._count._all;
      count += g._count._all;
      sum += g.rating * g._count._all;
    }
  }
  return { average: count ? sum / count : 0, count, distribution };
}

export async function listReviews(opts: { page?: number; perPage?: number; placeId?: number } = {}) {
  const perPage = opts.perPage ?? 10;
  const page = Math.max(1, opts.page ?? 1);
  const where = opts.placeId ? { placeId: opts.placeId } : {};
  const [rows, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: { id: true, authorName: true, rating: true, comment: true, createdAt: true, placeId: true },
    }),
    prisma.review.count({ where }),
  ]);
  return {
    reviews: rows as unknown as ReviewData[],
    total: total as number,
    page,
    pages: Math.max(1, Math.ceil((total as number) / perPage)),
  };
}

export const ALERT_TAG = "site-alert";

// Affiché sur toutes les pages : mis en cache entre les requêtes, invalidé dès que l'admin modifie le bandeau.
const cachedAlert = unstable_cache(
  async () => {
    const row = await prisma.siteAlert.findFirst({ where: { active: true }, orderBy: { id: "desc" }, select: { id: true, message: true, link: true } });
    return row as unknown as { id: number; message: string; link: string | null } | null;
  },
  ["active-alert"],
  { tags: [ALERT_TAG], revalidate: 600 },
);

export async function getActiveAlert() {
  try {
    return await cachedAlert();
  } catch {
    return null; // le site reste utilisable même si la base est indisponible
  }
}
