'use client';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-start gap-4 px-4 py-16">
      <p className="text-zinc-300">Não foi possível carregar os filmes agora.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
      >
        Tentar de novo
      </button>
    </main>
  );
}
