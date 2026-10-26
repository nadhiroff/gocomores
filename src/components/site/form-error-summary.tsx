"use client";
import { useEffect, useRef } from "react";
import type { FieldErrors } from "@/lib/validators";

/** Résumé d'erreurs focalisable : reçoit le focus après un envoi invalide, chaque entrée pointe vers son champ. */
export function FormErrorSummary({ errors, fieldIds, version }: { errors?: FieldErrors; fieldIds: Record<string, string>; version: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const entries = Object.entries(errors ?? {}).filter(([k]) => k !== "form");
  useEffect(() => {
    if (entries.length) ref.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);
  if (!entries.length) return null;
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      aria-labelledby="error-summary-title"
      className="rounded-xl border-2 border-destructive bg-[#FEE2E2] p-4 text-[#7F1D1D] focus-visible:outline-offset-4 dark:bg-[#450A0A] dark:text-[#FECACA]"
    >
      <h2 id="error-summary-title" className="font-sans text-base font-bold">
        Le formulaire contient {entries.length > 1 ? `${entries.length} erreurs` : "une erreur"}
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {entries.map(([key, msgs]) => (
          <li key={key}>
            <a href={`#${fieldIds[key] ?? key}`} className="font-medium underline">
              {msgs[0]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="mt-1.5 text-sm font-medium text-destructive">
      {errors[0]}
    </p>
  );
}
