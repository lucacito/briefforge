'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Download, FileText, FileJson, Globe, Check, Copy, Link, Mail,
  AlertTriangle, type LucideIcon,
} from 'lucide-react';
import { useProject } from '@/lib/context';
import { generateMarkdown, generateProposalSummary, generateHtml, downloadFile } from '@/lib/exportUtils';
import { composeScope } from '@/lib/scopeComposer';
import { loadBranding } from '@/lib/branding';
import { buildSharePayload, buildShareUrl } from '@/lib/export/shareLink';
import type { BrandingConfig } from '@/types/branding';
import type { PdfInput } from '@/lib/export/pdf';

// ── Button atoms ──────────────────────────────────────────────────────────────

function ExportButton({
  label, icon: Icon, onClick, sub, primary = false, loading = false,
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => Promise<void> | void;
  sub?: string;
  primary?: boolean;
  loading?: boolean;
}) {
  const [state, setState] = useState<'idle' | 'working' | 'done'>('idle');
  const handle = async () => {
    if (state !== 'idle') return;
    setState('working');
    try { await onClick(); setState('done'); setTimeout(() => setState('idle'), 2000); }
    catch { setState('idle'); }
  };

  return (
    <motion.button
      onClick={handle}
      disabled={state === 'working' || loading}
      whileTap={{ scale: 0.97 }}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all duration-200 disabled:opacity-60 ${
        primary
          ? 'bg-[#7F2020]/15 hover:bg-[#7F2020]/25 border-[#7F2020]/30 hover:border-[#7F2020]/50 text-[#F6F3EB]'
          : 'bg-white/[0.04] hover:bg-white/[0.07] border-white/[0.07] hover:border-white/[0.20] text-white/70 hover:text-white'
      }`}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
        primary ? 'bg-[#7F2020]/30' : 'bg-white/[0.10]'
      }`}>
        {state === 'done'
          ? <Check className="w-3.5 h-3.5 text-[#586851]" />
          : state === 'working'
          ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white/70 rounded-full animate-spin block" />
          : <Icon className={`w-3.5 h-3.5 ${primary ? 'text-[#F6F3EB]' : 'text-[#656656]'}`} />
        }
      </div>
      <div className="flex-1 text-left">
        <span className="text-sm font-medium block">
          {state === 'done' ? 'Done!' : state === 'working' ? 'Working…' : label}
        </span>
        {sub && <span className="text-[10px] text-white/40 block">{sub}</span>}
      </div>
    </motion.button>
  );
}

function CopyButton({ label, icon: Icon, onClick, sub }: {
  label: string; icon: LucideIcon; onClick: () => Promise<string | void>; sub?: string;
}) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    const result = await onClick();
    if (typeof result === 'string') {
      await navigator.clipboard.writeText(result);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <motion.button
      onClick={handle}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] hover:border-white/[0.20] text-white/70 hover:text-white transition-all duration-200"
    >
      <div className="w-7 h-7 rounded-lg bg-white/[0.10] flex items-center justify-center flex-shrink-0">
        {copied ? <Check className="w-3.5 h-3.5 text-[#586851]" /> : <Icon className="w-3.5 h-3.5 text-[#656656]" />}
      </div>
      <div className="flex-1 text-left">
        <span className="text-sm font-medium block">{copied ? 'Copied!' : label}</span>
        {sub && <span className="text-[10px] text-white/40 block">{sub}</span>}
      </div>
    </motion.button>
  );
}

// ── ExportPanel ───────────────────────────────────────────────────────────────

