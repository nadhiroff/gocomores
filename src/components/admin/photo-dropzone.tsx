"use client";
import { useId, useRef, useState } from "react";
import { CloudUpload } from "lucide-react";
import { ACCEPTED_TYPES } from "@/lib/image-compress";
import { cn } from "@/lib/utils";

/** Zone de glisser-déposer accessible (clic, clavier ou dépôt de fichiers). */
export function PhotoDropzone({ onFiles, disabled, hint = "JPEG, PNG ou WebP — les photos sont automatiquement allégées avant l'envoi." }: { onFiles: (files: File[]) => void; disabled?: boolean; hint?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const hintId = useId();

  const pick = (list: FileList | null) => {
    const files = Array.from(list ?? []).filter((f) => ACCEPTED_TYPES.includes(f.type));
    if (files.length) onFiles(files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!disabled) pick(e.dataTransfer.files);
      }}
      className={cn(
        "relative grid place-items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
        over ? "border-primary bg-accent" : "border-input/60 bg-muted/40 hover:border-primary/70 hover:bg-accent/50",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <span className="grid size-14 place-items-center rounded-full bg-[#FFF6CC] text-[#6B5600] dark:bg-[#332B00] dark:text-flag-yellow">
        <CloudUpload className="size-7" aria-hidden="true" />
      </span>
      <p className="text-base font-semibold">
        Glissez vos photos ici ou{" "}
        <button type="button" onClick={() => inputRef.current?.click()} className="text-link underline underline-offset-4 hover:no-underline" aria-describedby={hintId} disabled={disabled}>
          parcourez vos fichiers
        </button>
      </p>
      <p id={hintId} className="text-sm text-muted-foreground">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
