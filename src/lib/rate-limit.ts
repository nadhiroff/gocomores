import { prisma } from "@/lib/db";

/** Limite persistante (base de données) par empreinte d'IP : survit aux redémarrages. */
export async function reviewRateLimited(ipHash: string): Promise<boolean> {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const n = await prisma.review.count({ where: { ipHash, createdAt: { gte: since } } });
  return n >= 3; // 3 avis / heure / IP
}

export async function contactRateLimited(ipHash: string): Promise<boolean> {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const n = await prisma.contactMessage.count({ where: { ipHash, createdAt: { gte: since } } });
  return n >= 3; // 3 messages / heure / IP
}

// Limite en mémoire pour la connexion admin (5 essais / 15 min / IP).
const attempts = new Map<string, { count: number; reset: number }>();
export function loginRateLimited(key: string): boolean {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || rec.reset < now) {
    attempts.set(key, { count: 1, reset: now + 15 * 60 * 1000 });
    return false;
  }
  rec.count += 1;
  return rec.count > 5;
}
export function loginReset(key: string) {
  attempts.delete(key);
}
