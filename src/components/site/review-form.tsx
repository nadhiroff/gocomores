"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { submitReview } from "@/actions/reviews";
import { FieldError, FormErrorSummary } from "@/components/site/form-error-summary";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FormState } from "@/lib/validators";

const initial: FormState = { ok: false };
const MAX = 1000;
const FIELD_IDS = { authorName: "review-name", rating: "review-rating-1", comment: "review-comment" };

export function ReviewForm({ placeSlug, placeName }: { placeSlug?: string; placeName?: string }) {
  const [state, action, pending] = useActionState(submitReview, initial);
  const [rating, setRating] = useState(0);
  const [count, setCount] = useState(0);
  const [version, setVersion] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const e = state.errors ?? {};

  useEffect(() => {
    if (state.errors) setVersion((v) => v + 1);
    if (state.ok) {
      formRef.current?.reset();
      setRating(0);
      setCount(0);
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} noValidate className="space-y-6" aria-describedby="review-privacy">
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

      {placeSlug && <input type="hidden" name="placeSlug" value={placeSlug} />}
      {placeName && (
        <p className="text-sm text-muted-foreground">
          Avis sur : <strong className="text-foreground">{placeName}</strong>
        </p>
      )}

      {/* Honeypot : invisible pour les humains et les lecteurs d'écran. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="review-website">Ne pas remplir</label>
        <input id="review-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <Label htmlFor="review-name">Pseudo ou prénom (public)</Label>
        <Input id="review-name" name="authorName" autoComplete="nickname" maxLength={60} required aria-required="true" aria-invalid={!!e.authorName} aria-describedby={e.authorName ? "review-name-err" : "review-name-help"} />
        <p id="review-name-help" className="mt-1.5 text-sm text-muted-foreground">Ce nom sera visible par tous. Aucun e-mail demandé.</p>
        <FieldError id="review-name-err" errors={e.authorName} />
      </div>

      <fieldset aria-describedby={e.rating ? "review-rating-err" : undefined}>
        <legend className="mb-1.5 text-sm font-semibold">Votre note</legend>
        <div className="flex flex-wrap items-center gap-1" role="radiogroup">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} htmlFor={`review-rating-${n}`} className="relative inline-flex size-11 items-center justify-center rounded-lg has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring">
              <input
                id={`review-rating-${n}`}
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                className="peer sr-only"
                aria-label={`${n} étoile${n > 1 ? "s" : ""} sur 5`}
              />
              <Star aria-hidden="true" className={cn("size-8 transition-transform duration-150 hover:scale-110", n <= rating ? "fill-[var(--ylang)] text-[var(--ylang)]" : "text-muted-foreground")} />
            </label>
          ))}
          <span className="ml-2 text-sm text-muted-foreground" aria-live="polite">
            {rating ? `${rating} sur 5` : "Choisissez une note"}
          </span>
        </div>
        <FieldError id="review-rating-err" errors={e.rating} />
      </fieldset>

      <div>
        <Label htmlFor="review-comment">Votre commentaire</Label>
        <Textarea
          id="review-comment"
          name="comment"
          rows={5}
          maxLength={MAX}
          required
          aria-required="true"
          aria-invalid={!!e.comment}
          aria-describedby={`review-count${e.comment ? " review-comment-err" : ""}`}
          onChange={(ev) => setCount(ev.target.value.length)}
        />
        <div className="mt-1.5 flex justify-between gap-4 text-sm">
          <FieldError id="review-comment-err" errors={e.comment} />
          <p id="review-count" className={cn("ml-auto tabular-nums", count > MAX - 50 ? "font-semibold text-destructive" : "text-muted-foreground")}>
            {count}/{MAX}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" variant="cta" size="lg" disabled={pending}>
          {pending ? "Publication…" : "Publier mon avis"}
        </Button>
        <p id="review-privacy" className="text-sm text-muted-foreground">
          Moins d&apos;une minute · Aucun e-mail demandé · Votre nom ou pseudo sera visible
        </p>
      </div>
    </form>
  );
}
