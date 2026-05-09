import { ProjectState, ProjectScores, ScopeHealthIssue, ScoreBreakdown } from '@/types/project';
import { PROJECT_TYPES } from '@/data/projectTypes';
import { FEATURES } from '@/data/features';
import { INTEGRATIONS } from '@/data/integrations';
import { computeRisk } from './riskEngine';
import { computePricing } from './pricingEngine';
import { computeTimeline } from './timelineEngine';

export function computeComplexity(
  state: ProjectState,
): { score: number; breakdown: ScoreBreakdown['complexity'] } {
  const breakdown: ScoreBreakdown['complexity'] = [];
  let score = 0;

  const projectType = PROJECT_TYPES.find(pt => pt.id === state.projectType);
  if (projectType) {
    score += projectType.baseComplexity;
    breakdown.push({ source: `Project type: ${projectType.label}`, points: projectType.baseComplexity });
  }

  for (const featureId of state.features) {
    const feature = FEATURES.find(f => f.id === featureId);
    if (feature) {
      score += feature.complexityPoints;
      breakdown.push({ source: `Feature: ${feature.label}`, points: feature.complexityPoints });
    }
  }

  for (const integId of state.integrations) {
    const integ = INTEGRATIONS.find(i => i.id === integId);
    if (integ) {
      score += integ.complexityPoints;
      breakdown.push({ source: `Integration: ${integ.label}`, points: integ.complexityPoints });
    }
  }

  const externalPts = state.externalSystems * 3;
  if (externalPts > 0) {
    score += externalPts;
    breakdown.push({ source: `External systems (×${state.externalSystems})`, points: externalPts });
  }

  if (state.migration === 'simple') { score += 8; breakdown.push({ source: 'Migration: Simple', points: 8 }); }
  if (state.migration === 'full') { score += 18; breakdown.push({ source: 'Migration: Full', points: 18 }); }
  if (state.seoMigration) { score += 5; breakdown.push({ source: 'SEO migration', points: 5 }); }

  if (state.branding === 'full') { score += 8; breakdown.push({ source: 'Branding: Full', points: 8 }); }
  else if (state.branding === 'partial') { score += 4; breakdown.push({ source: 'Branding: Partial', points: 4 }); }

  if (state.compliance.includes('hipaa')) { score += 15; breakdown.push({ source: 'Compliance: HIPAA', points: 15 }); }
  if (state.compliance.includes('enterprise-security')) { score += 10; breakdown.push({ source: 'Compliance: Enterprise Security', points: 10 }); }
  if (state.compliance.includes('gdpr')) { score += 5; breakdown.push({ source: 'Compliance: GDPR', points: 5 }); }
  if (state.compliance.includes('legal-review')) { score += 5; breakdown.push({ source: 'Compliance: Legal Review', points: 5 }); }

  if (state.browserSupport === 'legacy') { score += 8; breakdown.push({ source: 'Browser support: Legacy', points: 8 }); }

  if (state.stakeholders > 5) {
    const pts = (state.stakeholders - 5) * 2;
    score += pts;
    breakdown.push({ source: `Stakeholders (${state.stakeholders})`, points: pts });
  }
  if (state.revisionRounds > 3) {
    const pts = (state.revisionRounds - 3) * 2;
    score += pts;
    breakdown.push({ source: `Revision rounds (${state.revisionRounds})`, points: pts });
  }

  if (state.trainingRequired) { score += 5; breakdown.push({ source: 'Training required', points: 5 }); }
  if (state.documentationRequired) { score += 5; breakdown.push({ source: 'Documentation required', points: 5 }); }

  return { score, breakdown };
}

export function getComplexityLabel(score: number): string {
  if (score < 30) return 'Simple';
  if (score < 60) return 'Moderate';
  if (score < 100) return 'Complex';
  if (score < 150) return 'Advanced';
  return 'Enterprise';
}

export function getComplexityColor(score: number): string {
  if (score < 30) return '#586851';
  if (score < 60) return '#656656';
  if (score < 100) return '#9B3030';
  if (score < 150) return '#7F2020';
  return '#7F2020';
}

export function getRiskLabel(score: number): string {
  if (score < 25) return 'Low';
  if (score < 50) return 'Moderate';
  if (score < 75) return 'High';
  return 'High';
}

export function getRiskColor(score: number): string {
  if (score < 25) return '#586851';
  if (score < 50) return '#656656';
  if (score < 75) return '#9B3030';
  return '#7F2020';
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
  const { score: complexity, breakdown: complexityBreakdown } = computeComplexity(state);
  const { risk, flags } = computeRisk(state, complexity);
  const { score: scopeHealth, issues: scopeHealthIssues } = computeScopeHealth(state);
  const { estimate: pricing, breakdown: pricingBreakdown } = computePricing(state, complexity);
  const { timeline, breakdown: timelineBreakdown } = computeTimeline(state, complexity);

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
    breakdown: {
      complexity: complexityBreakdown,
      pricing: pricingBreakdown,
      timeline: timelineBreakdown,
    },
  };
}
