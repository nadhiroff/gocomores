"use client";
import { useActionState } from "react";
import { changeOwnPassword, createAdminUser } from "@/actions/admin";
import { FieldError } from "@/components/site/form-error-summary";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormState } from "@/lib/validators";

const init: FormState = { ok: false };

function Msg({ s }: { s: FormState }) {
  if (!s.message) return null;
  return (
    <Alert variant={s.ok ? "success" : "destructive"} role={s.ok ? "status" : "alert"}>
      <span>{s.message}</span>
    </Alert>
  );
}

export function CreateAdminForm() {
  const [s, action, pending] = useActionState(createAdminUser, init);
  const e = s.errors ?? {};
  return (
    <form action={action} className="space-y-4" key={s.ok ? "ok" : "form"}>
      <Msg s={s} />
      <div>
        <Label htmlFor="n-name">Nom</Label>
        <Input id="n-name" name="name" required aria-invalid={!!e.name} />
        <FieldError id="n-name-e" errors={e.name} />
      </div>
      <div>
        <Label htmlFor="n-email">Adresse e-mail</Label>
        <Input id="n-email" name="email" type="email" autoComplete="off" required aria-invalid={!!e.email} />
        <FieldError id="n-email-e" errors={e.email} />
      </div>
      <div>
        <Label htmlFor="n-pass">Mot de passe (12 caractères minimum)</Label>
        <Input id="n-pass" name="password" type="password" autoComplete="new-password" required minLength={12} aria-invalid={!!e.password} />
        <FieldError id="n-pass-e" errors={e.password} />
      </div>
      <Button type="submit" variant="cta" disabled={pending}>{pending ? "Création…" : "Créer l'administrateur"}</Button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [s, action, pending] = useActionState(changeOwnPassword, init);
  const e = s.errors ?? {};
  return (
    <form action={action} className="space-y-4" key={s.ok ? "ok" : "form"}>
      <Msg s={s} />
      <div>
        <Label htmlFor="c-cur">Mot de passe actuel</Label>
        <Input id="c-cur" name="current" type="password" autoComplete="current-password" required aria-invalid={!!e.current} />
        <FieldError id="c-cur-e" errors={e.current} />
      </div>
      <div>
        <Label htmlFor="c-new">Nouveau mot de passe (12 caractères minimum)</Label>
        <Input id="c-new" name="next" type="password" autoComplete="new-password" required minLength={12} aria-invalid={!!e.next} />
        <FieldError id="c-new-e" errors={e.next} />
      </div>
      <div>
        <Label htmlFor="c-conf">Confirmer le nouveau mot de passe</Label>
        <Input id="c-conf" name="confirm" type="password" autoComplete="new-password" required aria-invalid={!!e.confirm} />
        <FieldError id="c-conf-e" errors={e.confirm} />
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Enregistrement…" : "Changer mon mot de passe"}</Button>
    </form>
  );
}
