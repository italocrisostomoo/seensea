import type { CSSProperties } from 'react';

// Paleta derivada do pôster: `ambient` tinge fundos e degradês (escura, texto branco por cima);
// `accent` pinta botões, foco e detalhes (clara, texto preto por cima).
export interface Palette {
  ambient: string;
  accent: string;
}

/** Verde-azulado do SeenSea: usado quando não há pôster. */
export const DEFAULT_PALETTE: Palette = { ambient: '#0f4a55', accent: '#8be3d5' };
/** Para pôsteres em preto e branco (ou quase). */
export const NEUTRAL_PALETTE: Palette = { ambient: '#292b33', accent: '#e6e7ec' };

const HUE_BUCKETS = 24;
const MIN_SATURATION = 0.25;
const MIN_LIGHTNESS = 0.12;
const MAX_LIGHTNESS = 0.9;
/** Abaixo desta fração de "peso cromático" por pixel, o pôster é tratado como neutro. */
const MIN_CHROMA_SHARE = 0.015;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const round = (v: number, digits = 4) => Math.round(v * 10 ** digits) / 10 ** digits;

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, round(l)];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h = (h * 60 + 360) % 360;
  return [round(h, 2), round(s), round(l)];
}

export function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return `#${[r, g, b]
    .map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0'))
    .join('')}`;
}

/**
 * Escolhe a cor mais marcante de um pôster a partir dos pixels crus (RGB ou RGBA).
 * Cores vivas e de luminosidade média pesam mais; pretos, brancos e cinzas são ignorados,
 * para que a cor escolhida seja a "assinatura" do pôster e não o fundo escuro.
 */
export function paletteFromPixels(data: Uint8Array, channels: number): Palette {
  const total = Math.floor(data.length / channels);
  if (total === 0) return DEFAULT_PALETTE;

  const samples: { h: number; s: number; w: number; bucket: number }[] = [];
  const bucketWeight = new Array<number>(HUE_BUCKETS).fill(0);
  let chroma = 0;

  for (let i = 0; i + 2 < data.length; i += channels) {
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    if (s < MIN_SATURATION || l < MIN_LIGHTNESS || l > MAX_LIGHTNESS) continue;
    const w = s * (1 - Math.abs(l - 0.5) * 1.6);
    if (w <= 0) continue;
    const bucket = Math.floor(h / (360 / HUE_BUCKETS)) % HUE_BUCKETS;
    samples.push({ h, s, w, bucket });
    bucketWeight[bucket] += w;
    chroma += w;
  }

  if (chroma / total < MIN_CHROMA_SHARE) return NEUTRAL_PALETTE;

  // Bucket vencedor somado aos vizinhos, para não partir uma cor ao meio na fronteira.
  const near = (b: number, center: number) => {
    const d = Math.abs(b - center);
    return Math.min(d, HUE_BUCKETS - d) <= 1;
  };
  let best = 0;
  let bestScore = -1;
  for (let b = 0; b < HUE_BUCKETS; b++) {
    const score = bucketWeight[(b + HUE_BUCKETS - 1) % HUE_BUCKETS] + bucketWeight[b] + bucketWeight[(b + 1) % HUE_BUCKETS];
    if (score > bestScore) {
      bestScore = score;
      best = b;
    }
  }

  let x = 0;
  let y = 0;
  let sat = 0;
  let weight = 0;
  for (const p of samples) {
    if (!near(p.bucket, best)) continue;
    const rad = (p.h * Math.PI) / 180;
    x += Math.cos(rad) * p.w;
    y += Math.sin(rad) * p.w;
    sat += p.s * p.w;
    weight += p.w;
  }
  const hue = (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360;
  const s = sat / weight;

  return {
    ambient: hslToHex(hue, clamp(s * 0.9, 0.3, 0.7), 0.2),
    accent: hslToHex(hue, clamp(s, 0.45, 0.85), 0.76),
  };
}

export function paletteStyle(p: Palette): CSSProperties {
  return { '--ambient': p.ambient, '--accent': p.accent } as CSSProperties;
}
