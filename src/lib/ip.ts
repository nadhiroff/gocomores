import { createHmac } from "node:crypto";
import { headers } from "next/headers";

/** IP du client (derrière un proxy : première valeur de x-forwarded-for). */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  const ip = (xff ? xff.split(",")[0] : h.get("x-real-ip")) ?? "0.0.0.0";
  return ip.trim().slice(0, 64);
}

/**
 * Empreinte HMAC de l'IP, salée par AUTH_SECRET : sert uniquement à limiter les abus.
 * L'adresse IP elle-même n'est jamais stockée.
 */
export function hashIp(ip: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET manquant");
  return createHmac("sha256", secret).update(ip).digest("hex");
}
