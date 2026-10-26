import { CalendarDays, Clock, KeyRound, ShieldCheck, UserCheck, UserPlus, Users, UserX } from "lucide-react";
import { ChangePasswordForm, CreateAdminForm } from "@/components/admin/admin-user-forms";
import { UserActions } from "@/components/admin/user-actions";
import { PageHeader, Panel, Pill, StatCard } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Utilisateurs" };

// Avatars aux couleurs du drapeau, attribuées de façon stable selon l'identifiant.
const AVATARS = [
  { band: "bg-[#009639]", circle: "bg-[#009639] text-white" },
  { band: "bg-[#003DA5]", circle: "bg-[#003DA5] text-white" },
  { band: "bg-[#EF3340]", circle: "bg-[#EF3340] text-white" },
  { band: "bg-[#FFD100]", circle: "bg-[#FFD100] text-[#1a1600]" },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "A") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

const rtf = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });
function relative(date: Date) {
  const s = Math.round((date.getTime() - Date.now()) / 1000);
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [unit, sec] of steps) if (Math.abs(s) >= sec) return rtf.format(Math.round(s / sec), unit);
  return "à l'instant";
}

export default async function AdminUsers() {
  const me = await requireAdmin();
  const users = (await prisma.adminUser.findMany({ orderBy: { id: "asc" } })) as unknown as {
    id: number; name: string; email: string; active: boolean; createdAt: Date; lastLoginAt: Date | null;
  }[];
  const active = users.filter((u) => u.active).length;
  const monthAgo = Date.now() - 30 * 86400 * 1000;
  const recent = users.filter((u) => u.lastLoginAt && u.lastLoginAt.getTime() > monthAgo).length;
  const fmtDay = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });
  const fmtFull = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" });

  return (
    <>
      <PageHeader
        title="Utilisateurs"
        description="Les personnes qui peuvent gérer le contenu de GoComores."
        actions={<Button asChild><a href="#ajout"><UserPlus aria-hidden="true" /> Ajouter un administrateur</a></Button>}
      />

      <div className="admin-stagger grid gap-4 sm:grid-cols-3">
        <StatCard label="Administrateurs" value={users.length} icon={Users} tone="blue" />
        <StatCard label="Comptes actifs" value={active} icon={UserCheck} tone="green" hint={users.length - active ? `${users.length - active} désactivé${users.length - active > 1 ? "s" : ""}` : "Aucun compte désactivé"} />
        <StatCard label="Connectés ce mois-ci" value={recent} icon={Clock} tone="yellow" />
      </div>

      <h2 className="mb-4 mt-10 text-lg font-bold">Équipe</h2>
      <ul className="admin-stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {users.map((u) => {
          const look = AVATARS[(u.id - 1) % AVATARS.length];
          const isMe = u.id === me.adminId;
          return (
            <li key={u.id} className={cn("admin-lift relative flex flex-col overflow-hidden rounded-2xl border bg-card", !u.active && "opacity-75")}>
              <div aria-hidden="true" className={cn("h-16", look.band)}>
                <div className="h-full w-full bg-[radial-gradient(circle_at_85%_-20%,rgb(255_255_255/0.35),transparent_55%)]" />
              </div>
              <div className="-mt-9 flex flex-1 flex-col px-5 pb-5">
                <span aria-hidden="true" className={cn("grid size-[4.5rem] place-items-center rounded-2xl text-2xl font-bold shadow-md ring-4 ring-card", look.circle, !u.active && "grayscale")}>
                  {initials(u.name)}
                </span>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold">{u.name}</h3>
                  {isMe && <Pill tone="blue">Vous</Pill>}
                  {u.active ? <Pill tone="green"><ShieldCheck className="size-3.5" aria-hidden="true" /> Actif</Pill> : <Pill tone="red"><UserX className="size-3.5" aria-hidden="true" /> Désactivé</Pill>}
                </div>
                <a href={`mailto:${u.email}`} className="mt-0.5 break-all text-sm text-link hover:underline">{u.email}</a>
                <dl className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 shrink-0" aria-hidden="true" />
                    <dt className="sr-only">Dernière connexion</dt>
                    <dd>{u.lastLoginAt ? <>Connecté <time dateTime={u.lastLoginAt.toISOString()} title={fmtFull.format(u.lastLoginAt)}>{relative(u.lastLoginAt)}</time></> : "Jamais connecté"}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
                    <dt className="sr-only">Création du compte</dt>
                    <dd>Membre depuis le {fmtDay.format(u.createdAt)}</dd>
                  </div>
                </dl>
                <div className="mt-auto pt-5">
                  {isMe ? (
                    <Button asChild variant="secondary" size="sm" className="w-full"><a href="#mdp"><KeyRound aria-hidden="true" /> Changer mon mot de passe</a></Button>
                  ) : (
                    <UserActions id={u.id} email={u.email} active={u.active} />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-sm text-muted-foreground">Il reste toujours au moins un administrateur actif : le dernier ne peut être ni désactivé ni supprimé.</p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div id="ajout" className="scroll-mt-24">
          <Panel title={<span className="inline-flex items-center gap-2"><UserPlus className="size-5 text-primary" aria-hidden="true" /> Ajouter un administrateur</span>} id="ajout-titre" description="La personne pourra se connecter immédiatement avec ces identifiants.">
            <CreateAdminForm />
          </Panel>
        </div>
        <div id="mdp" className="scroll-mt-24">
          <Panel title={<span className="inline-flex items-center gap-2"><KeyRound className="size-5 text-primary" aria-hidden="true" /> Mon mot de passe</span>} id="mdp-titre" description="Choisissez une phrase longue et facile à retenir.">
            <ChangePasswordForm />
          </Panel>
        </div>
      </div>
    </>
  );
}
