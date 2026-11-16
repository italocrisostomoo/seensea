'use client';

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export type ListType = 'watched' | 'watchlist';

const TABLE: Record<ListType, string> = { watched: 'watched_movies', watchlist: 'watchlist_movies' };

export function useMovieList(type: ListType) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['lista', type, user?.id];

  const query = useQuery({
    queryKey,
    enabled: !!user,
    staleTime: 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLE[type])
        .select('tmdb_id')
        .eq('user_id', user!.id)
        .order('added_at', { ascending: false });
      if (error) throw error;
      return data.map((m: { tmdb_id: number }) => m.tmdb_id);
    },
  });

  const update = useCallback(
    (fn: (prev: number[]) => number[]) => queryClient.setQueryData<number[]>(['lista', type, user?.id], (prev) => fn(prev ?? [])),
    [queryClient, type, user?.id],
  );

  const addMovie = useCallback(
    async (tmdbId: number) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from(TABLE[type]).insert({ user_id: user.id, tmdb_id: tmdbId });
      // 23505 = já estava na lista (UNIQUE): o estado final é o desejado.
      if (error && error.code !== '23505') throw error;
      update((prev) => (prev.includes(tmdbId) ? prev : [tmdbId, ...prev]));
    },
    [user, type, update],
  );

  const removeMovie = useCallback(
    async (tmdbId: number) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from(TABLE[type]).delete().eq('user_id', user.id).eq('tmdb_id', tmdbId);
      if (error) throw error;
      update((prev) => prev.filter((id) => id !== tmdbId));
    },
    [user, type, update],
  );

  const movies = query.data ?? [];
  return {
    movies,
    loading: !!user && query.isPending,
    error: query.isError,
    addMovie,
    removeMovie,
    isInList: (tmdbId: number) => movies.includes(tmdbId),
  };
}
