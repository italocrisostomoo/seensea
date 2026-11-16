'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

function Arrow({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" className="size-7 fill-none stroke-current stroke-2" aria-hidden>
      <path d={dir === 'left' ? 'm14.5 5-7 7 7 7' : 'm9.5 5 7 7-7 7'} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Fileira horizontal com setas no desktop; no toque, rola com o dedo. */
export function ShelfScroller({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  function scroll(dir: -1 | 1) {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
  }

  const button =
    'absolute inset-y-0 z-10 hidden w-14 items-center justify-center text-fg transition-opacity md:flex disabled:pointer-events-none disabled:opacity-0 opacity-0 group-hover/shelf:opacity-100 focus-visible:opacity-100';

  return (
    <div className="group/shelf relative">
      <button
        type="button"
        aria-label={`Voltar em ${label}`}
        onClick={() => scroll(-1)}
        disabled={edges.start}
        className={`${button} left-0 bg-gradient-to-r from-black/90 to-transparent`}
      >
        <Arrow dir="left" />
      </button>
      <ul
        ref={ref}
        onScroll={measure}
        className="scrollbar-none flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-4 pt-3 md:scroll-px-12 md:gap-5 md:px-12"
      >
        {children}
      </ul>
      <button
        type="button"
        aria-label={`Avançar em ${label}`}
        onClick={() => scroll(1)}
        disabled={edges.end}
        className={`${button} right-0 bg-gradient-to-l from-black/90 to-transparent`}
      >
        <Arrow dir="right" />
      </button>
    </div>
  );
}
