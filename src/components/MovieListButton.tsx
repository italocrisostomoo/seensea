'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMovieList } from '@/hooks/useMovieList';

interface MovieListButtonProps {
  tmdbId: number;
  type: 'watched' | 'watchlist';
}

export function MovieListButton({ tmdbId, type }: MovieListButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { isInList, addMovie, removeMovie } = useMovieList(type);
  const [isLoading, setIsLoading] = useState(false);

  const inList = isInList(tmdbId);
  const label = type === 'watched' ? 'Já assisti' : 'Quero assistir';

  const handleClick = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);
    try {
      if (inList) {
        await removeMovie(tmdbId);
      } else {
        await addMovie(tmdbId);
      }
    } catch (error) {
      console.error('Error updating list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <button
        onClick={handleClick}
        className="rounded border border-fg/30 px-3 py-1.5 text-sm transition hover:bg-fg/10"
      >
        Faça login
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`rounded px-3 py-1.5 text-sm transition ${
        inList
          ? 'bg-fg/20 text-fg'
          : 'border border-fg/30 text-fg/70 hover:bg-fg/10'
      } disabled:opacity-50`}
    >
      {isLoading ? (
        <span className="inline-block animate-spin">⟳</span>
      ) : inList ? (
        <>✓ {label}</>
      ) : (
        <>+ {label}</>
      )}
    </button>
  );
}
