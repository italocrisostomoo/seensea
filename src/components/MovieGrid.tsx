import type { ReactNode } from "react";
import type { MovieSummary } from "@/lib/tmdb/types";
import { MovieCard } from "./MovieCard";

export function MovieGrid({
  movies,
  renderFooter,
}: {
  movies: MovieSummary[];
  renderFooter?: (movie: MovieSummary) => ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 lg:grid-cols-5 xl:grid-cols-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} footer={renderFooter?.(movie)} />
      ))}
    </div>
  );
}
