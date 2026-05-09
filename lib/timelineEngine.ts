import { ProjectState, TimelineBreakdown, ScoreBreakdown } from '@/types/project';
import { FEATURES } from '@/data/features';

export type TimelineBreakdownItem = ScoreBreakdown['timeline'][number];

export function formatWeeks(n: number): string {
  return n === 1 ? '1 week' : `${n} weeks`;
}

export function computeTimeline(
  state: ProjectState,
  complexity: number,
): { timeline: TimelineBreakdown; breakdown: TimelineBreakdownItem[] } {
  let featureWeeks = 0;
  for (const fid of state.features) {
    const feature = FEATURES.find(f => f.id === fid);
    if (feature) featureWeeks += feature.timelineImpact;
  }

  const integrationWeeks = state.integrations.length * 0.5 + state.externalSystems * 0.3;

  let discovery = 1;
  const discoveryReasons: string[] = ['Base discovery'];
  if (state.stakeholders > 4) { discovery += 1; discoveryReasons.push(`${state.stakeholders} stakeholders`); }
  if (state.approvalLayers === 'committee') { discovery += 1; discoveryReasons.push('Committee approval'); }
  discovery = Math.min(discovery, 3);

  let design = 1.5;
  const designReasons: string[] = ['Base design'];
  if (state.branding === 'full') { design += 3; designReasons.push('Full branding'); }
  else if (state.branding === 'partial') { design += 1.5; designReasons.push('Partial branding'); }
  if (state.imageAssets === 'full-art') { design += 2; designReasons.push('Full art direction'); }
  const complexityDesignAdd = complexity * 0.01;
  if (complexityDesignAdd > 0.1) designReasons.push(`Complexity factor`);
  design += complexityDesignAdd;
  design = Math.min(Math.max(design, 1), 8);

  let development = Math.max(2, featureWeeks + integrationWeeks);
  const devReasons: string[] = [`${state.features.length} features, ${state.integrations.length} integrations`];
  if (state.browserSupport === 'legacy') { development *= 1.2; devReasons.push('Legacy browser support'); }
  if (state.compliance.includes('hipaa')) { development += 2; devReasons.push('HIPAA compliance'); }
  if (state.compliance.includes('enterprise-security')) { development += 2; devReasons.push('Enterprise security'); }
  if (state.migration === 'full') { development += 2; devReasons.push('Full migration'); }
  else if (state.migration === 'simple') { development += 1; devReasons.push('Simple migration'); }
  development = Math.min(development, 24);

  const revisionBuffer = state.revisionRounds * 0.5;

  let qa = 1;
  const qaReasons: string[] = ['Base QA'];
  qa += complexity * 0.01;
  if (state.compliance.includes('accessibility')) { qa += 0.5; qaReasons.push('Accessibility audit'); }
  qa = Math.min(Math.max(qa, 0.5), 4);

  const launch = 0.5;

  // Urgency does NOT compress timeline — rush jobs cost more (urgencyMultiplier in pricingEngine)
  // but take roughly the same calendar time. Remove the old 0.75 urgencyFactor.
  const rawTotal = discovery + design + development + revisionBuffer + qa + launch;
  const total = Math.round(rawTotal * 2) / 2;

  const timeline: TimelineBreakdown = {
    discovery: Math.round(discovery * 2) / 2,
    design: Math.round(design * 2) / 2,
    development: Math.round(development * 2) / 2,
    qa: Math.round(qa * 2) / 2,
    launch,
    total,
  };

  const breakdown: TimelineBreakdownItem[] = [
    { phase: 'Discovery', weeks: timeline.discovery, reason: discoveryReasons.join(', ') },
    { phase: 'Design', weeks: timeline.design, reason: designReasons.join(', ') },
    { phase: 'Development', weeks: timeline.development, reason: devReasons.join(', ') },
    { phase: 'Revision buffer', weeks: Math.round(revisionBuffer * 2) / 2, reason: `${state.revisionRounds} revision rounds` },
    { phase: 'QA & Testing', weeks: timeline.qa, reason: qaReasons.join(', ') },
    { phase: 'Launch', weeks: timeline.launch, reason: 'Deployment and go-live' },
  ];

  return { timeline, breakdown };
}
