import { ProjectState, PricingEstimate } from '@/types/project';
import { PROJECT_TYPES } from '@/data/projectTypes';
import { FEATURES } from '@/data/features';
import { INTEGRATIONS } from '@/data/integrations';

export function computePricing(state: ProjectState, complexity: number): PricingEstimate {
  const projectType = PROJECT_TYPES.find(pt => pt.id === state.projectType);
  let base = projectType ? projectType.basePrice : 3000;

  let featureValue = 0;
  for (const fid of state.features) {
    const feature = FEATURES.find(f => f.id === fid);
    if (feature) featureValue += feature.complexityPoints * 300;
  }

  let integValue = 0;
  for (const iid of state.integrations) {
    const integ = INTEGRATIONS.find(i => i.id === iid);
    if (integ) integValue += integ.complexityPoints * 250;
  }

  let contentCost = 0;
  if (state.contentReadiness === 'none') contentCost += 2500;
  else if (state.contentReadiness === 'partial') contentCost += 1000;
  if (state.copywriting === 'full') contentCost += 3000;
  else if (state.copywriting === 'light') contentCost += 800;
  if (state.imageAssets === 'full-art') contentCost += 4000;
  else if (state.imageAssets === 'stock') contentCost += 800;
  else if (state.imageAssets === 'partial') contentCost += 400;
  if (state.branding === 'full') contentCost += 5000;
  else if (state.branding === 'partial') contentCost += 2000;

  let migrationCost = 0;
  if (state.migration === 'full') migrationCost += 3000;
  else if (state.migration === 'simple') migrationCost += 1200;
  if (state.seoMigration) migrationCost += 800;

  let overheadMultiplier = 1;
  overheadMultiplier += state.stakeholders * 0.02;
  overheadMultiplier += (state.revisionRounds - 2) * 0.05;
  if (state.approvalLayers === 'committee') overheadMultiplier += 0.1;
  if (state.communicationStyle === 'frequent') overheadMultiplier += 0.08;
  if (state.trainingRequired) overheadMultiplier += 0.05;
  if (state.documentationRequired) overheadMultiplier += 0.05;

  let urgencyMultiplier = 1;
  if (state.deadlineUrgency > 75) urgencyMultiplier = 1.35;
  else if (state.deadlineUrgency > 50) urgencyMultiplier = 1.2;
  else if (state.deadlineUrgency > 30) urgencyMultiplier = 1.05;

  let complianceCost = 0;
  if (state.compliance.includes('hipaa')) complianceCost += 5000;
  if (state.compliance.includes('enterprise-security')) complianceCost += 3000;
  if (state.compliance.includes('gdpr')) complianceCost += 1500;
  if (state.compliance.includes('legal-review')) complianceCost += 1000;
  if (state.compliance.includes('accessibility')) complianceCost += 1500;

  const subtotal = (base + featureValue + integValue + contentCost + migrationCost + complianceCost) * overheadMultiplier * urgencyMultiplier;

  const minimum = Math.round(subtotal * 0.75 / 500) * 500;
  const realistic = Math.round(subtotal / 500) * 500;
  const premium = Math.round(subtotal * 1.4 / 500) * 500;

  return { minimum, realistic, premium };
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}
