'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, Clock, DollarSign, Shield, Zap, ChevronRight, ChevronDown, type LucideIcon } from 'lucide-react';
import { useProject } from '@/lib/context';
import { PROJECT_TYPES } from '@/data/projectTypes';
import { FEATURES } from '@/data/features';
import { formatPrice } from '@/lib/pricingEngine';
import { formatWeeks } from '@/lib/timelineEngine';
import { useCountUp } from '@/lib/useCountUp';

function ScoreRing({ value, color, size = 56 }: { value: number; color: string; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - filled }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </svg>
  );
}

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="bg-white/[0.03] rounded-xl p-3.5 border border-white/[0.06]">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] text-white/60 uppercase tracking-wider font-medium">{label}</span>
        <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-3 h-3" style={{ color }} />
        </div>
      </div>
      <div className="text-lg font-bold text-white leading-none">{value}</div>
      {sub && <div className="text-[10px] text-white/60 mt-1">{sub}</div>}
    </div>
  );
}

export function SummaryPanel() {
  const { state, scores } = useProject();
  const [showPricingBreakdown, setShowPricingBreakdown] = useState(false);
  const [showComplexityBreakdown, setShowComplexityBreakdown] = useState(false);

  const projectType = PROJECT_TYPES.find(pt => pt.id === state.projectType);
  const selectedFeatures = state.features.slice(0, 6).map(fid => FEATURES.find(f => f.id === fid)?.label).filter(Boolean);
  const currency = state.rateConfig.currency;

  const clampedComplexity = Math.min(100, (scores.complexity / 250) * 100);
  const animatedPrice = useCountUp(scores.pricing.realistic);

  const bd = scores.breakdown;

  return (
    <aside className="flex flex-col h-full bg-bg-panel border-l border-white/[0.06] overflow-y-auto">
      <div className="p-5 border-b border-white/[0.06] sticky top-0 bg-bg-panel z-10">
        <h2 className="text-xs font-semibold text-white/65 uppercase tracking-widest">Live Summary</h2>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Project Type */}
        <div className="bg-white/[0.03] rounded-xl p-3.5 border border-white/[0.06]">
          <div className="text-[10px] text-white/60 uppercase tracking-wider font-medium mb-2">Project Type</div>
          <AnimatePresence mode="wait">
            {projectType ? (
              <motion.div key={projectType.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                <div className="text-sm font-semibold text-white">{projectType.label}</div>
                <div className="text-[10px] text-white/60 mt-1 leading-relaxed">{projectType.description}</div>
              </motion.div>
            ) : (
              <motion.div key="empty" className="text-xs text-white/60 italic">Not selected yet</motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Complexity */}
        <div className="bg-white/[0.03] rounded-xl p-3.5 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Complexity</span>
            <div className="relative w-10 h-10">
              <ScoreRing value={clampedComplexity} color={scores.complexityColor} size={40} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[9px] font-bold" style={{ color: scores.complexityColor }}>
                  {scores.complexity}
                </span>
              </div>
            </div>
          </div>
          <motion.div
            key={scores.complexityLabel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-base font-bold"
            style={{ color: scores.complexityColor }}
          >
            {scores.complexityLabel}
          </motion.div>
          {bd.complexity.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setShowComplexityBreakdown(v => !v)}
                className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/60 transition-colors"
              >
                <motion.span animate={{ rotate: showComplexityBreakdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-3 h-3" />
                </motion.span>
                How is this calculated?
              </button>
              <AnimatePresence>
                {showComplexityBreakdown && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 space-y-1">
                      {bd.complexity.map(item => (
                        <div key={item.source} className="flex items-center justify-between text-[10px]">
                          <span className="text-white/50 truncate pr-2">{item.source}</span>
                          <span className="text-white/65 font-mono flex-shrink-0">+{item.points}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Budget */}
        <div className="bg-white/[0.03] rounded-xl p-3.5 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Budget Range</span>
            <DollarSign className="w-3.5 h-3.5 text-[#586851]/80" />
          </div>
          <AnimatePresence mode="wait">
            {scores.pricing.realistic > 0 ? (
              <motion.div key="has-price" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-lg font-bold text-white">{formatPrice(animatedPrice, currency)}</div>
                <div className="text-[10px] text-white/60 mt-1">
                  {formatPrice(scores.pricing.minimum, currency)} – {formatPrice(scores.pricing.premium, currency)}
                </div>
                <div className="mt-2.5 h-1.5 bg-white/[0.06] rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#586851]/40 rounded-l-full" style={{ width: '33%' }} />
                  <div className="h-full bg-[#586851]/70" style={{ width: '34%' }} />
                  <div className="h-full bg-[#586851]/40 rounded-r-full" style={{ width: '33%' }} />
                </div>
                <div className="flex justify-between text-[9px] text-white/60 mt-1">
                  <span>Min</span><span>Realistic</span><span>Premium</span>
                </div>
                {state.pricingOverride.realistic === null && bd.pricing.totalHours > 0 && (
                  <div className="mt-2">
                    <button
                      onClick={() => setShowPricingBreakdown(v => !v)}
                      className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/60 transition-colors"
                    >
                      <motion.span animate={{ rotate: showPricingBreakdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-3 h-3" />
                      </motion.span>
                      How is this calculated?
                    </button>
                    <AnimatePresence>
                      {showPricingBreakdown && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-white/50">Total hours</span>
                              <span className="text-white/65 font-mono">{bd.pricing.totalHours}h</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-white/50">Rate</span>
                              <span className="text-white/65 font-mono">{formatPrice(bd.pricing.hourlyRate, currency)}/hr</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-white/50">Overhead</span>
                              <span className="text-white/65 font-mono">{bd.pricing.overheadMultiplier.toFixed(2)}×</span>
                            </div>
                            {bd.pricing.urgencyMultiplier > 1 && (
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-white/50">Urgency</span>
                                <span className="text-[#9B3030] font-mono">{bd.pricing.urgencyMultiplier.toFixed(2)}×</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="empty" className="text-xs text-white/40 italic">
                {state.projectType ? 'Add features to refine' : 'Select a project type'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Timeline */}
        <div className="bg-white/[0.03] rounded-xl p-3.5 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Timeline</span>
            <Clock className="w-3.5 h-3.5 text-[#656656]/80" />
          </div>
          {scores.timeline.total > 0 ? (
            <>
              <div className="text-lg font-bold text-white">{formatWeeks(scores.timeline.total)}</div>
              <div className="mt-2.5 space-y-1.5">
                {[
                  { label: 'Discovery', value: scores.timeline.discovery, color: '#656656' },
                  { label: 'Design', value: scores.timeline.design, color: '#626758' },
                  { label: 'Dev', value: scores.timeline.development, color: '#586851' },
                  { label: 'QA', value: scores.timeline.qa, color: '#4E5C48' },
                ].map(phase => (
                  <div key={phase.label} className="flex items-center gap-2">
                    <span className="text-[9px] text-white/60 w-12 flex-shrink-0">{phase.label}</span>
                    <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: phase.color }}
                        animate={{ width: `${(phase.value / scores.timeline.total) * 100}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    <span className="text-[9px] text-white/60 w-8 text-right">{phase.value}w</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-xs text-white/60 italic">Select project type to estimate</div>
          )}
        </div>

        {/* Risk */}
        <div className="bg-white/[0.03] rounded-xl p-3.5 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Risk Level</span>
            <Shield className="w-3.5 h-3.5" style={{ color: scores.riskColor }} />
          </div>
          <div className="text-base font-bold mb-2" style={{ color: scores.riskColor }}>{scores.riskLabel}</div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: scores.riskColor }}
              animate={{ width: `${scores.risk}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          {scores.riskFlags.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {scores.riskFlags.slice(0, 3).map(flag => (
                <div key={flag.id} className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-[#656656]/80 flex-shrink-0 mt-0.5" />
                  <span className="text-[10px] text-white/65 leading-tight">{flag.clientLabel}</span>
                </div>
              ))}
              {scores.riskFlags.length > 3 && (
                <div className="text-[10px] text-white/60">+{scores.riskFlags.length - 3} more</div>
              )}
            </div>
          )}
        </div>

        {/* Scope Health */}
        <div className="bg-white/[0.03] rounded-xl p-3.5 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Scope Health</span>
            <Zap className="w-3.5 h-3.5 text-[#656656]/80" />
          </div>
          <div className={`text-base font-bold mb-2 ${
            scores.scopeHealth >= 80 ? 'text-[#586851]' :
            scores.scopeHealth >= 60 ? 'text-[#656656]' : 'text-[#7F2020]'
          }`}>{scores.scopeHealth}%</div>
          {scores.scopeHealthIssues.slice(0, 3).map(issue => (
            <div key={issue.id} className="flex items-start gap-1.5 mb-1.5">
              <ChevronRight className="w-3 h-3 text-white/55 flex-shrink-0 mt-0.5" />
              <span className="text-[10px] text-white/65 leading-tight">{issue.label}</span>
            </div>
          ))}
        </div>

        {/* Selected Features */}
        {selectedFeatures.length > 0 && (
          <div className="bg-white/[0.03] rounded-xl p-3.5 border border-white/[0.06]">
            <div className="text-[10px] text-white/60 uppercase tracking-wider font-medium mb-2">
              Features ({state.features.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedFeatures.map(f => (
                <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.12] text-white border border-white/[0.25]">
                  {f}
                </span>
              ))}
              {state.features.length > 6 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/65">
                  +{state.features.length - 6}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
