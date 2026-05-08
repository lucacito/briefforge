import { ProjectState, RiskFlag } from '@/types/project';

export function computeRisk(state: ProjectState, complexity: number): { risk: number; flags: RiskFlag[] } {
  const flags: RiskFlag[] = [];
  let risk = 0;

  if (state.revisionRounds > 5) {
    risk += 20;
    flags.push({
      id: 'high-revisions',
      label: 'Revision Overload',
      description: `${state.revisionRounds} revision rounds creates a feedback loop that never ends. Consider capping at 3.`,
      severity: 'high',
    });
  } else if (state.revisionRounds > 3) {
    risk += 10;
    flags.push({
      id: 'moderate-revisions',
      label: 'Many Revisions',
      description: 'More than 3 revision rounds can extend timelines significantly.',
      severity: 'medium',
    });
  }

  if (state.deadlineUrgency > 75 && state.contentReadiness !== 'ready') {
    risk += 25;
    flags.push({
      id: 'urgent-missing-content',
      label: 'Racing the Clock Without Fuel',
      description: 'Tight deadline + missing content is the #1 cause of project disasters.',
      severity: 'critical',
    });
  } else if (state.deadlineUrgency > 60) {
    risk += 15;
    flags.push({
      id: 'tight-deadline',
      label: 'Aggressive Timeline',
      description: 'The urgency level suggests little buffer for unexpected issues.',
      severity: 'high',
    });
  }

  if (state.projectType === 'ecommerce' && state.migration === 'full') {
    risk += 20;
    flags.push({
      id: 'ecommerce-migration',
      label: 'Ecommerce Migration Minefield',
      description: 'Migrating an ecommerce store risks losing orders, products, and customer data. Plan carefully.',
      severity: 'critical',
    });
  }

  if (state.stakeholders > 7) {
    risk += 20;
    flags.push({
      id: 'too-many-stakeholders',
      label: 'Too Many Cooks',
      description: `${state.stakeholders} stakeholders means ${state.stakeholders} opinions and approval bottlenecks.`,
      severity: 'high',
    });
  } else if (state.stakeholders > 4) {
    risk += 10;
    flags.push({
      id: 'many-stakeholders',
      label: 'Committee Decision Overhead',
      description: 'More than 4 stakeholders significantly slows feedback cycles.',
      severity: 'medium',
    });
  }

  if (state.hostingResponsibility === 'undecided') {
    risk += 10;
    flags.push({
      id: 'hosting-undecided',
      label: 'Hosting Limbo',
      description: 'Who manages the server? Undecided hosting creates launch-day surprises.',
      severity: 'medium',
    });
  }

  if (state.compliance.includes('hipaa')) {
    risk += 20;
    flags.push({
      id: 'hipaa-compliance',
      label: 'HIPAA Territory',
      description: 'HIPAA compliance requires legal review, audit trails, and specialized infrastructure.',
      severity: 'critical',
    });
  }

  if (state.compliance.includes('enterprise-security')) {
    risk += 12;
    flags.push({
      id: 'enterprise-security',
      label: 'Enterprise Security Requirements',
      description: 'Enterprise security audits, pen testing, and compliance documentation add significant overhead.',
      severity: 'high',
    });
  }

  if (state.approvalLayers === 'committee' && state.deadlineUrgency > 50) {
    risk += 15;
    flags.push({
      id: 'committee-deadline',
      label: 'Committee Approval on a Deadline',
      description: 'Committees move slowly. Combining committee approval with urgency is a timeline killer.',
      severity: 'high',
    });
  }

  if (state.contentReadiness === 'none' && state.copywriting === 'none') {
    risk += 15;
    flags.push({
      id: 'no-content-no-copy',
      label: 'Content Black Hole',
      description: 'No content and no copywriting plan means designs will be built on assumptions.',
      severity: 'high',
    });
  }

  if (state.communicationStyle === 'async' && state.stakeholders > 3) {
    risk += 8;
    flags.push({
      id: 'async-with-many-stakeholders',
      label: 'Async Chaos',
      description: 'Async communication with many stakeholders creates misalignment and long feedback cycles.',
      severity: 'medium',
    });
  }

  if (complexity > 150) {
    risk += 15;
    flags.push({
      id: 'monster-project',
      label: 'Monster Project Territory',
      description: 'This scope is enormous. Consider phasing the delivery into MVPs to reduce risk.',
      severity: 'critical',
    });
  }

  if (state.features.length > 15) {
    risk += 10;
    flags.push({
      id: 'feature-bloat',
      label: 'Feature Bloat Warning',
      description: `${state.features.length} features in one scope is ambitious. Consider an MVP approach.`,
      severity: 'medium',
    });
  }

  return { risk: Math.min(100, risk), flags };
}
