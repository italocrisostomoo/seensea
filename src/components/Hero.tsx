import Image from "next/image";
import type { ReactNode } from "react";
import { tmdbImage } from "@/lib/images";
import { type Palette, paletteStyle } from "@/lib/palette";
import type { TitleLogo } from "@/lib/tmdb/artwork";
import type { MovieDetails } from "@/lib/tmdb/types";
import { formatRating } from "./MovieCard";

export function formatRuntime(min: number): string {
  return `${Math.floor(min / 60)}h${String(min % 60).padStart(2, "0")}`;
}

/** Nome do filme: a arte oficial do título quando existe, senão o nome em letra de cartaz. */
export function TitleArt({ title, logo, size }: { title: string; logo: TitleLogo | null; size: "home" | "page" }) {
  const src = logo ? tmdbImage(logo.path, "w500") : null;
  if (src && logo) {
    return (
      <h1>
        <Image
          src={src}
          alt={title}
          width={500}
          height={Math.round(500 / logo.aspectRatio)}
          priority
          className={`h-auto w-auto object-contain object-left drop-shadow-[0_4px_24px_rgb(0_0_0/0.6)] ${
            size === "home"
              ? "max-h-28 max-w-[min(24rem,80vw)] sm:max-h-36"
              : "max-h-32 max-w-[min(28rem,80vw)] sm:max-h-44"
          }`}
        />
      </h1>
    );
  }
  return (
    <h1
      className={`display text-balance text-fg drop-shadow-[0_4px_24px_rgb(0_0_0/0.6)] ${
        size === "home" ? "text-5xl sm:text-7xl" : "text-5xl sm:text-7xl lg:text-8xl"
      }`}
    >
      {title}
    </h1>
  );
}

export function MovieMeta({ movie, genres = true }: { movie: MovieDetails; genres?: boolean }) {
  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fg-muted sm:text-base">
      {movie.year && <span>{movie.year}</span>}
      {movie.runtime && <span>{formatRuntime(movie.runtime)}</span>}
      {movie.rating > 0 && (
        <span className="text-fg">
          <span className="text-rating" aria-hidden>★</span>
          <span className="sr-only">Nota</span> {formatRating(movie.rating)}
        </span>
      )}
      {genres && movie.genres.slice(0, 3).map((g) => (
        <span key={g.id}>{g.name}</span>
      ))}
    </p>
  );
}

/**
 * Cena do filme sangrando até as bordas, tingida pela cor do pôster.
 * Fica atrás do trilho de navegação no desktop (margem negativa do mesmo tamanho).
 */
export function HeroBackdrop({
  backdropPath,
  palette,
  className = "",
  children,
}: {
  backdropPath: string | null;
  palette: Palette;
  className?: string;
  children: ReactNode;
}) {
  const backdrop = tmdbImage(backdropPath, "original");
  return (
    <section
      style={paletteStyle(palette)}
      className={`relative isolate flex flex-col justify-end overflow-hidden bg-ambient md:-ml-(--rail) md:pl-(--rail) ${className}`}
    >
      {backdrop && (
        <Image
          src={backdrop}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-30 object-cover object-[60%_20%]"
        />
      )}
      <div aria-hidden className="absolute inset-0 -z-20 bg-ambient opacity-50 mix-blend-soft-light" />
      <div aria-hidden className="hero-fade-side absolute inset-0 -z-10 hidden md:block" />
      <div aria-hidden className="hero-fade-base absolute inset-0 -z-10" />
      {children}
    </section>
  );
}
