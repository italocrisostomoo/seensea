'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export function useMovieList(type: 'watched' | 'watchlist') {
  const { user } = useAuth();
  const [movies, setMovies] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch on mount + when user changes
  useEffect(() => {
    if (!user) {
      setMovies([]);
      setLoading(false);
      return;
    }

    fetchMovies();
  }, [user]);

  const fetchMovies = async () => {
    const table = type === 'watched' ? 'watched_movies' : 'watchlist_movies';
    const { data } = await supabase
      .from(table)
      .select('tmdb_id')
      .eq('user_id', user!.id);

    setMovies(data?.map((m: { tmdb_id: number }) => m.tmdb_id) || []);
    setLoading(false);
  };

  const addMovie = async (tmdbId: number) => {
    if (!user) throw new Error('Not authenticated');
    const table = type === 'watched' ? 'watched_movies' : 'watchlist_movies';
    await supabase.from(table).insert({ user_id: user.id, tmdb_id: tmdbId });
    setMovies([...movies, tmdbId]);
  };

  const removeMovie = async (tmdbId: number) => {
    if (!user) throw new Error('Not authenticated');
    const table = type === 'watched' ? 'watched_movies' : 'watchlist_movies';
    await supabase
      .from(table)
      .delete()
      .eq('user_id', user.id)
      .eq('tmdb_id', tmdbId);
    setMovies(movies.filter((id) => id !== tmdbId));
  };

  return {
    movies,
    loading,
    addMovie,
    removeMovie,
    isInList: (tmdbId: number) => movies.includes(tmdbId),
  };
}
