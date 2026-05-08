'use client';

import { motion } from 'framer-motion';
import { useProject } from '@/lib/context';
import { ComplexityMeter } from '@/components/ComplexityMeter';
import { TimelineChart } from '@/components/TimelineChart';
import { RiskAlerts } from '@/components/RiskAlerts';
import { formatPrice } from '@/lib/pricingEngine';
import { TrendingUp, DollarSign } from 'lucide-react';

function PriceCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`flex-1 rounded-xl p-4 border text-center transition-all duration-200 ${
      highlight
        ? 'bg-violet-500/12 border-violet-500/35'
        : 'bg-white/[0.03] border-white/[0.07]'
    }`}>
      <div className="text-[10px] text-white/60 uppercase tracking-wider mb-2">{label}</div>
      <motion.div
        key={value}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-xl font-black ${highlight ? 'text-white' : 'text-white/60'}`}
      >
        {formatPrice(value)}
      </motion.div>
    </div>
  );
}

export function PricingTimelineStep() {
  const { scores } = useProject();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Pricing & Timeline</h2>
        <p className="text-white/65 text-sm">Estimates generated from your full project configuration. These are ranges, not fixed quotes.</p>
      </div>

      {/* Budget */}
      <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/[0.07]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-1">Budget Estimate</h3>
            <div className="text-xs text-white/65">Based on project type, features, team, and urgency</div>
          </div>
          <DollarSign className="w-5 h-5 text-emerald-400/40" />
        </div>

        <div className="flex gap-3 mb-4">
          <PriceCard label="Minimum" value={scores.pricing.minimum} />
          <PriceCard label="Realistic" value={scores.pricing.realistic} highlight />
          <PriceCard label="Premium" value={scores.pricing.premium} />
        </div>

        <div className="relative h-2.5 bg-white/[0.05] rounded-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 right-0 flex">
            <motion.div
              className="h-full bg-emerald-500/30 rounded-l-full"
              animate={{ width: '33.3%' }}
            />
            <motion.div
              className="h-full bg-emerald-500/60"
              animate={{ width: '33.4%' }}
            />
            <motion.div
              className="h-full bg-emerald-500/30 rounded-r-full"
              animate={{ width: '33.3%' }}
            />
          </div>
        </div>
        <div className="flex justify-between mt-1.5">
          {['Minimum', 'Realistic', 'Premium'].map(l => (
            <span key={l} className="text-[10px] text-white/60 flex-1 text-center">{l}</span>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <p className="text-[11px] text-white/65 leading-relaxed">
            The <span className="text-white/80 font-medium">realistic estimate</span> is the recommended number to quote. Minimum assumes best-case conditions; premium accounts for full scope expansion, comprehensive revisions, and higher urgency overhead.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <TimelineChart timeline={scores.timeline} />

      {/* Complexity */}
      <ComplexityMeter
        score={scores.complexity}
        label={scores.complexityLabel}
        color={scores.complexityColor}
      />

      {/* Risk Alerts */}
      <RiskAlerts
        flags={scores.riskFlags}
        riskScore={scores.risk}
        riskLabel={scores.riskLabel}
        riskColor={scores.riskColor}
      />

      {/* Scope health issues */}
      {scores.scopeHealthIssues.length > 0 && (
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-violet-400/60" />
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Scope Health Warnings</h3>
          </div>
          <div className="space-y-2.5">
            {scores.scopeHealthIssues.map(issue => (
              <div key={issue.id} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/6 border border-amber-500/15">
                <span className="text-amber-400 flex-shrink-0">⚠</span>
                <span className="text-xs text-white/70 leading-relaxed">{issue.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
