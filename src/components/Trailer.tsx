'use client';

import { useState } from 'react';

// O iframe só existe depois do clique: nada do YouTube carrega junto com a página.
export function Trailer({ youtubeKey, title }: { youtubeKey: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-white">Trailer</h2>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-900">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeKey}?autoplay=1`}
            title={`Trailer de ${title}`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Assistir ao trailer de ${title}`}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 text-lg font-semibold text-white hover:from-zinc-700"
          >
            ▶ Trailer
          </button>
        )}
      </div>
    </section>
  );
}
