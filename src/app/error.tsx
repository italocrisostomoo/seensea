'use client';

import { PageShell } from '@/components/PageShell';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PageShell title="Algo saiu do ar">
      <p className="mb-6 max-w-[50ch] text-fg-muted">
        Não foi possível carregar os filmes agora. O catálogo do TMDB pode estar fora do ar por instantes.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-black hover:brightness-110"
      >
        Tentar de novo
      </button>
    </PageShell>
  );
}
