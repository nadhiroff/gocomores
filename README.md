# GoComores

Guide touristique indépendant des Comores (100 % français). Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui · MySQL + Prisma · Zod · Leaflet/OpenStreetMap · Auth.js · Nodemailer.

Aucun cookie de suivi, aucun analytics tiers, polices auto-hébergées.

## Démarrage

```bash
npm install
cp .env.example .env            # puis renseigner les variables
npx prisma migrate dev          # crée les tables (migrations init + admin_users)
npx prisma db seed              # 3 îles, 6 catégories, 10 lieux, bandeau d'alerte
# Créer le premier administrateur (stocké dans MySQL, table admin_users) :
npm run admin:create -- "vous@exemple.com" "mot de passe de 12 caractères minimum" "Votre nom"
npm run dev                     # http://localhost:3000
```

Production : `npm run build && npm start` (utiliser `npx prisma migrate deploy` au lieu de `migrate dev`).

### Variables d'environnement

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | Connexion MySQL |
| `AUTH_SECRET` | Secret Auth.js **et** sel du hachage d'IP (`openssl rand -base64 32`) |
| `SMTP_*`, `SMTP_FROM`, `CONTACT_TO` | Envoi du formulaire de contact (sans SMTP, le message est quand même stocké) |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_EMAIL` | URL publique et e-mail affiché |
| `UPLOAD_DIR` | Dossier des photos téléversées (servies via `/uploads/…`) |

## Structure

- `design-system/gocomores/MASTER.md` : design system (ui-ux-pro-max) + décisions et écarts documentés.
- `src/app/globals.css` : tokens (variables CSS, clair/sombre), mappés à Tailwind via `@theme inline`.
- `prisma/` : `schema.prisma`, migration `init`, `seed.ts`.
- `src/actions/` : server actions (avis, contact, admin) validées par Zod.
- `public/images/` : photos (Wikimedia Commons, licences libres) ; auteurs et licences dans `src/lib/photo-credits.ts`, affichés sur `/credits-photos`.

## Contenu éditorial : à faire avant la mise en ligne

- Seuls **Mont Karthala** et la **vieille ville de Moroni** sont `VERIFIED` (recoupés avec Wikipedia/Archnet le 10/10/2026). Tous les autres lieux, ainsi que accès/horaires/tarifs, sont `TO_CONFIRM`.
- Les photos viennent de Wikimedia Commons. Domoni, Itsamia et le pic Ntringui n'ont pas de photo du lieu exact (photo ancienne ou des environs) : à remplacer par vos propres photos via `/admin`. Toute nouvelle photo tierce doit être créditée dans `src/lib/photo-credits.ts`.
- Compléter les champs `[À REMPLIR]` : page **À propos** (nom, texte), **Mentions légales** (éditeur, hébergeur), **Confidentialité** (durées de conservation).
- La page **Infos voyageurs** (Karthala, cyclones, formalités) est à confirmer auprès de sources officielles ; les formalités d'entrée n'y sont volontairement pas détaillées.
- **Mayotte** n'est pas incluse : décision en attente.

## Sécurité

Server actions revalidées par session ; honeypot + limite par IP hachée (HMAC, IP jamais stockée) sur avis et contact ; limite de tentatives de connexion ; uploads validés par octets magiques (SVG refusé) ; en-têtes de sécurité ; JSON-LD échappé.

## Administrateurs

Les comptes sont dans la table `admin_users` (mots de passe hachés avec bcrypt, jamais en clair). Le premier se crée avec `npm run admin:create`; les suivants se gèrent dans `/admin/utilisateurs` (ajout, changement de mot de passe, désactivation, suppression). Un compte supprimé ou désactivé perd l'accès immédiatement.
# gocomores
