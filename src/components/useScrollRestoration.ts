'use client';

import { useEffect, useRef } from 'react';

// Grava window.scrollY por chave e restaura uma única vez, quando `ready` vira true.
export function useScrollRestoration(key: string, ready: boolean): void {
  const restoredKey = useRef<string | null>(null);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        try {
          sessionStorage.setItem(`scroll:${key}`, String(window.scrollY));
        } catch {}
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [key]);

  useEffect(() => {
    if (!ready || restoredKey.current === key) return;
    restoredKey.current = key;
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(`scroll:${key}`);
    } catch {}
    const y = saved === null ? 0 : Number(saved);
    window.scrollTo(0, Number.isFinite(y) ? y : 0);
  }, [key, ready]);
}
