'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export function SearchBar({ defaultValue = '', autoFocus = false }: { defaultValue?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (q) router.push('/buscar?q=' + encodeURIComponent(q));
  }

  return (
    <form onSubmit={onSubmit} role="search" className="relative w-full max-w-2xl">
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 z-10 size-6 -translate-y-1/2 fill-none stroke-fg-muted stroke-[1.75]"
      >
        <circle cx="11" cy="11" r="6.5" />
        <path d="m20 20-4.2-4.2" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus={autoFocus}
        placeholder="Nome do filme"
        aria-label="Buscar filme pelo nome"
        className="w-full rounded-xl border border-white/15 bg-black/40 py-4 pl-14 pr-4 text-lg text-fg backdrop-blur placeholder:text-fg-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
    </form>
  );
}
