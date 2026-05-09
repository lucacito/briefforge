import { ProjectState, RiskFlag } from '@/types/project';

export function computeRisk(state: ProjectState, complexity: number): { risk: number; flags: RiskFlag[] } {
  const flags: RiskFlag[] = [];
  let risk = 0;

  if (state.revisionRounds > 5) {
    risk += 20;
    flags.push({
      id: 'high-revisions',
      label: 'Revision Overload',
      clientLabel: 'Excessive Revision Rounds',
      description: `${state.revisionRounds} revision rounds creates a feedback loop that never ends. Consider capping at 3.`,
      mitigation: 'Cap revision rounds at 3 and define what constitutes a revision in the contract.',
      severity: 'high',
    });
  } else if (state.revisionRounds > 3) {
    risk += 10;
    flags.push({
      id: 'moderate-revisions',
      label: 'Many Revisions',
      clientLabel: 'High Number of Revision Rounds',
      description: 'More than 3 revision rounds can extend timelines significantly.',
      mitigation: 'Reduce to 3 revision rounds and document approval criteria upfront.',
      severity: 'medium',
    });
  }

  if (state.deadlineUrgency > 75 && state.contentReadiness !== 'ready') {
    risk += 25;
    flags.push({
      id: 'urgent-missing-content',
      label: 'Racing the Clock Without Fuel',
      clientLabel: 'Tight Deadline With Unprepared Content',
      description: 'Tight deadline + missing content is the #1 cause of project disasters.',
      mitigation: 'Scope a content sprint or placeholder phase before development begins.',
      severity: 'critical',
    });
  } else if (state.deadlineUrgency > 60) {
    risk += 15;
    flags.push({
      id: 'tight-deadline',
      label: 'Aggressive Timeline',
      clientLabel: 'Aggressive Timeline',
      description: 'The urgency level suggests little buffer for unexpected issues.',
      mitigation: 'Add a buffer week and agree on a scope freeze date before development starts.',
      severity: 'high',
    });
  }

  if (state.projectType === 'ecommerce' && state.migration === 'full') {
    risk += 20;
    flags.push({
      id: 'ecommerce-migration',
      label: 'Ecommerce Migration Minefield',
      clientLabel: 'Ecommerce Platform Migration',
      description: 'Migrating an ecommerce store risks losing orders, products, and customer data. Plan carefully.',
      mitigation: 'Run parallel systems and validate product, order, and customer data before cutting over.',
      severity: 'critical',
    });
  }

  if (state.stakeholders > 7) {
    risk += 20;
    flags.push({
      id: 'too-many-stakeholders',
      label: 'Too Many Cooks',
      clientLabel: 'High Stakeholder Count',
      description: `${state.stakeholders} stakeholders means ${state.stakeholders} opinions and approval bottlenecks.`,
      mitigation: 'Designate a single decision-maker with authority to approve on behalf of the group.',
      severity: 'high',
    });
  } else if (state.stakeholders > 4) {
    risk += 10;
    flags.push({
      id: 'many-stakeholders',
      label: 'Committee Decision Overhead',
      clientLabel: 'Large Stakeholder Group',
      description: 'More than 4 stakeholders significantly slows feedback cycles.',
      mitigation: 'Establish a clear approval process and a single point of contact before kickoff.',
      severity: 'medium',
    });
  }

  if (state.hostingResponsibility === 'undecided') {
    risk += 10;
    flags.push({
      id: 'hosting-undecided',
      label: 'Hosting Limbo',
      clientLabel: 'Hosting Responsibility Not Assigned',
      description: 'Who manages the server? Undecided hosting creates launch-day surprises.',
      mitigation: 'Confirm hosting ownership in the contract before the project begins.',
      severity: 'medium',
    });
  }

  if (state.compliance.includes('hipaa')) {
    risk += 20;
    flags.push({
      id: 'hipaa-compliance',
      label: 'HIPAA Territory',
      clientLabel: 'HIPAA Compliance Required',
      description: 'HIPAA compliance requires legal review, audit trails, and specialized infrastructure.',
      mitigation: 'Engage a HIPAA-specialist vendor and schedule a legal review before architecture decisions are made.',
      severity: 'critical',
    });
  }

  if (state.compliance.includes('enterprise-security')) {
    risk += 12;
    flags.push({
      id: 'enterprise-security',
      label: 'Enterprise Security Requirements',
      clientLabel: 'Enterprise Security Requirements',
      description: 'Enterprise security audits, pen testing, and compliance documentation add significant overhead.',
      mitigation: 'Budget for a dedicated security sprint and a third-party pen test before launch.',
      severity: 'high',
    });
  }

  if (state.approvalLayers === 'committee' && state.deadlineUrgency > 50) {
    risk += 15;
    flags.push({
      id: 'committee-deadline',
      label: 'Committee Approval on a Deadline',
      clientLabel: 'Committee Approval Combined With Tight Deadline',
      description: 'Committees move slowly. Combining committee approval with urgency is a timeline killer.',
      mitigation: 'Pre-schedule approval meetings and set a hard deadline for responses to avoid bottlenecks.',
      severity: 'high',
    });
  }

  if (state.contentReadiness === 'none' && state.copywriting === 'none') {
    risk += 15;
    flags.push({
      id: 'no-content-no-copy',
      label: 'Content Black Hole',
      clientLabel: 'No Content Plan',
      description: 'No content and no copywriting plan means designs will be built on assumptions.',
      mitigation: 'Begin with a content audit and a writing brief before design starts.',
      severity: 'high',
    });
  }

  if (state.communicationStyle === 'async' && state.stakeholders > 3) {
    risk += 8;
    flags.push({
      id: 'async-with-many-stakeholders',
      label: 'Async Chaos',
      clientLabel: 'Async Communication With Multiple Stakeholders',
      description: 'Async communication with many stakeholders creates misalignment and long feedback cycles.',
      mitigation: 'Move to weekly video check-ins for the duration of the project.',
      severity: 'medium',
    });
  }

  if (complexity > 150) {
    risk += 15;
    flags.push({
      id: 'large-scope',
      label: 'Enterprise-Scale Scope',
      clientLabel: 'Large Scope Requires Phasing',
      description: 'This scope is enormous. Consider phasing the delivery into MVPs to reduce risk.',
      mitigation: 'Break into 2–3 phased deliveries, each with its own scope and sign-off.',
      severity: 'critical',
    });
  }

  if (state.features.length > 15) {
    risk += 10;
    flags.push({
      id: 'feature-bloat',
      label: 'Feature Bloat Warning',
      clientLabel: 'Large Feature Set',
      description: `${state.features.length} features in one scope is ambitious. Consider an MVP approach.`,
      mitigation: 'Prioritize features into must-have and nice-to-have, and defer non-essential ones to a phase 2.',
      severity: 'medium',
    });
  }

  return { risk: Math.min(100, risk), flags };
}