export function ExportPanel() {
  const { state, scores } = useProject();
  const [branding, setBranding] = useState<BrandingConfig | null>(null);
  const [shareInfo, setShareInfo] = useState<{ label: string; warning: boolean } | null>(null);

  useEffect(() => {
    setBranding(loadBranding());
  }, []);

  const slug = (state.name || 'scope').replace(/\s+/g, '-').toLowerCase();
  const b = branding;

  const makePdfInput = (): PdfInput => {
    const composed = composeScope(state, scores);
    return {
      projectName: state.name || 'Project Scope',
      clientName: state.clientName ?? '',
      date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
      currency: state.rateConfig.currency,
      composed,
      branding: b!,
      pricing: scores.pricing,
      timeline: scores.timeline,
      complexityLabel: scores.complexityLabel,
      riskLabel: scores.riskLabel,
    };
  };

  const handlePdf = async () => {
    const { exportPdf } = await import('@/lib/export/pdf');
    await exportPdf(makePdfInput(), `${slug}-scope.pdf`);
  };

  const handleDocx = async () => {
    const { exportDocx } = await import('@/lib/export/docx');
    await exportDocx(makePdfInput(), `${slug}-scope.docx`);
  };

  const handleCopyShareLink = async () => {
    const composed = composeScope(state, scores);
    const payload = buildSharePayload(state, scores, composed, b!);
    const result = buildShareUrl(payload);
    setShareInfo({ label: result.label, warning: result.warning });
    return result.url;
  };

  const handleEmailLink = async () => {
    const composed = composeScope(state, scores);
    const payload = buildSharePayload(state, scores, composed, b!);
    const { url } = buildShareUrl(payload);
    const subject = encodeURIComponent(`Project scope: ${state.name || 'New Project'}`);
    const body = encodeURIComponent(`Hi,\n\nHere's the project scope I put together:\n\n${url}\n\nLet me know if you have any questions.`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  if (!b) return null;

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 space-y-5">
      <h3 className="text-xs text-white/65 uppercase tracking-widest font-medium">Export & Share</h3>

      {/* Download group */}
      <div className="space-y-2">
        <p className="text-[10px] text-white/35 uppercase tracking-wider">Download</p>
        <ExportButton label="Export PDF" icon={Download} onClick={handlePdf} primary sub="Full proposal with cover page" />
        <ExportButton label="Export DOCX" icon={FileText} onClick={handleDocx} sub="Word document, opens in Pages / Docs" />
        <ExportButton label="Download Markdown" icon={FileText} onClick={() => downloadFile(generateMarkdown(state, scores), `${slug}-scope.md`, 'text/markdown')} />
        <ExportButton label="Download HTML" icon={Globe} onClick={() => downloadFile(generateHtml(state, scores), `${slug}-scope.html`, 'text/html')} sub="Print to PDF from browser" />
        <ExportButton label="Download JSON" icon={FileJson} onClick={() => downloadFile(JSON.stringify({ state, scores }, null, 2), `${slug}.json`, 'application/json')} />
        <ExportButton label="Download TXT" icon={Download} onClick={() => downloadFile(generateMarkdown(state, scores), `${slug}-scope.txt`, 'text/plain')} />
      </div>

      {/* Copy group */}
      <div className="space-y-2">
        <p className="text-[10px] text-white/35 uppercase tracking-wider">Copy</p>
        <CopyButton label="Copy as Markdown" icon={Copy} onClick={async () => generateMarkdown(state, scores)} />
        <CopyButton label="Copy Proposal Summary" icon={FileText} onClick={async () => generateProposalSummary(state, scores)} />
      </div>

      {/* Share group */}
      <div className="space-y-2">
        <p className="text-[10px] text-white/35 uppercase tracking-wider">Share</p>
        <CopyButton
          label="Copy share link"
          icon={Link}
          onClick={handleCopyShareLink}
        />
        {shareInfo && (
          <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] ${
            shareInfo.warning ? 'text-[#9B3030] bg-[#7F2020]/10' : 'text-white/35 bg-white/[0.03]'
          }`}>
            {shareInfo.warning && <AlertTriangle className="w-3 h-3 flex-shrink-0" />}
            {shareInfo.label}
          </div>
        )}
        <ExportButton
          label="Email link"
          icon={Mail}
          onClick={handleEmailLink}
          sub={`Subject: Project scope: ${state.name || 'New Project'}`}
        />
      </div>
    </div>
  );
}
