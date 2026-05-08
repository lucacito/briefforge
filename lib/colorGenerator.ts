import type { PaletteColor, MoodAnalysis, ColorRole, Palette } from '@/types/palette';
import { hslToHex, hexToRgb, approximateColorName } from './colorUtils';

function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
}

const WARM_WORDS = ['sunset', 'warm', 'autumn', 'fall', 'fire', 'summer', 'golden', 'amber', 'orange', 'red', 'peach', 'coral', 'rust', 'cafe', 'café', 'coffee', 'terra', 'sand', 'desert', 'honey', 'copper', 'bronze', 'italian'];
const COOL_WORDS = ['ocean', 'night', 'cold', 'winter', 'arctic', 'ice', 'cyber', 'neon', 'space', 'blue', 'teal', 'mint', 'aqua', 'tokyo', 'rain', 'rainy', 'storm', 'nordic', 'scandinavian', 'arctic', 'moon', 'night'];
const GREEN_WORDS = ['forest', 'nature', 'plant', 'leaf', 'jungle', 'tropical', 'garden', 'grass', 'earth', 'sage', 'fern', 'moss', 'emerald', 'pine'];
const PURPLE_WORDS = ['twilight', 'dusk', 'violet', 'lavender', 'purple', 'magic', 'mystical', 'galaxy', 'cosmic', 'dream', 'mystic', 'retro', 'arcade', 'synthwave'];

type HarmonyScheme = 'analogous' | 'split-complementary' | 'triadic' | 'complementary';

function deriveHarmonyHues(baseHue: number, scheme: HarmonyScheme): number[] {
  switch (scheme) {
    case 'analogous':
      return [
        baseHue,
        (baseHue + 28) % 360,
        (baseHue + 56) % 360,
        (baseHue + 12) % 360,
        (baseHue - 18 + 360) % 360,
      ];
    case 'split-complementary':
      return [
        baseHue,
        (baseHue + 150) % 360,
        (baseHue + 210) % 360,
        (baseHue + 18) % 360,
        (baseHue - 18 + 360) % 360,
      ];
    case 'triadic':
      return [
        baseHue,
        (baseHue + 120) % 360,
        (baseHue + 240) % 360,
        (baseHue + 40) % 360,
        (baseHue - 40 + 360) % 360,
      ];
    case 'complementary':
    default:
      return [
        baseHue,
        (baseHue + 180) % 360,
        (baseHue + 30) % 360,
        (baseHue + 8) % 360,
        (baseHue - 8 + 360) % 360,
      ];
  }
}

export function generatePaletteFromMood(mood: string, variationSeed = 0): PaletteColor[] {
  const normalized = mood.toLowerCase().trim();
  const seed = stringToSeed(normalized) + variationSeed;
  const rand = mulberry32(seed);

  let baseHue = rand() * 360;

  if (WARM_WORDS.some((w) => normalized.includes(w))) {
    baseHue = 10 + rand() * 50;
  } else if (COOL_WORDS.some((w) => normalized.includes(w))) {
    baseHue = 190 + rand() * 65;
  } else if (GREEN_WORDS.some((w) => normalized.includes(w))) {
    baseHue = 95 + rand() * 65;
  } else if (PURPLE_WORDS.some((w) => normalized.includes(w))) {
    baseHue = 265 + rand() * 55;
  }

  const schemes: HarmonyScheme[] = ['analogous', 'split-complementary', 'triadic', 'complementary'];
  const scheme = schemes[Math.floor(rand() * schemes.length)];
  const hues = deriveHarmonyHues(baseHue, scheme);

  const roles: ColorRole[] = ['primary', 'secondary', 'accent', 'neutral-1', 'neutral-2'];

  const configs = [
    { s: 52 + rand() * 22, l: 44 + rand() * 16 },
    { s: 42 + rand() * 22, l: 38 + rand() * 22 },
    { s: 62 + rand() * 22, l: 54 + rand() * 16 },
    { s: 6 + rand() * 14, l: 10 + rand() * 14 },
    { s: 4 + rand() * 14, l: 84 + rand() * 11 },
  ];

  return hues.map((hue, i) => {
    const { s, l } = configs[i];
    const hex = hslToHex(hue, s, l);
    const rgb = hexToRgb(hex);
    const hsl = { h: Math.round(hue), s: Math.round(s), l: Math.round(l) };
    return { hex, rgb, hsl, name: approximateColorName(hue, s, l), role: roles[i] };
  });
}

