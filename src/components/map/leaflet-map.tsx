"use client";
import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import Link from "next/link";
import { islandLetter, textOn } from "@/lib/islands";
import type { MapPlace } from "./types";

const HEX = /^#[0-9a-fA-F]{3,8}$/;
const DEFAULT_CENTER: [number, number] = [-11.9, 43.9];

function makeIcon(color: string, letter: string) {
  const safe = HEX.test(color) ? color : "#0C4A6E";
  return L.divIcon({
    className: "",
    html: `<div class="gc-marker" style="background:${safe};color:${textOn(safe)}"><span aria-hidden="true">${letter}</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -34],
  });
}

function FitBounds({ places }: { places: MapPlace[] }) {
  const map = useMap();
  useEffect(() => {
    if (!places.length) return;
    if (places.length === 1) {
      map.setView([places[0].lat, places[0].lng], 11);
      return;
    }
    map.fitBounds(L.latLngBounds(places.map((p) => [p.lat, p.lng] as [number, number])), { padding: [40, 40], maxZoom: 11 });
  }, [places, map]);
  return null;
}

function Focus({ selectedId, markers, places }: { selectedId: number | null; markers: React.MutableRefObject<Map<number, L.Marker>>; places: MapPlace[] }) {
  const map = useMap();
  useEffect(() => {
    if (selectedId == null) return;
    const p = places.find((x) => x.id === selectedId);
    const m = markers.current.get(selectedId);
    if (!p || !m) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) map.setView([p.lat, p.lng], Math.max(map.getZoom(), 12));
    else map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 12), { duration: 0.8 });
    m.openPopup();
  }, [selectedId, map, markers, places]);
  return null;
}

function FlyToUser({ pos }: { pos: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.flyTo(pos, 12, { duration: 0.8 });
  }, [pos, map]);
  return null;
}

export default function LeafletMap({
  places,
  selectedId,
  onSelect,
  userPos,
}: {
  places: MapPlace[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  userPos: [number, number] | null;
}) {
  const markers = useRef(new Map<number, L.Marker>());
  const icons = useMemo(() => {
    const m = new Map<string, L.DivIcon>();
    for (const p of places) {
      if (!m.has(p.island.slug)) m.set(p.island.slug, makeIcon(p.island.color, islandLetter(p.island.slug)));
    }
    return m;
  }, [places]);

  return (
    <MapContainer center={DEFAULT_CENTER} zoom={8} scrollWheelZoom className="h-full w-full" aria-label="Carte interactive des lieux à visiter aux Comores">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">Contributeurs OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={18} />
      <FitBounds places={places} />
      <Focus selectedId={selectedId} markers={markers} places={places} />
      <FlyToUser pos={userPos} />
      {places.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={icons.get(p.island.slug)}
          title={`${p.name} — ${p.island.localName}`}
          alt={`${p.name}, ${p.island.localName}`}
          keyboard
          ref={(m) => {
            if (m) markers.current.set(p.id, m);
            else markers.current.delete(p.id);
          }}
          eventHandlers={{ click: () => onSelect(p.id) }}
        >
          <Popup>
            <p className="m-0 font-serif text-base font-semibold">{p.name}</p>
            <p className="m-0 mt-0.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
              {p.island.localName} · {p.category.name}
            </p>
            <p className="m-0 mt-2 text-sm">{p.verified ? "Vérifié" : "Information à confirmer"}</p>
            <Link href={`/destinations/${p.slug}`} className="mt-2 inline-flex min-h-11 items-center font-semibold underline" style={{ color: "var(--link)" }}>
              Voir la fiche
            </Link>
          </Popup>
        </Marker>
      ))}
      {userPos && <CircleMarker center={userPos} radius={9} pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#2563EB", fillOpacity: 1 }} />}
    </MapContainer>
  );
}
