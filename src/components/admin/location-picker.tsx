"use client";
import dynamic from "next/dynamic";

const Inner = dynamic(() => import("./location-picker-inner"), {
  ssr: false,
  loading: () => (
    <div role="status" className="grid h-full place-items-center bg-muted text-sm text-muted-foreground">
      Chargement de la carte…
    </div>
  ),
});

export function LocationPicker(props: { lat: number | null; lng: number | null; onPick: (lat: number, lng: number) => void }) {
  return (
    <div className="h-80 overflow-hidden rounded-2xl border sm:h-[26rem]">
      <Inner {...props} />
    </div>
  );
}
