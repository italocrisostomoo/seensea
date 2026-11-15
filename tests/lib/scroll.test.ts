import { describe, expect, it } from 'vitest';
import { scrollTargetToRestore } from '@/lib/scroll';

describe('scrollTargetToRestore', () => {
  it.each([
    ['sem valor salvo', null, 5000, 800, null],
    ['valor inválido', 'abc', 5000, 800, null],
    ['zero', '0', 5000, 800, null],
    ['negativo', '-10', 5000, 800, null],
    ['alcançável', '3000', 5000, 800, 3000],
    ['limite exato', '4200', 5000, 800, 4200],
    ['página curta (recarga com só a página 1)', '3000', 2000, 800, null],
  ])('%s', (_n, saved, docH, viewH, expected) =>
    expect(scrollTargetToRestore(saved, docH, viewH)).toBe(expected),
  );
});
