import Link from "next/link";
import type { MovieSummary } from "@/lib/tmdb/types";
import { BackdropCard, MovieCard } from "./MovieCard";
import { ShelfScroller } from "./ShelfScroller";

export function Shelf({
  title,
  href,
  movies,
  variant = "poster",
}: {
  title: string;
  href?: string;
  movies: MovieSummary[];
  /** "backdrop": cards deitados e maiores, para a prateleira de destaque. */
  variant?: "poster" | "backdrop";
}) {
  if (movies.length === 0) return null;
  const itemClass =
    variant === "backdrop" ? "w-[78vw] shrink-0 snap-start sm:w-80 lg:w-96" : "w-36 shrink-0 snap-start sm:w-44 lg:w-48";
  return (
    <section className="flex flex-col gap-1" aria-label={title}>
      <div className="flex items-baseline justify-between gap-4 px-5 md:px-12">
        <h2 className="heading text-xl text-fg sm:text-2xl">{title}</h2>
        {href && (
          <Link href={href} className="shrink-0 text-sm font-medium text-fg-muted hover:text-accent">
            Ver todos
          </Link>
        )}
      </div>
      <ShelfScroller label={title}>
        {movies.map((movie) => (
          <li key={movie.id} className={itemClass}>
            {variant === "backdrop" ? <BackdropCard movie={movie} /> : <MovieCard movie={movie} />}
          </li>
        ))}
      </ShelfScroller>
    </section>
  );
}
