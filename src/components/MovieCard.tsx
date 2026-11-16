import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { tmdbImage } from "@/lib/images";
import type { MovieSummary } from "@/lib/tmdb/types";

export function formatRating(rating: number): string {
  return rating.toFixed(1).replace(".", ",");
}

/**
 * Pôster em pé. Ao passar o mouse ou focar, o próprio pôster desfocado acende por trás:
 * cada card brilha com as cores do seu filme.
 */
export function MovieCard({ movie, footer }: { movie: MovieSummary; footer?: ReactNode }) {
  const poster = tmdbImage(movie.posterPath, "w342");
  return (
    <article className="flex flex-col gap-2.5">
      <Link href={`/filme/${movie.id}`} className="group flex flex-col gap-2.5 rounded-lg focus-visible:outline-none">
        <div className="relative isolate aspect-[2/3]">
          {poster && (
            <Image
              src={poster}
              alt=""
              aria-hidden
              fill
              sizes="(min-width: 1024px) 12rem, (min-width: 640px) 11rem, 9rem"
              className="-z-10 scale-90 object-cover opacity-0 blur-2xl saturate-150 transition-opacity duration-300 group-hover:opacity-80 group-focus-visible:opacity-80"
            />
          )}
          <div className="relative h-full overflow-hidden rounded-lg bg-white/5 transition-transform duration-300 after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-1 after:ring-white/10 after:ring-inset group-hover:-translate-y-1 group-focus-visible:-translate-y-1 group-focus-visible:after:ring-2 group-focus-visible:after:ring-fg">
            {poster ? (
              <Image
                src={poster}
                alt={`Pôster de ${movie.title}`}
                fill
                sizes="(min-width: 1024px) 12rem, (min-width: 640px) 11rem, 9rem"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-end bg-gradient-to-br from-ambient to-black p-3">
                <span className="display text-2xl text-fg">{movie.title}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-0.5 px-0.5">
          <h3 className="line-clamp-1 text-sm font-medium text-fg-muted transition-colors group-hover:text-fg">
            {movie.title}
          </h3>
          <p className="flex gap-2 text-xs text-fg-faint">
            {movie.year && <span>{movie.year}</span>}
            {movie.rating > 0 && (
              <span>
                <span className="text-rating" aria-hidden>★</span>
                <span className="sr-only">Nota</span> {formatRating(movie.rating)}
              </span>
            )}
          </p>
        </div>
      </Link>
      {footer}
    </article>
  );
}

/** Card deitado, com a cena do filme e o título por cima: usado na prateleira de destaque. */
export function BackdropCard({ movie }: { movie: MovieSummary }) {
  const backdrop = tmdbImage(movie.backdropPath, "w780");
  return (
    <Link
      href={`/filme/${movie.id}`}
      className="group relative isolate flex aspect-video items-end overflow-hidden rounded-lg bg-white/5 p-4"
    >
      {backdrop && (
        <Image
          src={backdrop}
          alt=""
          fill
          sizes="(min-width: 768px) 24rem, 80vw"
          className="-z-20 object-cover transition-transform duration-500 group-hover:scale-105 group-focus-visible:scale-105"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="flex flex-col gap-1">
        <h3 className="display line-clamp-2 text-2xl text-fg font-bold tracking-[-0.01em] [font-variation-settings:'wdth'_100] sm:text-3xl">{movie.title}</h3>
        <p className="flex gap-2 text-xs text-fg-muted">
          {movie.year && <span>{movie.year}</span>}
          {movie.rating > 0 && (
            <span>
              <span className="text-rating" aria-hidden>★</span>
              <span className="sr-only">Nota</span> {formatRating(movie.rating)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
