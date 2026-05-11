import LZString from 'lz-string';
import type { ComposedScope } from '@/lib/scopeComposer';
import type { BrandingConfig } from '@/types/branding';
import type { PricingEstimate, TimelineBreakdown, ProjectState, ProjectScores } from '@/types/project';
import type { RateConfig } from '@/types/rateConfig';

// ── Payload ───────────────────────────────────────────────────────────────────

export interface SharePayload {
  v: 1;
  projectName: string;
  clientName: string;
  date: string;
  currency: RateConfig['currency'];
  composed: ComposedScope;
  branding: BrandingConfig;
  pricing: PricingEstimate;
  timeline: TimelineBreakdown;
  complexityLabel: string;
  riskLabel: string;
  scopeHealth: number;
}

export function buildSharePayload(
  state: ProjectState,
  scores: ProjectScores,
  composed: ComposedScope,
  branding: BrandingConfig,
): SharePayload {
  return {
    v: 1,
    projectName: state.name || 'Project Scope',
    clientName: state.clientName ?? '',
    date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
    currency: state.rateConfig.currency,
    composed,
    branding,
    pricing: scores.pricing,
    timeline: scores.timeline,
    complexityLabel: scores.complexityLabel,
    riskLabel: scores.riskLabel,
    scopeHealth: scores.scopeHealth,
  };
}

// ── Encode / decode ───────────────────────────────────────────────────────────

export function encodeSharePayload(payload: SharePayload): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
}

export function decodeSharePayload(encoded: string): SharePayload | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json) as SharePayload;
  } catch {
    return null;
  }
}

// ── URL build + size check ────────────────────────────────────────────────────

export interface ShareUrlResult {
  url: string;
  bytes: number;
  warning: boolean;
  label: string;
}

export function buildShareUrl(payload: SharePayload): ShareUrlResult {
  const encoded = encodeSharePayload(payload);
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${base}/shared/v1?d=${encoded}`;
  const bytes = url.length;
  const kb = (bytes / 1024).toFixed(1);
  return {
    url,
    bytes,
    warning: bytes > 6000,
    // TODO: a backend short-link service would solve the URL length issue entirely
    label: bytes > 6000
      ? `${kb} KB — may be too long for some email clients`
      : `${kb} KB — should work everywhere`,
  };
}
