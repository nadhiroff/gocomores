"use client";
import { useActionState } from "react";
import { saveAlert } from "@/actions/admin";
import { FieldError } from "@/components/site/form-error-summary";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormState } from "@/lib/validators";

export function AlertForm({ message, link, active }: { message: string; link: string; active: boolean }) {
  const [state, action, pending] = useActionState(saveAlert, { ok: false } as FormState);
  const e = state.errors ?? {};
  return (
    <form action={action} className="max-w-2xl space-y-5">
      {state.message && <Alert variant={state.ok ? "success" : "destructive"} role={state.ok ? "status" : "alert"}><span>{state.message}</span></Alert>}
      <div>
        <Label htmlFor="a-msg">Message</Label>
        <Textarea id="a-msg" name="message" rows={3} maxLength={400} defaultValue={message} required aria-invalid={!!e.message} />
        <FieldError id="a-msg-e" errors={e.message} />
      </div>
      <div>
        <Label htmlFor="a-link">Lien (chemin interne ou URL https)</Label>
        <Input id="a-link" name="link" defaultValue={link} aria-invalid={!!e.link} />
        <FieldError id="a-link-e" errors={e.link} />
      </div>
      <label className="inline-flex min-h-11 items-center gap-3 font-medium">
        <input type="checkbox" name="active" defaultChecked={active} className="size-5" /> Afficher le bandeau
      </label>
      <div><Button type="submit" variant="cta" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</Button></div>
    </form>
  );
}
