"use client";
import { useActionState, useState } from "react";
import { savePlace } from "@/actions/admin";
import { FieldError, FormErrorSummary } from "@/components/site/form-error-summary";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CategoryInfo, IslandInfo, PracticalInfo } from "@/lib/types";
import type { FormState } from "@/lib/validators";

export interface PlaceFormValues {
  id: number | null;
  name: string;
  slug: string;
  islandId: number | "";
  categoryId: number | "";
  summary: string;
  history: string;
  lat: number | "";
  lng: number | "";
  googleMapsUrl: string;
  status: "VERIFIED" | "TO_CONFIRM";
  verifiedAt: string;
  coverAlt: string;
  practical: PracticalInfo;
}

const IDS = { name: "p-name", slug: "p-slug", islandId: "p-island", categoryId: "p-cat", summary: "p-summary", history: "p-history", lat: "p-lat", lng: "p-lng", status: "p-status", verifiedAt: "p-verified", photoAlt: "p-photo-alt" };

const PRACTICAL: { key: keyof PracticalInfo; label: string }[] = [
  { key: "access", label: "Accès" },
  { key: "hours", label: "Horaires" },
  { key: "fares", label: "Tarifs" },
  { key: "bestPeriod", label: "Meilleure période" },
];

export function PlaceForm({ values, islands, categories }: { values: PlaceFormValues; islands: IslandInfo[]; categories: CategoryInfo[] }) {
  const [state, action, pending] = useActionState(savePlace.bind(null, values.id), { ok: false } as FormState);
  const [status, setStatus] = useState(values.status);
  const e = state.errors ?? {};
  const [version, setVersion] = useState(0);
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state.errors) setVersion((v) => v + 1);
  }

  return (
    <form action={action} noValidate className="space-y-8">
      <FormErrorSummary errors={state.errors} fieldIds={IDS} version={version} />
      {state.ok && <Alert variant="success" role="status"><span>{state.message}</span></Alert>}

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-3 text-xl font-bold">Identité</legend>
        <div>
          <Label htmlFor="p-name">Nom</Label>
          <Input id="p-name" name="name" defaultValue={values.name} required aria-invalid={!!e.name} />
          <FieldError id="p-name-e" errors={e.name} />
        </div>
        <div>
          <Label htmlFor="p-slug">Slug (URL)</Label>
          <Input id="p-slug" name="slug" defaultValue={values.slug} aria-describedby="p-slug-h" aria-invalid={!!e.slug} />
          <p id="p-slug-h" className="mt-1 text-sm text-muted-foreground">Laissez vide pour le générer depuis le nom.</p>
          <FieldError id="p-slug-e" errors={e.slug} />
        </div>
        <div>
          <Label htmlFor="p-island">Île</Label>
          <NativeSelect id="p-island" name="islandId" defaultValue={values.islandId} required aria-invalid={!!e.islandId}>
            <option value="" disabled>Choisir…</option>
            {islands.map((i) => <option key={i.id} value={i.id}>{i.localName} ({i.name})</option>)}
          </NativeSelect>
          <FieldError id="p-island-e" errors={e.islandId} />
        </div>
        <div>
          <Label htmlFor="p-cat">Catégorie</Label>
          <NativeSelect id="p-cat" name="categoryId" defaultValue={values.categoryId} required aria-invalid={!!e.categoryId}>
            <option value="" disabled>Choisir…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </NativeSelect>
          <FieldError id="p-cat-e" errors={e.categoryId} />
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-3 text-xl font-bold">Contenu</legend>
        <div>
          <Label htmlFor="p-summary">Résumé (400 caractères max.)</Label>
          <Textarea id="p-summary" name="summary" rows={3} maxLength={400} defaultValue={values.summary} required aria-invalid={!!e.summary} />
          <FieldError id="p-summary-e" errors={e.summary} />
        </div>
        <div>
          <Label htmlFor="p-history">Histoire (séparez les paragraphes par une ligne vide)</Label>
          <Textarea id="p-history" name="history" rows={10} defaultValue={values.history} required aria-invalid={!!e.history} />
          <FieldError id="p-history-e" errors={e.history} />
        </div>
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-3 text-xl font-bold">Infos pratiques</legend>
        {PRACTICAL.map(({ key, label }) => {
          const f = values.practical[key];
          return (
            <div key={key}>
              <Label htmlFor={`pr-${key}`}>{label}</Label>
              <Textarea id={`pr-${key}`} name={key} rows={3} maxLength={600} defaultValue={f?.value ?? ""} className="min-h-20" />
              <label className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm">
                <input type="checkbox" name={`${key}_tbc`} defaultChecked={f?.toConfirm ?? true} className="size-5" />
                Information à confirmer
              </label>
            </div>
          );
        })}
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-3 text-xl font-bold">Position</legend>
        <div>
          <Label htmlFor="p-lat">Latitude</Label>
          <Input id="p-lat" name="lat" type="number" step="any" defaultValue={values.lat} required aria-invalid={!!e.lat} />
          <FieldError id="p-lat-e" errors={e.lat} />
        </div>
        <div>
          <Label htmlFor="p-lng">Longitude</Label>
          <Input id="p-lng" name="lng" type="number" step="any" defaultValue={values.lng} required aria-invalid={!!e.lng} />
          <FieldError id="p-lng-e" errors={e.lng} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="p-gmaps">Lien Google Maps (optionnel)</Label>
          <Input id="p-gmaps" name="googleMapsUrl" type="url" defaultValue={values.googleMapsUrl} />
        </div>
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-3 text-xl font-bold">Vérification</legend>
        <div>
          <Label htmlFor="p-status">Statut</Label>
          <NativeSelect id="p-status" name="status" value={status} onChange={(ev) => setStatus(ev.target.value as typeof status)}>
            <option value="TO_CONFIRM">À confirmer</option>
            <option value="VERIFIED">Vérifié</option>
          </NativeSelect>
        </div>
        <div>
          <Label htmlFor="p-verified">Date de vérification</Label>
          <Input id="p-verified" name="verifiedAt" type="date" defaultValue={values.verifiedAt} disabled={status !== "VERIFIED"} aria-describedby="p-verified-h" />
          <p id="p-verified-h" className="mt-1 text-sm text-muted-foreground">Si vide avec le statut « Vérifié », la date du jour est utilisée.</p>
          <FieldError id="p-verified-e" errors={e.verifiedAt} />
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-3 text-xl font-bold">Photos</legend>
        <div>
          <Label htmlFor="p-photos">Ajouter des photos (JPEG, PNG ou WebP, 5 Mo max.)</Label>
          <Input id="p-photos" name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple />
          <FieldError id="p-photos-e" errors={e.photos} />
        </div>
        <div>
          <Label htmlFor="p-photo-alt">Texte alternatif des nouvelles photos</Label>
          <Input id="p-photo-alt" name="photoAlt" maxLength={300} aria-invalid={!!e.photoAlt} />
          <FieldError id="p-photo-alt-e" errors={e.photoAlt} />
        </div>
        <div>
          <Label htmlFor="p-cover-alt">Texte alternatif de l&apos;image de couverture</Label>
          <Input id="p-cover-alt" name="coverAlt" defaultValue={values.coverAlt} maxLength={300} />
        </div>
      </fieldset>

      <Button type="submit" variant="cta" size="lg" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</Button>
    </form>
  );
}
