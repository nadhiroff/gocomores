import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const metadata = { robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Le compteur n'est rendu que si requireAdmin réussit (sinon redirection) : on peut lancer les deux en parallèle.
  const [session, toConfirm] = await Promise.all([requireAdmin(), prisma.place.count({ where: { status: "TO_CONFIRM" } }) as Promise<number>]);
  return (
    <AdminShell userName={session.user?.name ?? "Administrateur"} counts={{ "/admin/lieux": toConfirm }}>
      {children}
    </AdminShell>
  );
}
