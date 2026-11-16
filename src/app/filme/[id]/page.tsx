import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ServiceBadges } from "@/components/ServiceBadges";
import { Shelf } from "@/components/Shelf";
import { Trailer } from "@/components/Trailer";
import { exploreHref } from "@/lib/filters";
import { tmdbImage } from "@/lib/images";
import { relatedShelves } from "@/lib/related";
import { themesForMovie } from "@/lib/themes";
import { discoverMovies } from "@/lib/tmdb/discover";
import { getMovie, parseMovieId } from "@/lib/tmdb/movie";
import type { Person } from "@/lib/tmdb/types";

type Props = { params: Promise<{ id: string }> };

function formatRuntime(min: number): string {
  return `${Math.floor(min / 60)}h${String(min % 60).padStart(2, "0")}`;
}

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

function PersonPhoto({ person }: { person: Person }) {
  const photo = tmdbImage(person.profilePath, "w185");
  return (
    <>
      <div className="relative size-20 overflow-hidden rounded-full bg-zinc-800">
        {photo ? (
          <Image src={photo} alt={person.name} fill sizes="80px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl text-zinc-500">
            {person.name.slice(0, 1)}
          </div>
        )}
      </div>
      <span className="text-xs text-zinc-300">{person.name}</span>
    </>
  );
}

async function MovieDetailsView({ id }: { id: number }) {
  const movie = await getMovie(id);
  if (!movie) notFound();

  const poster = tmdbImage(movie.posterPath, "w342");
  const backdrop = tmdbImage(movie.backdropPath, "w1280");
  const themes = themesForMovie(movie.keywordIds);
  const shelves = relatedShelves(movie);
  const results = await Promise.allSettled(shelves.map((s) => discoverMovies(s.query)));
  const chipClass = "rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-700";
  const meta = [
    movie.year ? String(movie.year) : null,
    movie.runtime ? formatRuntime(movie.runtime) : null,
    `★ ${movie.rating.toFixed(1).replace(".", ",")}`,
  ].filter(Boolean);

  return (
    <article className="relative isolate">
      {backdrop && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image src={backdrop} alt="" fill priority sizes="100vw" className="object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
        </div>
      )}
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:flex-row">
        <div className="relative mx-auto aspect-[2/3] w-56 shrink-0 overflow-hidden rounded-lg bg-zinc-800 md:mx-0 md:w-72">
          {poster ? (
            <Image
              src={poster}
              alt={`Pôster de ${movie.title}`}
              fill
              priority
              sizes="(min-width: 768px) 288px, 224px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-center text-zinc-400">
              {movie.title}
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <h1 className="text-3xl font-bold text-white">{movie.title}</h1>
          <p className="text-sm text-zinc-300">{meta.join(" · ")}</p>
          {movie.genres.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {movie.genres.map((g) => (
                <li key={g.id}>
                  <Link href={exploreHref({ genres: [g.id] })} className={chipClass}>
                    {g.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {themes.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {themes.map((t) => (
                <li key={t.slug}>
                  <Link href={exploreHref({ theme: t.slug })} className={chipClass}>
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="leading-relaxed text-zinc-200">
            {movie.overview ?? "Sinopse indisponível em português."}
          </p>
          <ServiceBadges providers={movie.providers} variant="page" />
          {movie.directors.length > 0 && (
            <p className="text-sm text-zinc-300">
              <span className="text-zinc-400">Direção:</span>{" "}
              {movie.directors.map((d, i) => (
                <span key={d.id}>
                  {i > 0 && ", "}
                  <Link href={exploreHref({ crewId: d.id })} className="hover:text-white hover:underline">
                    {d.name}
                  </Link>
                </span>
              ))}
            </p>
          )}
          {movie.trailerKey && <Trailer youtubeKey={movie.trailerKey} title={movie.title} />}
          {movie.cast.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-white">Elenco</h2>
              <ul className="flex gap-4 overflow-x-auto pb-2">
                {movie.cast.map((p) => (
                  <li key={p.id} className="shrink-0">
                    <Link
                      href={exploreHref({ castId: p.id })}
                      className="flex w-24 flex-col items-center gap-1 text-center hover:text-white"
                    >
                      <PersonPhoto person={p} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pb-10">
        {shelves.map((shelf, i) => {
          const r = results[i];
          const movies = r.status === "fulfilled" ? r.value.results.filter((m) => m.id !== movie.id) : [];
          return <Shelf key={shelf.title} title={shelf.title} href={shelf.href} movies={movies} />;
        })}
      </div>
    </article>
  );
}

// Rota bloqueante (sem casca estática): o notFound() roda antes de qualquer streaming,
// então ID inválido ou inexistente responde com status 404 real (e não um "soft 404").
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
