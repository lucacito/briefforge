import { ProjectState, TimelineBreakdown } from '@/types/project';
import { FEATURES } from '@/data/features';

export function computeTimeline(state: ProjectState, complexity: number): TimelineBreakdown {
  let featureWeeks = 0;
  for (const fid of state.features) {
    const feature = FEATURES.find(f => f.id === fid);
    if (feature) featureWeeks += feature.timelineImpact;
  }

  const integrationWeeks = state.integrations.length * 0.5 + state.externalSystems * 0.3;

  let discovery = 1;
  if (state.stakeholders > 4) discovery += 1;
  if (state.approvalLayers === 'committee') discovery += 1;
  discovery = Math.min(discovery, 3);

  let design = 1.5;
  if (state.branding === 'full') design += 3;
  else if (state.branding === 'partial') design += 1.5;
  if (state.imageAssets === 'full-art') design += 2;
  design += complexity * 0.01;
  design = Math.min(Math.max(design, 1), 8);

  let development = Math.max(2, featureWeeks + integrationWeeks);
  if (state.browserSupport === 'legacy') development *= 1.2;
  if (state.compliance.includes('hipaa')) development += 2;
  if (state.compliance.includes('enterprise-security')) development += 2;
  if (state.migration === 'full') development += 2;
  else if (state.migration === 'simple') development += 1;
  development = Math.min(development, 24);

  const revisionBuffer = state.revisionRounds * 0.5;

  let qa = 1;
  qa += complexity * 0.01;
  if (state.compliance.includes('accessibility')) qa += 0.5;
  qa = Math.min(Math.max(qa, 0.5), 4);

  const launch = 0.5;

  const rawTotal = discovery + design + development + revisionBuffer + qa + launch;
  const urgencyFactor = state.deadlineUrgency > 70 ? 0.75 : state.deadlineUrgency > 40 ? 0.9 : 1;
  const total = Math.round(rawTotal * urgencyFactor * 2) / 2;

  return {
    discovery: Math.round(discovery * 2) / 2,
    design: Math.round(design * 2) / 2,
    development: Math.round(development * 2) / 2,
    qa: Math.round(qa * 2) / 2,
    launch,
    total,
  };
}
