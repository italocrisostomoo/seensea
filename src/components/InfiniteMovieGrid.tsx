'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { filtersToSearchParams, type Filters } from '@/lib/filters';
import { getNextPageParam } from '@/lib/pagination';
import type { MoviePage } from '@/lib/tmdb/types';
import { MovieGrid } from './MovieGrid';
import { useScrollRestoration } from './useScrollRestoration';

async function fetchPage(filters: Filters, page: number): Promise<MoviePage> {
  const sp = filtersToSearchParams(filters);
  sp.set('pagina', String(page));
  const res = await fetch(`/api/discover?${sp.toString()}`);
  if (!res.ok) throw new Error(`discover ${res.status}`);
  return res.json();
}

export function InfiniteMovieGrid({
  filters,
  initialPage,
}: {
  filters: Filters;
  initialPage: MoviePage;
}) {
  const key = filtersToSearchParams(filters).toString();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isError, refetch } =
    useInfiniteQuery({
      queryKey: ['discover', key],
      queryFn: ({ pageParam }) => fetchPage(filters, pageParam),
      initialPageParam: 1,
      getNextPageParam,
      initialData: { pages: [initialPage], pageParams: [1] },
    });

  const movies = useMemo(() => data.pages.flatMap((p) => p.results), [data]);
  useScrollRestoration(key, true);

  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage || isError) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: '600px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isError, isFetchingNextPage, fetchNextPage, movies.length]);

  return (
    <>
      <MovieGrid movies={movies} />
      <div ref={sentinel} className="py-8 text-center text-sm text-zinc-400" aria-live="polite">
        {isError ? (
          <div className="flex flex-col items-center gap-3">
            <p>Não foi possível carregar mais filmes.</p>
            <button
              type="button"
              onClick={() => void (hasNextPage ? fetchNextPage() : refetch())}
              className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-500"
            >
              Tentar de novo
            </button>
          </div>
        ) : isFetchingNextPage ? (
          <p>Carregando…</p>
        ) : !hasNextPage ? (
          <p>Você chegou ao fim.</p>
        ) : null}
      </div>
    </>
  );
}
