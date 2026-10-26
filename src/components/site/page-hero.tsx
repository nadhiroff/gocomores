import type { ReactNode } from "react";

export function PageHero({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <section className="hero-aurora text-white">
      <div className="container-page py-14 sm:py-20">
        {eyebrow && <p className="eyebrow !text-[#FDBA74]">{eyebrow}</p>}
        <h1 className="mt-2 max-w-3xl text-4xl font-bold sm:text-5xl">{title}</h1>
        {children && <div className="mt-4 max-w-2xl text-lg text-white/90">{children}</div>}
      </div>
    </section>
  );
}
