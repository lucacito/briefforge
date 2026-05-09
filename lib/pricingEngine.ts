/*
 * PRICING ENGINE — Hours-based model
 *
 * Internal currency is hours, not dollars.
 * Final conversion: price = totalHours × hourlyRate × overheadMultiplier × urgencyMultiplier
 *
 * Conversion ratios (calibrated so $100/hr ≈ previous hardcoded prices):
 *   Base project hours : ProjectTypeData.baseHours       (was basePrice ÷ 100)
 *   Feature            : complexityPoints × 3 h/pt       (was complexityPoints × $300)
 *   Integration        : complexityPoints × 2.5 h/pt     (was complexityPoints × $250)
 *   Content readiness  : none=25h, partial=10h
 *   Copywriting        : full=30h, light=8h
 *   Image assets       : full-art=40h, stock=8h, partial=4h
 *   Branding           : full=50h, partial=20h
 *   Migration          : full=30h, simple=12h; SEO migration=8h
 *   Compliance         : hipaa=50h, enterprise-security=30h, gdpr=15h,
 *                        legal-review=10h, accessibility=15h
 */

import { ProjectState, PricingEstimate, ScoreBreakdown } from '@/types/project';
import { PROJECT_TYPES } from '@/data/projectTypes';
import { FEATURES } from '@/data/features';
import { INTEGRATIONS } from '@/data/integrations';
import { RateConfig } from '@/types/rateConfig';

export type PricingBreakdown = ScoreBreakdown['pricing'];

export function computePricing(
  state: ProjectState,
  _complexity: number,
): { estimate: PricingEstimate; breakdown: PricingBreakdown } {
  const rateConfig: RateConfig = state.rateConfig;

  // Pricing override wins unconditionally
  if (state.pricingOverride.realistic !== null) {
    const override = state.pricingOverride.realistic;
    const emptyBreakdown: PricingBreakdown = {
      baseHours: 0, featureHours: 0, integrationHours: 0, contentHours: 0,
      migrationHours: 0, complianceHours: 0, overheadMultiplier: 1,
      urgencyMultiplier: 1, totalHours: 0, hourlyRate: rateConfig.hourlyRate,
    };
    return {
      estimate: {
        minimum: Math.round(override * 0.75 / 500) * 500,
        realistic: override,
        premium: Math.round(override * 1.4 / 500) * 500,
        pricingSource: 'override',
      },
      breakdown: emptyBreakdown,
    };
  }

  const projectType = PROJECT_TYPES.find(pt => pt.id === state.projectType);
  const baseHours = projectType ? projectType.baseHours : 30;

  let featureHours = 0;
  for (const fid of state.features) {
    const feature = FEATURES.find(f => f.id === fid);
    if (feature) featureHours += feature.complexityPoints * 3;
  }

  let integrationHours = 0;
  for (const iid of state.integrations) {
    const integ = INTEGRATIONS.find(i => i.id === iid);
    if (integ) integrationHours += integ.complexityPoints * 2.5;
  }

  let contentHours = 0;
  if (state.contentReadiness === 'none') contentHours += 25;
  else if (state.contentReadiness === 'partial') contentHours += 10;
  if (state.copywriting === 'full') contentHours += 30;
  else if (state.copywriting === 'light') contentHours += 8;
  if (state.imageAssets === 'full-art') contentHours += 40;
  else if (state.imageAssets === 'stock') contentHours += 8;
  else if (state.imageAssets === 'partial') contentHours += 4;
  if (state.branding === 'full') contentHours += 50;
  else if (state.branding === 'partial') contentHours += 20;

  let migrationHours = 0;
  if (state.migration === 'full') migrationHours += 30;
  else if (state.migration === 'simple') migrationHours += 12;
  if (state.seoMigration) migrationHours += 8;

  let complianceHours = 0;
  if (state.compliance.includes('hipaa')) complianceHours += 50;
  if (state.compliance.includes('enterprise-security')) complianceHours += 30;
  if (state.compliance.includes('gdpr')) complianceHours += 15;
  if (state.compliance.includes('legal-review')) complianceHours += 10;
  if (state.compliance.includes('accessibility')) complianceHours += 15;

  // Bug fix (1): baseline at 2 stakeholders so default project adds 0% overhead
  // Bug fix (2): clamp at 0 so 1 revision round doesn't reduce price
  let overheadMultiplier = 1;
  overheadMultiplier += Math.max(0, (state.stakeholders - 2) * 0.02);
  overheadMultiplier += Math.max(0, (state.revisionRounds - 2) * 0.05);
  if (state.approvalLayers === 'committee') overheadMultiplier += 0.1;
  if (state.communicationStyle === 'frequent') overheadMultiplier += 0.08;
  if (state.trainingRequired) overheadMultiplier += 0.05;
  if (state.documentationRequired) overheadMultiplier += 0.05;

  let urgencyMultiplier = 1;
  if (state.deadlineUrgency > 75) urgencyMultiplier = 1.35;
  else if (state.deadlineUrgency > 50) urgencyMultiplier = 1.2;
  else if (state.deadlineUrgency > 30) urgencyMultiplier = 1.05;

  const totalHours = baseHours + featureHours + integrationHours + contentHours + migrationHours + complianceHours;
  const subtotal = totalHours * rateConfig.hourlyRate * overheadMultiplier * urgencyMultiplier;

  return {
    estimate: {
      minimum: Math.round(subtotal * 0.75 / 500) * 500,
      realistic: Math.round(subtotal / 500) * 500,
      premium: Math.round(subtotal * 1.4 / 500) * 500,
      pricingSource: 'computed',
    },
    breakdown: {
      baseHours,
      featureHours,
      integrationHours,
      contentHours,
      migrationHours,
      complianceHours,
      overheadMultiplier,
      urgencyMultiplier,
      totalHours,
      hourlyRate: rateConfig.hourlyRate,
    },
  };
}

export function formatPrice(amount: number, currency: RateConfig['currency'] = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}
