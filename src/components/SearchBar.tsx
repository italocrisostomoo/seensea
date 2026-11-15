'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState('');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    router.push('/buscar?q=' + encodeURIComponent(value.trim()));
  }

  return (
    <form onSubmit={onSubmit} role="search" className="ml-auto">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar filme…"
        aria-label="Buscar filme"
        className="w-40 rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600 sm:w-64"
      />
    </form>
  );
}
