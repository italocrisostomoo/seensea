'use client';

import { useRouter } from 'next/navigation';
import { SERVICES } from '@/config/services';
import { THEMES } from '@/config/themes';
import { type Filters, filtersToSearchParams } from '@/lib/filters';
import type { SortOrder } from '@/lib/tmdb/types';

interface Props {
  filters: Filters;
  genres: { id: number; name: string }[];
  personName: string | null;
}

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'popularidade', label: 'Popularidade' },
  { value: 'nota', label: 'Nota' },
  { value: 'lancamento', label: 'Lançamento' },
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

const selectClass =
  'rounded-md border border-white/15 bg-black/60 px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none';
const groupTitle = 'mb-2.5 text-sm font-semibold text-fg';

export function FiltersPanel({ filters, genres, personName }: Props) {
  const router = useRouter();

  function update(partial: Partial<Filters>) {
    const qs = filtersToSearchParams({ ...filters, ...partial }).toString();
    router.push(qs ? `/explorar?${qs}` : '/explorar');
  }

  const hasPerson = filters.castId !== null || filters.crewId !== null;

  return (
    <details open className="mb-10 rounded-xl border border-line bg-black/40 p-4 backdrop-blur md:p-6">
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
          <label className="flex items-center gap-2 text-sm text-fg-muted">
            Tema
            <select
              className={selectClass}
              value={filters.theme ?? ''}
              onChange={(e) => update({ theme: e.target.value || null })}
            >
              <option value="">Todos os temas</option>
              {THEMES.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-fg-muted">
            Ordem
            <select
              className={selectClass}
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value as SortOrder })}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

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
