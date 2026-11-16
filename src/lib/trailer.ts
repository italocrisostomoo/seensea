export interface TmdbVideo {
  key: string;
  site: string;
  type: string;
  iso_639_1: string;
}

// Trailer do YouTube: português primeiro, depois inglês. Teasers e outros sites ficam de fora.
export function pickTrailer(videos: TmdbVideo[]): string | null {
  const trailers = videos.filter((v) => v.site === 'YouTube' && v.type === 'Trailer');
  return (
    trailers.find((v) => v.iso_639_1 === 'pt')?.key ??
    trailers.find((v) => v.iso_639_1 === 'en')?.key ??
    null
  );
}
