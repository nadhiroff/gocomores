import { deleteMessage } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Messages" };

export default async function AdminMessages() {
  const rows = (await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 })) as unknown as {
    id: number; name: string; email: string; subject: string; message: string; createdAt: Date;
  }[];
  const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" });
  return (
    <>
      <h1 className="text-3xl font-bold">Messages ({rows.length})</h1>
      <ul className="mt-6 space-y-4">
        {rows.map((m) => (
          <li key={m.id} className="rounded-xl border bg-card p-5">
            <p className="font-semibold">{m.subject}</p>
            <p className="text-sm text-muted-foreground">
              {m.name} · <a className="text-link underline" href={`mailto:${m.email}`}>{m.email}</a> · {fmt.format(m.createdAt)}
            </p>
            <p className="mt-3 whitespace-pre-line break-words">{m.message}</p>
            <form action={deleteMessage} className="mt-3">
              <input type="hidden" name="id" value={m.id} />
              <Button type="submit" variant="destructive" size="sm">Supprimer<span className="sr-only"> le message « {m.subject} »</span></Button>
            </form>
          </li>
        ))}
        {!rows.length && <li className="text-muted-foreground">Aucun message.</li>}
      </ul>
    </>
  );
}
