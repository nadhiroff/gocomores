"use client";
import { useActionState } from "react";
import { login } from "@/actions/admin";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormState } from "@/lib/validators";

export function LoginForm({ from }: { from: string }) {
  const [state, action, pending] = useActionState(login, { ok: false } as FormState);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="from" value={from} />
      {state.message && (
        <Alert variant="destructive" role="alert">
          <span>{state.message}</span>
        </Alert>
      )}
      <div>
        <Label htmlFor="email">Adresse e-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
