import type { Metadata } from 'next';
import Link from 'next/link';
import { FiltersPanel } from '@/components/FiltersPanel';
import { MovieGrid } from '@/components/MovieGrid';
import { filtersToDiscoverQuery, parseFilters } from '@/lib/filters';
import { discoverMovies } from '@/lib/tmdb/discover';
import { getGenres, getPerson } from '@/lib/tmdb/movie';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata: Metadata = { title: 'Explorar' };

// Rota dinâmica por requisição (lê searchParams e o TMDB); sem casca estática no build.
export const instant = false;

function toURLSearchParams(raw: Record<string, string | string[] | undefined>): URLSearchParams {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) sp.set(key, first);
  }
  return sp;
}

export default async function ExplorePage({ searchParams }: Props) {
  const filters = parseFilters(toURLSearchParams(await searchParams));
  const personId = filters.castId ?? filters.crewId;

  const [genres, { results }, person] = await Promise.all([
    getGenres(),
    discoverMovies(filtersToDiscoverQuery(filters)),
    personId !== null ? getPerson(personId) : Promise.resolve(null),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Explorar</h1>
      <FiltersPanel filters={filters} genres={genres} personName={person?.name ?? null} />
      {results.length > 0 ? (
        <MovieGrid movies={results} />
      ) : (
        <div className="flex flex-col items-start gap-4 py-8">
          <p className="text-zinc-300">Nenhum filme encontrado com esses filtros.</p>
          <Link
            href="/explorar"
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
          >
            Limpar filtros
          </Link>
        </div>
      )}
    </main>
  );
}
