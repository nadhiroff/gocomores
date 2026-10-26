"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getClientIp, hashIp } from "@/lib/ip";
import { reviewRateLimited } from "@/lib/rate-limit";
import { flattenErrors, reviewSchema, type FormState } from "@/lib/validators";

export async function submitReview(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = reviewSchema.safeParse(raw);

  // Honeypot : un robot remplit le champ caché. On répond « succès » sans rien enregistrer.
  if (typeof raw.website === "string" && raw.website.trim() !== "") {
    return { ok: true, message: "Merci ! Votre avis a été publié." };
  }
  if (!parsed.success) {
    return { ok: false, errors: flattenErrors(parsed.error), message: "Veuillez corriger les champs signalés." };
  }

  try {
    const ipHash = hashIp(await getClientIp());
    if (await reviewRateLimited(ipHash)) {
      return {
        ok: false,
        errors: { form: ["Vous avez déjà publié plusieurs avis récemment. Réessayez dans une heure."] },
        message: "Vous avez déjà publié plusieurs avis récemment. Réessayez dans une heure.",
      };
    }

    let placeId: number | null = null;
    const slug = parsed.data.placeSlug;
    if (slug) {
      const place = await prisma.place.findUnique({ where: { slug }, select: { id: true } });
      placeId = (place as { id: number } | null)?.id ?? null;
    }

    await prisma.review.create({
      data: {
        authorName: parsed.data.authorName,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        ipHash,
        placeId,
      },
    });

    revalidatePath("/");
    revalidatePath("/avis");
    if (slug) revalidatePath(`/destinations/${slug}`);
    return { ok: true, message: "Merci ! Votre avis est publié." };
  } catch (e) {
    console.error("submitReview", e);
    return { ok: false, errors: { form: ["Une erreur est survenue. Réessayez dans un instant."] }, message: "Une erreur est survenue. Réessayez dans un instant." };
  }
}
