import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { ComorosFlag } from "@/components/site/comoros-flag";

export const metadata: Metadata = { title: "Connexion administrateur", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  return (
    <div className="admin-theme grid min-h-dvh bg-background text-foreground lg:grid-cols-2">
      <div aria-hidden="true" className="flag-stripe fixed inset-x-0 top-0 z-50 h-1" />
      <div className="relative hidden overflow-hidden bg-sidebar p-12 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden="true" className="absolute -left-40 top-1/2 size-[36rem] -translate-y-1/2 rounded-full bg-flag-green/25 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <ComorosFlag className="h-9 w-auto rounded-[3px] ring-1 ring-white/20" />
          <span className="text-xl font-bold">Go<span className="text-flag-yellow">Comores</span></span>
        </div>
        <div className="relative max-w-md">
          <p className="text-4xl font-bold leading-tight text-white">Faites découvrir les Comores, en quelques clics.</p>
          <p className="mt-4 text-sidebar-muted">De Ngazidja à Mwali, gérez les lieux, les photos et les avis du guide depuis un seul endroit.</p>
        </div>
        <ul aria-hidden="true" className="relative flex gap-2">
          {["#FFD100", "#FFFFFF", "#EF3340", "#003DA5", "#009639"].map((c) => (
            <li key={c} className="h-1.5 w-10 rounded-full" style={{ background: c }} />
          ))}
        </ul>
      </div>
      <div className="grid place-items-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <ComorosFlag className="h-8 w-auto rounded-[3px]" />
            <span className="text-xl font-bold">GoComores</span>
          </div>
          <h1 className="text-3xl font-bold">Espace administrateur</h1>
          <p className="mb-8 mt-2 text-muted-foreground">Connectez-vous pour gérer le site.</p>
          <LoginForm from={from?.startsWith("/admin") ? from : "/admin"} />
          <Link href="/" className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" /> Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}
