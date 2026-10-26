"use client";
import { useActionState, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { saveAlert } from "@/actions/admin";
import { FieldError } from "@/components/site/form-error-summary";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FormState } from "@/lib/validators";

export function AlertForm({ message, link, active }: { message: string; link: string; active: boolean }) {
  const [state, action, pending] = useActionState(saveAlert, { ok: false } as FormState);
  const [msg, setMsg] = useState(message);
  const [href, setHref] = useState(link);
  const [on, setOn] = useState(active);
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-5">
      {state.message && <Alert variant={state.ok ? "success" : "destructive"} role={state.ok ? "status" : "alert"}><span>{state.message}</span></Alert>}

      <div>
        <p className="mb-2 text-sm font-semibold">Aperçu</p>
        <div className={cn("overflow-hidden rounded-xl border transition-opacity", !on && "opacity-50")}>
          <div className="flex min-h-14 flex-wrap items-center gap-x-4 gap-y-1 bg-[#082F49] px-4 py-2 text-sm text-white">
            <ShieldAlert className="size-5 shrink-0 text-[#FDBA74]" aria-hidden="true" />
            <p className="flex-1 basis-60 leading-snug">{msg || "Votre message…"}</p>
            {href && <span className="font-semibold text-[#FDBA74] underline underline-offset-4">{href.startsWith("/") ? "Informations pratiques" : "Consulter la source"}</span>}
          </div>
        </div>
        {!on && <p className="mt-1 text-sm text-muted-foreground">Bandeau masqué : il n&apos;apparaîtra pas sur le site.</p>}
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <Label htmlFor="a-msg">Message</Label>
          <span className="text-xs tabular-nums text-muted-foreground">{msg.length} / 400</span>
        </div>
        <Textarea id="a-msg" name="message" rows={3} maxLength={400} value={msg} onChange={(ev) => setMsg(ev.target.value)} required aria-invalid={!!e.message} />
        <FieldError id="a-msg-e" errors={e.message} />
      </div>
      <div>
        <Label htmlFor="a-link">Lien (chemin interne ou URL https)</Label>
        <Input id="a-link" name="link" value={href} onChange={(ev) => setHref(ev.target.value)} placeholder="/infos-voyageurs" aria-invalid={!!e.link} />
        <FieldError id="a-link-e" errors={e.link} />
      </div>
      <label className="flex min-h-11 items-center gap-3 font-medium">
        <input type="checkbox" name="active" checked={on} onChange={(ev) => setOn(ev.target.checked)} className="size-5 accent-[var(--primary)]" /> Afficher le bandeau sur le site
      </label>
      <div><Button type="submit" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</Button></div>
    </form>
  );
}
