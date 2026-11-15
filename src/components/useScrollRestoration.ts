'use client';

import { useEffect, useRef } from 'react';
import { scrollTargetToRestore } from '@/lib/scroll';

// Grava window.scrollY por chave e restaura uma única vez por chave, quando `ready`
// fica true. Só restaura se houver valor salvo (quem decide apagá-lo numa navegação
// nova é o chamador) e se a página já for alta o bastante para alcançá-lo.
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
    const y = scrollTargetToRestore(
      saved,
      document.documentElement.scrollHeight,
      window.innerHeight,
    );
    if (y === null) return;

    // O Next pode rolar depois dos efeitos; reaplica em até 2 quadros e para.
    let tries = 0;
    let frame = 0;
    const apply = () => {
      window.scrollTo(0, y);
      if (Math.abs(window.scrollY - y) > 2 && tries++ < 2) frame = requestAnimationFrame(apply);
    };
    apply();
    return () => cancelAnimationFrame(frame);
  }, [key, ready]);
}
