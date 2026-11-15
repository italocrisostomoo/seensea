import { exploreHref } from '@/lib/filters';
import { themesForMovie } from '@/lib/themes';
import type { DiscoverQuery } from '@/lib/tmdb/discover';
import type { MovieDetails } from '@/lib/tmdb/types';

export interface RelatedShelf {
  title: string;
  href: string;
  query: DiscoverQuery;
}

export function relatedShelves(movie: MovieDetails): RelatedShelf[] {
  const shelves: RelatedShelf[] = [];
  const theme = themesForMovie(movie.keywordIds)[0];
  if (theme) {
    shelves.push({
      title: `Mais de ${theme.name}`,
      href: exploreHref({ theme: theme.slug }),
      query: { keywordIds: theme.keywordIds },
    });
  }
  const director = movie.directors[0];
  if (director) {
    shelves.push({
      title: `Mais de ${director.name}`,
      href: exploreHref({ crewId: director.id }),
      query: { crewId: director.id },
    });
  }
  if (movie.genres.length > 0) {
    shelves.push({
      title: 'Do mesmo gênero',
      href: exploreHref({ genres: [movie.genres[0].id] }),
      query: { genres: movie.genres.map((g) => g.id), genreMatch: 'any' },
    });
  }
  return shelves;
}
