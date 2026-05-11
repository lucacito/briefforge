'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { decodeSharePayload, type SharePayload } from '@/lib/export/shareLink';
import { formatPrice } from '@/lib/pricingEngine';
import { formatWeeks } from '@/lib/timelineEngine';
import { AlertTriangle, FileText, Printer, Download } from 'lucide-react';

const SEVERITY_COLORS: Record<string, string> = {
  low: '#4A7A40',
  medium: '#7A7040',
  high: '#8B2020',
  critical: '#5C1717',
};

// ── Shared scope renderer ─────────────────────────────────────────────────────

function ScopeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4 pb-2 border-b border-gray-200">
        {title}
      </h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((text, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
          <span className="text-gray-300 mt-0.5 flex-shrink-0">–</span>
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}

function SharedContent({ payload }: { payload: SharePayload }) {
  const { composed, branding, pricing, timeline, currency, complexityLabel, riskLabel, scopeHealth } = payload;
  const primary = branding.primaryColor || '#8B2020';
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const { exportPdf } = await import('@/lib/export/pdf');
      const input = {
        projectName: payload.projectName,
        clientName: payload.clientName,
        date: payload.date,
        currency: payload.currency,
        composed,
        branding,
        pricing,
        timeline,
        complexityLabel,
        riskLabel,
      };
      const slug = payload.projectName.replace(/\s+/g, '-').toLowerCase();
      await exportPdf(input, `${slug}-scope.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => window.print();

  const phases: [string, number][] = [
    ['Discovery & Requirements', timeline.discovery],
    ['Design & UI/UX', timeline.design],
    ['Development & Build', timeline.development],
    ['QA & Testing', timeline.qa],
    ['Launch & Deployment', timeline.launch],
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 print:text-black">
      {/* Header bar */}
      <div style={{ backgroundColor: primary, height: 4 }} className="print:hidden" />

      {/* Top bar */}
      <div className="border-b border-gray-200 print:hidden">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {branding.logoDataUrl ? (
              <img src={branding.logoDataUrl} alt={branding.agencyName} className="h-8 object-contain" />
            ) : (
              <span className="text-sm font-semibold text-gray-700">
                {branding.agencyName || 'FlyScope'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: primary }}
            >
              <Download className="w-3.5 h-3.5" />
              {downloading ? 'Generating…' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Document */}
      <div className="max-w-3xl mx-auto px-6 py-12 print:py-0 print:px-0 print:max-w-none">
        {/* Cover */}
        <div className="mb-12">
          {branding.logoDataUrl && (
            <img src={branding.logoDataUrl} alt={branding.agencyName} className="h-10 object-contain mb-6 print:h-8" />
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">{payload.projectName}</h1>
          {payload.clientName && (
            <p className="text-lg text-gray-500 mb-1">Prepared for {payload.clientName}</p>
          )}
          <p className="text-sm text-gray-400 mt-4">
            {branding.preparedByName
              ? `${branding.preparedByName}${branding.agencyName ? ` · ${branding.agencyName}` : ''} · `
              : ''}
            {payload.date}
          </p>
          <div className="flex items-center gap-4 mt-6">
            {[
              { label: 'Complexity', value: complexityLabel },
              { label: 'Risk', value: riskLabel },
              { label: 'Scope Health', value: `${scopeHealth}%` },
              { label: 'Recommended', value: formatPrice(pricing.realistic, currency), accent: true },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-gray-400">{stat.label}</div>
                <div
                  className="text-sm font-bold mt-0.5"
                  style={stat.accent ? { color: primary } : { color: '#111' }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Summary */}
        <ScopeSection title="Executive Summary">
          <div
            className="text-sm text-gray-700 leading-relaxed p-4 rounded-r-lg border-l-4 bg-gray-50"
            style={{ borderLeftColor: primary }}
          >
            {composed.executiveSummary}
          </div>
        </ScopeSection>

        {/* Deliverables */}
        <ScopeSection title="Deliverables">
          <BulletList items={composed.deliverables.map(d => d.text)} />
          {composed.customLineItems.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Custom Scope Items</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">Item</th>
                    <th className="text-right py-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {composed.customLineItems.map(item => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-2 text-gray-700">{item.label}</td>
                      <td className="py-2 text-right text-gray-500 font-mono">{item.hours}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ScopeSection>

        {/* Timeline */}
        <ScopeSection title="Timeline">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">Phase</th>
                <th className="text-right py-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">Duration</th>
              </tr>
            </thead>
            <tbody>
              {phases.map(([label, weeks]) => (
                <tr key={label} className="border-b border-gray-100">
                  <td className="py-2 text-gray-700">{label}</td>
                  <td className="py-2 text-right text-gray-500">{formatWeeks(weeks)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-300">
                <td className="py-2 font-bold text-gray-900">Total</td>
                <td className="py-2 text-right font-bold text-gray-900">{formatWeeks(timeline.total)}</td>
              </tr>
            </tbody>
          </table>
        </ScopeSection>

        {/* Investment */}
        <ScopeSection title="Investment">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">Tier</th>
                <th className="text-right py-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">Estimate</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Minimum</td>
                <td className="py-2 text-right text-gray-600">{formatPrice(pricing.minimum, currency)}</td>
              </tr>
              <tr className="border-b border-gray-100 bg-gray-50">
                <td className="py-2 font-semibold text-gray-900">Realistic (recommended)</td>
                <td className="py-2 text-right font-bold text-gray-900" style={{ color: primary }}>
                  {formatPrice(pricing.realistic, currency)}
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Premium</td>
                <td className="py-2 text-right text-gray-600">{formatPrice(pricing.premium, currency)}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-gray-400 italic mt-2">
            {pricing.pricingSource === 'override'
              ? 'The realistic estimate is a custom figure set during scoping.'
              : 'Realistic is the recommended figure. Minimum assumes best-case scope; premium covers full expansion and revisions.'}
          </p>
        </ScopeSection>

        {/* Assumptions */}
        <ScopeSection title="Assumptions">
          <BulletList items={composed.assumptions.map(a => a.text)} />
        </ScopeSection>

        {/* Exclusions */}
        <ScopeSection title="Exclusions">
          <BulletList items={composed.exclusions.map(e => e.text)} />
        </ScopeSection>

        {/* Risks */}
        <ScopeSection title="Risk Flags">
          {composed.risks.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No significant risks flagged.</p>
          ) : (
            <div className="space-y-3">
              {composed.risks.map(risk => (
                <div key={risk.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: SEVERITY_COLORS[risk.severity] ?? '#666' }} />
                    <span className="font-semibold text-sm text-gray-900">{risk.clientLabel}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium capitalize"
                      style={{ color: SEVERITY_COLORS[risk.severity], backgroundColor: `${SEVERITY_COLORS[risk.severity]}18` }}
                    >
                      {risk.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-1">{risk.description}</p>
                  <p className="text-xs text-gray-400">
                    <span className="font-medium text-gray-500">Mitigation:</span> {risk.mitigation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScopeSection>

        {/* Next Steps */}
        <ScopeSection title="Next Steps">
          <ul className="space-y-2">
            {composed.nextSteps.map(s => {
              const parts = s.text.split(' — ');
              return (
                <li key={s.id} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                  <span className="text-gray-300 mt-0.5 flex-shrink-0">–</span>
                  {parts.length === 2
                    ? <span><strong>{parts[0]}</strong> — {parts[1]}</span>
                    : <span>{s.text}</span>
                  }
                </li>
              );
            })}
          </ul>
        </ScopeSection>

        {/* Notes */}
        {composed.scopeNotes && (
          <ScopeSection title="Notes">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{composed.scopeNotes}</p>
          </ScopeSection>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 mt-8">
          <p className="text-xs text-gray-400 leading-relaxed">
            This document is a preliminary scope estimate. All figures are subject to refinement during discovery.
            Nothing in this document constitutes a binding agreement.
          </p>
          {!branding.hideFlyScopeBranding && (
            <p className="text-xs text-gray-300 mt-2">
              {branding.footerText || 'Generated with FlyScope'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page wrapper ──────────────────────────────────────────────────────────────

export function SharedView() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get('d');

  if (!encoded) {
    return (
      <div className="min-h-screen bg-[#0D0906] flex items-center justify-center p-6">
        <div className="text-center">
          <FileText className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-sm">No scope data found in this link.</p>
        </div>
      </div>
    );
  }

  const payload = decodeSharePayload(encoded);

  if (!payload) {
    return (
      <div className="min-h-screen bg-[#0D0906] flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-[#9B3030]/60 mx-auto mb-4" />
          <p className="text-white/40 text-sm">This link appears to be corrupted or expired.</p>
        </div>
      </div>
    );
  }

  return <SharedContent payload={payload} />;
}
