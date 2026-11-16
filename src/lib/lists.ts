export type ListType = 'watched' | 'watchlist';

export interface ListEntry {
  tmdbId: number;
  status: ListType;
}

export function idsIn(entries: ListEntry[], status: ListType): number[] {
  return entries.filter((e) => e.status === status).map((e) => e.tmdbId);
}

// Um filme fica em uma lista só: marcar na outra lista move o filme para o topo dela.
export function setStatus(entries: ListEntry[], tmdbId: number, status: ListType): ListEntry[] {
  return [{ tmdbId, status }, ...entries.filter((e) => e.tmdbId !== tmdbId)];
}

export function removeEntry(entries: ListEntry[], tmdbId: number, status: ListType): ListEntry[] {
  return entries.filter((e) => !(e.tmdbId === tmdbId && e.status === status));
}
