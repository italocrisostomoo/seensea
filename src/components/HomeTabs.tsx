'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useMovieList } from '@/hooks/useMovieList';
import { Shelf } from '@/components/Shelf';

interface HomeTabsProps {
  children: React.ReactNode; // Content for "Destaque" tab
}

type TabType = 'destaque' | 'watched' | 'watchlist';

function ListMoviesTab({ type }: { type: 'watched' | 'watchlist' }) {
  const { user } = useAuth();
  const { movies, loading } = useMovieList(type);
  const label = type === 'watched' ? 'Já assisti' : 'Quero assistir';

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

  if (loading) {
    return (
      <div className="px-5 py-12">
        <div className="h-6 w-32 animate-pulse rounded bg-white/10" />
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="px-5 py-12 text-center">
        <p className="text-fg/70">Nenhum filme em {label.toLowerCase()} ainda</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-8">
      <p className="mb-4 text-sm text-fg/70">
        {movies.length} filme{movies.length !== 1 ? 's' : ''} {label.toLowerCase()}
      </p>
    </div>
  );
}

export function HomeTabs({ children }: HomeTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('destaque');
  const { user } = useAuth();

  return (
    <div className="flex flex-1 flex-col">
      {/* Tab Navigation */}
      <div className="flex gap-6 border-b border-fg/10 px-5 py-4 md:pl-[calc(var(--rail)+1rem)]">
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
