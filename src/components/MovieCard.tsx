import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { tmdbImage } from "@/lib/images";
import type { MovieSummary } from "@/lib/tmdb/types";

export function MovieCard({ movie, footer }: { movie: MovieSummary; footer?: ReactNode }) {
  const poster = tmdbImage(movie.posterPath, "w342");
  const rating = movie.rating.toFixed(1).replace(".", ",");
  return (
    <article className="flex flex-col gap-2">
      <Link href={`/filme/${movie.id}`} className="group flex flex-col gap-2">
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-800">
          {poster ? (
            <Image
              src={poster}
              alt={`Pôster de ${movie.title}`}
              fill
              sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 50vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-3 text-center text-sm text-zinc-400">
              {movie.title}
            </div>
          )}
        </div>
        <h3 className="line-clamp-2 text-sm font-medium text-white">{movie.title}</h3>
        <p className="text-xs text-zinc-400">
          {movie.year ?? ""}
          {movie.year ? " · " : ""}
          <span className="text-amber-400">★ {rating}</span>
        </p>
      </Link>
      {footer}
    </article>
  );
}
