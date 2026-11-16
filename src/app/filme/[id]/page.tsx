import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { HeroBackdrop, MovieMeta, TitleArt } from "@/components/Hero";
import { ServiceBadges } from "@/components/ServiceBadges";
import { Shelf } from "@/components/Shelf";
import { Trailer } from "@/components/Trailer";
import { MovieListButton } from "@/components/MovieListButton";
import { exploreHref } from "@/lib/filters";
import { tmdbImage } from "@/lib/images";
import { paletteStyle } from "@/lib/palette";
import { relatedShelves } from "@/lib/related";
import { themesForMovie } from "@/lib/themes";
import { getPosterPalette, getTitleLogo } from "@/lib/tmdb/artwork";
import { discoverMovies } from "@/lib/tmdb/discover";
import { getMovie, parseMovieId } from "@/lib/tmdb/movie";
import type { Person } from "@/lib/tmdb/types";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseMovieId((await params).id);
  if (id === null) notFound();
  const movie = await getMovie(id);
  if (!movie) notFound();
  const backdrop = tmdbImage(movie.backdropPath, "w1280");
  return {
    title: movie.title,
    description: movie.overview ?? undefined,
    openGraph: {
      title: movie.title,
      description: movie.overview ?? undefined,
      images: backdrop ? [backdrop] : undefined,
    },
  };
}

const chipClass =
  "inline-block rounded-full border border-accent/35 bg-accent/10 px-3.5 py-1.5 text-sm text-fg transition-colors hover:bg-accent hover:text-black";

function PersonLink({ person }: { person: Person }) {
  const photo = tmdbImage(person.profilePath, "w185");
  return (
    <Link href={exploreHref({ castId: person.id })} className="group flex w-24 flex-col items-center gap-2 text-center">
      <div className="relative size-20 overflow-hidden rounded-full bg-white/5 ring-2 ring-transparent transition-shadow group-hover:ring-accent">
        {photo ? (
          <Image src={photo} alt="" fill sizes="80px" className="object-cover" />
        ) : (
          <div className="display flex h-full items-center justify-center text-3xl text-fg-faint">
            {person.name.slice(0, 1)}
          </div>
        )}
      </div>
      <span className="text-xs leading-snug text-fg-muted group-hover:text-fg">{person.name}</span>
    </Link>
  );
}

