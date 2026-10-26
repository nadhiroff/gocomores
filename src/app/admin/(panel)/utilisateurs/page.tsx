import { deleteAdminUser, toggleAdminUser } from "@/actions/admin";
import { ChangePasswordForm, CreateAdminForm } from "@/components/admin/admin-user-forms";
import { Badge } from "@/components/ui/badge";
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
      <h1 className="text-3xl font-bold">Administrateurs ({users.length})</h1>
      <div className="relative mt-6 overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <caption className="sr-only">Liste des administrateurs</caption>
          <thead className="border-b bg-muted/60">
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
                <td className="p-3"><Badge variant={u.active ? "verified" : "toConfirm"}>{u.active ? "Actif" : "Désactivé"}</Badge></td>
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
                        <Button type="submit" variant="destructive" size="sm">Supprimer<span className="sr-only"> {u.email}</span></Button>
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

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="ajout" className="rounded-xl border bg-card p-6">
          <h2 id="ajout" className="mb-4 text-2xl font-bold">Ajouter un administrateur</h2>
          <CreateAdminForm />
        </section>
        <section aria-labelledby="mdp" className="rounded-xl border bg-card p-6">
          <h2 id="mdp" className="mb-4 text-2xl font-bold">Mon mot de passe</h2>
          <ChangePasswordForm />
        </section>
      </div>
    </>
  );
}
