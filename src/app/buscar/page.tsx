import type { Metadata } from 'next';
import Link from 'next/link';
import { MovieGrid } from '@/components/MovieGrid';
import { PageShell } from '@/components/PageShell';
import { SearchBar } from '@/components/SearchBar';
import { ServiceBadges } from '@/components/ServiceBadges';
import { redirect } from 'next/navigation';
import { AVAILABILITY_ATTRIBUTION } from '@/lib/attribution';
import { MAX_PAGE } from '@/lib/tmdb/discover';
import { getMovieProviders } from '@/lib/tmdb/movie';
import { searchMovies } from '@/lib/tmdb/search';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Rota dinâmica: lê searchParams e o TMDB em tempo de requisição. `instant = false` desliga a
// validação de "navegação instantânea" (a casca estática desta rota não precisa ser provada);
// o build marca a rota como parcialmente pré-renderizada (◐) e o conteúdo vem na requisição.
export const instant = false;

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? '';
}

function parsePage(raw: string): number {
  return /^\d+$/.test(raw) && Number(raw) >= 1 ? Math.min(Number(raw), MAX_PAGE) : 1;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = first((await searchParams).q).trim();
  return { title: q ? `Busca: ${q}` : 'Busca' };
}

function pageHref(q: string, pagina: number): string {
  return `/buscar?q=${encodeURIComponent(q)}&pagina=${pagina}`;
}

const linkClass =
  'rounded-md border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-fg transition-colors hover:border-accent hover:text-accent';

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = first(sp.q).trim();

  if (q === '') {
    return (
      <PageShell title="Buscar">
        <SearchBar autoFocus />
        <p className="mt-4 text-fg-muted">Procure pelo título em português ou no original.</p>
      </PageShell>
    );
  }

  const requestedPage = parsePage(first(sp.pagina));
  const result = await searchMovies(q, requestedPage);

  // Página além do fim (ex.: ?pagina=999): leva à última página válida em vez de dizer
  // "nenhum filme", o que seria falso.
  if (result.totalPages > 0 && requestedPage > result.totalPages) {
    redirect(pageHref(q, result.totalPages));
  }

  if (result.results.length === 0) {
    return (
      <PageShell title="Buscar">
        <SearchBar key={q} defaultValue={q} />
        <p className="mt-6 text-fg-muted">
          Nenhum filme encontrado para &ldquo;{q}&rdquo;. Confira a grafia ou tente o título original.
        </p>
      </PageShell>
    );
  }

  const settled = await Promise.allSettled(result.results.map((m) => getMovieProviders(m.id)));
  settled.forEach((s, i) => {
    if (s.status === 'rejected') console.error(`[busca] falha nos provedores do filme ${result.results[i].id}:`, s.reason);
  });
  const providersById = new Map(
    result.results.map((m, i) => {
      const s = settled[i];
      return [m.id, s.status === 'fulfilled' ? s.value : null] as const;
    }),
  );

  return (
    <PageShell title="Buscar">
      <SearchBar key={q} defaultValue={q} />
      <h2 className="heading mb-6 mt-10 text-xl text-fg-muted">
        Resultados para <span className="text-fg">&ldquo;{q}&rdquo;</span>
      </h2>
      <MovieGrid
        movies={result.results}
        renderFooter={(movie) => {
          const providers = providersById.get(movie.id);
          return providers ? <ServiceBadges providers={providers} variant="card" /> : null;
        }}
      />
      <nav className="mt-10 flex items-center gap-3" aria-label="Páginas de resultados">
        {result.page > 1 && (
          <Link href={pageHref(q, result.page - 1)} className={linkClass}>
            Página anterior
          </Link>
        )}
        {result.page < result.totalPages && (
          <Link href={pageHref(q, result.page + 1)} className={linkClass}>
            Próxima página
          </Link>
        )}
      </nav>
      <p className="mt-6 text-xs text-fg-faint">{AVAILABILITY_ATTRIBUTION}</p>
    </PageShell>
  );
}
