import { ProjectState, ProjectScores, RateConfig } from '@/types/project';
import { PROJECT_TYPES } from '@/data/projectTypes';
import { FEATURES } from '@/data/features';
import { INTEGRATIONS } from '@/data/integrations';
import { formatPrice } from './pricingEngine';
import { formatWeeks } from './timelineEngine';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getProjectTypeLabel(state: ProjectState): string {
  const pt = PROJECT_TYPES.find(p => p.id === state.projectType);
  return pt ? pt.label : 'Not specified';
}

function getProjectTypeDescription(state: ProjectState): string {
  const pt = PROJECT_TYPES.find(p => p.id === state.projectType);
  return pt ? pt.description : '';
}

function getFeatureLabels(state: ProjectState): string[] {
  return state.features
    .map(fid => FEATURES.find(f => f.id === fid))
    .filter(Boolean)
    .map(f => f!.label);
}

function getFeaturesByCategory(state: ProjectState): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  state.features.forEach(fid => {
    const f = FEATURES.find(feat => feat.id === fid);
    if (f) {
      if (!groups[f.category]) groups[f.category] = [];
      groups[f.category].push(f.label);
    }
  });
  return groups;
}

function getIntegrationLabels(state: ProjectState): string[] {
  return state.integrations
    .map(iid => INTEGRATIONS.find(i => i.id === iid))
    .filter(Boolean)
    .map(i => i!.label);
}

// ── Exclusions ────────────────────────────────────────────────────────────────

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

// ── Assumptions ───────────────────────────────────────────────────────────────

export function generateAssumptions(state: ProjectState, _scores: ProjectScores, rateConfig: RateConfig): string[] {
  const a: string[] = [];

  // Stakeholders + approval
  if (state.stakeholders > 4) {
    a.push(`With ${state.stakeholders} stakeholders involved, we will establish a single primary point of contact for day-to-day decisions to keep velocity high`);
  } else {
    a.push('A single primary point of contact on the client side handles internal coordination and approval routing');
  }

  if (state.approvalLayers === 'committee') {
    a.push(`Committee approval cycles are factored into the timeline — we assume 3–5 business days per round`);
  } else if (state.approvalLayers === 'manager') {
    a.push('Manager-level sign-offs are factored in at each phase gate — typically 2–3 business days per round');
  }

  // Revision rounds
  if (state.revisionRounds > 0) {
    a.push(`Scope includes ${state.revisionRounds} revision round${state.revisionRounds !== 1 ? 's' : ''} per phase. Additional rounds beyond this are billed at ${formatPrice(rateConfig.hourlyRate, rateConfig.currency)}/hour`);
  }

  // Content readiness
  if (state.contentReadiness === 'none') {
    a.push('Content is not yet available — a content delivery milestone is agreed at kickoff so it does not block the development phase');
  } else if (state.contentReadiness === 'partial') {
    a.push('Partially available content is delivered by an agreed milestone; development proceeds in parallel using placeholder copy where needed');
  }

  // Hosting
  if (state.hostingResponsibility === 'client') {
    a.push('Client manages their own hosting infrastructure, DNS configuration, and SSL certificates');
  } else if (state.hostingResponsibility === 'agency') {
    a.push('Hosting setup and the first 12 months of managed hosting are included in scope and invoiced separately from the project fee');
  }

  // Branding
  if (state.branding === 'existing') {
    a.push('Existing brand assets (logos, typefaces, colour system) are provided in vector format (SVG/AI/EPS) at project kickoff');
  } else if (state.branding === 'partial') {
    a.push('Partially developed brand assets are provided at kickoff — any gaps are addressed during the design phase at no extra charge');
  }

  // Migration
  if (state.migration === 'full') {
    a.push('Full access to the existing platform, database exports, and content archive is granted at project start');
  } else if (state.migration === 'simple') {
    a.push('Access to the existing platform is granted at project start for content and asset migration');
  }

  // Compliance
  if (state.compliance.includes('hipaa')) {
    a.push('HIPAA compliance assumes a Business Associate Agreement (BAA) is signed with our infrastructure providers before development begins');
  }
  if (state.compliance.includes('gdpr')) {
    a.push('GDPR compliance assumes client provides a current data register and any existing privacy framework documentation at kickoff');
  }
  if (state.compliance.includes('accessibility')) {
    a.push('Accessibility work targets WCAG 2.1 AA — client to confirm if a higher standard applies before design begins');
  }

  // Third-party credentials
  if (state.integrations.length > 0) {
    a.push('All required third-party API credentials, keys, and sandbox accounts are provided by client at kickoff');
  }

  // Communication cadence
  if (state.communicationStyle === 'frequent') {
    a.push('Frequent check-ins are built into the schedule — this assumes client availability for short calls multiple times per week during active development');
  } else if (state.communicationStyle === 'weekly') {
    a.push('Weekly status calls are factored into the schedule — a recurring time slot is agreed at kickoff');
  }

  return a;
}

