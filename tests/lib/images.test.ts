import { expect, it } from 'vitest';
import { tmdbImage } from '@/lib/images';

it('monta a URL da imagem', () => expect(tmdbImage('/a.jpg', 'w342')).toBe('https://image.tmdb.org/t/p/w342/a.jpg'));
it('retorna null sem path', () => expect(tmdbImage(null, 'w342')).toBeNull());
