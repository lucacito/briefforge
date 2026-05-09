'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProject } from '@/lib/context';
import { ComplexityMeter } from '@/components/ComplexityMeter';
import { TimelineChart } from '@/components/TimelineChart';
import { RiskAlerts } from '@/components/RiskAlerts';
import { formatPrice } from '@/lib/pricingEngine';
import { getStepReadiness } from '@/lib/stepReadiness';
import { TrendingUp, DollarSign, ChevronDown, Edit2, X } from 'lucide-react';

function PrerequisiteGate({ message }: { message: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-10 text-center">
      <div className="text-4xl mb-4">⚙️</div>
      <div className="text-sm font-semibold text-white/80 mb-2">Not enough data yet</div>
      <div className="text-xs text-white/55 max-w-xs mx-auto leading-relaxed">{message}</div>
    </div>
  );
}

function PriceCard({
  label,
  value,
  highlight,
  currency,
  isOverride,
  onOverride,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  currency: string;
  isOverride?: boolean;
  onOverride?: () => void;
}) {
  return (
    <div className={`flex-1 rounded-xl p-4 border text-center transition-all duration-200 ${
      highlight
        ? 'bg-white/[0.12] border-white/[0.35]'
        : 'bg-white/[0.03] border-white/[0.07]'
    }`}>
      <div className="flex items-center justify-center gap-1.5 mb-2">
        <span className="text-[10px] text-white/60 uppercase tracking-wider">{label}</span>
        {highlight && onOverride && (
          <button
            onClick={onOverride}
            className="text-white/35 hover:text-white/65 transition-colors"
            title="Override price"
          >
            <Edit2 className="w-2.5 h-2.5" />
          </button>
        )}
        {isOverride && (
          <span className="text-[9px] px-1 py-0.5 rounded bg-[#656656]/25 text-[#656656] font-medium">Custom</span>
        )}
      </div>
      <motion.div
        key={value}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-xl font-black ${highlight ? 'text-white' : 'text-white/60'}`}
      >
        {formatPrice(value, currency as any)}
      </motion.div>
    </div>
  );
}

export function PricingTimelineStep() {
  const { state, scores, updateState } = useProject();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [overrideEditing, setOverrideEditing] = useState(false);
  const [overrideInput, setOverrideInput] = useState('');

  const readiness = getStepReadiness(state, 6);
  const currency = state.rateConfig.currency;
  const isOverride = state.pricingOverride.realistic !== null;

  const handleStartOverride = () => {
    setOverrideInput(String(scores.pricing.realistic));
    setOverrideEditing(true);
  };

  const handleApplyOverride = () => {
    const val = parseInt(overrideInput.replace(/\D/g, ''), 10);
    if (!isNaN(val) && val > 0) {
      updateState({ pricingOverride: { realistic: val } });
    }
    setOverrideEditing(false);
  };

  const handleResetOverride = () => {
    updateState({ pricingOverride: { realistic: null } });
    setOverrideEditing(false);
  };

  const bd = scores.breakdown.pricing;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Pricing & Timeline</h2>
        <p className="text-white/65 text-sm">Estimates generated from your full project configuration. These are ranges, not fixed quotes.</p>
      </div>

      {!readiness.ready ? (
        <PrerequisiteGate message={readiness.prerequisite} />
      ) : (
        <>
          {/* Budget */}
          <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/[0.07]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-1">Budget Estimate</h3>
                <div className="text-xs text-white/65">Based on project type, features, team, and urgency</div>
              </div>
              <DollarSign className="w-5 h-5 text-[#586851]/60" />
            </div>

            <div className="flex gap-3 mb-4">
              <PriceCard label="Minimum" value={scores.pricing.minimum} currency={currency} />
              <PriceCard
                label="Realistic"
                value={scores.pricing.realistic}
                highlight
                currency={currency}
                isOverride={isOverride}
                onOverride={handleStartOverride}
              />
              <PriceCard label="Premium" value={scores.pricing.premium} currency={currency} />
            </div>

            {/* Override input */}
            <AnimatePresence>
              {overrideEditing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="p-3 bg-white/[0.04] border border-white/[0.10] rounded-xl flex items-center gap-3">
                    <span className="text-xs text-white/60 flex-shrink-0">Override realistic to</span>
                    <input
                      autoFocus
                      type="text"
                      value={overrideInput}
                      onChange={e => setOverrideInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleApplyOverride();
                        if (e.key === 'Escape') setOverrideEditing(false);
                      }}
                      className="flex-1 bg-white/[0.06] border border-white/[0.12] rounded-lg px-2.5 py-1.5 text-sm text-white outline-none focus:border-white/[0.30] transition-colors font-mono"
                      placeholder="e.g. 12000"
                    />
                    <button
                      onClick={handleApplyOverride}
                      className="px-3 py-1.5 rounded-lg bg-[#586851]/25 border border-[#586851]/35 text-xs text-white font-medium hover:bg-[#586851]/35 transition-all"
                    >
                      Set
                    </button>
                    <button onClick={() => setOverrideEditing(false)} className="text-white/40 hover:text-white/70">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {isOverride && (
                    <button
                      onClick={handleResetOverride}
                      className="mt-1.5 ml-1 text-[10px] text-white/50 hover:text-white/70 transition-colors"
                    >
                      Reset to calculated value
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative h-2.5 bg-white/[0.05] rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 right-0 flex">
                <motion.div className="h-full bg-[#586851]/30 rounded-l-full" animate={{ width: '33.3%' }} />
                <motion.div className="h-full bg-[#586851]/60" animate={{ width: '33.4%' }} />
                <motion.div className="h-full bg-[#586851]/30 rounded-r-full" animate={{ width: '33.3%' }} />
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

            {/* How is this calculated */}
            {!isOverride && (
              <div className="mt-3">
                <button
                  onClick={() => setShowBreakdown(v => !v)}
                  className="flex items-center gap-1.5 text-[11px] text-white/50 hover:text-white/70 transition-colors"
                >
                  <motion.span animate={{ rotate: showBreakdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </motion.span>
                  How is this calculated?
                </button>
                <AnimatePresence>
                  {showBreakdown && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-2">
                        {[
                          { label: 'Base hours', value: bd.baseHours },
                          { label: 'Feature hours', value: bd.featureHours },
                          { label: 'Integration hours', value: bd.integrationHours },
                          { label: 'Content / copywriting', value: bd.contentHours },
                          { label: 'Migration', value: bd.migrationHours },
                          { label: 'Compliance', value: bd.complianceHours },
                        ].filter(r => r.value > 0).map(row => (
                          <div key={row.label} className="flex items-center justify-between text-[11px]">
                            <span className="text-white/55">{row.label}</span>
                            <span className="text-white/75 font-mono">{row.value}h</span>
                          </div>
                        ))}
                        <div className="border-t border-white/[0.06] pt-2 flex items-center justify-between text-[11px]">
                          <span className="text-white/55">Total hours</span>
                          <span className="text-white/75 font-mono font-semibold">{bd.totalHours}h</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-white/55">× Rate ({formatPrice(bd.hourlyRate, currency)}/hr)</span>
                          <span className="text-white/75 font-mono">{formatPrice(bd.totalHours * bd.hourlyRate, currency)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-white/55">× Overhead ({bd.overheadMultiplier.toFixed(2)}×)</span>
                          <span className="text-white/75 font-mono">{formatPrice(Math.round(bd.totalHours * bd.hourlyRate * bd.overheadMultiplier), currency)}</span>
                        </div>
                        {bd.urgencyMultiplier > 1 && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-white/55">× Urgency ({bd.urgencyMultiplier.toFixed(2)}×)</span>
                            <span className="text-[#9B3030] font-mono">+{formatPrice(Math.round(bd.totalHours * bd.hourlyRate * bd.overheadMultiplier * (bd.urgencyMultiplier - 1)), currency)}</span>
                          </div>
                        )}
                        <div className="border-t border-white/[0.06] pt-2 flex items-center justify-between text-[11px] font-semibold">
                          <span className="text-white/70">Realistic estimate</span>
                          <span className="text-white font-mono">{formatPrice(scores.pricing.realistic, currency)}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
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
                <TrendingUp className="w-4 h-4 text-[#656656]/80" />
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Scope Health Warnings</h3>
              </div>
              <div className="space-y-2.5">
                {scores.scopeHealthIssues.map(issue => (
                  <div key={issue.id} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#656656]/6 border border-[#656656]/15">
                    <span className="text-[#656656] flex-shrink-0">⚠</span>
                    <span className="text-xs text-white/70 leading-relaxed">{issue.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
