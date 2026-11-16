'use client';

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { filtersToSearchParams, type Filters } from '@/lib/filters';
import { consumeTraversal } from '@/lib/navigation';
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
  const queryClient = useQueryClient();

  // Voltar/avançar reaproveita as páginas em cache e a rolagem salva. Qualquer outra
  // navegação (filtro novo, link, mesmo para filtros já vistos) recomeça na página 1,
  // no topo: reduz o cache a `initialPage` e apaga a posição salva. Roda antes da
  // pintura; o ref evita decidir duas vezes para a mesma chave (StrictMode).
  const decidedKey = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (decidedKey.current === key) return;
    decidedKey.current = key;
    if (consumeTraversal()) return;
    queryClient.setQueryData(['discover', key], { pages: [initialPage], pageParams: [1] });
    try {
      sessionStorage.removeItem(`scroll:${key}`);
    } catch {}
  }, [key, initialPage, queryClient]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isError, refetch } =
    useInfiniteQuery({
      queryKey: ['discover', key],
      queryFn: ({ pageParam }) => fetchPage(filters, pageParam),
      initialPageParam: 1,
      getNextPageParam,
      initialData: { pages: [initialPage], pageParams: [1] },
    });

  const movies = useMemo(() => data.pages.flatMap((p) => p.results), [data]);
  useScrollRestoration(key, movies.length > 0);

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
      <div ref={sentinel} className="py-10 text-center text-sm text-fg-muted" aria-live="polite">
        {isError ? (
          <div className="flex flex-col items-center gap-3">
            <p>Não foi possível carregar mais filmes.</p>
            <button
              type="button"
              onClick={() => void (hasNextPage ? fetchNextPage() : refetch())}
              className="rounded-md bg-accent px-5 py-2.5 font-semibold text-black hover:brightness-110"
            >
              Tentar de novo
            </button>
          </div>
        ) : isFetchingNextPage ? (
          <p>Carregando…</p>
        ) : !hasNextPage ? (
          <p>Esses são todos os filmes com esses filtros.</p>
        ) : null}
      </div>
    </>
  );
}
