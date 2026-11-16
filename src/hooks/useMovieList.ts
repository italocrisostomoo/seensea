'use client';

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { idsIn, removeEntry, setStatus, type ListEntry, type ListType } from '@/lib/lists';
import { useAuth } from './useAuth';

export type { ListType };

const TABLE = 'movie_lists';

export function useMovieList(type: ListType) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const query = useQuery({
    queryKey: ['listas', userId],
    enabled: !!userId,
    staleTime: 0,
    queryFn: async (): Promise<ListEntry[]> => {
      const { data, error } = await supabase
        .from(TABLE)
        .select('tmdb_id, status')
        .eq('user_id', userId!)
        .order('added_at', { ascending: false });
      if (error) throw error;
      return data.map((r: { tmdb_id: number; status: ListType }) => ({ tmdbId: r.tmdb_id, status: r.status }));
    },
  });

  const update = useCallback(
    (fn: (prev: ListEntry[]) => ListEntry[]) =>
      queryClient.setQueryData<ListEntry[]>(['listas', userId], (prev) => fn(prev ?? [])),
    [queryClient, userId],
  );

  const addMovie = useCallback(
    async (tmdbId: number) => {
      if (!userId) throw new Error('Not authenticated');
      const { error } = await supabase
        .from(TABLE)
        .upsert(
          { user_id: userId, tmdb_id: tmdbId, status: type, added_at: new Date().toISOString() },
          { onConflict: 'user_id,tmdb_id' },
        );
      if (error) throw error;
      update((prev) => setStatus(prev, tmdbId, type));
    },
    [userId, type, update],
  );

  const removeMovie = useCallback(
    async (tmdbId: number) => {
      if (!userId) throw new Error('Not authenticated');
      const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq('user_id', userId)
        .eq('tmdb_id', tmdbId)
        .eq('status', type);
      if (error) throw error;
      update((prev) => removeEntry(prev, tmdbId, type));
    },
    [userId, type, update],
  );

  const movies = idsIn(query.data ?? [], type);
  return {
    movies,
    loading: !!userId && query.isPending,
    error: query.isError,
    addMovie,
    removeMovie,
    isInList: (tmdbId: number) => movies.includes(tmdbId),
  };
}
