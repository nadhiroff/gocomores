"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { ALERT_TAG } from "@/lib/queries";
import { saveImage } from "@/lib/uploads";
import { slugify } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { adminUserSchema, alertSchema, flattenErrors, passwordChangeSchema, placeSchema, type FormState } from "@/lib/validators";

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const from = String(formData.get("from") ?? "/admin");
  const result = await signIn("credentials", {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    redirect: false,
  });
  if (result?.error) {
    return { ok: false, message: "Identifiants incorrects ou trop de tentatives. Réessayez dans quelques minutes." };
  }
  redirect(from.startsWith("/admin") ? from : "/admin");
}

export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}

function revalidateAll(slug?: string) {
  for (const p of ["/", "/destinations", "/carte", "/avis", "/sitemap.xml", "/admin", "/admin/lieux", "/admin/medias"]) revalidatePath(p);
  if (slug) revalidatePath(`/destinations/${slug}`);
}

function practicalFromForm(fd: FormData) {
  const f = (k: string) => {
    const value = String(fd.get(k) ?? "").trim().slice(0, 600);
    const toConfirm = fd.get(`${k}_tbc`) === "on" || value === "";
    return { value: value || null, toConfirm };
  };
  return { access: f("access"), hours: f("hours"), fares: f("fares"), bestPeriod: f("bestPeriod") };
}