async function MovieDetailsView({ id }: { id: number }) {
  const movie = await getMovie(id);
  if (!movie) notFound();

  const shelves = relatedShelves(movie);
  await connection(); // as prateleiras usam a data atual (discoverMovies): renderiza em tempo de requisição
  const [palette, logo, results] = await Promise.all([
    getPosterPalette(movie.posterPath),
    getTitleLogo(movie.id),
    Promise.allSettled(shelves.map((s) => discoverMovies(s.query))),
  ]);
  results.forEach((r, i) => {
    if (r.status === "rejected") console.error(`[filme ${movie.id}] falha na prateleira "${shelves[i].title}":`, r.reason);
  });
  const poster = tmdbImage(movie.posterPath, "w500");
  const themes = themesForMovie(movie.keywordIds);
  const tags = [
    ...movie.genres.map((g) => ({ key: `g${g.id}`, name: g.name, href: exploreHref({ genres: [g.id] }) })),
    ...themes.map((t) => ({ key: `t${t.slug}`, name: t.name, href: exploreHref({ theme: t.slug }) })),
  ];

  return (
    <article style={paletteStyle(palette)}>
      <HeroBackdrop backdropPath={movie.backdropPath} palette={palette} className="min-h-[min(88svh,52rem)] lg:min-h-[min(90svh,58rem)]">
        <div className="flex items-end gap-12 px-5 pb-14 pt-28 md:px-12">
          <div className="hero-rise flex max-w-2xl flex-1 flex-col gap-5">
            <TitleArt title={movie.title} logo={logo} size="page" />
            <MovieMeta movie={movie} genres={false} />
            {tags.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Gêneros e temas">
                {tags.map((t) => (
                  <li key={t.key}>
                    <Link href={t.href} className={chipClass}>
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="max-w-[60ch] text-base leading-relaxed text-fg/90 sm:text-lg">
              {movie.overview ?? "Sinopse indisponível em português."}
            </p>
            {movie.directors.length > 0 && (
              <p className="text-sm text-fg-muted">
                Direção de{" "}
                {movie.directors.map((d, i) => (
                  <span key={d.id}>
                    {i > 0 && ", "}
                    <Link href={exploreHref({ crewId: d.id })} className="font-medium text-fg hover:text-accent">
                      {d.name}
                    </Link>
                  </span>
                ))}
              </p>
            )}
            <div className="flex flex-col gap-6 pt-2">
              <ServiceBadges providers={movie.providers} variant="page" />
              <div className="flex flex-wrap gap-3">
                <MovieListButton tmdbId={movie.id} type="watched" />
                <MovieListButton tmdbId={movie.id} type="watchlist" />
              </div>
              {movie.trailerKey && (
                <a
                  href="#trailer"
                  className="flex w-fit items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-black transition-[filter] hover:brightness-110"
                >
                  <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
                    <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" />
                  </svg>
                  Ver trailer
                </a>
              )}
            </div>
          </div>

          {poster && (
            <div className="relative isolate ml-auto hidden aspect-[2/3] w-64 shrink-0 lg:block xl:w-72">
              <Image
                src={poster}
                alt=""
                aria-hidden
                fill
                sizes="18rem"
                className="-z-10 translate-y-6 scale-95 object-cover opacity-70 blur-3xl saturate-150"
              />
              <Image
                src={poster}
                alt={`Pôster de ${movie.title}`}
                fill
                priority
                sizes="18rem"
                className="rounded-xl object-cover ring-1 ring-white/15"
              />
            </div>
          )}
        </div>
      </HeroBackdrop>

      <div className="flex flex-col gap-12 pb-6 pt-4">
        {movie.trailerKey && (
          <Trailer
            youtubeKey={movie.trailerKey}
            title={movie.title}
            thumbnail={tmdbImage(movie.backdropPath, "w1280")}
          />
        )}
        {movie.cast.length > 0 && (
          <section className="flex flex-col gap-4" aria-label="Elenco">
            <h2 className="heading px-5 text-xl text-fg sm:text-2xl md:px-12">Elenco</h2>
            <ul className="scrollbar-none flex gap-3 overflow-x-auto px-5 pb-2 md:px-12">
              {movie.cast.map((p) => (
                <li key={p.id} className="shrink-0">
                  <PersonLink person={p} />
                </li>
              ))}
            </ul>
          </section>
        )}
        {shelves.map((shelf, i) => {
          const r = results[i];
          const movies = r.status === "fulfilled" ? r.value.results.filter((m) => m.id !== movie.id) : [];
          return <Shelf key={shelf.title} title={shelf.title} href={shelf.href} movies={movies} />;
        })}
      </div>
    </article>
  );
}

// `instant = false` NÃO faz o notFound() devolver status 404. Ele só desliga a validação de
// "navegação instantânea" e da casca estática; o build marca a rota como ◐ (parcialmente
// pré-renderizada). A checagem feita em tempo de requisição (getMovie + notFound) roda depois
// que a casca já foi enviada, então o status HTTP continua 200 (ver "Status codes" em loading.md).
//
// Trade-off sobre o 404:
// - ID malformado (/filme/abc, /filme/0): src/proxy.ts responde antes da rota, com 404 real.
// - ID válido que não existe no TMDB (/filme/999999999): "soft 404", ou seja, status 200 com
//   noindex e a tela "Filme não encontrado". Só dá para saber que não existe consultando o TMDB.
export const instant = false;

export default async function MoviePage({ params }: Props) {
  const id = parseMovieId((await params).id);
  if (id === null) notFound();
  return (
    <main className="flex-1">
      <MovieDetailsView id={id} />
    </main>
  );
}
