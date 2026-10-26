"use client";
import dynamic from "next/dynamic";
import { LoaderCircle } from "lucide-react";

export const MapView = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div role="status" aria-live="polite" className="grid h-full min-h-64 place-items-center bg-muted text-muted-foreground">
      <p className="flex items-center gap-2 font-medium">
        <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        Chargement…
      </p>
    </div>
  ),
});
