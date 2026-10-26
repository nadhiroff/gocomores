"use client";
import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

const ICON = L.divIcon({
  className: "",
  html: `<div class="gc-marker" style="background:#009639"><span aria-hidden="true">●</span></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

/** Recentre la carte quand les coordonnées sont saisies à la main. */
function Follow({ pos }: { pos: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (pos && !map.getBounds().contains(pos)) map.setView(pos, Math.max(map.getZoom(), 11));
  }, [pos, map]);
  return null;
}

export default function LocationPickerInner({ lat, lng, onPick }: { lat: number | null; lng: number | null; onPick: (lat: number, lng: number) => void }) {
  const pos: [number, number] | null = lat !== null && lng !== null ? [lat, lng] : null;
  return (
    <MapContainer center={pos ?? [-11.95, 43.75]} zoom={pos ? 12 : 8} className="h-full w-full" aria-label="Carte : cliquez pour placer le lieu">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">Contributeurs OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={18} />
      <ClickHandler onPick={onPick} />
      <Follow pos={pos} />
      {pos && (
        <Marker
          position={pos}
          icon={ICON}
          draggable
          title="Position du lieu (déplaçable)"
          alt="Position du lieu"
          eventHandlers={{
            dragend: (e) => {
              const p = (e.target as L.Marker).getLatLng();
              onPick(p.lat, p.lng);
            },
          }}
        />
      )}
    </MapContainer>
  );
}
