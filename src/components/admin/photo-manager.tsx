"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, GripVertical, LoaderCircle, Star, Trash2, TriangleAlert, X } from "lucide-react";
import { deletePlaceImage, reorderPlaceImages, updatePlaceImageAlt, uploadPlaceImage } from "@/actions/admin";
import { PhotoDropzone } from "@/components/admin/photo-dropzone";
import { PlaceImage } from "@/components/site/place-image";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { compressImage, formatBytes } from "@/lib/image-compress";
import { cn } from "@/lib/utils";

export interface ManagedImage {
  id: number;
  url: string;
  alt: string;
}

interface Pending {
  key: string;
  name: string;
  preview: string;
  status: "compressing" | "uploading" | "error";
  detail?: string;
}

function AltEditor({ image, onSaved }: { image: ManagedImage; onSaved: (alt: string) => void }) {
  const [value, setValue] = useState(image.alt);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const dirty = value.trim() !== image.alt;
  const id = `alt-${image.id}`;

  const save = async () => {
    setState("saving");
    const fd = new FormData();
    fd.set("id", String(image.id));
    fd.set("alt", value);
    const res = await updatePlaceImageAlt(fd);
    if (res.ok) {
      onSaved(value.trim());
      setState("saved");
    } else {
      setError(res.error ?? "Erreur.");
      setState("error");
    }
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-muted-foreground">Description (texte alternatif)</label>
      <div className="flex gap-1.5">
        <Input
          id={id}
          value={value}
          maxLength={300}
          onChange={(e) => {
            setValue(e.target.value);
            setState("idle");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (dirty) save();
            }
          }}
          className="min-h-10 px-2.5 py-1.5 text-sm"
          aria-invalid={state === "error"}
        />
        {dirty && (
          <Button type="button" size="icon" className="size-10 shrink-0" onClick={save} disabled={state === "saving"} aria-label="Enregistrer la description">
            {state === "saving" ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Check aria-hidden="true" />}
          </Button>
        )}
      </div>
      <p aria-live="polite" className="mt-1 min-h-4 text-xs">
        {state === "saved" && <span className="text-primary">Description enregistrée.</span>}
        {state === "error" && <span className="text-destructive">{error}</span>}
      </p>
    </div>
  );
}

