import { z } from "zod";

export type PlaceStatus = "VERIFIED" | "TO_CONFIRM";

export interface IslandInfo {
  id: number;
  slug: string;
  name: string;
  localName: string;
  color: string;
}
export interface CategoryInfo {
  id: number;
  slug: string;
  name: string;
  icon: string;
}

const fieldSchema = z.object({ value: z.string().nullable().optional(), toConfirm: z.boolean().optional() });
export const practicalSchema = z.object({
  access: fieldSchema.optional(),
  hours: fieldSchema.optional(),
  fares: fieldSchema.optional(),
  bestPeriod: fieldSchema.optional(),
});
export type PracticalInfo = z.infer<typeof practicalSchema>;

export function parsePractical(raw: unknown): PracticalInfo {
  const r = practicalSchema.safeParse(raw);
  return r.success ? r.data : {};
}

export interface PlaceCardData {
  id: number;
  slug: string;
  name: string;
  summary: string;
  status: PlaceStatus;
  verifiedAt: Date | null;
  googleMapsUrl: string | null;
  coverImage: string | null;
  coverAlt: string | null;
  lat: number;
  lng: number;
  island: IslandInfo;
  category: CategoryInfo;
}

export interface PlaceImageData {
  id: number;
  url: string;
  alt: string;
  order: number;
}

export interface ReviewData {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  placeId: number | null;
}

export interface PlaceDetail extends PlaceCardData {
  history: string;
  practical: PracticalInfo;
  images: PlaceImageData[];
}

export interface ReviewStats {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}
