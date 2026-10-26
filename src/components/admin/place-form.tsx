"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { ExternalLink, FileText, Images, Info, LoaderCircle, MapPin, Save, Tag, X } from "lucide-react";
import { savePlace } from "@/actions/admin";
import { LocationPicker } from "@/components/admin/location-picker";
import { PhotoDropzone } from "@/components/admin/photo-dropzone";
import { PhotoManager, type ManagedImage } from "@/components/admin/photo-manager";
import { FieldError, FormErrorSummary } from "@/components/site/form-error-summary";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { compressImage, formatBytes } from "@/lib/image-compress";
import type { CategoryInfo, IslandInfo, PracticalInfo } from "@/lib/types";
import { cn, slugify } from "@/lib/utils";
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
  practical: PracticalInfo;
}

const IDS = { name: "p-name", slug: "p-slug", islandId: "p-island", categoryId: "p-cat", summary: "p-summary", history: "p-history", lat: "p-lat", lng: "p-lng", googleMapsUrl: "p-gmaps", status: "p-status", verifiedAt: "p-verified", photos: "p-photos", photoAlt: "p-photo-alt" };

const TABS = [
  { id: "identite", label: "Identité", icon: Tag, fields: ["name", "slug", "islandId", "categoryId", "status", "verifiedAt"] },
  { id: "contenu", label: "Contenu", icon: FileText, fields: ["summary", "history"] },
  { id: "pratique", label: "Infos pratiques", icon: Info, fields: [] },
  { id: "carte", label: "Carte", icon: MapPin, fields: ["lat", "lng", "googleMapsUrl"] },
  { id: "photos", label: "Photos", icon: Images, fields: ["photos", "photoAlt"] },
] as const;
export type PlaceTab = (typeof TABS)[number]["id"];

const PRACTICAL: { key: keyof PracticalInfo; label: string; placeholder: string }[] = [
  { key: "access", label: "Accès", placeholder: "Ex. : 20 min en taxi depuis Moroni, puis 10 min à pied." },
  { key: "hours", label: "Horaires", placeholder: "Ex. : accessible en permanence." },
  { key: "fares", label: "Tarifs", placeholder: "Ex. : gratuit, guide conseillé (≈ 10 000 KMF)." },
  { key: "bestPeriod", label: "Meilleure période", placeholder: "Ex. : saison sèche, de mai à octobre." },
];

const MAX_NEW = 8;

function Counter({ value, max }: { value: number; max: number }) {
  return <span className={cn("text-xs tabular-nums", value > max * 0.9 ? "text-destructive" : "text-muted-foreground")}>{value} / {max}</span>;
}

