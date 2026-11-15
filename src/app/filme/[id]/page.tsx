import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ServiceBadges } from "@/components/ServiceBadges";
import { tmdbImage } from "@/lib/images";
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
    <li className="flex w-24 shrink-0 flex-col items-center gap-1 text-center">
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
    </li>
  );
}

async function MovieDetailsView({ id }: { id: number }) {
  const movie = await getMovie(id);
  if (!movie) notFound();

  const poster = tmdbImage(movie.posterPath, "w342");
  const backdrop = tmdbImage(movie.backdropPath, "w1280");
  const meta = [
    movie.year ? String(movie.year) : null,
    movie.runtime ? formatRuntime(movie.runtime) : null,
    `★ ${movie.rating.toFixed(1).replace(".", ",")}`,
    movie.genres.length ? movie.genres.map((g) => g.name).join(", ") : null,
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
          <p className="leading-relaxed text-zinc-200">
            {movie.overview ?? "Sinopse indisponível em português."}
          </p>
          <ServiceBadges providers={movie.providers} variant="page" />
          {movie.directors.length > 0 && (
            <p className="text-sm text-zinc-300">
              <span className="text-zinc-400">
                Direção: 
              </span>
              {movie.directors.map((d) => d.name).join(", ")}
            </p>
          )}
          {movie.cast.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-white">Elenco</h2>
              <ul className="flex gap-4 overflow-x-auto pb-2">
                {movie.cast.map((p) => (
                  <PersonPhoto key={p.id} person={p} />
                ))}
              </ul>
            </section>
          )}
        </div>
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
