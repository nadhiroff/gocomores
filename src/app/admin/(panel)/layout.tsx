import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const metadata = { robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const toConfirm = (await prisma.place.count({ where: { status: "TO_CONFIRM" } })) as number;
  return (
    <AdminShell userName={session.user?.name ?? "Administrateur"} counts={{ "/admin/lieux": toConfirm }}>
      {children}
    </AdminShell>
  );
}
