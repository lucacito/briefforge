import { ProjectState, ProjectScores, ScopeItem, EditableRisk, CustomLineItem, RateConfig } from '@/types/project';
import { PROJECT_TYPES } from '@/data/projectTypes';
import { FEATURES } from '@/data/features';
import { INTEGRATIONS } from '@/data/integrations';
import { formatPrice } from '@/lib/pricingEngine';
import { formatWeeks } from '@/lib/timelineEngine';

export interface ComposedScope {
  executiveSummary: string;
  deliverables: ScopeItem[];
  assumptions: ScopeItem[];
  exclusions: ScopeItem[];
  risks: EditableRisk[];
  nextSteps: ScopeItem[];
  customLineItems: CustomLineItem[];
  scopeNotes: string;
}

// ── Stable ID ─────────────────────────────────────────────────────────────────

export function stableId(prefix: string, text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(31, h) + text.charCodeAt(i) | 0;
  }
  return `${prefix}_${Math.abs(h).toString(36)}`;
}

// ── Pure generators ───────────────────────────────────────────────────────────

export function generateDeliverables(state: ProjectState): ScopeItem[] {
  const items: ScopeItem[] = [];
  for (const fid of state.features) {
    const f = FEATURES.find(feat => feat.id === fid);
    if (f) items.push({ id: stableId('del', f.label), text: f.label, source: 'generated' });
  }
  for (const iid of state.integrations) {
    const i = INTEGRATIONS.find(int => int.id === iid);
    if (i) items.push({ id: stableId('del', `int:${i.label}`), text: i.label, source: 'generated' });
  }
  if (state.externalSystems > 0) {
    const text = `${state.externalSystems} additional external system${state.externalSystems !== 1 ? 's' : ''} (custom API work)`;
    items.push({ id: stableId('del', text), text, source: 'generated' });
  }
  return items;
}

export function generateExclusions(state: ProjectState): string[] {
  const ex: string[] = [];
  if (state.contentReadiness !== 'ready') {
    ex.push('Content population and data entry — placeholder content will be used during build, with a client handoff window agreed at kickoff');
  }
  if (!state.features.includes('api-integrations')) {
    ex.push('Custom API or webhook development beyond the integrations listed in this scope');
  }
  if (!state.maintenanceNeeded) {
    ex.push('This scope covers initial delivery only — an ongoing maintenance retainer can be quoted separately upon launch');
  }
  if (state.imageAssets !== 'full-art') {
    ex.push('Custom photography, video production, and bespoke illustration or 3D assets');
  }
  if (!state.features.includes('multi-language')) {
    ex.push('Translation, localisation, and right-to-left language support');
  }
  if (!state.documentationRequired) {
    ex.push('Technical documentation and developer handoff materials');
  }
  ex.push('Third-party software licences, API subscription fees, and hosting costs');
  ex.push('Scope changes or feature additions requested after design sign-off');
  return ex;
}

