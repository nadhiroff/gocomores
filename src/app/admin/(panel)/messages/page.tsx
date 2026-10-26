import { Mail, Reply, Trash2 } from "lucide-react";
import { deleteMessage } from "@/actions/admin";
import { EmptyNote, PageHeader } from "@/components/admin/ui";
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
      <PageHeader title="Messages" description={`${rows.length} message${rows.length > 1 ? "s" : ""} reçu${rows.length > 1 ? "s" : ""} via le formulaire de contact.`} />
      {rows.length ? (
        <ul className="admin-stagger space-y-3">
          {rows.map((m) => (
            <li key={m.id} className="admin-lift rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-lg font-bold">{m.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {m.name} · <a className="text-link underline" href={`mailto:${m.email}`}>{m.email}</a>
                  </p>
                </div>
                <time dateTime={m.createdAt.toISOString()} className="shrink-0 text-sm text-muted-foreground">{fmt.format(m.createdAt)}</time>
              </div>
              <p className="mt-3 whitespace-pre-line break-words rounded-xl bg-muted/60 p-4">{m.message}</p>
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <Button asChild variant="secondary" size="sm">
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}><Reply aria-hidden="true" /> Répondre<span className="sr-only"> à {m.name}</span></a>
                </Button>
                <form action={deleteMessage}>
                  <input type="hidden" name="id" value={m.id} />
                  <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                    <Trash2 aria-hidden="true" /> Supprimer<span className="sr-only"> le message « {m.subject} »</span>
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyNote icon={Mail}>Aucun message.</EmptyNote>
      )}
    </>
  );
}
