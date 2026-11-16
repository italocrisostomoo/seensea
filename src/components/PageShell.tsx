import type { ReactNode } from "react";

/** Moldura das páginas sem destaque: um brilho da cor do SeenSea no topo e o título em letra de cartaz. */
export function PageShell({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <main className="relative isolate flex-1 px-5 pb-12 pt-24 md:px-12 md:pt-16">
      <div aria-hidden className="ambient-wash absolute inset-x-0 top-0 -z-10 h-[26rem] md:-left-(--rail)" />
      <h1 className="display mb-8 text-5xl text-fg sm:text-6xl">{title}</h1>
      {children}
    </main>
  );
}
