"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitContact } from "@/actions/contact";
import { FieldError, FormErrorSummary } from "@/components/site/form-error-summary";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormState } from "@/lib/validators";

const initial: FormState = { ok: false };
const FIELD_IDS = { name: "contact-name", email: "contact-email", subject: "contact-subject", message: "contact-message" };

export function ContactForm({ defaultSubject = "" }: { defaultSubject?: string }) {
  const [state, action, pending] = useActionState(submitContact, initial);
  const [version, setVersion] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const e = state.errors ?? {};

  useEffect(() => {
    if (state.errors) setVersion((v) => v + 1);
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} noValidate className="space-y-5">
      <FormErrorSummary errors={state.errors} fieldIds={FIELD_IDS} version={version} />
      {state.ok && (
        <Alert variant="success" role="status">
          <span>{state.message}</span>
        </Alert>
      )}
      {e.form && (
        <Alert variant="destructive" role="alert">
          <span>{e.form[0]}</span>
        </Alert>
      )}

      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Ne pas remplir</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Nom</Label>
          <Input id="contact-name" name="name" autoComplete="name" required aria-required="true" maxLength={100} aria-invalid={!!e.name} aria-describedby={e.name ? "contact-name-err" : undefined} />
          <FieldError id="contact-name-err" errors={e.name} />
        </div>
        <div>
          <Label htmlFor="contact-email">Adresse e-mail</Label>
          <Input id="contact-email" name="email" type="email" autoComplete="email" required aria-required="true" maxLength={200} aria-invalid={!!e.email} aria-describedby={e.email ? "contact-email-err" : undefined} />
          <FieldError id="contact-email-err" errors={e.email} />
        </div>
      </div>
      <div>
        <Label htmlFor="contact-subject">Sujet</Label>
        <Input id="contact-subject" name="subject" defaultValue={defaultSubject} required aria-required="true" maxLength={200} aria-invalid={!!e.subject} aria-describedby={e.subject ? "contact-subject-err" : undefined} />
        <FieldError id="contact-subject-err" errors={e.subject} />
      </div>
      <div>
        <Label htmlFor="contact-message">Message</Label>
        <Textarea id="contact-message" name="message" rows={7} required aria-required="true" maxLength={3000} aria-invalid={!!e.message} aria-describedby={e.message ? "contact-message-err" : undefined} />
        <FieldError id="contact-message-err" errors={e.message} />
      </div>
      <Button type="submit" variant="cta" size="lg" disabled={pending}>
        {pending ? "Envoi…" : "Envoyer le message"}
      </Button>
    </form>
  );
}
