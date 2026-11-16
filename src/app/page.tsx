import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { HeroBackdrop, MovieMeta, TitleArt } from "@/components/Hero";
import { ServiceBadges } from "@/components/ServiceBadges";
import { Shelf } from "@/components/Shelf";
import { THEMES } from "@/config/themes";
import { exploreHref } from "@/lib/filters";
import { DEFAULT_PALETTE, paletteStyle } from "@/lib/palette";
import { getPosterPalette, getTitleLogo } from "@/lib/tmdb/artwork";
import { discoverMovies } from "@/lib/tmdb/discover";
import { getMovie } from "@/lib/tmdb/movie";
import type { MovieSummary } from "@/lib/tmdb/types";

const SHELF_SIZE = 20;

async function Featured({ movie }: { movie: MovieSummary }) {
  const [details, palette, logo] = await Promise.all([
    getMovie(movie.id).catch(() => null),
    getPosterPalette(movie.posterPath),
    getTitleLogo(movie.id),
  ]);
  if (!details) return null;

  return (
    <HeroBackdrop backdropPath={details.backdropPath} palette={palette} className="min-h-[min(88svh,52rem)] md:min-h-[min(92svh,58rem)]">
      <div className="hero-rise flex max-w-2xl flex-col gap-5 px-5 pb-48 pt-28 sm:pb-56 md:px-12">
        <TitleArt title={details.title} logo={logo} size="home" />
        <MovieMeta movie={details} />
        {details.overview && (
          <p className="line-clamp-3 max-w-[46ch] text-base leading-relaxed text-fg/90 sm:text-lg">{details.overview}</p>
        )}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Link
            href={`/filme/${details.id}`}
            className="w-fit rounded-md bg-accent px-6 py-3 text-sm font-semibold text-black transition-[filter] hover:brightness-110"
          >
            Ver detalhes
          </Link>
          {details.providers.main.length > 0 && (
            <ServiceBadges providers={{ main: details.providers.main, others: [] }} variant="card" />
          )}
        </div>
      </div>
    </HeroBackdrop>
  );
}

async function HomeContent() {
  await connection(); // renderiza em tempo de requisição (usa a data atual e o token)
  const [general, ...shelves] = await Promise.allSettled([
    discoverMovies({}),
    ...THEMES.map((t) => discoverMovies({ keywordIds: t.keywordIds })),
  ]);

  const popular = general.status === "fulfilled" ? general.value.results : [];
  const [featured, ...trending] = popular;

  return (
    <>
      {featured ? <Featured movie={featured} /> : <div className="h-28" />}
      {/* As prateleiras sobem por cima da cena, como na TV. */}
      <div className={`relative z-10 flex flex-col gap-8 md:gap-10 ${featured ? "-mt-40 sm:-mt-48" : ""}`}>
        <Shelf
          title="Em alta nos streamings"
          href={exploreHref({})}
          movies={trending.filter((m) => m.backdropPath).slice(0, 12)}
          variant="backdrop"
        />
        {THEMES.map((theme, i) => {
          const result = shelves[i];
          if (result.status !== "fulfilled") return null;
          return (
            <Shelf
              key={theme.slug}
              title={theme.name}
              href={exploreHref({ theme: theme.slug })}
              movies={result.value.results.slice(0, SHELF_SIZE)}
            />
          );
        })}
      </div>
    </>
  );
}

function HomeSkeleton() {
  return (
    <div
      aria-busy
      className="ambient-wash flex min-h-[min(88svh,52rem)] flex-col justify-end gap-5 px-5 pb-56 md:-ml-(--rail) md:pl-[calc(var(--rail)+3rem)]"
      style={paletteStyle(DEFAULT_PALETTE)}
    >
      <span className="sr-only">Carregando…</span>
      <div className="h-24 w-80 max-w-full animate-pulse rounded-lg bg-white/10" />
      <div className="h-4 w-56 animate-pulse rounded bg-white/10" />
      <div className="h-16 w-full max-w-xl animate-pulse rounded bg-white/5" />
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col pb-12">
      {/* Suspense: a busca ao TMDB roda em tempo de requisição, então o build não exige o token. */}
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent />
      </Suspense>
    </main>
  );
}
