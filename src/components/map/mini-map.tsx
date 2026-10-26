"use client";
import dynamic from "next/dynamic";

const Inner = dynamic(() => import("./mini-map-inner"), {
  ssr: false,
  loading: () => (
    <div role="status" className="grid h-full place-items-center bg-muted text-sm text-muted-foreground">
      Chargement…
    </div>
  ),
});

export function MiniMap(props: { lat: number; lng: number; color: string; letter: string; label: string }) {
  return (
    <div className="h-72 overflow-hidden rounded-xl border sm:h-80">
      <Inner {...props} />
    </div>
  );
}
