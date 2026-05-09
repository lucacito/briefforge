'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, FileText, FileJson, Globe, Check, type LucideIcon } from 'lucide-react';
import { useProject } from '@/lib/context';
import { generateMarkdown, generateProposalSummary, generateHtml, downloadFile } from '@/lib/exportUtils';

interface CopyButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => Promise<void>;
}

function CopyButton({ label, icon: Icon, onClick }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await onClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <motion.button
      onClick={handle}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] hover:border-white/[0.20] text-white/70 hover:text-white transition-all duration-200"
    >
      <div className="w-8 h-8 rounded-lg bg-white/[0.10] flex items-center justify-center flex-shrink-0">
        {copied ? <Check className="w-4 h-4 text-[#586851]" /> : <Icon className="w-4 h-4 text-[#656656]" />}
      </div>
      <span className="text-sm font-medium">{copied ? 'Copied!' : label}</span>
    </motion.button>
  );
}

function DownloadButton({ label, icon: Icon, onClick, sub }: { label: string; icon: LucideIcon; onClick: () => void; sub?: string }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] hover:border-white/[0.20] text-white/70 hover:text-white transition-all duration-200"
    >
      <div className="w-8 h-8 rounded-lg bg-white/[0.10] flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-[#656656]" />
      </div>
      <div className="flex-1 text-left">
        <span className="text-sm font-medium block">{label}</span>
        {sub && <span className="text-[10px] text-white/45">{sub}</span>}
      </div>
    </motion.button>
  );
}

export function ExportPanel() {
  const { state, scores } = useProject();
  const slug = state.name.replace(/\s+/g, '-').toLowerCase() || 'scope';

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(generateMarkdown(state, scores));
  };

  const copyProposal = async () => {
    await navigator.clipboard.writeText(generateProposalSummary(state, scores));
  };

  const downloadJson = () => {
    downloadFile(JSON.stringify({ state, scores }, null, 2), `${slug}.json`, 'application/json');
  };

  const downloadTxt = () => {
    downloadFile(generateMarkdown(state, scores), `${slug}-scope.txt`, 'text/plain');
  };

  const downloadHtml = () => {
    downloadFile(generateHtml(state, scores), `${slug}-scope.html`, 'text/html');
  };

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
      <h3 className="text-xs text-white/65 uppercase tracking-widest font-medium mb-5">Export & Share</h3>
      <div className="grid grid-cols-1 gap-2.5">
        <CopyButton label="Copy Scope as Markdown" icon={FileText} onClick={copyMarkdown} />
        <CopyButton label="Copy Proposal Summary" icon={Copy} onClick={copyProposal} />
        <DownloadButton label="Download HTML" icon={Globe} onClick={downloadHtml} sub="Print to PDF from your browser" />
        <DownloadButton label="Download TXT" icon={Download} onClick={downloadTxt} />
        <DownloadButton label="Download JSON" icon={FileJson} onClick={downloadJson} />
      </div>
    </div>
  );
}
