import type { Metadata } from 'next';
import Link from 'next/link';
import { MovieGrid } from '@/components/MovieGrid';
import { ServiceBadges } from '@/components/ServiceBadges';
import { getMovieProviders } from '@/lib/tmdb/movie';
import { searchMovies } from '@/lib/tmdb/search';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Rota dinâmica por requisição (lê searchParams e o TMDB); sem casca estática no build.
export const instant = false;

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? '';
}

function parsePage(raw: string): number {
  return /^\d+$/.test(raw) && Number(raw) >= 1 ? Math.min(Number(raw), 500) : 1;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = first((await searchParams).q).trim();
  return { title: q ? `Busca: ${q}` : 'Busca' };
}

function pageHref(q: string, pagina: number): string {
  return `/buscar?q=${encodeURIComponent(q)}&pagina=${pagina}`;
}

const linkClass = 'rounded-md bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700';

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = first(sp.q).trim();

  if (q === '') {
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <p className="text-zinc-300">Digite o nome de um filme.</p>
      </main>
    );
  }

  const result = await searchMovies(q, parsePage(first(sp.pagina)));

  if (result.results.length === 0) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <p className="text-zinc-300">Nenhum filme encontrado para &quot;{q}&quot;.</p>
      </main>
    );
  }

  const settled = await Promise.allSettled(result.results.map((m) => getMovieProviders(m.id)));
  const providersById = new Map(
    result.results.map((m, i) => {
      const s = settled[i];
      return [m.id, s.status === 'fulfilled' ? s.value : null] as const;
    }),
  );

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Resultados para &quot;{q}&quot;</h1>
      <MovieGrid
        movies={result.results}
        renderFooter={(movie) => {
          const providers = providersById.get(movie.id);
          return providers ? <ServiceBadges providers={providers} variant="card" /> : null;
        }}
      />
      <nav className="mt-8 flex items-center gap-4">
        {result.page > 1 && (
          <Link href={pageHref(q, result.page - 1)} className={linkClass}>
            Anterior
          </Link>
        )}
        {result.page < result.totalPages && (
          <Link href={pageHref(q, result.page + 1)} className={linkClass}>
            Próxima
          </Link>
        )}
      </nav>
      <p className="mt-6 text-xs text-zinc-500">Dados de disponibilidade: JustWatch</p>
    </main>
  );
}
