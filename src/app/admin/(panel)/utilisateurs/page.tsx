import { deleteAdminUser, toggleAdminUser } from "@/actions/admin";
import { ChangePasswordForm, CreateAdminForm } from "@/components/admin/admin-user-forms";
import { PageHeader, Panel, Pill } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Utilisateurs" };

export default async function AdminUsers() {
  const me = await requireAdmin();
  const users = (await prisma.adminUser.findMany({ orderBy: { id: "asc" } })) as unknown as {
    id: number; name: string; email: string; active: boolean; createdAt: Date; lastLoginAt: Date | null;
  }[];
  const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });
  return (
    <>
      <PageHeader title="Utilisateurs" description={`${users.length} administrateur${users.length > 1 ? "s" : ""} peuvent gérer le site.`} />
      <div className="relative overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <caption className="sr-only">Liste des administrateurs</caption>
          <thead className="border-b bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="p-3">Nom</th>
              <th scope="col" className="p-3">E-mail</th>
              <th scope="col" className="p-3">Statut</th>
              <th scope="col" className="p-3">Dernière connexion</th>
              <th scope="col" className="p-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id}>
                <th scope="row" className="p-3 font-semibold">{u.name}{u.id === me.adminId && <span className="font-normal text-muted-foreground"> (vous)</span>}</th>
                <td className="p-3">{u.email}</td>
                <td className="p-3"><Pill tone={u.active ? "green" : "yellow"}>{u.active ? "Actif" : "Désactivé"}</Pill></td>
                <td className="p-3">{u.lastLoginAt ? fmt.format(u.lastLoginAt) : "Jamais"}</td>
                <td className="p-3">
                  {u.id !== me.adminId && (
                    <div className="flex flex-wrap justify-end gap-2">
                      <form action={toggleAdminUser}>
                        <input type="hidden" name="id" value={u.id} />
                        <Button type="submit" variant="outline" size="sm">{u.active ? "Désactiver" : "Réactiver"}<span className="sr-only"> {u.email}</span></Button>
                      </form>
                      <form action={deleteAdminUser}>
                        <input type="hidden" name="id" value={u.id} />
                        <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">Supprimer<span className="sr-only"> {u.email}</span></Button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">Il reste toujours au moins un administrateur actif : le dernier ne peut être ni désactivé ni supprimé.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Ajouter un administrateur" id="ajout">
          <CreateAdminForm />
        </Panel>
        <Panel title="Mon mot de passe" id="mdp">
          <ChangePasswordForm />
        </Panel>
      </div>
    </>
  );
}
