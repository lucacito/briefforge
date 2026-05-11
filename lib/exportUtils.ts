import { ProjectState, ProjectScores } from '@/types/project';
import { PROJECT_TYPES } from '@/data/projectTypes';
import { FEATURES } from '@/data/features';
import { formatPrice } from './pricingEngine';
import { formatWeeks } from './timelineEngine';
import { composeScope, generateAssumptions, generateExclusions } from './scopeComposer';

// Re-export generators for backward compat (ScopeSummaryStep uses these)
export { generateAssumptions, generateExclusions };

// ── Helpers ──────────────────────────────────────────────────────────────────

function getProjectTypeLabel(state: ProjectState): string {
  return PROJECT_TYPES.find(p => p.id === state.projectType)?.label ?? 'Not specified';
}

// ── Markdown export ───────────────────────────────────────────────────────────

export function generateMarkdown(state: ProjectState, scores: ProjectScores): string {
  const composed = composeScope(state, scores);
  const ptLabel = getProjectTypeLabel(state);
  const currency = state.rateConfig.currency;
  const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const title = state.name ? `${state.name} — Project Scope` : `${ptLabel} — Project Scope`;

  const lines: string[] = [];

  lines.push(`# ${title}`);
  lines.push('');
  lines.push(`*Prepared by FlyScope · ${date}*`);
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Executive Summary');
  lines.push('');
  lines.push(composed.executiveSummary);
  lines.push('');
  lines.push('---');
  lines.push('');

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

  lines.push('## Deliverables');
  lines.push('');
  if (composed.deliverables.length > 0) {
    composed.deliverables.forEach(d => lines.push(`- ${d.text}`));
  } else {
    lines.push('*No features selected.*');
  }
  if (composed.customLineItems.length > 0) {
    lines.push('');
    lines.push('**Custom scope items**');
    lines.push('');
    composed.customLineItems.forEach(item => lines.push(`- ${item.label} (${item.hours}h)`));
  }
  lines.push('');
  lines.push('---');
  lines.push('');

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
    lines.push('*Note: A deadline urgency premium is factored into the investment figure.*');
    lines.push('');
  }
  lines.push('---');
  lines.push('');

  lines.push('## Investment');
  lines.push('');
  lines.push('| | |');
  lines.push('|---|---|');
  lines.push(`| Minimum | ${formatPrice(scores.pricing.minimum, currency)} |`);
  lines.push(`| **Realistic** | **${formatPrice(scores.pricing.realistic, currency)}** |`);
  lines.push(`| Premium | ${formatPrice(scores.pricing.premium, currency)} |`);
  lines.push('');
  if (scores.pricing.pricingSource === 'override') {
    lines.push('*The realistic estimate above is a custom figure set during scoping.*');
  } else {
    lines.push('*Realistic is the recommended figure to quote. Minimum assumes best-case scope; premium covers full expansion and revisions.*');
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Assumptions');
  lines.push('');
  composed.assumptions.forEach(a => lines.push(`- ${a.text}`));
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Exclusions');
  lines.push('');
  composed.exclusions.forEach(e => lines.push(`- ${e.text}`));
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Risks');
  lines.push('');
  if (composed.risks.length === 0) {
    lines.push('No significant risk flags identified based on current configuration.');
  } else {
    composed.risks.forEach((risk, i) => {
      if (i > 0) lines.push('');
      lines.push(`**${risk.clientLabel}**`);
      lines.push('');
      lines.push(risk.description);
      lines.push('');
      lines.push(`*Mitigation: ${risk.mitigation}*`);
    });
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Next Steps');
  lines.push('');
  composed.nextSteps.forEach(s => lines.push(`- ${s.text}`));
  lines.push('');

  if (composed.scopeNotes) {
    lines.push('---');
    lines.push('');
    lines.push('## Notes');
    lines.push('');
    lines.push(composed.scopeNotes);
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('*This document is a preliminary scope estimate generated by FlyScope. All figures are subject to refinement during discovery. Nothing here constitutes a binding agreement.*');

  return lines.join('\n');
}

// ── Proposal summary ──────────────────────────────────────────────────────────

export function generateProposalSummary(state: ProjectState, scores: ProjectScores): string {
  const composed = composeScope(state, scores);
  const ptLabel = getProjectTypeLabel(state);
  const currency = state.rateConfig.currency;
  const projectTitle = state.name || ptLabel;

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

  const totalWeeks = scores.timeline.total;
  const approxWeeks = totalWeeks % 2 === 0 ? `${totalWeeks}` : `${totalWeeks}–${totalWeeks + 1}`;

  const urgencyNote = state.deadlineUrgency > 75
    ? ' The tight deadline is reflected in the estimate — compressing the timeline further would require narrowing scope.'
    : state.deadlineUrgency > 50
    ? ' A moderate urgency premium is included given the timeline.'
    : '';

  const discussionItems: string[] = [];
  if (state.stakeholders > 3) discussionItems.push(`the ${state.stakeholders}-person approval setup`);
  if (state.contentReadiness !== 'ready') discussionItems.push('content readiness and the handoff timeline');
  if (state.integrations.length > 2) discussionItems.push('which integrations are critical for launch versus phase two');
  if (state.compliance.length > 0) discussionItems.push('compliance requirements and their effect on the build');
  if (composed.risks.length > 0 && discussionItems.length < 2) {
    discussionItems.push(`the ${composed.risks[0].clientLabel.toLowerCase()}`);
  }
  if (discussionItems.length === 0) discussionItems.push('any open questions from this summary');

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
  const composed = composeScope(state, scores);
  const ptLabel = getProjectTypeLabel(state);
  const currency = state.rateConfig.currency;
  const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const title = state.name ? `${state.name} — Project Scope` : `${ptLabel} — Project Scope`;

  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fmt = (n: number) => esc(formatPrice(n, currency));
  const fw = (n: number) => esc(formatWeeks(n));

  const deliverablesHtml = composed.deliverables.length > 0
    ? `<ul>${composed.deliverables.map(d => `<li>${esc(d.text)}</li>`).join('')}</ul>`
    : '<p><em>No features selected.</em></p>';

  const customItemsHtml = composed.customLineItems.length > 0
    ? `<h4>Custom scope items</h4><ul>${composed.customLineItems.map(item => `<li>${esc(item.label)} (${item.hours}h)</li>`).join('')}</ul>`
    : '';

  const risksHtml = composed.risks.length === 0
    ? '<p>No significant risk flags identified based on current configuration.</p>'
    : composed.risks.map(risk => `
      <div class="risk-item">
        <h4>${esc(risk.clientLabel)}</h4>
        <p>${esc(risk.description)}</p>
        <p class="mitigation"><strong>Mitigation:</strong> ${esc(risk.mitigation)}</p>
      </div>`).join('');

  const nextStepsHtml = composed.nextSteps.map(s => {
    const parts = s.text.split(' — ');
    if (parts.length === 2) return `<li><strong>${esc(parts[0])}</strong> &mdash; ${esc(parts[1])}</li>`;
    return `<li>${esc(s.text)}</li>`;
  }).join('');

  const scopeNotesSection = composed.scopeNotes
    ? `<hr /><h2>Notes</h2><p>${esc(composed.scopeNotes).replace(/\n/g, '<br />')}</p>`
    : '';

  const investmentNote = scores.pricing.pricingSource === 'override'
    ? `<p class="note">The realistic estimate is a custom figure set during scoping. Minimum and premium are derived proportionally.</p>`
    : `<p class="note">Realistic is the recommended figure to quote. Minimum assumes best-case scope; premium covers full expansion and revisions.</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.7; color: #1a1a1a; background: #fff; max-width: 780px; margin: 0 auto; padding: 52px 48px; }
    h1 { font-size: 26px; font-weight: 700; color: #111; margin-bottom: 4px; line-height: 1.2; }
    h2 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.09em; color: #666; margin: 36px 0 14px; padding-bottom: 7px; border-bottom: 1px solid #e5e5e5; }
    h4 { font-size: 11px; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.05em; margin: 18px 0 6px; }
    p { margin-bottom: 10px; color: #333; }
    ul { list-style: none; padding: 0; margin-bottom: 8px; }
    ul li { padding: 3px 0 3px 16px; color: #333; position: relative; }
    ul li::before { content: '–'; position: absolute; left: 0; color: #bbb; }
    hr { border: none; border-top: 1px solid #e8e8e8; margin: 36px 0; }
    .meta { color: #999; font-size: 12px; margin-bottom: 28px; }
    .exec-summary { background: #fafafa; border-left: 3px solid #8b2020; padding: 16px 20px; margin: 16px 0 28px; border-radius: 0 4px 4px 0; }
    .exec-summary p { margin: 0; color: #222; line-height: 1.75; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 13px; }
    td, th { text-align: left; padding: 8px 10px; border-bottom: 1px solid #eeeeee; }
    td:last-child, th:last-child { text-align: right; font-variant-numeric: tabular-nums; }
    thead th { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #888; border-bottom: 2px solid #e0e0e0; }
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
    .risk-item p { margin: 0 0 6px; } .risk-item p:last-child { margin: 0; }
    .mitigation { color: #666; font-size: 13px; }
    .next-steps li { padding: 6px 0 6px 16px; }
    .next-steps strong { color: #111; }
    .note { font-size: 12px; color: #888; font-style: italic; margin-top: 10px; }
    .footer { margin-top: 44px; padding-top: 18px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #bbb; line-height: 1.6; }
    @media print { body { padding: 0; max-width: none; font-size: 13px; } h2 { page-break-after: avoid; } .risk-item, .stat-grid, .stat-grid-2 { page-break-inside: avoid; } hr { margin: 24px 0; } }
  </style>
</head>
<body>

  <h1>${esc(title)}</h1>
  <p class="meta">Prepared by FlyScope &middot; ${esc(date)}</p>

  <h2>Executive Summary</h2>
  <div class="exec-summary"><p>${esc(composed.executiveSummary)}</p></div>

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
  ${deliverablesHtml}${customItemsHtml}
  <hr />

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
  <ul>${composed.assumptions.map(a => `<li>${esc(a.text)}</li>`).join('')}</ul>
  <hr />

  <h2>Exclusions</h2>
  <ul>${composed.exclusions.map(e => `<li>${esc(e.text)}</li>`).join('')}</ul>
  <hr />

  <h2>Risks</h2>
  ${risksHtml}
  <hr />

  <h2>Next Steps</h2>
  <ul class="next-steps">${nextStepsHtml}</ul>

  ${scopeNotesSection}

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
