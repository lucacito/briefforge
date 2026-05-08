import { ProjectState, ProjectScores, ScopeHealthIssue } from '@/types/project';
import { PROJECT_TYPES } from '@/data/projectTypes';
import { FEATURES } from '@/data/features';
import { INTEGRATIONS } from '@/data/integrations';
import { computeRisk } from './riskEngine';
import { computePricing } from './pricingEngine';
import { computeTimeline } from './timelineEngine';

export function computeComplexity(state: ProjectState): number {
  let score = 0;

  const projectType = PROJECT_TYPES.find(pt => pt.id === state.projectType);
  if (projectType) score += projectType.baseComplexity;

  for (const featureId of state.features) {
    const feature = FEATURES.find(f => f.id === featureId);
    if (feature) score += feature.complexityPoints;
  }

  for (const integId of state.integrations) {
    const integ = INTEGRATIONS.find(i => i.id === integId);
    if (integ) score += integ.complexityPoints;
  }

  score += state.externalSystems * 3;

  if (state.migration === 'simple') score += 8;
  if (state.migration === 'full') score += 18;
  if (state.seoMigration) score += 5;

  if (state.branding === 'full') score += 8;
  else if (state.branding === 'partial') score += 4;

  if (state.compliance.includes('hipaa')) score += 15;
  if (state.compliance.includes('enterprise-security')) score += 10;
  if (state.compliance.includes('gdpr')) score += 5;
  if (state.compliance.includes('legal-review')) score += 5;

  if (state.browserSupport === 'legacy') score += 8;

  if (state.stakeholders > 5) score += (state.stakeholders - 5) * 2;
  if (state.revisionRounds > 3) score += (state.revisionRounds - 3) * 2;

  if (state.trainingRequired) score += 5;
  if (state.documentationRequired) score += 5;

  return score;
}

export function getComplexityLabel(score: number): string {
  if (score < 30) return 'Simple';
  if (score < 60) return 'Moderate';
  if (score < 100) return 'Complex';
  if (score < 150) return 'Advanced';
  return 'Monster Project';
}

export function getComplexityColor(score: number): string {
  if (score < 30) return '#22c55e';
  if (score < 60) return '#eab308';
  if (score < 100) return '#f97316';
  if (score < 150) return '#ef4444';
  return '#a855f7';
}

export function getRiskLabel(score: number): string {
  if (score < 25) return 'Low';
  if (score < 50) return 'Moderate';
  if (score < 75) return 'High';
  return 'Chaos Mode';
}

export function getRiskColor(score: number): string {
  if (score < 25) return '#22c55e';
  if (score < 50) return '#eab308';
  if (score < 75) return '#ef4444';
  return '#a855f7';
}

export function computeScopeHealth(state: ProjectState): { score: number; issues: ScopeHealthIssue[] } {
  const issues: ScopeHealthIssue[] = [];
  let deductions = 0;

  if (!state.projectType) {
    issues.push({ id: 'no-project-type', label: 'Project type not selected' });
    deductions += 20;
  }

  if (state.features.length === 0) {
    issues.push({ id: 'no-features', label: 'No features selected' });
    deductions += 15;
  }

  if (state.contentReadiness === 'none') {
    issues.push({ id: 'no-content', label: 'No content ownership defined' });
    deductions += 10;
  }

  if (state.imageAssets === 'full-art') {
    issues.push({ id: 'art-direction', label: 'Full art direction adds significant scope' });
    deductions += 5;
  }

  if (state.hostingResponsibility === 'undecided') {
    issues.push({ id: 'hosting-undecided', label: 'Hosting responsibility not assigned' });
    deductions += 10;
  }

  if (state.migration !== 'none' && !state.seoMigration) {
    issues.push({ id: 'seo-migration', label: 'SEO migration status unspecified for migration project' });
    deductions += 5;
  }

  if (state.deadlineUrgency > 70 && state.contentReadiness !== 'ready') {
    issues.push({ id: 'urgent-no-content', label: 'Tight deadline with unprepared content is risky' });
    deductions += 10;
  }

  if (state.revisionRounds < 2) {
    issues.push({ id: 'low-revisions', label: 'Only 1 revision round may lead to scope creep later' });
    deductions += 5;
  }

  return { score: Math.max(0, 100 - deductions), issues };
}

export function computeAllScores(state: ProjectState): ProjectScores {
  const complexity = computeComplexity(state);
  const { risk, flags } = computeRisk(state, complexity);
  const { score: scopeHealth, issues: scopeHealthIssues } = computeScopeHealth(state);
  const pricing = computePricing(state, complexity);
  const timeline = computeTimeline(state, complexity);

  return {
    complexity,
    complexityLabel: getComplexityLabel(complexity),
    complexityColor: getComplexityColor(complexity),
    risk,
    riskLabel: getRiskLabel(risk),
    riskColor: getRiskColor(risk),
    riskFlags: flags,
    scopeHealth,
    scopeHealthIssues,
    pricing,
    timeline,
  };
}
