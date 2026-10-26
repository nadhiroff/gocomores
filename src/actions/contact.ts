"use server";

import { prisma } from "@/lib/db";
import { getClientIp, hashIp } from "@/lib/ip";
import { sendContactMail } from "@/lib/mail";
import { contactRateLimited } from "@/lib/rate-limit";
import { contactSchema, flattenErrors, type FormState } from "@/lib/validators";

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData.entries());

  if (typeof raw.website === "string" && raw.website.trim() !== "") {
    return { ok: true, message: "Merci, votre message est bien parti. Réponse sous 24 à 48 h." };
  }
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, errors: flattenErrors(parsed.error), message: "Veuillez corriger les champs signalés." };
  }

  try {
    const ipHash = hashIp(await getClientIp());
    if (await contactRateLimited(ipHash)) {
      const msg = "Vous avez envoyé plusieurs messages récemment. Réessayez dans une heure.";
      return { ok: false, errors: { form: [msg] }, message: msg };
    }
    // Stockage d'abord : le message n'est jamais perdu, même si le SMTP est indisponible.
    await prisma.contactMessage.create({ data: { ...parsed.data, ipHash } });
    await sendContactMail(parsed.data);
    return { ok: true, message: "Merci, votre message est bien parti. Réponse sous 24 à 48 h." };
  } catch (e) {
    console.error("submitContact", e);
    const msg = "Une erreur est survenue. Écrivez-nous directement par e-mail.";
    return { ok: false, errors: { form: [msg] }, message: msg };
  }
}
