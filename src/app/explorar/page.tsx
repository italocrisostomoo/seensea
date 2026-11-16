import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';
import { FiltersPanel } from '@/components/FiltersPanel';
import { InfiniteMovieGrid } from '@/components/InfiniteMovieGrid';
import { PageShell } from '@/components/PageShell';
import { filtersToDiscoverQuery, parseFilters } from '@/lib/filters';
import { discoverMovies } from '@/lib/tmdb/discover';
import { getGenres, getPerson } from '@/lib/tmdb/movie';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata: Metadata = { title: 'Explorar' };

// Rota dinâmica: lê searchParams e o TMDB em tempo de requisição. `instant = false` desliga a
// validação de "navegação instantânea" (a casca estática desta rota não precisa ser provada);
// o build marca a rota como parcialmente pré-renderizada (◐) e o conteúdo vem na requisição.
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
  await connection(); // discoverMovies usa a data atual: renderiza em tempo de requisição
  const personId = filters.castId ?? filters.crewId;

  const [genres, firstPage, person] = await Promise.all([
    getGenres(),
    discoverMovies(filtersToDiscoverQuery(filters)),
    personId !== null ? getPerson(personId) : Promise.resolve(null),
  ]);

  return (
    <PageShell title="Explorar">
      <FiltersPanel filters={filters} genres={genres} personName={person?.name ?? null} />
      {firstPage.results.length > 0 ? (
        <InfiniteMovieGrid filters={filters} initialPage={firstPage} />
      ) : (
        <div className="flex flex-col items-start gap-4 py-8">
          <p className="text-fg-muted">Nenhum filme combina com esses filtros. Tire um ou mais para ver mais opções.</p>
          <Link
            href="/explorar"
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-black hover:brightness-110"
          >
            Limpar filtros
          </Link>
        </div>
      )}
    </PageShell>
  );
}
