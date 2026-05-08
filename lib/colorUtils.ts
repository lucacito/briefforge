import type { RGB, HSL } from '@/types/palette';

export function hexToRgb(hex: string): RGB {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
      case gn: h = ((bn - rn) / d + 2) / 6; break;
      case bn: h = ((rn - gn) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

export function approximateColorName(h: number, s: number, l: number): string {
  if (s < 12) {
    if (l < 15) return 'Jet Black';
    if (l < 30) return 'Charcoal';
    if (l < 50) return 'Slate Gray';
    if (l < 70) return 'Silver';
    if (l < 85) return 'Platinum';
    return 'Off White';
  }

  const prefix = l < 30 ? 'Deep ' : l < 45 ? 'Dark ' : l > 75 ? 'Light ' : s > 75 ? 'Vivid ' : '';

  const hueMap: [number, string][] = [
    [12, 'Red'],
    [22, 'Vermilion'],
    [35, 'Orange'],
    [50, 'Amber'],
    [65, 'Gold'],
    [80, 'Yellow'],
    [105, 'Chartreuse'],
    [135, 'Green'],
    [165, 'Emerald'],
    [185, 'Teal'],
    [200, 'Cyan'],
    [225, 'Sky Blue'],
    [250, 'Blue'],
    [265, 'Indigo'],
    [280, 'Violet'],
    [300, 'Purple'],
    [320, 'Magenta'],
    [340, 'Rose'],
    [355, 'Crimson'],
    [360, 'Red'],
  ];

  for (const [angle, name] of hueMap) {
    if (h <= angle) return prefix + name;
  }
  return prefix + 'Red';
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