export function analyzeMood(mood: string, colors: PaletteColor[]): MoodAnalysis {
  const primary = colors[0];
  const h = primary.hsl.h;

  const warmthBase =
    h <= 60 || h >= 330
      ? 65 + colors[0].hsl.s * 0.25
      : h <= 120 || h >= 270
      ? 35 + colors[0].hsl.s * 0.1
      : 15 + colors[0].hsl.s * 0.05;
  const warmth = Math.round(Math.min(95, Math.max(5, warmthBase)));

  const lightnesses = colors.map((c) => c.hsl.l);
  const lightnessRange = Math.max(...lightnesses) - Math.min(...lightnesses);
  const contrast = lightnessRange > 60 ? 'high' : lightnessRange > 35 ? 'medium' : 'low';

  const chromatic = colors.slice(0, 3);
  const vibrancy = Math.round(chromatic.reduce((sum, c) => sum + c.hsl.s, 0) / chromatic.length);

  const vibe = deriveVibe(mood, warmth, vibrancy, primary.hsl.l);
  const recommendedFor = deriveRecommendation(vibe);

  return { vibe, warmth, contrast, vibrancy, recommendedFor };
}

function deriveVibe(mood: string, warmth: number, vibrancy: number, lightness: number): string {
  const lower = mood.toLowerCase();

  if (lower.includes('nostalgic') || lower.includes('retro')) return 'Retro Nostalgia';
  if (lower.includes('cyber') || lower.includes('neon') || lower.includes('punk')) return 'Cyberpunk Intensity';
  if (lower.includes('forest') || lower.includes('nature') || lower.includes('peaceful')) return 'Natural Serenity';
  if (lower.includes('brutal') || lower.includes('industrial')) return 'Industrial Edge';
  if (lower.includes('minimal') || lower.includes('scandinavian') || lower.includes('nordic')) return 'Nordic Minimalism';
  if (lower.includes('tropical') || lower.includes('vacation') || lower.includes('beach')) return 'Tropical Vibrancy';
  if (lower.includes('galaxy') || lower.includes('cosmic') || lower.includes('space')) return 'Cosmic Wonder';
  if (lower.includes('autumn') || lower.includes('fall') || lower.includes('cozy')) return 'Autumnal Warmth';

  if (warmth > 60 && vibrancy > 55) return 'Energetic Warmth';
  if (warmth > 60 && vibrancy < 45) return 'Romantic Warmth';
  if (warmth < 35 && lightness < 40) return 'Cinematic Melancholy';
  if (warmth < 35 && vibrancy > 60) return 'Electric Cool';
  if (vibrancy < 30) return 'Muted Elegance';
  if (vibrancy > 70) return 'Bold Dynamism';
  return 'Balanced Harmony';
}

function deriveRecommendation(vibe: string): string {
  const map: Record<string, string> = {
    'Retro Nostalgia': 'music branding, editorial, vintage products',
    'Cyberpunk Intensity': 'gaming, tech startups, dark UI, events',
    'Natural Serenity': 'wellness brands, eco products, spas, blogs',
    'Industrial Edge': 'architecture, fashion, bold editorial',
    'Nordic Minimalism': 'SaaS dashboards, portfolios, luxury brands',
    'Tropical Vibrancy': 'travel apps, lifestyle brands, social media',
    'Cosmic Wonder': 'sci-fi media, creative agencies, NFT projects',
    'Autumnal Warmth': 'food brands, lifestyle blogs, home decor',
    'Energetic Warmth': 'sports brands, e-commerce, mobile apps',
    'Romantic Warmth': 'fashion, beauty brands, wedding sites',
    'Cinematic Melancholy': 'film portfolios, music branding, editorial',
    'Electric Cool': 'tech products, developer tools, dark apps',
    'Muted Elegance': 'luxury fashion, premium services, finance',
    'Bold Dynamism': 'startups, creative tools, marketing agencies',
    'Balanced Harmony': 'general purpose, SaaS, content platforms',
  };
  return map[vibe] ?? 'versatile for most digital applications';
}

export function buildPalette(mood: string, variationSeed = 0): Palette {
  const colors = generatePaletteFromMood(mood, variationSeed);
  const analysis = analyzeMood(mood, colors);
  return {
    id: `${stringToSeed(mood)}-${Date.now()}`,
    mood,
    colors,
    analysis,
    timestamp: Date.now(),
  };
}