export async function savePlace(id: number | null, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = placeSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) return { ok: false, errors: flattenErrors(parsed.error), message: "Veuillez corriger les champs signalés." };
  const d = parsed.data;

  let verifiedAt: Date | null = null;
  if (d.status === "VERIFIED") {
    verifiedAt = d.verifiedAt ? new Date(`${d.verifiedAt}T00:00:00.000Z`) : new Date();
    if (Number.isNaN(verifiedAt.getTime())) return { ok: false, errors: { verifiedAt: ["Date de vérification invalide."] }, message: "Date invalide." };
  }

  const slug = d.slug || slugify(d.name);
  const clash = await prisma.place.findUnique({ where: { slug }, select: { id: true } });
  if (clash && (clash as { id: number }).id !== id) return { ok: false, errors: { slug: ["Ce slug est déjà utilisé."] }, message: "Ce slug est déjà utilisé." };

  const data = {
    slug,
    name: d.name,
    summary: d.summary,
    history: d.history,
    practicalInfo: practicalFromForm(fd),
    lat: d.lat,
    lng: d.lng,
    googleMapsUrl: d.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${d.lat},${d.lng}`,
    status: d.status,
    verifiedAt,
    islandId: d.islandId,
    categoryId: d.categoryId,
  };

  const place = id ? await prisma.place.update({ where: { id }, data }) : await prisma.place.create({ data });
  const placeId = (place as { id: number }).id;

  // Photos téléversées : validées par leur contenu réel.
  const files = fd.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 8);
  // Sans description fournie, le nom du lieu sert de texte alternatif (modifiable ensuite photo par photo).
  const alt = String(fd.get("photoAlt") ?? "").trim().slice(0, 300) || d.name;
  let order = (await prisma.placeImage.count({ where: { placeId } })) as number;
  const problems: string[] = [];
  for (const file of files) {
    const res = await saveImage(file);
    if ("error" in res) {
      problems.push(`${file.name} : ${res.error}`);
      continue;
    }
    await prisma.placeImage.create({ data: { placeId, url: res.url, alt, order: order++ } });
  }
  if (files.length) await syncCover(placeId);

  revalidateAll(slug);
  if (problems.length) return { ok: false, errors: { photos: problems }, message: "Lieu enregistré, mais certaines photos ont été refusées." };
  if (!id) redirect(`/admin/lieux/${placeId}`);
  return { ok: true, message: "Lieu enregistré." };
}

export async function deletePlace(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  // La fiche publique est mise en cache : on récupère le slug pour l'invalider aussi.
  const deleted = (await prisma.place.delete({ where: { id } })) as { slug: string };
  revalidateAll(deleted.slug);
  redirect("/admin/lieux");
}

/* ───────────── Médiathèque : photos des lieux ───────────── */

export interface ImageActionResult {
  ok: boolean;
  error?: string;
  image?: { id: number; url: string; alt: string; order: number };
}

async function placeSlug(placeId: number) {
  return ((await prisma.place.findUnique({ where: { id: placeId }, select: { slug: true } })) as { slug: string } | null)?.slug;
}

/** La couverture d'un lieu est toujours sa première photo : on la resynchronise après chaque changement. */
async function syncCover(placeId: number) {
  const first = (await prisma.placeImage.findFirst({ where: { placeId }, orderBy: [{ order: "asc" }, { id: "asc" }] })) as { url: string; alt: string } | null;
  await prisma.place.update({ where: { id: placeId }, data: { coverImage: first?.url ?? null, coverAlt: first?.alt ?? null } });
  const slug = await placeSlug(placeId);
  revalidateAll(slug);
  revalidatePath(`/admin/lieux/${placeId}`);
}

/** Téléverse UNE photo (le client envoie les fichiers un par un pour afficher la progression). */
export async function uploadPlaceImage(fd: FormData): Promise<ImageActionResult> {
  await requireAdmin();
  const placeId = Number(fd.get("placeId"));
  const file = fd.get("photo");
  if (!Number.isInteger(placeId) || !(file instanceof File)) return { ok: false, error: "Requête invalide." };
  const place = (await prisma.place.findUnique({ where: { id: placeId }, select: { name: true } })) as { name: string } | null;
  if (!place) return { ok: false, error: "Lieu introuvable." };
  const res = await saveImage(file);
  if ("error" in res) return { ok: false, error: res.error };
  const alt = String(fd.get("alt") ?? "").replace(/<[^>]*>/g, "").trim().slice(0, 300) || place.name;
  const last = (await prisma.placeImage.findFirst({ where: { placeId }, orderBy: { order: "desc" }, select: { order: true } })) as { order: number } | null;
  const image = (await prisma.placeImage.create({ data: { placeId, url: res.url, alt, order: (last?.order ?? -1) + 1 } })) as { id: number; url: string; alt: string; order: number };
  await syncCover(placeId);
  return { ok: true, image: { id: image.id, url: image.url, alt: image.alt, order: image.order } };
}

export async function updatePlaceImageAlt(fd: FormData): Promise<ImageActionResult> {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const alt = String(fd.get("alt") ?? "").replace(/<[^>]*>/g, "").trim().slice(0, 300);
  if (!Number.isInteger(id)) return { ok: false, error: "Requête invalide." };
  if (alt.length < 3) return { ok: false, error: "Description : 3 caractères minimum." };
  const img = (await prisma.placeImage.update({ where: { id }, data: { alt } })) as { placeId: number };
  await syncCover(img.placeId);
  return { ok: true };
}

/** Enregistre un nouvel ordre ; la première photo devient la couverture. */
export async function reorderPlaceImages(placeId: number, ids: number[]): Promise<ImageActionResult> {
  await requireAdmin();
  if (!Number.isInteger(placeId) || !ids.every(Number.isInteger)) return { ok: false, error: "Requête invalide." };
  const owned = (await prisma.placeImage.findMany({ where: { placeId }, select: { id: true } })) as { id: number }[];
  const ownedIds = new Set(owned.map((o) => o.id));
  if (ids.length !== ownedIds.size || !ids.every((id) => ownedIds.has(id))) return { ok: false, error: "La liste des photos a changé, rechargez la page." };
  await prisma.$transaction(ids.map((id, order) => prisma.placeImage.update({ where: { id }, data: { order } })));
  await syncCover(placeId);
  return { ok: true };
}

export async function deletePlaceImage(formData: FormData): Promise<ImageActionResult> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return { ok: false, error: "Requête invalide." };
  const img = (await prisma.placeImage.delete({ where: { id } })) as { placeId: number };
  await syncCover(img.placeId);
  return { ok: true };
}

export async function deleteReview(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await prisma.review.delete({ where: { id } });
  revalidateAll();
  revalidatePath("/admin/avis");
}

export async function deleteMessage(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
}

export async function saveAlert(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = alertSchema.safeParse({ message: fd.get("message"), link: fd.get("link") ?? "", active: fd.get("active") === "on" });
  if (!parsed.success) return { ok: false, errors: flattenErrors(parsed.error), message: "Veuillez corriger les champs signalés." };
  const { message, link, active } = parsed.data;
  const current = await prisma.siteAlert.findFirst({ orderBy: { id: "desc" } });
  const data = { message, link: link || null, active: !!active };
  if (current) await prisma.siteAlert.update({ where: { id: (current as { id: number }).id }, data });
  else await prisma.siteAlert.create({ data });
  revalidateTag(ALERT_TAG);
  revalidatePath("/", "layout");
  return { ok: true, message: "Bandeau mis à jour." };
}

/* ───────────── Gestion des administrateurs ───────────── */

export async function createAdminUser(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = adminUserSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) return { ok: false, errors: flattenErrors(parsed.error), message: "Veuillez corriger les champs signalés." };
  const { name, email, password } = parsed.data;
  const exists = await prisma.adminUser.findUnique({ where: { email }, select: { id: true } });
  if (exists) return { ok: false, errors: { email: ["Un administrateur utilise déjà cette adresse."] }, message: "Adresse déjà utilisée." };
  await prisma.adminUser.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 12) } });
  revalidatePath("/admin/utilisateurs");
  return { ok: true, message: `Administrateur ${email} créé.` };
}

export async function changeOwnPassword(_prev: FormState, fd: FormData): Promise<FormState> {
  const session = await requireAdmin();
  const parsed = passwordChangeSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) return { ok: false, errors: flattenErrors(parsed.error), message: "Veuillez corriger les champs signalés." };
  const user = (await prisma.adminUser.findUnique({ where: { id: session.adminId } })) as { passwordHash: string } | null;
  if (!user || !(await bcrypt.compare(parsed.data.current, user.passwordHash))) {
    return { ok: false, errors: { current: ["Mot de passe actuel incorrect."] }, message: "Mot de passe actuel incorrect." };
  }
  await prisma.adminUser.update({ where: { id: session.adminId }, data: { passwordHash: await bcrypt.hash(parsed.data.next, 12) } });
  return { ok: true, message: "Mot de passe modifié." };
}

async function activeCountExcluding(id: number) {
  return (await prisma.adminUser.count({ where: { active: true, id: { not: id } } })) as number;
}

export async function toggleAdminUser(formData: FormData) {
  const session = await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id === session.adminId) return; // on ne se désactive pas soi-même
  const u = (await prisma.adminUser.findUnique({ where: { id }, select: { active: true } })) as { active: boolean } | null;
  if (!u) return;
  if (u.active && (await activeCountExcluding(id)) < 1) return; // toujours au moins un admin actif
  await prisma.adminUser.update({ where: { id }, data: { active: !u.active } });
  revalidatePath("/admin/utilisateurs");
}

export async function deleteAdminUser(formData: FormData) {
  const session = await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id === session.adminId) return; // on ne se supprime pas soi-même
  if ((await activeCountExcluding(id)) < 1) return;
  await prisma.adminUser.delete({ where: { id } });
  revalidatePath("/admin/utilisateurs");
}
