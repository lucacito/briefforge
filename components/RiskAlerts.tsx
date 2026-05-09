'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Zap, CheckCircle2, type LucideIcon } from 'lucide-react';
import { RiskFlag } from '@/types/project';

const SEVERITY_CONFIG: Record<string, { icon: LucideIcon; color: string; bg: string; border: string; label: string }> = {
  low: { icon: CheckCircle2, color: '#586851', bg: 'rgba(88,104,81,0.10)', border: 'rgba(88,104,81,0.25)', label: 'Low' },
  medium: { icon: AlertCircle, color: '#656656', bg: 'rgba(101,102,86,0.10)', border: 'rgba(101,102,86,0.25)', label: 'Medium' },
  high: { icon: AlertTriangle, color: '#9B3030', bg: 'rgba(155,48,48,0.10)', border: 'rgba(155,48,48,0.25)', label: 'High' },
  critical: { icon: Zap, color: '#7F2020', bg: 'rgba(127,32,32,0.12)', border: 'rgba(127,32,32,0.30)', label: 'Critical' },
};

interface RiskAlertsProps {
  flags: RiskFlag[];
  riskScore: number;
  riskLabel: string;
  riskColor: string;
}

export function RiskAlerts({ flags, riskScore, riskLabel, riskColor }: RiskAlertsProps) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-xs text-white/60 uppercase tracking-widest font-medium mb-1">Risk Assessment</h3>
          <motion.div
            key={riskLabel}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold"
            style={{ color: riskColor }}
          >
            {riskLabel}
          </motion.div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black" style={{ color: riskColor }}>{riskScore}</div>
          <div className="text-[10px] text-white/60">/ 100</div>
        </div>
      </div>

      <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${riskColor}60, ${riskColor})` }}
          animate={{ width: `${riskScore}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <AnimatePresence mode="popLayout">
        {flags.length === 0 ? (
          <motion.div
            key="no-flags"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 py-4 text-white/60 text-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-[#586851]/70" />
            <span>No risk flags detected — scope looks solid.</span>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {flags.map((flag, i) => {
              const cfg = SEVERITY_CONFIG[flag.severity];
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={flag.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl p-3.5"
                  style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: cfg.color }} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white/80">{flag.label}</span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                          style={{ color: cfg.color, backgroundColor: `${cfg.color}20` }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-white/65 leading-relaxed">{flag.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
