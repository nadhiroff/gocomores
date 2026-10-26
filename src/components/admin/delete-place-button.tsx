"use client";
import { Trash2 } from "lucide-react";
import { deletePlace } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function DeletePlaceButton({ id, name }: { id: number; name: string }) {
  return (
    <form
      action={deletePlace}
      onSubmit={(e) => {
        if (!window.confirm(`Supprimer définitivement « ${name} » ? Cette action est irréversible.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="destructive">
        <Trash2 aria-hidden="true" /> Supprimer le lieu
      </Button>
    </form>
  );
}
