import { describe, expect, it } from 'vitest';
import { DEFAULT_PALETTE, NEUTRAL_PALETTE, hslToHex, paletteFromPixels, paletteStyle, rgbToHsl } from '@/lib/palette';

function pixels(...colors: [number, number, number, number][]): Uint8Array {
  // cada item: [r, g, b, quantidade]
  const out: number[] = [];
  for (const [r, g, b, n] of colors) for (let i = 0; i < n; i++) out.push(r, g, b);
  return Uint8Array.from(out);
}

function hueOf(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return rgbToHsl((n >> 16) & 255, (n >> 8) & 255, n & 255)[0];
}

describe('conversões', () => {
  it('rgb → hsl', () => expect(rgbToHsl(0, 0, 255)).toEqual([240, 1, 0.5]));
  it('hsl → hex', () => {
    expect(hslToHex(0, 1, 0.5)).toBe('#ff0000');
    expect(hslToHex(120, 1, 0.25)).toBe('#008000');
  });
});

describe('paletteFromPixels', () => {
  it('pôster vermelho gera paleta vermelha (fundo escuro, destaque claro)', () => {
    const p = paletteFromPixels(pixels([200, 20, 20, 50]), 3);
    expect(hueOf(p.ambient)).toBeCloseTo(0, 0);
    expect(hueOf(p.accent)).toBeCloseTo(0, 0);
    expect(rgbToHsl(...hexToRgb(p.ambient))[2]).toBeLessThan(0.3);
    expect(rgbToHsl(...hexToRgb(p.accent))[2]).toBeGreaterThan(0.65);
  });

  it('cor viva vence área grande e apagada', () => {
    const p = paletteFromPixels(pixels([60, 55, 50, 80], [20, 60, 230, 20]), 3);
    expect(hueOf(p.accent)).toBeGreaterThan(200);
    expect(hueOf(p.accent)).toBeLessThan(240);
  });

  it('ignora pretos e brancos ao escolher a cor', () => {
    const p = paletteFromPixels(pixels([0, 0, 0, 200], [255, 255, 255, 200], [30, 160, 60, 30]), 3);
    expect(hueOf(p.accent)).toBeGreaterThan(110);
    expect(hueOf(p.accent)).toBeLessThan(150);
  });

  it('pôster em preto e branco gera paleta neutra', () => {
    expect(paletteFromPixels(pixels([20, 20, 20, 30], [128, 128, 128, 30], [230, 230, 230, 30]), 3)).toEqual(
      NEUTRAL_PALETTE,
    );
  });

  it('aceita canal alfa (4 canais)', () => {
    const data = Uint8Array.from([200, 20, 20, 255, 200, 20, 20, 255]);
    expect(hueOf(paletteFromPixels(data, 4).accent)).toBeCloseTo(0, 0);
  });

  it('sem pixels usa a paleta padrão', () => {
    expect(paletteFromPixels(new Uint8Array(), 3)).toEqual(DEFAULT_PALETTE);
  });
});

it('paletteStyle expõe as variáveis CSS', () => {
  expect(paletteStyle({ ambient: '#111111', accent: '#eeeeee' })).toEqual({
    '--ambient': '#111111',
    '--accent': '#eeeeee',
  });
});

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
