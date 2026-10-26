"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, CircleHelp, LocateFixed, MapPinOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { islandColorVar, islandLetter } from "@/lib/islands";
import { cn } from "@/lib/utils";
import { MapView } from "./map-view";
import type { MapPlace } from "./types";

interface Opt {
  slug: string;
  label: string;
}

export function MapExplorer({ places, islands, categories }: { places: MapPlace[]; islands: (Opt & { color: string })[]; categories: Opt[] }) {
  const [ile, setIle] = useState("");
  const [cat, setCat] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [geoMsg, setGeoMsg] = useState("");
  const [locating, setLocating] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return places.filter(
      (p) =>
        (!ile || p.island.slug === ile) &&
        (!cat || p.category.slug === cat) &&
        (!needle || p.name.toLowerCase().includes(needle) || p.summary.toLowerCase().includes(needle)),
    );
  }, [places, ile, cat, q]);

  function locate() {
    if (!("geolocation" in navigator)) {
      setGeoMsg("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    setLocating(true);
    setGeoMsg("Recherche de votre position…");
    // Demandée uniquement au clic : aucune position n'est lue ni envoyée au chargement.
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setGeoMsg("Votre position est affichée sur la carte. Elle n'est pas enregistrée.");
        setLocating(false);
      },
      (err) => {
        setGeoMsg(err.code === err.PERMISSION_DENIED ? "Autorisation refusée : la carte reste utilisable sans votre position." : "Position introuvable pour le moment.");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }

  return (
    <div className="grid lg:h-[calc(100dvh-4rem)] lg:grid-cols-[24rem_1fr]">
      <aside className="flex flex-col border-b bg-background lg:min-h-0 lg:border-b-0 lg:border-r" aria-label="Filtres et liste des lieux">
        <div className="space-y-4 border-b p-4">
          <h1 className="font-serif text-2xl font-bold">Carte des lieux</h1>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="m-ile">Île</Label>
              <NativeSelect id="m-ile" value={ile} onChange={(e) => setIle(e.target.value)}>
                <option value="">Toutes</option>
                {islands.map((i) => (
                  <option key={i.slug} value={i.slug}>
                    {i.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div>
              <Label htmlFor="m-cat">Catégorie</Label>
              <NativeSelect id="m-cat" value={cat} onChange={(e) => setCat(e.target.value)}>
                <option value="">Toutes</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>
          <div>
            <Label htmlFor="m-q">Recherche</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input id="m-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" maxLength={80} />
            </div>
          </div>
          <Button type="button" variant="secondary" className="w-full" onClick={locate} disabled={locating}>
            <LocateFixed aria-hidden="true" /> Ma position
          </Button>
          <p role="status" aria-live="polite" className="min-h-5 text-sm text-muted-foreground">
            {geoMsg}
          </p>
        </div>

        <div className="flex items-center justify-between px-4 pb-1 pt-3">
          <p role="status" aria-live="polite" className="font-semibold">
            {filtered.length} {filtered.length > 1 ? "résultats" : "résultat"}
          </p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs" aria-label="Légende">
            {islands.map((i) => (
              <li key={i.slug} className="inline-flex items-center gap-1.5">
                <span className="grid size-5 place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: i.color }} aria-hidden="true">
                  {islandLetter(i.slug)}
                </span>
                {i.label}
              </li>
            ))}
          </ul>
        </div>

        {filtered.length ? (
          <ul className="max-h-96 flex-1 divide-y overflow-y-auto lg:max-h-none">
            {filtered.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setSelected(p.id)}
                  aria-pressed={selected === p.id}
                  className={cn("flex min-h-16 w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent", selected === p.id && "bg-secondary")}
                >
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ background: p.island.color }} aria-hidden="true">
                    {islandLetter(p.island.slug)}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold leading-snug">{p.name}</span>
                    <span className="block text-sm" style={{ color: islandColorVar(p.island.slug) }}>
                      {p.island.localName} · <span className="text-muted-foreground">{p.category.name}</span>
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      {p.verified ? <BadgeCheck className="size-3.5" aria-hidden="true" /> : <CircleHelp className="size-3.5" aria-hidden="true" />}
                      {p.verified ? "Vérifié" : "Information à confirmer"}
                    </span>
                  </span>
                </button>
                {selected === p.id && (
                  <p className="bg-secondary px-4 pb-3 pl-14 text-sm">
                    <Link href={`/destinations/${p.slug}`} className="inline-flex min-h-11 items-center font-semibold text-link underline underline-offset-4">
                      Voir la fiche
                    </Link>
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
            <MapPinOff className="size-8" aria-hidden="true" />
            <p className="font-semibold text-foreground">Aucun lieu ne correspond.</p>
            <Button type="button" variant="outline" onClick={() => { setIle(""); setCat(""); setQ(""); }}>
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </aside>

      <div className="h-[60dvh] min-h-80 lg:h-auto" id="carte-interactive">
        <MapView places={filtered} selectedId={selected} onSelect={setSelected} userPos={userPos} />
      </div>
    </div>
  );
}
