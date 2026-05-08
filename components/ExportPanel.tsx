'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, FileText, FileJson, Check, type LucideIcon } from 'lucide-react';
import { useProject } from '@/lib/context';
import { generateMarkdown, generateProposalSummary, downloadFile } from '@/lib/exportUtils';

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
      className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] hover:border-violet-500/30 text-white/70 hover:text-white transition-all duration-200"
    >
      <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Icon className="w-4 h-4 text-violet-400" />}
      </div>
      <span className="text-sm font-medium">{copied ? 'Copied!' : label}</span>
    </motion.button>
  );
}

function DownloadButton({ label, icon: Icon, onClick }: { label: string; icon: LucideIcon; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] hover:border-indigo-500/30 text-white/70 hover:text-white transition-all duration-200"
    >
      <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-indigo-400" />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
}

export function ExportPanel() {
  const { state, scores } = useProject();

  const copyMarkdown = async () => {
    const md = generateMarkdown(state, scores);
    await navigator.clipboard.writeText(md);
  };

  const copyProposal = async () => {
    const summary = generateProposalSummary(state, scores);
    await navigator.clipboard.writeText(summary);
  };

  const downloadJson = () => {
    const data = JSON.stringify({ state, scores }, null, 2);
    downloadFile(data, `${state.name.replace(/\s+/g, '-').toLowerCase()}-scope.json`, 'application/json');
  };

  const downloadTxt = () => {
    const txt = generateMarkdown(state, scores);
    downloadFile(txt, `${state.name.replace(/\s+/g, '-').toLowerCase()}-scope.txt`, 'text/plain');
  };

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
      <h3 className="text-xs text-white/65 uppercase tracking-widest font-medium mb-5">Export & Share</h3>
      <div className="grid grid-cols-1 gap-2.5">
        <CopyButton label="Copy Scope as Markdown" icon={FileText} onClick={copyMarkdown} />
        <CopyButton label="Copy Proposal Summary" icon={Copy} onClick={copyProposal} />
        <DownloadButton label="Download JSON" icon={FileJson} onClick={downloadJson} />
        <DownloadButton label="Download TXT" icon={Download} onClick={downloadTxt} />
      </div>
    </div>
  );
}
