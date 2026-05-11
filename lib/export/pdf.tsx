'use client';

import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet, pdf } from '@react-pdf/renderer';
import type { ComposedScope } from '@/lib/scopeComposer';
import type { BrandingConfig } from '@/types/branding';
import type { PricingEstimate, TimelineBreakdown } from '@/types/project';
import type { RateConfig } from '@/types/rateConfig';
import { formatPrice } from '@/lib/pricingEngine';
import { formatWeeks } from '@/lib/timelineEngine';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PdfInput {
  projectName: string;
  clientName: string;
  date: string;
  currency: RateConfig['currency'];
  composed: ComposedScope;
  branding: BrandingConfig;
  pricing: PricingEstimate;
  timeline: TimelineBreakdown;
  complexityLabel: string;
  riskLabel: string;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333333',
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 72,
    paddingLeft: 56,
    paddingRight: 56,
  },
  coverPage: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    flexDirection: 'column',
  },
  coverBar: {
    height: 5,
    marginBottom: 48,
    marginTop: 0,
  },
  coverBody: {
    paddingLeft: 56,
    paddingRight: 56,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  coverTitle: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    marginBottom: 10,
    lineHeight: 1.2,
  },
  coverClient: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  coverPrepared: {
    fontSize: 10,
    color: '#999999',
    marginTop: 32,
  },
  coverMeta: {
    fontSize: 10,
    color: '#888888',
    lineHeight: 1.7,
    marginBottom: 48,
  },
  coverLogo: {
    height: 36,
    objectFit: 'contain',
    objectPositionX: 0,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#999999',
    letterSpacing: 1.2,
    marginTop: 22,
    marginBottom: 8,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  execBox: {
    backgroundColor: '#FAFAFA',
    borderLeftWidth: 3,
    padding: 12,
    marginBottom: 4,
    borderRadius: 2,
  },
  bodyText: {
    fontSize: 10,
    color: '#444444',
    lineHeight: 1.65,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bulletDot: {
    fontSize: 10,
    color: '#BBBBBB',
    width: 14,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: '#444444',
    lineHeight: 1.5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tableRowHighlight: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#F9F9F9',
  },
  tableRowTotal: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: '#DDDDDD',
  },
  thCell: {
    flex: 1,
    padding: 7,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#888888',
  },
  thCellRight: {
    flex: 1,
    padding: 7,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#888888',
    textAlign: 'right',
  },
  tdCell: {
    flex: 1,
    padding: 7,
    fontSize: 9,
    color: '#333333',
  },
  tdCellRight: {
    flex: 1,
    padding: 7,
    fontSize: 9,
    color: '#333333',
    textAlign: 'right',
  },
  tdCellBold: {
    flex: 1,
    padding: 7,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
  },
  tdCellBoldRight: {
    flex: 1,
    padding: 7,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    textAlign: 'right',
  },
  riskItem: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 3,
    padding: 10,
    marginBottom: 8,
  },
  riskLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  riskLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    marginRight: 8,
  },
  riskBadge: {
    fontSize: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  riskDesc: {
    fontSize: 9,
    color: '#555555',
    lineHeight: 1.5,
    marginBottom: 4,
  },
  riskMitigation: {
    fontSize: 9,
    color: '#777777',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 56,
    right: 56,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#BBBBBB',
  },
  disclaimer: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    fontSize: 8,
    color: '#AAAAAA',
    lineHeight: 1.6,
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, { text: string; bg: string }> = {
  low:      { text: '#4A7A40', bg: '#EDF4EC' },
  medium:   { text: '#7A7040', bg: '#F5F4EC' },
  high:     { text: '#8B2020', bg: '#F5ECEC' },
  critical: { text: '#5C1717', bg: '#EDE8E8' },
};

function Bullet({ text }: { text: string }) {
  return (
    <View style={S.bulletRow}>
      <Text style={S.bulletDot}>–</Text>
      <Text style={S.bulletText}>{text}</Text>
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <Text style={S.sectionLabel}>{children.toUpperCase()}</Text>;
}

function Table({ headers, rows, totals }: {
  headers: [string, string];
  rows: [string, string, boolean?][];
  totals?: [string, string];
}) {
  return (
    <View>
      <View style={S.tableHeader}>
        <Text style={S.thCell}>{headers[0]}</Text>
        <Text style={S.thCellRight}>{headers[1]}</Text>
      </View>
      {rows.map(([left, right, bold], i) => (
        <View key={i} style={bold ? S.tableRowHighlight : S.tableRow}>
          <Text style={bold ? S.tdCellBold : S.tdCell}>{left}</Text>
          <Text style={bold ? S.tdCellBoldRight : S.tdCellRight}>{right}</Text>
        </View>
      ))}
      {totals && (
        <View style={S.tableRowTotal}>
          <Text style={S.tdCellBold}>{totals[0]}</Text>
          <Text style={S.tdCellBoldRight}>{totals[1]}</Text>
        </View>
      )}
    </View>
  );
}

function Footer({ branding, primaryColor }: { branding: BrandingConfig; primaryColor: string }) {
  return (
    <View style={S.footer} fixed>
      <Text style={S.footerText}>
        {branding.hideFlyScopeBranding ? branding.footerText : branding.footerText || 'Generated with FlyScope'}
      </Text>
      <Text style={S.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

// ── Cover Page ────────────────────────────────────────────────────────────────

function CoverPage({ input }: { input: PdfInput }) {
  const { projectName, clientName, date, branding, complexityLabel, riskLabel } = input;
  const primary = branding.primaryColor || '#8B2020';

  return (
    <Page size="A4" style={S.coverPage}>
      <View style={[S.coverBar, { backgroundColor: primary }]} />
      <View style={S.coverBody}>
        <View>
          {branding.logoDataUrl && (
            <Image src={branding.logoDataUrl} style={S.coverLogo} />
          )}
          <Text style={S.coverTitle}>{projectName}</Text>
          {clientName && (
            <Text style={S.coverClient}>Prepared for {clientName}</Text>
          )}
          <Text style={S.coverPrepared}>
            {branding.preparedByName
              ? `Prepared by ${branding.preparedByName}${branding.agencyName ? ` · ${branding.agencyName}` : ''}`
              : branding.agencyName || 'Prepared with FlyScope'}
          </Text>
        </View>
        <View style={S.coverMeta}>
          <Text>{date}</Text>
          {branding.contactEmail ? <Text>{branding.contactEmail}</Text> : null}
          <Text style={{ marginTop: 12, fontSize: 9, color: '#BBBBBB' }}>
            {complexityLabel} complexity · {riskLabel} risk
          </Text>
        </View>
      </View>
    </Page>
  );
}

// ── Content Pages ─────────────────────────────────────────────────────────────

function ContentPages({ input }: { input: PdfInput }) {
  const { composed, branding, pricing, timeline, currency } = input;
  const primary = branding.primaryColor || '#8B2020';

  const phases: [string, number][] = [
    ['Discovery & Requirements', timeline.discovery],
    ['Design & UI/UX', timeline.design],
    ['Development & Build', timeline.development],
    ['QA & Testing', timeline.qa],
    ['Launch & Deployment', timeline.launch],
  ];

  return (
    <Page size="A4" style={S.page}>
      <Footer branding={branding} primaryColor={primary} />

      {/* Executive Summary */}
      <SectionLabel>Executive Summary</SectionLabel>
      <View style={[S.execBox, { borderLeftColor: primary }]}>
        <Text style={S.bodyText}>{composed.executiveSummary}</Text>
      </View>

      {/* Deliverables */}
      <SectionLabel>Deliverables</SectionLabel>
      {composed.deliverables.length > 0
        ? composed.deliverables.map(d => <Bullet key={d.id} text={d.text} />)
        : <Text style={S.bodyText}>No features selected.</Text>
      }

      {/* Custom line items */}
      {composed.customLineItems.length > 0 && (
        <>
          <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#666666', marginTop: 10, marginBottom: 6 }}>
            CUSTOM SCOPE ITEMS
          </Text>
          <Table
            headers={['Item', 'Hours']}
            rows={composed.customLineItems.map(item => [item.label, `${item.hours}h`])}
            totals={['Total custom hours', `${composed.customLineItems.reduce((s, i) => s + i.hours, 0)}h`]}
          />
        </>
      )}

      {/* Timeline */}
      <SectionLabel>Timeline</SectionLabel>
      <Table
        headers={['Phase', 'Duration']}
        rows={phases.map(([label, weeks]) => [label, formatWeeks(weeks)])}
        totals={['Total Estimate', formatWeeks(timeline.total)]}
      />

      {/* Investment */}
      <SectionLabel>Investment</SectionLabel>
      <Table
        headers={['Tier', 'Estimate']}
        rows={[
          ['Minimum', formatPrice(pricing.minimum, currency)],
          ['Realistic (recommended)', formatPrice(pricing.realistic, currency), true],
          ['Premium', formatPrice(pricing.premium, currency)],
        ]}
      />
      <Text style={{ fontSize: 8, color: '#999999', marginTop: 4, marginBottom: 4 }}>
        {pricing.pricingSource === 'override'
          ? 'The realistic estimate is a custom figure set during scoping.'
          : 'Realistic is the recommended figure. Minimum assumes best-case scope; premium covers full expansion and revisions.'}
      </Text>

      {/* Assumptions */}
      <SectionLabel>Assumptions</SectionLabel>
      {composed.assumptions.map(a => <Bullet key={a.id} text={a.text} />)}

      {/* Exclusions */}
      <SectionLabel>Exclusions</SectionLabel>
      {composed.exclusions.map(e => <Bullet key={e.id} text={e.text} />)}

      {/* Risks */}
      <SectionLabel>Risk Flags</SectionLabel>
      {composed.risks.length === 0
        ? <Text style={S.bodyText}>No significant risks flagged.</Text>
        : composed.risks.map(risk => {
            const colors = SEVERITY_COLORS[risk.severity] ?? SEVERITY_COLORS.medium;
            return (
              <View key={risk.id} style={S.riskItem} wrap={false}>
                <View style={S.riskLabelRow}>
                  <Text style={S.riskLabel}>{risk.clientLabel}</Text>
                  <Text style={[S.riskBadge, { color: colors.text, backgroundColor: colors.bg }]}>
                    {risk.severity.toUpperCase()}
                  </Text>
                </View>
                <Text style={S.riskDesc}>{risk.description}</Text>
                <Text style={S.riskMitigation}>Mitigation: {risk.mitigation}</Text>
              </View>
            );
          })
      }

      {/* Next Steps */}
      <SectionLabel>Next Steps</SectionLabel>
      {composed.nextSteps.map(s => {
        const parts = s.text.split(' — ');
        return (
          <View key={s.id} style={S.bulletRow}>
            <Text style={S.bulletDot}>–</Text>
            <View style={{ flex: 1 }}>
              {parts.length === 2
                ? <Text style={S.bulletText}><Text style={{ fontFamily: 'Helvetica-Bold' }}>{parts[0]}</Text> — {parts[1]}</Text>
                : <Text style={S.bulletText}>{s.text}</Text>
              }
            </View>
          </View>
        );
      })}

      {/* Notes */}
      {composed.scopeNotes ? (
        <>
          <SectionLabel>Notes</SectionLabel>
          <Text style={S.bodyText}>{composed.scopeNotes}</Text>
        </>
      ) : null}

      {/* Disclaimer */}
      <Text style={S.disclaimer}>
        This document is a preliminary scope estimate. All figures are subject to refinement during discovery.
        Nothing in this document constitutes a binding agreement.
      </Text>
    </Page>
  );
}

// ── ScopePDF document ─────────────────────────────────────────────────────────

export function ScopePDF({ input }: { input: PdfInput }) {
  return (
    <Document
      title={input.projectName}
      author={input.branding.preparedByName || input.branding.agencyName || 'FlyScope'}
      creator="FlyScope"
      producer="FlyScope"
    >
      <CoverPage input={input} />
      <ContentPages input={input} />
    </Document>
  );
}

// ── Export function ───────────────────────────────────────────────────────────

export async function exportPdf(input: PdfInput, filename: string): Promise<void> {
  const { saveAs } = await import('file-saver');
  const blob = await pdf(<ScopePDF input={input} />).toBlob();
  saveAs(blob, filename);
}