export function PhotoManager({ placeId, placeName, initial }: { placeId: number; placeName: string; initial: ManagedImage[] }) {
  const router = useRouter();
  const [images, setImages] = useState(initial);
  const [pending, setPending] = useState<Pending[]>([]);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);
  const [, startTransition] = useTransition();
  const previews = useRef(new Set<string>());

  useEffect(() => setImages(initial), [initial]);
  useEffect(() => {
    const urls = previews.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const patch = (key: string, p: Partial<Pending>) => setPending((list) => list.map((x) => (x.key === key ? { ...x, ...p } : x)));
  const drop = (key: string) =>
    setPending((list) => {
      const item = list.find((x) => x.key === key);
      if (item) {
        URL.revokeObjectURL(item.preview);
        previews.current.delete(item.preview);
      }
      return list.filter((x) => x.key !== key);
    });

  const upload = async (files: File[]) => {
    setMessage(null);
    const items = files.map((f, i) => {
      const preview = URL.createObjectURL(f);
      previews.current.add(preview);
      return { file: f, key: `${Date.now()}-${i}-${f.name}`, name: f.name, preview, status: "compressing" as const };
    });
    setPending((list) => [...list, ...items.map((it) => ({ key: it.key, name: it.name, preview: it.preview, status: it.status }))]);
    let added = 0;
    // Envoi séquentiel : progression lisible et requêtes légères.
    for (const item of items) {
      const small = await compressImage(item.file);
      patch(item.key, { status: "uploading", detail: small.size < item.file.size ? `${formatBytes(item.file.size)} → ${formatBytes(small.size)}` : formatBytes(small.size) });
      const fd = new FormData();
      fd.set("placeId", String(placeId));
      fd.set("photo", small);
      try {
        const res = await uploadPlaceImage(fd);
        if (res.ok && res.image) {
          const img = res.image;
          setImages((list) => [...list, { id: img.id, url: img.url, alt: img.alt }]);
          drop(item.key);
          added++;
        } else {
          patch(item.key, { status: "error", detail: res.error ?? "Envoi refusé." });
        }
      } catch {
        patch(item.key, { status: "error", detail: "Envoi impossible (fichier trop lourd ou connexion interrompue)." });
      }
    }
    if (added) {
      setMessage({ ok: true, text: `${added} photo${added > 1 ? "s ajoutées" : " ajoutée"}. Pensez à vérifier leur description.` });
      startTransition(() => router.refresh());
    }
  };

  const persistOrder = async (next: ManagedImage[], previous: ManagedImage[]) => {
    setImages(next);
    const res = await reorderPlaceImages(placeId, next.map((i) => i.id));
    if (!res.ok) {
      setImages(previous);
      setMessage({ ok: false, text: res.error ?? "Impossible d'enregistrer l'ordre." });
    } else {
      startTransition(() => router.refresh());
    }
  };

  const move = (index: number, to: number) => {
    if (to < 0 || to >= images.length || to === index) return;
    const next = [...images];
    const [it] = next.splice(index, 1);
    next.splice(to, 0, it);
    persistOrder(next, images);
  };

  const remove = async (img: ManagedImage) => {
    if (!window.confirm("Supprimer définitivement cette photo ?")) return;
    const previous = images;
    setImages((list) => list.filter((i) => i.id !== img.id));
    const fd = new FormData();
    fd.set("id", String(img.id));
    const res = await deletePlaceImage(fd);
    if (!res.ok) {
      setImages(previous);
      setMessage({ ok: false, text: res.error ?? "Suppression impossible." });
    } else {
      setMessage({ ok: true, text: "Photo supprimée." });
      startTransition(() => router.refresh());
    }
  };

  return (
    <div className="space-y-5">
      <PhotoDropzone onFiles={upload} />

      <div aria-live="polite">
        {message && (
          <Alert variant={message.ok ? "success" : "destructive"}>
            <span className="flex-1">{message.text}</span>
            <button type="button" onClick={() => setMessage(null)} aria-label="Fermer le message" className="rounded"><X className="size-4" aria-hidden="true" /></button>
          </Alert>
        )}
      </div>

      {!!pending.length && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Envois en cours">
          {pending.map((p) => (
            <li key={p.key} className={cn("flex items-center gap-3 rounded-xl border bg-card p-2", p.status === "error" && "border-destructive/60")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.preview} alt="" className="size-16 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate font-semibold">{p.name}</p>
                <p className={cn("flex items-center gap-1.5", p.status === "error" ? "text-destructive" : "text-muted-foreground")}>
                  {p.status === "error" ? <TriangleAlert className="size-4 shrink-0" aria-hidden="true" /> : <LoaderCircle className="size-4 shrink-0 animate-spin" aria-hidden="true" />}
                  {p.status === "compressing" ? "Optimisation…" : p.status === "uploading" ? `Envoi… ${p.detail ?? ""}` : p.detail}
                </p>
              </div>
              {p.status === "error" && (
                <Button type="button" variant="ghost" size="icon" onClick={() => drop(p.key)} aria-label={`Retirer ${p.name}`}><X aria-hidden="true" /></Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {images.length ? (
        <>
          <p className="text-sm text-muted-foreground">
            Glissez les photos pour changer leur ordre (ou utilisez les flèches). La <strong className="text-foreground">première photo est la couverture</strong> affichée sur le site.
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {images.map((img, index) => (
              <li
                key={img.id}
                draggable
                onDragStart={(e) => {
                  setDragId(img.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => {
                  if (dragId !== null) e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragId === null) return;
                  const from = images.findIndex((i) => i.id === dragId);
                  setDragId(null);
                  move(from, index);
                }}
                className={cn(
                  "group overflow-hidden rounded-2xl border bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition",
                  index === 0 && "ring-2 ring-flag-yellow",
                  dragId === img.id && "opacity-50",
                )}
              >
                <div className="relative aspect-[4/3] cursor-grab bg-muted active:cursor-grabbing">
                  <PlaceImage src={img.url} alt={img.alt} fill sizes="(min-width: 1280px) 320px, (min-width: 640px) 45vw, 90vw" className="object-cover" />
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white">
                    <GripVertical className="size-3.5" aria-hidden="true" /> {index + 1}
                  </span>
                  {index === 0 && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-flag-yellow px-2.5 py-1 text-xs font-bold text-[#1a1600]">
                      <Star className="size-3.5 fill-current" aria-hidden="true" /> Couverture
                    </span>
                  )}
                </div>
                <div className="space-y-2 p-3">
                  <AltEditor image={img} onSaved={(alt) => setImages((list) => list.map((i) => (i.id === img.id ? { ...i, alt } : i)))} />
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button type="button" variant="ghost" size="icon" className="size-10" onClick={() => move(index, index - 1)} disabled={index === 0} aria-label={`Déplacer la photo ${index + 1} vers la gauche`}>
                      <ArrowLeft aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="size-10" onClick={() => move(index, index + 1)} disabled={index === images.length - 1} aria-label={`Déplacer la photo ${index + 1} vers la droite`}>
                      <ArrowRight aria-hidden="true" />
                    </Button>
                    {index !== 0 && (
                      <Button type="button" variant="secondary" size="sm" className="min-h-10" onClick={() => move(index, 0)}>
                        <Star aria-hidden="true" /> Couverture
                      </Button>
                    )}
                    <Button type="button" variant="ghost" size="icon" className="ml-auto size-10 text-destructive hover:bg-destructive/10" onClick={() => remove(img)} aria-label={`Supprimer la photo ${index + 1}`}>
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        !pending.length && <p className="text-center text-sm text-muted-foreground">Aucune photo pour « {placeName} ». Ajoutez-en une pour illustrer ce lieu.</p>
      )}
    </div>
  );
}
