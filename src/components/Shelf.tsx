import Link from "next/link";
import type { MovieSummary } from "@/lib/tmdb/types";
import { MovieCard } from "./MovieCard";

export function Shelf({
  title,
  href,
  movies,
}: {
  title: string;
  href?: string;
  movies: MovieSummary[];
}) {
  if (movies.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {href && (
          <Link href={href} className="text-sm text-zinc-400 hover:text-white">
            ver tudo →
          </Link>
        )}
      </div>
      <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3">
        {movies.map((movie) => (
          <li key={movie.id} className="w-36 shrink-0 snap-start sm:w-40">
            <MovieCard movie={movie} />
          </li>
        ))}
      </ul>
    </section>
  );
}