export function generateAssumptions(state: ProjectState, _scores: ProjectScores, rateConfig: RateConfig): string[] {
  const a: string[] = [];
  if (state.stakeholders > 4) {
    a.push(`With ${state.stakeholders} stakeholders involved, we will establish a single primary point of contact for day-to-day decisions to keep velocity high`);
  } else {
    a.push('A single primary point of contact on the client side handles internal coordination and approval routing');
  }
  if (state.approvalLayers === 'committee') {
    a.push('Committee approval cycles are factored into the timeline — we assume 3–5 business days per round');
  } else if (state.approvalLayers === 'manager') {
    a.push('Manager-level sign-offs are factored in at each phase gate — typically 2–3 business days per round');
  }
  if (state.revisionRounds > 0) {
    a.push(`Scope includes ${state.revisionRounds} revision round${state.revisionRounds !== 1 ? 's' : ''} per phase. Additional rounds beyond this are billed at ${formatPrice(rateConfig.hourlyRate, rateConfig.currency)}/hour`);
  }
  if (state.contentReadiness === 'none') {
    a.push('Content is not yet available — a content delivery milestone is agreed at kickoff so it does not block the development phase');
  } else if (state.contentReadiness === 'partial') {
    a.push('Partially available content is delivered by an agreed milestone; development proceeds in parallel using placeholder copy where needed');
  }
  if (state.hostingResponsibility === 'client') {
    a.push('Client manages their own hosting infrastructure, DNS configuration, and SSL certificates');
  } else if (state.hostingResponsibility === 'agency') {
    a.push('Hosting setup and the first 12 months of managed hosting are included in scope and invoiced separately from the project fee');
  }
  if (state.branding === 'existing') {
    a.push('Existing brand assets (logos, typefaces, colour system) are provided in vector format (SVG/AI/EPS) at project kickoff');
  } else if (state.branding === 'partial') {
    a.push('Partially developed brand assets are provided at kickoff — any gaps are addressed during the design phase at no extra charge');
  }
  if (state.migration === 'full') {
    a.push('Full access to the existing platform, database exports, and content archive is granted at project start');
  } else if (state.migration === 'simple') {
    a.push('Access to the existing platform is granted at project start for content and asset migration');
  }
  if (state.compliance.includes('hipaa')) {
    a.push('HIPAA compliance assumes a Business Associate Agreement (BAA) is signed with our infrastructure providers before development begins');
  }
  if (state.compliance.includes('gdpr')) {
    a.push('GDPR compliance assumes client provides a current data register and any existing privacy framework documentation at kickoff');
  }
  if (state.compliance.includes('accessibility')) {
    a.push('Accessibility work targets WCAG 2.1 AA — client to confirm if a higher standard applies before design begins');
  }
  if (state.integrations.length > 0) {
    a.push('All required third-party API credentials, keys, and sandbox accounts are provided by client at kickoff');
  }
  if (state.communicationStyle === 'frequent') {
    a.push('Frequent check-ins are built into the schedule — this assumes client availability for short calls multiple times per week during active development');
  } else if (state.communicationStyle === 'weekly') {
    a.push('Weekly status calls are factored into the schedule — a recurring time slot is agreed at kickoff');
  }
  return a;
}

export function generateExecSummary(state: ProjectState, scores: ProjectScores): string {
  const pt = PROJECT_TYPES.find(p => p.id === state.projectType);
  const ptLabel = pt?.label ?? 'Project';
  const currency = state.rateConfig.currency;

  const topFeatures = state.features
    .map(fid => FEATURES.find(f => f.id === fid))
    .filter(Boolean)
    .sort((a, b) => b!.complexityPoints - a!.complexityPoints)
    .slice(0, 5)
    .map(f => f!.label.toLowerCase());

  const featurePhrase = topFeatures.length > 1
    ? topFeatures.slice(0, -1).join(', ') + ', and ' + topFeatures[topFeatures.length - 1]
    : topFeatures[0] ?? 'the configured features';

  const integrationCount = state.integrations.length + state.externalSystems;
  const integrationNote = integrationCount > 0
    ? ` alongside ${integrationCount} third-party integration${integrationCount !== 1 ? 's' : ''}`
    : '';

  const scaleWord =
    scores.complexity < 30  ? 'a contained'
    : scores.complexity < 60  ? 'a moderate'
    : scores.complexity < 100 ? 'a substantial'
    : scores.complexity < 150 ? 'a large-scale'
    : 'an enterprise-scale';

  const urgencyNote = state.deadlineUrgency > 75
    ? ' A high-urgency deadline is factored into the investment figure.'
    : state.deadlineUrgency > 50
    ? ' A moderate urgency premium is applied to the estimate.'
    : '';

  const name = state.name || ptLabel;
  let s = `${name} is ${scaleWord} ${ptLabel.toLowerCase()} build`;
  if (topFeatures.length > 0) s += ` incorporating ${featurePhrase}`;
  s += `${integrationNote}.`;
  s += ` At ${scores.complexityLabel.toLowerCase()} complexity with ${scores.riskLabel.toLowerCase()} risk, this scope translates to ${formatWeeks(scores.timeline.total)} of work and a realistic investment of ${formatPrice(scores.pricing.realistic, currency)}.${urgencyNote}`;
  return s;
}

