import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, PageBreak,
} from 'docx';
import type { ComposedScope } from '@/lib/scopeComposer';
import type { BrandingConfig } from '@/types/branding';
import type { PricingEstimate, TimelineBreakdown } from '@/types/project';
import { formatPrice } from '@/lib/pricingEngine';
import { formatWeeks } from '@/lib/timelineEngine';
import type { PdfInput } from './pdf';

// ── Helpers ───────────────────────────────────────────────────────────────────

const PRIMARY = '8B2020';

function heading1(text: string): Paragraph {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, bold: true })] });
}

function heading2(text: string): Paragraph {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text })] });
}

function heading3(text: string): Paragraph {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text })] });
}

function body(text: string): Paragraph {
  return new Paragraph({ children: [new TextRun({ text })] });
}

function bullet(text: string): Paragraph {
  return new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text })] });
}

function spacer(): Paragraph {
  return new Paragraph({ children: [new TextRun({ text: '' })] });
}

function pageBreak(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] });
}

const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

const lightBorder = {
  top: { style: BorderStyle.SINGLE, size: 1, color: 'EEEEEE' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'EEEEEE' },
  left: { style: BorderStyle.SINGLE, size: 1, color: 'EEEEEE' },
  right: { style: BorderStyle.SINGLE, size: 1, color: 'EEEEEE' },
};

function cell(content: string, bold = false, shade = false): TableCell {
  return new TableCell({
    borders: lightBorder,
    shading: shade ? { fill: 'F5F5F5' } : undefined,
    children: [
      new Paragraph({
        children: [new TextRun({ text: content, bold })],
      }),
    ],
  });
}

function cellRight(content: string, bold = false, shade = false): TableCell {
  return new TableCell({
    borders: lightBorder,
    shading: shade ? { fill: 'F5F5F5' } : undefined,
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: content, bold })],
      }),
    ],
  });
}

