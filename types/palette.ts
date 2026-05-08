export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export type ColorRole = 'primary' | 'secondary' | 'accent' | 'neutral-1' | 'neutral-2';

export interface PaletteColor {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  name: string;
  role: ColorRole;
}

export interface MoodAnalysis {
  vibe: string;
  warmth: number;
  contrast: string;
  vibrancy: number;
  recommendedFor: string;
}

export interface Palette {
  id: string;
  mood: string;
  colors: PaletteColor[];
  analysis: MoodAnalysis;
  timestamp: number;
}