/** Photos choisies à la création : compressées puis glissées dans le champ fichier du formulaire. */
function NewPhotos({ onBusy }: { onBusy: (busy: boolean) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<{ file: File; preview: string }[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f.file));
    inputRef.current.files = dt.files;
  }, [files]);
  useEffect(() => () => files.forEach((f) => URL.revokeObjectURL(f.preview)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const add = async (picked: File[]) => {
    setBusy(true);
    onBusy(true);
    const room = MAX_NEW - files.length;
    const out: { file: File; preview: string }[] = [];
    for (const f of picked.slice(0, room)) {
      const small = await compressImage(f);
      out.push({ file: small, preview: URL.createObjectURL(small) });
    }
    setFiles((list) => [...list, ...out]);
    setBusy(false);
    onBusy(false);
  };

  return (
    <div className="space-y-4">
      <input ref={inputRef} id="p-photos" name="photos" type="file" multiple className="sr-only" tabIndex={-1} aria-hidden="true" />
      <PhotoDropzone onFiles={add} disabled={busy || files.length >= MAX_NEW} hint={`Jusqu'à ${MAX_NEW} photos, automatiquement allégées. La première sera la couverture.`} />
      {busy && <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Optimisation des photos…</p>}
      {!!files.length && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {files.map((f, i) => (
            <li key={f.preview} className={cn("relative overflow-hidden rounded-xl border bg-card", i === 0 && "ring-2 ring-flag-yellow")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.preview} alt="" className="aspect-[4/3] w-full object-cover" />
              <p className="truncate px-2 py-1 text-xs text-muted-foreground">{i === 0 ? "Couverture · " : ""}{formatBytes(f.file.size)}</p>
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(f.preview);
                  setFiles((list) => list.filter((x) => x !== f));
                }}
                className="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
                aria-label={`Retirer la photo ${i + 1}`}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div>
        <Label htmlFor="p-photo-alt">Description des photos (texte alternatif)</Label>
        <Input id="p-photo-alt" name="photoAlt" maxLength={300} placeholder="Ex. : vue sur le cratère du Karthala au lever du soleil" aria-describedby="p-photo-alt-h" />
        <p id="p-photo-alt-h" className="mt-1 text-sm text-muted-foreground">Utile aux personnes malvoyantes et au référencement. Vide : le nom du lieu est utilisé. Modifiable ensuite photo par photo.</p>
      </div>
    </div>
  );
}

export function PlaceForm({
  values,
  islands,
  categories,
  images,
  initialTab = "identite",
}: {
  values: PlaceFormValues;
  islands: IslandInfo[];
  categories: CategoryInfo[];
  images?: ManagedImage[];
  initialTab?: PlaceTab;
}) {
  const [state, action, pending] = useActionState(savePlace.bind(null, values.id), { ok: false } as FormState);
  const [tab, setTab] = useState<PlaceTab>(initialTab);
  const [status, setStatus] = useState(values.status);
  const [name, setName] = useState(values.name);
  const [slug, setSlug] = useState(values.slug);
  const [summaryLen, setSummaryLen] = useState(values.summary.length);
  const [lat, setLat] = useState(values.lat === "" ? "" : String(values.lat));
  const [lng, setLng] = useState(values.lng === "" ? "" : String(values.lng));
  const [photosBusy, setPhotosBusy] = useState(false);
  const e = state.errors ?? {};
  const [version, setVersion] = useState(0);
  const [lastState, setLastState] = useState(state);
  const focusAfterSwitch = useRef<string | null>(null);
  const isEdit = values.id !== null;

  if (state !== lastState) {
    setLastState(state);
    if (state.errors) {
      setVersion((v) => v + 1);
      const first = TABS.find((t) => t.fields.some((f) => state.errors?.[f]));
      if (first) setTab(first.id);
    }
  }

  useEffect(() => {
    if (focusAfterSwitch.current) {
      document.getElementById(focusAfterSwitch.current)?.focus();
      focusAfterSwitch.current = null;
    }
  }, [tab]);

  const tabWithErrors = (t: (typeof TABS)[number]) => t.fields.some((f) => e[f]);
  const latNum = lat === "" ? null : Number(lat);
  const lngNum = lng === "" ? null : Number(lng);
  const validPos = latNum !== null && lngNum !== null && Number.isFinite(latNum) && Number.isFinite(lngNum);
  const previewSlug = slug.trim() || slugify(name);

  const onTabKey = (ev: React.KeyboardEvent, index: number) => {
    const dir = ev.key === "ArrowRight" ? 1 : ev.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    ev.preventDefault();
    const next = TABS[(index + dir + TABS.length) % TABS.length];
    setTab(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  // Les liens du résumé d'erreurs basculent d'abord sur le bon onglet.
  const onSummaryClick = (ev: React.MouseEvent) => {
    const a = (ev.target as HTMLElement).closest("a[href^='#']");
    if (!a) return;
    const fieldId = a.getAttribute("href")!.slice(1);
    const key = Object.entries(IDS).find(([, v]) => v === fieldId)?.[0];
    const owner = TABS.find((t) => (t.fields as readonly string[]).includes(key ?? ""));
    if (owner && owner.id !== tab) {
      ev.preventDefault();
      focusAfterSwitch.current = fieldId;
      setTab(owner.id);
    }
  };

  const panel = (id: PlaceTab) => ({ id: `panel-${id}`, role: "tabpanel" as const, "aria-labelledby": `tab-${id}`, hidden: tab !== id, tabIndex: -1 });

  return (
    <div>
      <div role="tablist" aria-label="Sections du lieu" className="-mx-1 mb-6 flex gap-1 overflow-x-auto border-b px-1">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(ev) => onTabKey(ev, i)}
            className={cn(
              "relative -mb-px inline-flex min-h-12 shrink-0 items-center gap-2 border-b-[3px] px-4 text-sm font-semibold transition-colors",
              tab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="size-4" aria-hidden="true" />
            {t.label}
            {t.id === "photos" && isEdit && images && <span className="rounded-full bg-muted px-1.5 text-xs">{images.length}</span>}
            {tabWithErrors(t) && <span className="size-2 rounded-full bg-destructive" aria-label="(contient des erreurs)" />}
          </button>
        ))}
      </div>

      <form action={action} noValidate className={cn("space-y-6", isEdit && tab === "photos" && "hidden")}>
        <div onClickCapture={onSummaryClick}>
          <FormErrorSummary errors={state.errors} fieldIds={IDS} version={version} />
        </div>
        {state.ok && <Alert variant="success" role="status"><span>{state.message}</span></Alert>}

        <div {...panel("identite")} className="grid gap-5 rounded-2xl border bg-card p-5 sm:grid-cols-2 sm:p-6">
          <div className="sm:col-span-2">
            <Label htmlFor="p-name">Nom du lieu</Label>
            <Input id="p-name" name="name" value={name} onChange={(ev) => setName(ev.target.value)} required placeholder="Ex. : Lac Salé" aria-invalid={!!e.name} />
            <FieldError id="p-name-e" errors={e.name} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="p-slug">Adresse de la page (slug)</Label>
            <Input id="p-slug" name="slug" value={slug} onChange={(ev) => setSlug(ev.target.value)} placeholder={slugify(name) || "genere-automatiquement"} aria-describedby="p-slug-h" aria-invalid={!!e.slug} />
            <p id="p-slug-h" className="mt-1 break-all text-sm text-muted-foreground">
              Laissez vide pour la générer depuis le nom. Aperçu : <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">/destinations/{previewSlug || "…"}</code>
            </p>
            <FieldError id="p-slug-e" errors={e.slug} />
          </div>
          <div>
            <Label htmlFor="p-island">Île</Label>
            <NativeSelect id="p-island" name="islandId" defaultValue={values.islandId} required aria-invalid={!!e.islandId}>
              <option value="" disabled>Choisir une île…</option>
              {islands.map((i) => <option key={i.id} value={i.id}>{i.localName} ({i.name})</option>)}
            </NativeSelect>
            <FieldError id="p-island-e" errors={e.islandId} />
          </div>
          <div>
            <Label htmlFor="p-cat">Catégorie</Label>
            <NativeSelect id="p-cat" name="categoryId" defaultValue={values.categoryId} required aria-invalid={!!e.categoryId}>
              <option value="" disabled>Choisir une catégorie…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </NativeSelect>
            <FieldError id="p-cat-e" errors={e.categoryId} />
          </div>
          <div>
            <Label htmlFor="p-status">Statut des informations</Label>
            <NativeSelect id="p-status" name="status" value={status} onChange={(ev) => setStatus(ev.target.value as typeof status)}>
              <option value="TO_CONFIRM">À confirmer</option>
              <option value="VERIFIED">Vérifié sur place</option>
            </NativeSelect>
          </div>
          <div>
            <Label htmlFor="p-verified">Date de vérification</Label>
            <Input id="p-verified" name="verifiedAt" type="date" defaultValue={values.verifiedAt} disabled={status !== "VERIFIED"} aria-describedby="p-verified-h" aria-invalid={!!e.verifiedAt} />
            <p id="p-verified-h" className="mt-1 text-sm text-muted-foreground">Vide avec « Vérifié » : la date du jour est utilisée.</p>
            <FieldError id="p-verified-e" errors={e.verifiedAt} />
          </div>
        </div>

        <div {...panel("contenu")} className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <Label htmlFor="p-summary">Résumé</Label>
              <Counter value={summaryLen} max={400} />
            </div>
            <Textarea id="p-summary" name="summary" rows={3} maxLength={400} defaultValue={values.summary} onChange={(ev) => setSummaryLen(ev.target.value.length)} required aria-describedby="p-summary-h" aria-invalid={!!e.summary} />
            <p id="p-summary-h" className="mt-1 text-sm text-muted-foreground">Affiché sur les cartes et dans les résultats de recherche : une ou deux phrases qui donnent envie.</p>
            <FieldError id="p-summary-e" errors={e.summary} />
          </div>
          <div>
            <Label htmlFor="p-history">Histoire et description</Label>
            <Textarea id="p-history" name="history" rows={14} defaultValue={values.history} required aria-describedby="p-history-h" aria-invalid={!!e.history} />
            <p id="p-history-h" className="mt-1 text-sm text-muted-foreground">Séparez les paragraphes par une ligne vide.</p>
            <FieldError id="p-history-e" errors={e.history} />
          </div>
        </div>

        <div {...panel("pratique")} className="grid gap-5 rounded-2xl border bg-card p-5 sm:grid-cols-2 sm:p-6">
          {PRACTICAL.map(({ key, label, placeholder }) => {
            const f = values.practical[key];
            return (
              <div key={key}>
                <Label htmlFor={`pr-${key}`}>{label}</Label>
                <Textarea id={`pr-${key}`} name={key} rows={3} maxLength={600} defaultValue={f?.value ?? ""} placeholder={placeholder} className="min-h-24" />
                <label className="mt-1 inline-flex min-h-11 items-center gap-2 text-sm">
                  <input type="checkbox" name={`${key}_tbc`} defaultChecked={f?.toConfirm ?? true} className="size-5 accent-[var(--primary)]" />
                  Information à confirmer
                </label>
              </div>
            );
          })}
        </div>

        <div {...panel("carte")} className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
          <p className="text-sm text-muted-foreground">Cliquez sur la carte pour placer le lieu, puis faites glisser le repère pour ajuster. Vous pouvez aussi saisir les coordonnées.</p>
          {tab === "carte" && (
            <LocationPicker
              lat={validPos ? latNum : null}
              lng={validPos ? lngNum : null}
              onPick={(a, b) => {
                setLat(a.toFixed(6));
                setLng(b.toFixed(6));
              }}
            />
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="p-lat">Latitude</Label>
              <Input id="p-lat" name="lat" type="number" step="any" value={lat} onChange={(ev) => setLat(ev.target.value)} required aria-invalid={!!e.lat} />
              <FieldError id="p-lat-e" errors={e.lat} />
            </div>
            <div>
              <Label htmlFor="p-lng">Longitude</Label>
              <Input id="p-lng" name="lng" type="number" step="any" value={lng} onChange={(ev) => setLng(ev.target.value)} required aria-invalid={!!e.lng} />
              <FieldError id="p-lng-e" errors={e.lng} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="p-gmaps">Lien Google Maps (optionnel)</Label>
              <Input id="p-gmaps" name="googleMapsUrl" type="url" defaultValue={values.googleMapsUrl} placeholder="https://maps.app.goo.gl/…" aria-describedby="p-gmaps-h" aria-invalid={!!e.googleMapsUrl} />
              <p id="p-gmaps-h" className="mt-1 text-sm text-muted-foreground">Vide : un lien est créé à partir des coordonnées.</p>
              <FieldError id="p-gmaps-e" errors={e.googleMapsUrl} />
            </div>
          </div>
        </div>

        {!isEdit && (
          <div {...panel("photos")} className="rounded-2xl border bg-card p-5 sm:p-6">
            <NewPhotos onBusy={setPhotosBusy} />
            <FieldError id="p-photos-e" errors={e.photos} />
          </div>
        )}

        <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <Button type="submit" size="lg" disabled={pending || photosBusy}>
            {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
            {pending ? "Enregistrement…" : isEdit ? "Enregistrer les modifications" : "Créer le lieu"}
          </Button>
          {isEdit && (
            <Button asChild variant="ghost">
              <a href={`/destinations/${values.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden="true" /> Voir sur le site <span className="sr-only">(nouvel onglet)</span></a>
            </Button>
          )}
          <p className="text-sm text-muted-foreground">Tous les onglets sont enregistrés ensemble.</p>
        </div>
      </form>

      {isEdit && tab === "photos" && (
        <div {...panel("photos")} hidden={false} className="rounded-2xl border bg-card p-5 sm:p-6">
          <p className="mb-4 text-sm text-muted-foreground">Les photos sont enregistrées automatiquement, pas besoin de cliquer sur « Enregistrer ».</p>
          <PhotoManager placeId={values.id!} placeName={values.name} initial={images ?? []} />
        </div>
      )}
    </div>
  );
}
