import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/site/logo";

export const metadata: Metadata = { title: "Connexion administrateur", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-16">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 shadow-[var(--shadow-md)]">
        <Logo />
        <h1 className="text-2xl font-bold">Espace administrateur</h1>
        <LoginForm from={from?.startsWith("/admin") ? from : "/admin"} />
      </div>
    </div>
  );
}
