'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useMovieList, type ListType } from '@/hooks/useMovieList';
import { MovieCard } from '@/components/MovieCard';
import type { MovieSummary } from '@/lib/tmdb/types';

interface HomeTabsProps {
  children: React.ReactNode;
}

type TabType = 'destaque' | ListType;

async function fetchSummaries(ids: number[]): Promise<MovieSummary[]> {
  const res = await fetch(`/api/filmes?ids=${ids.join(',')}`);
  if (!res.ok) throw new Error(`api/filmes ${res.status}`);
  return res.json();
}

function ListMoviesTab({ type }: { type: ListType }) {
  const { user } = useAuth();
  const { movies, loading, error } = useMovieList(type);
  const label = type === 'watched' ? 'Já assisti' : 'Quero assistir';
  const details = useQuery({
    queryKey: ['filmes', movies],
    queryFn: () => fetchSummaries(movies),
    enabled: movies.length > 0,
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-5">
        <p className="mb-4 text-lg text-fg/70">Faça login para ver suas listas</p>
        <Link
          href="/auth/login"
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

  if (loading || (movies.length > 0 && details.isPending)) {
    return (
      <div aria-busy className="grid grid-cols-2 gap-4 px-5 py-8 sm:grid-cols-3 md:px-12 lg:grid-cols-5 xl:grid-cols-6">
        <span className="sr-only">Carregando…</span>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-white/10" />
        ))}
      </div>
    );
  }

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

  const list = details.data ?? [];
  return (
    <section aria-label={label} className="px-5 py-8 md:px-12">
      <p className="mb-4 text-sm text-fg/70">
        {list.length} filme{list.length !== 1 ? 's' : ''}
      </p>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {list.map((movie) => (
          <li key={movie.id}>
            <MovieCard movie={movie} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HomeTabs({ children }: HomeTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('destaque');

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex gap-6 border-b border-fg/10 px-5 pb-4 pt-20 md:px-12 md:pt-6">
        <button
          onClick={() => setActiveTab('destaque')}
          className={`text-sm font-medium transition ${
            activeTab === 'destaque'
              ? 'text-fg border-b-2 border-accent pb-4 -mb-4'
              : 'text-fg/60 hover:text-fg'
          }`}
        >
          Destaque
        </button>
        <button
          onClick={() => setActiveTab('watched')}
          className={`text-sm font-medium transition ${
            activeTab === 'watched'
              ? 'text-fg border-b-2 border-accent pb-4 -mb-4'
              : 'text-fg/60 hover:text-fg'
          }`}
        >
          Já assisti
        </button>
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`text-sm font-medium transition ${
            activeTab === 'watchlist'
              ? 'text-fg border-b-2 border-accent pb-4 -mb-4'
              : 'text-fg/60 hover:text-fg'
          }`}
        >
          Quero assistir
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'destaque' && <div>{children}</div>}
        {activeTab === 'watched' && <ListMoviesTab type="watched" />}
        {activeTab === 'watchlist' && <ListMoviesTab type="watchlist" />}
      </div>
    </div>
  );
}