// ── Executive summary prose ───────────────────────────────────────────────────

function generateExecSummary(state: ProjectState, scores: ProjectScores): string {
  const ptLabel = getProjectTypeLabel(state);
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
    scores.complexity < 30 ? 'a contained'
    : scores.complexity < 60 ? 'a moderate'
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

// ── Markdown export ───────────────────────────────────────────────────────────

export function generateMarkdown(state: ProjectState, scores: ProjectScores): string {
  const lines: string[] = [];
  const ptLabel = getProjectTypeLabel(state);
  const featuresByCategory = getFeaturesByCategory(state);
  const integrationLabels = getIntegrationLabels(state);
  const exclusions = generateExclusions(state);
  const assumptions = generateAssumptions(state, scores, state.rateConfig);
  const currency = state.rateConfig.currency;
  const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const title = state.name ? `${state.name} — Project Scope` : `${ptLabel} — Project Scope`;

  // Title
  lines.push(`# ${title}`);
  lines.push('');
  lines.push(`*Prepared by FlyScope · ${date}*`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Executive Summary
  lines.push('## Executive Summary');
  lines.push('');
  lines.push(generateExecSummary(state, scores));
  lines.push('');
  lines.push('---');
  lines.push('');

  // Project Overview
  lines.push('## Project Overview');
  lines.push('');
  lines.push('| | |');
  lines.push('|---|---|');
  lines.push(`| **Type** | ${ptLabel} |`);
  lines.push(`| **Complexity** | ${scores.complexityLabel} (${scores.complexity} pts) |`);
  lines.push(`| **Risk Level** | ${scores.riskLabel} |`);
  lines.push(`| **Scope Health** | ${scores.scopeHealth}% |`);
  lines.push(`| **Recommended Quote** | ${formatPrice(scores.pricing.realistic, currency)} |`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Deliverables — grouped by category
  lines.push('## Deliverables');
  lines.push('');
  const categories = Object.entries(featuresByCategory);
  if (categories.length > 0) {
    categories.forEach(([category, features]) => {
      lines.push(`**${category}**`);
      lines.push('');
      features.forEach(f => lines.push(`- ${f}`));
      lines.push('');
    });
  } else {
    lines.push('*No features selected.*');
    lines.push('');
  }
  lines.push('---');
  lines.push('');

  // Integrations (separate section)
  if (integrationLabels.length > 0 || state.externalSystems > 0) {
    lines.push('## Integrations');
    lines.push('');
    integrationLabels.forEach(i => lines.push(`- ${i}`));
    if (state.externalSystems > 0) {
      lines.push(`- ${state.externalSystems} additional external system${state.externalSystems !== 1 ? 's' : ''} (custom API work)`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Timeline
  lines.push('## Timeline');
  lines.push('');
  lines.push('| Phase | Duration |');
  lines.push('|-------|----------|');
  lines.push(`| Discovery & Requirements | ${formatWeeks(scores.timeline.discovery)} |`);
  lines.push(`| Design & UI/UX | ${formatWeeks(scores.timeline.design)} |`);
  lines.push(`| Development & Build | ${formatWeeks(scores.timeline.development)} |`);
  lines.push(`| QA & Testing | ${formatWeeks(scores.timeline.qa)} |`);
  lines.push(`| Launch & Deployment | ${formatWeeks(scores.timeline.launch)} |`);
  lines.push(`| **Total** | **${formatWeeks(scores.timeline.total)}** |`);
  lines.push('');
  if (state.deadlineUrgency > 50) {
    lines.push('*Note: A deadline urgency premium is factored into the investment figure. The timeline above reflects what the scope requires and cannot be compressed without reducing deliverables.*');
    lines.push('');
  } else if (state.hostingResponsibility === 'agency') {
    lines.push('*Infrastructure provisioning typically adds 1–2 days to the launch phase.*');
    lines.push('');
  }
  lines.push('---');
  lines.push('');

  // Investment
  lines.push('## Investment');
  lines.push('');
  lines.push('| | |');
  lines.push('|---|---|');
  lines.push(`| Minimum | ${formatPrice(scores.pricing.minimum, currency)} |`);
  lines.push(`| **Realistic** | **${formatPrice(scores.pricing.realistic, currency)}** |`);
  lines.push(`| Premium | ${formatPrice(scores.pricing.premium, currency)} |`);
  lines.push('');
  if (scores.pricing.pricingSource === 'override') {
    lines.push('*The realistic estimate above is a custom figure set during scoping. Minimum and premium are derived proportionally.*');
  } else {
    lines.push('*Realistic is the recommended figure to quote. Minimum assumes best-case scope and execution. Premium covers full scope expansion, comprehensive revisions, and urgency overhead.*');
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Assumptions
  lines.push('## Assumptions');
  lines.push('');
  assumptions.forEach(a => lines.push(`- ${a}`));
  lines.push('');
  lines.push('---');
  lines.push('');

  // Exclusions
  lines.push('## Exclusions');
  lines.push('');
  exclusions.forEach(e => lines.push(`- ${e}`));
  lines.push('');
  lines.push('---');
  lines.push('');

  // Risks
  lines.push('## Risks');
  lines.push('');
  if (scores.riskFlags.length === 0) {
    lines.push('No significant risk flags identified based on current configuration.');
  } else {
    scores.riskFlags.forEach((flag, i) => {
      if (i > 0) lines.push('');
      lines.push(`**${flag.clientLabel}**`);
      lines.push('');
      lines.push(flag.description);
      lines.push('');
      lines.push(`*Mitigation: ${flag.mitigation}*`);
    });
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Next Steps
  lines.push('## Next Steps');
  lines.push('');
  lines.push('- **Kickoff call** — Review this scope together, resolve open questions, and align on communication cadence');
  lines.push('- **Contract** — Finalise and countersign the project agreement');
  lines.push('- **Deposit** — Confirm deposit terms and project start date');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('*This document is a preliminary scope estimate generated by FlyScope. All figures are subject to refinement during discovery. Nothing here constitutes a binding agreement.*');

  return lines.join('\n');
}

// ── Proposal summary ──────────────────────────────────────────────────────────

export function generateProposalSummary(state: ProjectState, scores: ProjectScores): string {
  const ptLabel = getProjectTypeLabel(state);
  const currency = state.rateConfig.currency;
  const projectTitle = state.name || ptLabel;

  // Key features in plain language (highest complexity first)
  const topFeatures = state.features
    .map(fid => FEATURES.find(f => f.id === fid))
    .filter(Boolean)
    .sort((a, b) => b!.complexityPoints - a!.complexityPoints)
    .slice(0, 5)
    .map(f => f!.label.toLowerCase());

  const featureList = topFeatures.length > 1
    ? topFeatures.slice(0, -1).join(', ') + ', and ' + topFeatures[topFeatures.length - 1]
    : topFeatures[0] ?? 'the features discussed';

  const integrationCount = state.integrations.length + state.externalSystems;
  const integrationPhrase = integrationCount > 0
    ? `, along with ${integrationCount} third-party integration${integrationCount !== 1 ? 's' : ''} to wire it all together`
    : '';

  // Timeline softened slightly
  const totalWeeks = scores.timeline.total;
  const approxWeeks = totalWeeks % 2 === 0 ? `${totalWeeks}` : `${totalWeeks}–${totalWeeks + 1}`;

  const urgencyNote = state.deadlineUrgency > 75
    ? ' The tight deadline is reflected in the estimate — compressing the timeline further would require narrowing scope.'
    : state.deadlineUrgency > 50
    ? ' A moderate urgency premium is included given the timeline.'
    : '';

  // Surface 2–3 project-specific discussion items
  const discussionItems: string[] = [];
  if (state.stakeholders > 3) {
    discussionItems.push(`the ${state.stakeholders}-person approval setup`);
  }
  if (state.contentReadiness !== 'ready') {
    discussionItems.push('content readiness and the handoff timeline');
  }
  if (state.integrations.length > 2) {
    discussionItems.push('which integrations are critical for launch versus phase two');
  }
  if (state.compliance.length > 0) {
    discussionItems.push('compliance requirements and their effect on the build');
  }
  if (scores.riskFlags.length > 0 && discussionItems.length < 2) {
    discussionItems.push(`the ${scores.riskFlags[0].clientLabel.toLowerCase()}`);
  }
  if (discussionItems.length === 0) {
    discussionItems.push('any open questions from this summary');
  }

  const discussionPhrase = discussionItems.length === 1
    ? discussionItems[0]
    : discussionItems.slice(0, -1).join(', ') + ', and ' + discussionItems[discussionItems.length - 1];

  return `Subject: Scope Summary — ${projectTitle}

Thanks for sharing the details on your ${ptLabel}. Based on what we've discussed, this is a ${scores.complexityLabel.toLowerCase()} build covering ${featureList}${integrationPhrase}.

We're estimating roughly ${approxWeeks} weeks of work, with a realistic budget around ${formatPrice(scores.pricing.realistic, currency)}. The minimum and premium ends of the range (${formatPrice(scores.pricing.minimum, currency)}–${formatPrice(scores.pricing.premium, currency)}) reflect what changes when scope tightens or expands during discovery.${urgencyNote}

A few items I'd want to walk through before we firm this up: ${discussionPhrase}.

Happy to set up a 30-minute call to walk through this together. Looking forward to it.`.trim();
}

// ── HTML export ───────────────────────────────────────────────────────────────

export function generateHtml(state: ProjectState, scores: ProjectScores): string {
  const ptLabel = getProjectTypeLabel(state);
  const featuresByCategory = getFeaturesByCategory(state);
  const integrationLabels = getIntegrationLabels(state);
  const exclusions = generateExclusions(state);
  const assumptions = generateAssumptions(state, scores, state.rateConfig);
  const currency = state.rateConfig.currency;
  const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const title = state.name ? `${state.name} — Project Scope` : `${ptLabel} — Project Scope`;

  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fmt = (n: number) => esc(formatPrice(n, currency));
  const fw = (n: number) => esc(formatWeeks(n));

  const featureSections = Object.entries(featuresByCategory)
    .map(([cat, features]) => `
      <h4>${esc(cat)}</h4>
      <ul>${features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>`)
    .join('');

  const integrationSection = (integrationLabels.length > 0 || state.externalSystems > 0) ? `
    <h2>Integrations</h2>
    <ul>
      ${integrationLabels.map(i => `<li>${esc(i)}</li>`).join('')}
      ${state.externalSystems > 0 ? `<li>${state.externalSystems} additional external system${state.externalSystems !== 1 ? 's' : ''} (custom API work)</li>` : ''}
    </ul>
    <hr />` : '';

  const risksHtml = scores.riskFlags.length === 0
    ? '<p>No significant risk flags identified based on current configuration.</p>'
    : scores.riskFlags.map(flag => `
      <div class="risk-item">
        <h4>${esc(flag.clientLabel)}</h4>
        <p>${esc(flag.description)}</p>
        <p class="mitigation"><strong>Mitigation:</strong> ${esc(flag.mitigation)}</p>
      </div>`).join('');

  const timelineNote = state.deadlineUrgency > 50
    ? `<p class="note">Note: A deadline urgency premium is factored into the investment figure. The timeline above reflects what the scope requires and will not compress without reducing deliverables.</p>`
    : '';

  const investmentNote = scores.pricing.pricingSource === 'override'
    ? `<p class="note">The realistic estimate is a custom figure set during scoping. Minimum and premium are derived proportionally.</p>`
    : `<p class="note">Realistic is the recommended figure to quote. Minimum assumes best-case scope and execution. Premium covers full scope expansion, comprehensive revisions, and urgency overhead.</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.7;
      color: #1a1a1a;
      background: #fff;
      max-width: 780px;
      margin: 0 auto;
      padding: 52px 48px;
    }
    h1 { font-size: 26px; font-weight: 700; color: #111; margin-bottom: 4px; line-height: 1.2; }
    h2 {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.09em; color: #666;
      margin: 36px 0 14px; padding-bottom: 7px;
      border-bottom: 1px solid #e5e5e5;
    }
    h3 { font-size: 15px; font-weight: 600; color: #222; margin: 22px 0 8px; }
    h4 {
      font-size: 11px; font-weight: 700; color: #555;
      text-transform: uppercase; letter-spacing: 0.05em;
      margin: 18px 0 6px;
    }
    p { margin-bottom: 10px; color: #333; }
    ul { list-style: none; padding: 0; margin-bottom: 8px; }
    ul li { padding: 3px 0 3px 16px; color: #333; position: relative; }
    ul li::before { content: '–'; position: absolute; left: 0; color: #bbb; }
    hr { border: none; border-top: 1px solid #e8e8e8; margin: 36px 0; }
    .meta { color: #999; font-size: 12px; margin-bottom: 28px; }
    .exec-summary {
      background: #fafafa;
      border-left: 3px solid #8b2020;
      padding: 16px 20px;
      margin: 16px 0 28px;
      border-radius: 0 4px 4px 0;
    }
    .exec-summary p { margin: 0; color: #222; line-height: 1.75; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 13px; }
    td, th { text-align: left; padding: 8px 10px; border-bottom: 1px solid #eeeeee; }
    td:last-child, th:last-child { text-align: right; font-variant-numeric: tabular-nums; }
    thead th {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: #888;
      border-bottom: 2px solid #e0e0e0; padding-top: 4px;
    }
    tfoot td { font-weight: 700; border-top: 2px solid #e0e0e0; border-bottom: none; font-size: 14px; }
    tr.highlight td { font-weight: 600; background: #f9f9f9; }
    .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0 20px; }
    .stat-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 0 0 8px; }
    .stat-box { border: 1px solid #e5e5e5; border-radius: 6px; padding: 12px 14px; }
    .stat-box .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.07em; color: #999; margin-bottom: 5px; }
    .stat-box .val { font-size: 16px; font-weight: 700; color: #111; }
    .stat-box.quote .val { font-size: 22px; color: #8b2020; }
    .risk-item { margin: 16px 0; padding: 14px 18px; border: 1px solid #e8e0e0; border-radius: 6px; background: #fdfafa; }
    .risk-item h4 { margin: 0 0 7px; color: #8b2020; text-transform: none; letter-spacing: 0; font-size: 14px; font-weight: 600; }
    .risk-item p { margin: 0 0 6px; }
    .risk-item p:last-child { margin: 0; }
    .mitigation { color: #666; font-size: 13px; }
    .next-steps li { padding: 6px 0 6px 16px; }
    .next-steps strong { color: #111; }
    .note { font-size: 12px; color: #888; font-style: italic; margin-top: 10px; }
    .footer { margin-top: 44px; padding-top: 18px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #bbb; line-height: 1.6; }
    @media print {
      body { padding: 0; max-width: none; font-size: 13px; }
      h2 { page-break-after: avoid; }
      .risk-item, .stat-grid, .stat-grid-2 { page-break-inside: avoid; }
      hr { margin: 24px 0; }
    }
  </style>
</head>
<body>

  <h1>${esc(title)}</h1>
  <p class="meta">Prepared by FlyScope &middot; ${esc(date)}</p>

  <h2>Executive Summary</h2>
  <div class="exec-summary"><p>${esc(generateExecSummary(state, scores))}</p></div>

  <h2>Project Overview</h2>
  <div class="stat-grid">
    <div class="stat-box"><div class="lbl">Type</div><div class="val" style="font-size:14px">${esc(ptLabel)}</div></div>
    <div class="stat-box"><div class="lbl">Complexity</div><div class="val">${esc(scores.complexityLabel)}</div></div>
    <div class="stat-box"><div class="lbl">Risk Level</div><div class="val">${esc(scores.riskLabel)}</div></div>
  </div>
  <div class="stat-grid-2">
    <div class="stat-box"><div class="lbl">Scope Health</div><div class="val">${scores.scopeHealth}%</div></div>
    <div class="stat-box quote"><div class="lbl">Recommended Quote</div><div class="val">${fmt(scores.pricing.realistic)}</div></div>
  </div>
  <hr />

  <h2>Deliverables</h2>
  ${featureSections || '<p><em>No features selected.</em></p>'}
  <hr />

  ${integrationSection}

  <h2>Timeline</h2>
  <table>
    <thead><tr><th>Phase</th><th>Duration</th></tr></thead>
    <tbody>
      <tr><td>Discovery &amp; Requirements</td><td>${fw(scores.timeline.discovery)}</td></tr>
      <tr><td>Design &amp; UI/UX</td><td>${fw(scores.timeline.design)}</td></tr>
      <tr><td>Development &amp; Build</td><td>${fw(scores.timeline.development)}</td></tr>
      <tr><td>QA &amp; Testing</td><td>${fw(scores.timeline.qa)}</td></tr>
      <tr><td>Launch &amp; Deployment</td><td>${fw(scores.timeline.launch)}</td></tr>
    </tbody>
    <tfoot><tr><td>Total</td><td>${fw(scores.timeline.total)}</td></tr></tfoot>
  </table>
  ${timelineNote}
  <hr />

  <h2>Investment</h2>
  <table>
    <thead><tr><th>Tier</th><th>Estimate</th></tr></thead>
    <tbody>
      <tr><td>Minimum</td><td>${fmt(scores.pricing.minimum)}</td></tr>
      <tr class="highlight"><td>Realistic (recommended)</td><td>${fmt(scores.pricing.realistic)}</td></tr>
      <tr><td>Premium</td><td>${fmt(scores.pricing.premium)}</td></tr>
    </tbody>
  </table>
  ${investmentNote}
  <hr />

  <h2>Assumptions</h2>
  <ul>${assumptions.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
  <hr />

  <h2>Exclusions</h2>
  <ul>${exclusions.map(e => `<li>${esc(e)}</li>`).join('')}</ul>
  <hr />

  <h2>Risks</h2>
  ${risksHtml}
  <hr />

  <h2>Next Steps</h2>
  <ul class="next-steps">
    <li><strong>Kickoff call</strong> &mdash; Review this scope together, resolve open questions, and align on communication cadence</li>
    <li><strong>Contract</strong> &mdash; Finalise and countersign the project agreement</li>
    <li><strong>Deposit</strong> &mdash; Confirm deposit terms and project start date</li>
  </ul>

  <div class="footer">
    This document is a preliminary scope estimate generated by FlyScope. All figures are subject to refinement during discovery. Nothing here constitutes a binding agreement.<br />
    To save as PDF: File &rarr; Print &rarr; Save as PDF in your browser.
  </div>

</body>
</html>`;
}

// ── File download ─────────────────────────────────────────────────────────────

export function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
