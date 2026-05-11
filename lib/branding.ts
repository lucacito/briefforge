import { BrandingConfig, DEFAULT_BRANDING } from '@/types/branding';

const KEY = 'flyscope_branding';

export function loadBranding(): BrandingConfig {
  if (typeof window === 'undefined') return DEFAULT_BRANDING;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_BRANDING, ...JSON.parse(raw) } : DEFAULT_BRANDING;
  } catch {
    return DEFAULT_BRANDING;
  }
}

export function saveBranding(config: BrandingConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(config));
  } catch {
    // Ignore storage errors
  }
}