function twoColTable(headers: [string, string], rows: [string, string, boolean?][]): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({ borders: lightBorder, shading: { fill: 'F5F5F5' }, children: [new Paragraph({ children: [new TextRun({ text: headers[0], bold: true, size: 18 })] })] }),
      new TableCell({ borders: lightBorder, shading: { fill: 'F5F5F5' }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: headers[1], bold: true, size: 18 })] })] }),
    ],
  });

  const dataRows = rows.map(([left, right, bold]) =>
    new TableRow({
      children: [cell(left, bold), cellRight(right, bold, bold)],
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

// ── Risk helper ───────────────────────────────────────────────────────────────

function riskParagraphs(composed: ComposedScope): Paragraph[] {
  if (composed.risks.length === 0) {
    return [body('No significant risks flagged based on current configuration.')];
  }
  return composed.risks.flatMap(risk => [
    new Paragraph({
      children: [
        new TextRun({ text: risk.clientLabel, bold: true }),
        new TextRun({ text: `  [${risk.severity.toUpperCase()}]`, color: PRIMARY, size: 18 }),
      ],
    }),
    body(risk.description),
    new Paragraph({
      children: [
        new TextRun({ text: 'Mitigation: ', bold: true }),
        new TextRun({ text: risk.mitigation, italics: true }),
      ],
    }),
    spacer(),
  ]);
}

// ── Main DOCX generator ───────────────────────────────────────────────────────

export async function generateDocxBlob(input: PdfInput): Promise<Blob> {
  const { projectName, clientName, date, composed, branding, pricing, timeline, currency } = input;

  const titleLine = clientName
    ? `${projectName} — Prepared for ${clientName}`
    : projectName;

  const preparedLine = branding.preparedByName
    ? `${branding.preparedByName}${branding.agencyName ? ` · ${branding.agencyName}` : ''} · ${date}`
    : `${date}`;

  const phases: [string, string][] = [
    ['Discovery & Requirements', formatWeeks(timeline.discovery)],
    ['Design & UI/UX', formatWeeks(timeline.design)],
    ['Development & Build', formatWeeks(timeline.development)],
    ['QA & Testing', formatWeeks(timeline.qa)],
    ['Launch & Deployment', formatWeeks(timeline.launch)],
  ];

  const children: (Paragraph | Table)[] = [
    // Cover / title block
    heading1(titleLine),
    new Paragraph({
      children: [new TextRun({ text: preparedLine, color: '888888', size: 20 })],
    }),
    spacer(),

    // Executive Summary
    heading2('Executive Summary'),
    body(composed.executiveSummary),
    spacer(),

    // Deliverables
    heading2('Deliverables'),
    ...(composed.deliverables.length > 0
      ? composed.deliverables.map(d => bullet(d.text))
      : [body('No features selected.')]),
    spacer(),

    // Custom line items
    ...(composed.customLineItems.length > 0 ? [
      heading3('Custom Scope Items'),
      twoColTable(
        ['Item', 'Hours'],
        [
          ...composed.customLineItems.map(item => [item.label, `${item.hours}h`] as [string, string]),
          [`Total custom hours`, `${composed.customLineItems.reduce((s, i) => s + i.hours, 0)}h`, true] as [string, string, boolean],
        ]
      ),
      spacer(),
    ] : []),

    // Timeline
    heading2('Timeline'),
    twoColTable(
      ['Phase', 'Duration'],
      [
        ...phases,
        ['Total', formatWeeks(timeline.total), true],
      ]
    ),
    spacer(),

    // Investment
    heading2('Investment'),
    twoColTable(
      ['Tier', 'Estimate'],
      [
        ['Minimum', formatPrice(pricing.minimum, currency)],
        ['Realistic (recommended)', formatPrice(pricing.realistic, currency), true],
        ['Premium', formatPrice(pricing.premium, currency)],
      ]
    ),
    new Paragraph({
      children: [new TextRun({
        text: pricing.pricingSource === 'override'
          ? 'The realistic estimate is a custom figure set during scoping.'
          : 'Realistic is the recommended figure. Minimum assumes best-case scope; premium covers full expansion.',
        italics: true,
        color: '888888',
        size: 18,
      })],
    }),
    spacer(),

    // Assumptions
    heading2('Assumptions'),
    ...composed.assumptions.map(a => bullet(a.text)),
    spacer(),

    // Exclusions
    heading2('Exclusions'),
    ...composed.exclusions.map(e => bullet(e.text)),
    spacer(),

    // Risks
    heading2('Risk Flags'),
    ...riskParagraphs(composed),

    // Next Steps
    heading2('Next Steps'),
    ...composed.nextSteps.map(s => {
      const parts = s.text.split(' — ');
      if (parts.length === 2) {
        return new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: parts[0], bold: true }),
            new TextRun({ text: ` — ${parts[1]}` }),
          ],
        });
      }
      return bullet(s.text);
    }),
    spacer(),

    // Notes
    ...(composed.scopeNotes ? [
      heading2('Notes'),
      body(composed.scopeNotes),
      spacer(),
    ] : []),

    // Disclaimer
    new Paragraph({
      children: [new TextRun({
        text: 'This document is a preliminary scope estimate. All figures are subject to refinement during discovery. Nothing in this document constitutes a binding agreement.',
        color: 'AAAAAA',
        size: 18,
        italics: true,
      })],
    }),
  ];

  const doc = new Document({
    creator: branding.agencyName || 'FlyScope',
    title: projectName,
    description: `Project scope for ${projectName}`,
    styles: {
      default: {
        heading1: {
          run: { size: 52, bold: true, color: '111111' },
          paragraph: { spacing: { after: 200 } },
        },
        heading2: {
          run: { size: 28, bold: true, color: '222222' },
          paragraph: { spacing: { before: 400, after: 120 } },
        },
        heading3: {
          run: { size: 22, bold: true, color: '444444' },
          paragraph: { spacing: { before: 200, after: 80 } },
        },
        document: {
          run: { size: 22, color: '333333' },
          paragraph: { spacing: { after: 120 } },
        },
      },
    },
    sections: [{ children }],
  });

  return Packer.toBlob(doc);
}

export async function exportDocx(input: PdfInput, filename: string): Promise<void> {
  const { saveAs } = await import('file-saver');
  const blob = await generateDocxBlob(input);
  saveAs(blob, filename);
}
