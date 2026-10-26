"use client";
import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

export default function MiniMapInner({ lat, lng, color, letter, label }: { lat: number; lng: number; color: string; letter: string; label: string }) {
  const safe = /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : "#0C4A6E";
  const icon = L.divIcon({
    className: "",
    html: `<div class="gc-marker" style="background:${safe}"><span aria-hidden="true">${letter}</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
  return (
    <MapContainer center={[lat, lng]} zoom={11} scrollWheelZoom={false} className="h-full w-full" aria-label={`Carte : ${label}`}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">Contributeurs OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={18} />
      <Marker position={[lat, lng]} icon={icon} title={label} alt={label} />
    </MapContainer>
  );
}
