"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
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
  for (const p of ["/", "/destinations", "/carte", "/avis", "/sitemap.xml"]) revalidatePath(p);
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
    coverAlt: d.coverAlt || null,
    islandId: d.islandId,
    categoryId: d.categoryId,
  };

  const place = id ? await prisma.place.update({ where: { id }, data }) : await prisma.place.create({ data });
  const placeId = (place as { id: number }).id;

  // Photos téléversées : validées par leur contenu réel.
  const files = fd.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 8);
  const alt = String(fd.get("photoAlt") ?? "").trim().slice(0, 300);
  if (files.length && !alt) return { ok: false, errors: { photoAlt: ["Texte alternatif obligatoire pour les photos."] }, message: "Ajoutez un texte alternatif décrivant la photo." };
  const existing = await prisma.placeImage.count({ where: { placeId } });
  let order = existing;
  const problems: string[] = [];
  for (const file of files) {
    const res = await saveImage(file);
    if ("error" in res) {
      problems.push(`${file.name} : ${res.error}`);
      continue;
    }
    await prisma.placeImage.create({ data: { placeId, url: res.url, alt, order: order++ } });
    if (existing === 0 && order === 1) await prisma.place.update({ where: { id: placeId }, data: { coverImage: res.url, coverAlt: d.coverAlt || alt } });
  }

  revalidateAll(slug);
  if (problems.length) return { ok: false, errors: { photos: problems }, message: "Lieu enregistré, mais certaines photos ont été refusées." };
  if (!id) redirect(`/admin/lieux/${placeId}`);
  return { ok: true, message: "Lieu enregistré." };
}

export async function deletePlace(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await prisma.place.delete({ where: { id } });
  revalidateAll();
  redirect("/admin");
}

export async function deletePlaceImage(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const placeId = Number(formData.get("placeId"));
  if (!Number.isInteger(id)) return;
  await prisma.placeImage.delete({ where: { id } });
  const first = await prisma.placeImage.findFirst({ where: { placeId }, orderBy: { order: "asc" } });
  await prisma.place.update({
    where: { id: placeId },
    data: { coverImage: (first as { url: string } | null)?.url ?? null, coverAlt: (first as { alt: string } | null)?.alt ?? null },
  });
  revalidateAll();
  revalidatePath(`/admin/lieux/${placeId}`);
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
