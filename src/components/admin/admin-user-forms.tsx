"use client";
import { useActionState, useState } from "react";
import { Check, Eye, EyeOff, KeyRound, UserPlus } from "lucide-react";
import { changeOwnPassword, createAdminUser } from "@/actions/admin";
import { FieldError } from "@/components/site/form-error-summary";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FormState } from "@/lib/validators";

const init: FormState = { ok: false };

function Msg({ s }: { s: FormState }) {
  if (!s.message) return null;
  return (
    <Alert variant={s.ok ? "success" : "destructive"} role={s.ok ? "status" : "alert"} className="admin-page">
      <span>{s.message}</span>
    </Alert>
  );
}

// Rouge → jaune → bleu → vert : les couleurs du drapeau, de la plus faible à la plus solide.
const LEVELS = [
  { label: "Trop court", color: "bg-[#EF3340]" },
  { label: "Faible", color: "bg-[#EF3340]" },
  { label: "Moyen", color: "bg-[#FFD100]" },
  { label: "Bon", color: "bg-[#003DA5] dark:bg-[#3b78e7]" },
  { label: "Excellent", color: "bg-[#009639]" },
];

function strength(pw: string) {
  if (pw.length < 12) return 0;
  let score = 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 20) score++;
  return score;
}

function PasswordField({ id, name, label, autoComplete, errors, meter, value, onChange }: {
  id: string; name: string; label: string; autoComplete: string; errors?: string[]; meter?: boolean; value: string; onChange: (v: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const level = strength(value);
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input id={id} name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} required value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!errors} aria-describedby={meter ? `${id}-s` : undefined} className="pr-12" />
        <button type="button" onClick={() => setVisible((v) => !v)} className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-muted-foreground hover:text-foreground" aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={visible}>
          {visible ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
        </button>
      </div>
      {meter && (
        <div className="mt-2">
          <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className={cn("h-1.5 rounded-full bg-muted transition-colors duration-300", value && level >= n && LEVELS[level].color)} />
            ))}
          </div>
          <p id={`${id}-s`} aria-live="polite" className="mt-1 text-xs text-muted-foreground">
            {value ? <>Robustesse : <strong className="text-foreground">{LEVELS[level].label}</strong>{level === 0 && ` (${value.length}/12 caractères)`}</> : "12 caractères minimum. Astuce : une phrase de plusieurs mots."}
          </p>
        </div>
      )}
      <FieldError id={`${id}-e`} errors={errors} />
    </div>
  );
}

export function CreateAdminForm() {
  const [s, action, pending] = useActionState(createAdminUser, init);
  const [password, setPassword] = useState("");
  const e = s.errors ?? {};
  return (
    <form action={action} className="space-y-4" key={s.ok ? s.message : "form"}>
      <Msg s={s} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="n-name">Nom</Label>
          <Input id="n-name" name="name" required placeholder="Ex. : Fatima Said" aria-invalid={!!e.name} />
          <FieldError id="n-name-e" errors={e.name} />
        </div>
        <div>
          <Label htmlFor="n-email">Adresse e-mail</Label>
          <Input id="n-email" name="email" type="email" autoComplete="off" required placeholder="nom@exemple.km" aria-invalid={!!e.email} />
          <FieldError id="n-email-e" errors={e.email} />
        </div>
      </div>
      <PasswordField id="n-pass" name="password" label="Mot de passe" autoComplete="new-password" errors={e.password} meter value={password} onChange={setPassword} />
      <Button type="submit" disabled={pending}><UserPlus aria-hidden="true" /> {pending ? "Création…" : "Créer l'administrateur"}</Button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [s, action, pending] = useActionState(changeOwnPassword, init);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const e = s.errors ?? {};
  const matches = confirm.length > 0 && confirm === next;
  return (
    <form action={action} className="space-y-4" key={s.ok ? s.message : "form"}>
      <Msg s={s} />
      <PasswordField id="c-cur" name="current" label="Mot de passe actuel" autoComplete="current-password" errors={e.current} value={current} onChange={setCurrent} />
      <PasswordField id="c-new" name="next" label="Nouveau mot de passe" autoComplete="new-password" errors={e.next} meter value={next} onChange={setNext} />
      <div>
        <PasswordField id="c-conf" name="confirm" label="Confirmer le nouveau mot de passe" autoComplete="new-password" errors={e.confirm} value={confirm} onChange={setConfirm} />
        {confirm && (
          <p aria-live="polite" className={cn("mt-1 flex items-center gap-1 text-xs", matches ? "text-primary" : "text-muted-foreground")}>
            {matches ? <><Check className="size-3.5" aria-hidden="true" /> Les deux mots de passe correspondent.</> : "Les deux mots de passe ne correspondent pas encore."}
          </p>
        )}
      </div>
      <Button type="submit" variant="secondary" disabled={pending}><KeyRound aria-hidden="true" /> {pending ? "Enregistrement…" : "Changer mon mot de passe"}</Button>
    </form>
  );
}
