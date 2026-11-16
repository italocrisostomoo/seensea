import 'server-only';
import { cacheLife } from 'next/cache';
import sharp from 'sharp';
import { tmdbImage } from '@/lib/images';
import { DEFAULT_PALETTE, type Palette, paletteFromPixels } from '@/lib/palette';
import { REVALIDATE, tmdbFetch } from './client';

export interface TitleLogo {
  path: string;
  aspectRatio: number;
}

interface TmdbImages {
  logos?: { file_path: string; iso_639_1: string | null; aspect_ratio: number; vote_average: number }[];
}

/** Cor de assinatura do pôster. Um pôster não muda, então o resultado fica em cache por semanas. */
export async function getPosterPalette(posterPath: string | null): Promise<Palette> {
  'use cache';
  cacheLife('weeks');
  const url = tmdbImage(posterPath, 'w92');
  if (!url) return DEFAULT_PALETTE;
  try {
    const res = await fetch(url);
    if (!res.ok) return DEFAULT_PALETTE;
    const { data, info } = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(24, 36, { fit: 'fill' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    return paletteFromPixels(new Uint8Array(data), info.channels);
  } catch {
    return DEFAULT_PALETTE;
  }
}

/** Logo oficial do título (a arte do nome do filme), em português se houver, senão em inglês. */
export async function getTitleLogo(id: number): Promise<TitleLogo | null> {
  try {
    const data = await tmdbFetch<TmdbImages>(
      `/movie/${id}/images`,
      // Logos sem idioma costumam ser só um símbolo, sem o nome: ficam de fora.
      { include_image_language: 'pt,en' },
      { revalidate: REVALIDATE.movie },
    );
    const logos = (data.logos ?? []).filter((l) => l.file_path.endsWith('.png') || l.file_path.endsWith('.svg'));
    const rank = (lang: string | null) => (lang === 'pt' ? 0 : 1);
    const best = [...logos].sort((a, b) => rank(a.iso_639_1) - rank(b.iso_639_1) || b.vote_average - a.vote_average)[0];
    return best ? { path: best.file_path, aspectRatio: best.aspect_ratio } : null;
  } catch {
    return null;
  }
}
