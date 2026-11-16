'use client';

import { useRouter } from 'next/navigation';
import { startTransition, useOptimistic } from 'react';
import { SERVICES } from '@/config/services';
import { THEMES } from '@/config/themes';
import { type Filters, filtersToSearchParams } from '@/lib/filters';
import type { SortOrder } from '@/lib/tmdb/types';
import { Select, type SelectOption } from './Select';

interface Props {
  filters: Filters;
  genres: { id: number; name: string }[];
  personName: string | null;
}

const SORT_OPTIONS: SelectOption<SortOrder>[] = [
  { value: 'popularidade', label: 'Popularidade' },
  { value: 'nota', label: 'Nota' },
  { value: 'lancamento', label: 'Lançamento' },
];

const THEME_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Todos os temas' },
  ...THEMES.map((t) => ({ value: t.slug, label: t.name })),
];

function toggle(list: number[], id: number): number[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

function chipClass(active: boolean): string {
  return `shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
    active
      ? 'border-accent bg-accent font-medium text-black'
      : 'border-white/15 bg-white/5 text-fg-muted hover:border-white/30 hover:text-fg'
  }`;
}

const groupTitle = 'mb-2.5 text-sm font-semibold text-fg';

export function FiltersPanel({ filters: serverFilters, genres, personName }: Props) {
  const router = useRouter();
  // A prop `serverFilters` só muda quando o servidor responde. Sem estado otimista, dois cliques
  // rápidos partiriam do mesmo estado velho e o primeiro filtro se perderia. Com useOptimistic,
  // cada clique parte do estado já mostrado na tela; ao fim da transição ele volta a seguir a prop.
  const [filters, setOptimistic] = useOptimistic(serverFilters);

  function update(partial: Partial<Filters>) {
    const next = { ...filters, ...partial };
    const qs = filtersToSearchParams(next).toString();
    startTransition(() => {
      setOptimistic(next);
      router.push(qs ? `/explorar?${qs}` : '/explorar');
    });
  }

  const hasPerson = filters.castId !== null || filters.crewId !== null;

  return (
    <details open className="relative z-20 mb-10 rounded-xl border border-line bg-black/40 p-4 backdrop-blur md:p-6">
      <summary className="cursor-pointer text-sm font-semibold text-fg md:hidden">Filtros</summary>
      <div className="mt-3 flex flex-col gap-5 md:mt-0">
        <div>
          <h2 className={groupTitle}>Serviços</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap">
            {SERVICES.map((s) => {
              const active = filters.services.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={active}
                  className={chipClass(active)}
                  onClick={() => update({ services: toggle(filters.services, s.id) })}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className={groupTitle}>Gêneros</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap">
            {genres.map((g) => {
              const active = filters.genres.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={active}
                  className={chipClass(active)}
                  onClick={() => update({ genres: toggle(filters.genres, g.id) })}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            label="Tema"
            value={filters.theme ?? ''}
            options={THEME_OPTIONS}
            onChange={(v) => update({ theme: v || null })}
            highlight={filters.theme !== null}
            dividerAfterFirst
          />

          <Select
            label="Ordem"
            value={filters.sort}
            options={SORT_OPTIONS}
            onChange={(v) => update({ sort: v })}
          />

          {hasPerson && personName && (
            <button
              type="button"
              className="rounded-full border border-accent bg-accent/15 px-3.5 py-1.5 text-sm text-fg hover:bg-accent hover:text-black"
              onClick={() => update({ castId: null, crewId: null })}
              aria-label={`Tirar o filtro de ${personName}`}
            >
              Com {personName} <span aria-hidden>✕</span>
            </button>
          )}
        </div>
      </div>
    </details>
  );
}
