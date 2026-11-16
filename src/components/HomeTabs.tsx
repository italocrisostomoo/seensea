'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useMovieList, type ListType } from '@/hooks/useMovieList';
import { MovieCard } from '@/components/MovieCard';
import { authHref } from '@/lib/auth';
import {
  chunk,
  MAX_IDS,
  resolveList,
  tabFromSearch,
  tabSearch,
  type HomeTab,
  type ListMoviesResponse,
} from '@/lib/lists';

interface HomeTabsProps {
  children: React.ReactNode;
}

const TABS: { id: HomeTab; label: string }[] = [
  { id: 'destaque', label: 'Destaque' },
  { id: 'watched', label: 'Já assisti' },
  { id: 'watchlist', label: 'Quero assistir' },
];

// Em lotes, um de cada vez: cada pedido dispara no máximo MAX_IDS buscas ao TMDB.
async function fetchSummaries(ids: number[]): Promise<ListMoviesResponse> {
  const all: ListMoviesResponse = { movies: [], missing: [], failed: [] };
  for (const batch of chunk(ids, MAX_IDS)) {
    const res = await fetch(`/api/filmes?ids=${batch.join(',')}`);
    if (!res.ok) throw new Error(`api/filmes ${res.status}`);
    const part: ListMoviesResponse = await res.json();
    all.movies.push(...part.movies);
    all.missing.push(...part.missing);
    all.failed.push(...part.failed);
  }
  return all;
}

function MissingCard({ id, type }: { id: number; type: ListType }) {
  const { removeMovie } = useMovieList(type);
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex aspect-[2/3] flex-col items-center justify-center gap-3 rounded-lg bg-white/5 p-3 text-center ring-1 ring-white/10">
      <p className="text-sm text-fg/70">Filme indisponível</p>
      <button
        onClick={async () => {
          setBusy(true);
          try {
            await removeMovie(id);
          } catch (e) {
            console.error('[lista] falha ao remover:', e);
            setBusy(false);
          }
        }}
        disabled={busy}
        className="rounded border border-fg/30 px-3 py-1.5 text-xs transition hover:bg-fg/10 disabled:opacity-50"
      >
        Remover
      </button>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div aria-busy className="grid grid-cols-2 gap-4 px-5 py-8 sm:grid-cols-3 md:px-12 lg:grid-cols-5 xl:grid-cols-6">
      <span className="sr-only">Carregando…</span>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-white/10" />
      ))}
    </div>
  );
}

function ListMoviesTab({ type }: { type: ListType }) {
  const { user, loading: authLoading } = useAuth();
  const { movies, loading, error } = useMovieList(type);
  const label = type === 'watched' ? 'Já assisti' : 'Quero assistir';
  const details = useQuery({
    queryKey: ['filmes', movies],
    queryFn: () => fetchSummaries(movies),
    enabled: movies.length > 0,
  });

  if (authLoading) return <ListSkeleton />;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-12">
        <p className="mb-4 text-lg text-fg/70">Faça login para ver suas listas</p>
        <Link
          href={authHref('login', `/${tabSearch(type)}`)}
          className="rounded-md bg-accent px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110"
        >
          Fazer login
        </Link>
      </div>
    );
  }

  if (error || details.isError) {
    return (
      <div className="px-5 py-12 text-center md:px-12">
        <p className="text-fg/70">Não foi possível carregar a lista. Tente recarregar a página.</p>
      </div>
    );
  }

  if (loading || (movies.length > 0 && details.isPending)) return <ListSkeleton />;

  if (movies.length === 0) {
    return (
      <div className="px-5 py-12 text-center md:px-12">
        <p className="text-fg/70">
          {type === 'watched'
            ? 'Nenhum filme marcado como "Já assisti" ainda.'
            : 'Nenhum filme em "Quero assistir" ainda.'}
        </p>
        <p className="mt-2 text-sm text-fg/50">Abra a página de um filme e use os botões abaixo da sinopse.</p>
      </div>
    );
  }

  const response = details.data ?? { movies: [], missing: [], failed: [] };
  const items = resolveList(movies, response);
  const failed = response.failed.length;
  return (
    <section aria-label={label} className="px-5 py-8 md:px-12">
      <p className="mb-4 text-sm text-fg/70">
        {movies.length} filme{movies.length !== 1 ? 's' : ''}
      </p>
      {failed > 0 && (
        <p className="mb-4 flex flex-wrap items-center gap-3 text-sm text-fg/70">
          {failed === 1 ? '1 filme não carregou agora.' : `${failed} filmes não carregaram agora.`}
          <button onClick={() => details.refetch()} className="font-medium text-fg underline hover:text-accent">
            Tentar de novo
          </button>
        </p>
      )}
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item) =>
          item.kind === 'movie' ? (
            <li key={item.movie.id}>
              <MovieCard movie={item.movie} />
            </li>
          ) : (
            <li key={item.id}>
              <MissingCard id={item.id} type={type} />
            </li>
          ),
        )}
      </ul>
    </section>
  );
}

function TabBar({ active, onSelect }: { active: HomeTab; onSelect?: (tab: HomeTab) => void }) {
  return (
    // As abas flutuam no topo, por cima do destaque, sem empurrá-lo para baixo.
    <div role="tablist" aria-label="Listas" className="absolute inset-x-0 top-16 z-30 flex gap-6 px-5 md:top-6 md:px-12">
      {TABS.map((tab) => {
        const selected = active === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect?.(tab.id)}
            className={`border-b-2 pb-1 text-sm font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] transition-colors ${
              selected ? 'border-accent text-fg' : 'border-transparent text-fg/70 hover:text-fg'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// Lê a aba do endereço (?lista=...). Fica dentro de Suspense para a home continuar pré-renderizada.
function TabsFromUrl() {
  const active = tabFromSearch(useSearchParams().toString());
  const select = (tab: HomeTab) => {
    // replaceState sincroniza com o roteador do Next sem recarregar a home.
    window.history.replaceState(null, '', `/${tabSearch(tab)}`);
  };
  return (
    <>
      <TabBar active={active} onSelect={select} />
      {active !== 'destaque' && (
        <div data-lista className="flex-1 pt-24 md:pt-16">
          <ListMoviesTab key={active} type={active} />
        </div>
      )}
    </>
  );
}

export function HomeTabs({ children }: HomeTabsProps) {
  return (
    <div className="home-tabs relative flex flex-1 flex-col">
      <Suspense fallback={<TabBar active="destaque" />}>
        <TabsFromUrl />
      </Suspense>
      <div className="home-destaque flex-1">{children}</div>
    </div>
  );
}