// ── Merge helpers ─────────────────────────────────────────────────────────────

function mergeItems(generated: ScopeItem[], edits: ScopeItem[]): ScopeItem[] {
  if (edits.length === 0) return generated;

  const genMap = new Map(generated.map(g => [g.id, g]));
  const result: ScopeItem[] = [];
  const seen = new Set<string>();

  for (const edit of edits) {
    seen.add(edit.id);
    if (edit.hidden) continue;
    const gen = genMap.get(edit.id);
    // Generated items: use fresh text from engine (user can only hide, not edit text)
    result.push(gen ?? edit);
  }

  // Newly generated items not yet tracked in edits go at the end
  for (const gen of generated) {
    if (!seen.has(gen.id)) result.push(gen);
  }

  return result;
}

function mergeRisks(generated: EditableRisk[], edits: EditableRisk[]): EditableRisk[] {
  if (edits.length === 0) return generated;

  const genMap = new Map(generated.map(g => [g.id, g]));
  const result: EditableRisk[] = [];
  const seen = new Set<string>();

  for (const edit of edits) {
    seen.add(edit.id);
    if (edit.hidden) continue;
    if (edit.source === 'user') {
      result.push(edit);
    } else {
      // Generated risk: user may have edited fields, prefer their version
      const gen = genMap.get(edit.id);
      result.push(gen ? { ...gen, ...edit } : edit);
    }
  }

  for (const gen of generated) {
    if (!seen.has(gen.id)) result.push(gen);
  }

  return result;
}

// ── Compose ───────────────────────────────────────────────────────────────────

export function composeScope(state: ProjectState, scores: ProjectScores): ComposedScope {
  const edits = state.scopeEdits;

  const genAssumptions = generateAssumptions(state, scores, state.rateConfig)
    .map(text => ({ id: stableId('ass', text), text, source: 'generated' as const }));
  const genExclusions = generateExclusions(state)
    .map(text => ({ id: stableId('exc', text), text, source: 'generated' as const }));
  const genNextSteps: ScopeItem[] = [
    { id: 'ns_kickoff', text: 'Kickoff call — Review this scope together, resolve open questions, and align on communication cadence', source: 'generated' },
    { id: 'ns_contract', text: 'Contract — Finalise and countersign the project agreement', source: 'generated' },
    { id: 'ns_deposit', text: 'Deposit — Confirm deposit terms and project start date', source: 'generated' },
  ];
  const genRisks: EditableRisk[] = scores.riskFlags.map(flag => ({
    id: stableId('risk', flag.id),
    label: flag.label,
    clientLabel: flag.clientLabel,
    description: flag.description,
    mitigation: flag.mitigation,
    severity: flag.severity,
    source: 'generated' as const,
  }));

  const executiveSummary = edits?.executiveSummaryOverride != null
    ? edits.executiveSummaryOverride
    : generateExecSummary(state, scores);

  return {
    executiveSummary,
    deliverables: mergeItems(generateDeliverables(state), edits?.deliverables ?? []),
    assumptions: mergeItems(genAssumptions, edits?.assumptions ?? []),
    exclusions: mergeItems(genExclusions, edits?.exclusions ?? []),
    risks: mergeRisks(genRisks, edits?.risks ?? []),
    nextSteps: mergeItems(genNextSteps, edits?.nextSteps ?? []),
    customLineItems: edits?.customLineItems ?? [],
    scopeNotes: edits?.scopeNotes ?? '',
  };
}
