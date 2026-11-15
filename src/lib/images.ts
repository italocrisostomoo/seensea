export function tmdbImage(
  path: string | null,
  size: 'w185' | 'w342' | 'w780' | 'w1280',
): string | null {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}
