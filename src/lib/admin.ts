import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * Défense en profondeur : chaque page et action admin revérifie la session ET que le compte
 * existe toujours et est actif en base (un admin supprimé ou désactivé perd l'accès immédiatement).
 */
export async function requireAdmin() {
  const session = await auth();
  const id = Number(session?.user?.id);
  if (!session?.user || !Number.isInteger(id)) redirect("/admin/login");
  const user = (await prisma.adminUser.findUnique({ where: { id }, select: { id: true, active: true } })) as { id: number; active: boolean } | null;
  if (!user || !user.active) redirect("/admin/login");
  return { ...session, adminId: user.id };
}
