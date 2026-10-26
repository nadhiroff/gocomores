"use client";
import { Power, Trash2 } from "lucide-react";
import { deleteAdminUser, toggleAdminUser } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function UserActions({ id, email, active }: { id: number; email: string; active: boolean }) {
  return (
    <div className="flex gap-2">
      <form action={toggleAdminUser} className="flex-1">
        <input type="hidden" name="id" value={id} />
        <Button type="submit" variant="outline" size="sm" className="w-full">
          <Power aria-hidden="true" /> {active ? "Désactiver" : "Réactiver"}<span className="sr-only"> {email}</span>
        </Button>
      </form>
      <form
        action={deleteAdminUser}
        onSubmit={(e) => {
          if (!window.confirm(`Supprimer définitivement le compte ${email} ?`)) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={id} />
        <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
          <Trash2 aria-hidden="true" /> Supprimer<span className="sr-only"> {email}</span>
        </Button>
      </form>
    </div>
  );
}
