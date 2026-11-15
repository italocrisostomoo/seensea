import { describe, expect, it } from 'vitest';
import { getNextPageParam } from '@/lib/pagination';

describe('getNextPageParam', () => {
  it.each([
    [{ page: 1, totalPages: 3 }, 2],
    [{ page: 3, totalPages: 3 }, undefined],
    [{ page: 1, totalPages: 0 }, undefined],
    [{ page: 1, totalPages: 1 }, undefined],
    [{ page: 500, totalPages: 500 }, undefined],
  ])('getNextPageParam(%o) = %s', (last, next) =>
    expect(getNextPageParam({ results: [], ...last })).toBe(next),
  );
});
