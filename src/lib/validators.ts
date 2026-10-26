import { z } from "zod";

// Retire caractères de contrôle et balises HTML : le texte est ensuite échappé à l'affichage par React.
const clean = (s: string) =>
  s
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<[^>]*>/g, "")
    .trim();

const text = (min: number, max: number, label: string) =>
  z
    .string({ required_error: `${label} : champ requis.` })
    .transform(clean)
    .pipe(
      z
        .string()
        .min(min, min === 1 ? `${label} : champ requis.` : `${label} : ${min} caractères minimum.`)
        .max(max, `${label} : ${max} caractères maximum.`),
    );

export const reviewSchema = z.object({
  authorName: text(2, 60, "Pseudo"),
  rating: z.coerce
    .number({ invalid_type_error: "Note : choisissez de 1 à 5 étoiles." })
    .int("Note : choisissez de 1 à 5 étoiles.")
    .min(1, "Note : choisissez de 1 à 5 étoiles.")
    .max(5, "Note : choisissez de 1 à 5 étoiles."),
  comment: text(10, 1000, "Commentaire"),
  placeSlug: z.string().max(160).optional().or(z.literal("")),
  website: z.string().max(200).optional(), // honeypot
});

export const contactSchema = z.object({
  name: text(2, 100, "Nom"),
  email: z
    .string({ required_error: "E-mail : champ requis." })
    .trim()
    .toLowerCase()
    .email("E-mail : adresse invalide.")
    .max(200, "E-mail : 200 caractères maximum."),
  subject: text(3, 200, "Sujet"),
  message: text(10, 3000, "Message"),
  website: z.string().max(200).optional(), // honeypot
});

export const alertSchema = z.object({
  message: text(5, 400, "Message"),
  link: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || v.startsWith("/") || /^https:\/\//.test(v), "Lien : chemin interne (/...) ou URL https://.")
    .optional(),
  active: z.coerce.boolean().optional(),
});

const optionalNumber = (label: string, min: number, max: number) =>
  z.coerce
    .number({ invalid_type_error: `${label} : nombre attendu.` })
    .min(min, `${label} : minimum ${min}.`)
    .max(max, `${label} : maximum ${max}.`);

export const placeSchema = z.object({
  name: text(2, 200, "Nom"),
  slug: z
    .string()
    .trim()
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug : minuscules, chiffres et tirets uniquement.")
    .optional()
    .or(z.literal("")),
  islandId: z.coerce.number().int().positive("Île : champ requis."),
  categoryId: z.coerce.number().int().positive("Catégorie : champ requis."),
  summary: text(10, 400, "Résumé"),
  history: text(10, 8000, "Histoire"),
  lat: optionalNumber("Latitude", -90, 90),
  lng: optionalNumber("Longitude", -180, 180),
  googleMapsUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https:\/\//.test(v), "Lien Google Maps : URL https:// attendue.")
    .optional(),
  status: z.enum(["VERIFIED", "TO_CONFIRM"]),
  verifiedAt: z.string().optional(),
  coverAlt: z.string().trim().max(300).optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
export type ContactInput = z.infer<typeof contactSchema>;

export type FieldErrors = Record<string, string[]>;

export function flattenErrors(err: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "form");
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

export interface FormState {
  ok: boolean;
  message?: string;
  errors?: FieldErrors;
}

export const adminUserSchema = z.object({
  name: text(2, 100, "Nom"),
  email: z.string({ required_error: "E-mail : champ requis." }).trim().toLowerCase().email("E-mail : adresse invalide.").max(200),
  password: z.string({ required_error: "Mot de passe : champ requis." }).min(12, "Mot de passe : 12 caractères minimum.").max(200, "Mot de passe : 200 caractères maximum."),
});

export const passwordChangeSchema = z
  .object({
    current: z.string().min(1, "Mot de passe actuel : champ requis.").max(200),
    next: z.string().min(12, "Nouveau mot de passe : 12 caractères minimum.").max(200),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "Confirmation : les deux mots de passe diffèrent." });
