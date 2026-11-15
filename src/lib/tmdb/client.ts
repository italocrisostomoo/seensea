import 'server-only';

const BASE_URL = 'https://api.themoviedb.org/3';

export const REVALIDATE = { lists: 86400, discover: 21600, movie: 21600, search: 3600 };

export class TmdbError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'TmdbError';
    this.status = status;
  }
}

export async function tmdbFetch<T>(
  path: string,
  params?: Record<string, string> | URLSearchParams,
  opts?: { revalidate?: number },
): Promise<T> {
  const token = process.env.TMDB_READ_TOKEN;
  if (!token) throw new Error('TMDB_READ_TOKEN não está definido (veja .env.example)');

  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${path}${query ? `?${query}` : ''}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    next: { revalidate: opts?.revalidate },
  });
  if (!res.ok) throw new TmdbError(res.status, `TMDB ${res.status} em ${path}`);
  return (await res.json()) as T;
}
