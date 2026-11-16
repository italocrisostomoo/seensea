'use client';

import Image from 'next/image';
import { useState } from 'react';

// O iframe só existe depois do clique: nada do YouTube carrega junto com a página.
export function Trailer({
  youtubeKey,
  title,
  thumbnail,
}: {
  youtubeKey: string;
  title: string;
  /** Cena do filme usada como capa até o trailer começar. */
  thumbnail?: string | null;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <section id="trailer" className="flex scroll-mt-8 flex-col gap-4 px-5 md:px-12" aria-label="Trailer">
      <h2 className="heading text-xl text-fg sm:text-2xl">Trailer</h2>
      <div className="relative isolate aspect-video w-full max-w-4xl overflow-hidden rounded-xl bg-ambient ring-1 ring-white/10">
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
            className="group absolute inset-0 flex items-center justify-center"
          >
            {thumbnail && (
              <Image
                src={thumbnail}
                alt=""
                fill
                sizes="(min-width: 1024px) 56rem, 100vw"
                className="-z-20 object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            )}
            <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
            <span className="flex size-20 items-center justify-center rounded-full bg-accent text-black shadow-[0_0_60px_-8px_var(--accent)] transition-transform group-hover:scale-110">
              <svg viewBox="0 0 24 24" className="ml-1 size-8 fill-current" aria-hidden>
                <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" />
              </svg>
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
