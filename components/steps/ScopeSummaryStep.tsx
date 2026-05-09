'use client';

import { motion } from 'framer-motion';
import { useProject } from '@/lib/context';
import { ExportPanel } from '@/components/ExportPanel';
import { PROJECT_TYPES } from '@/data/projectTypes';
import { FEATURES } from '@/data/features';
import { INTEGRATIONS } from '@/data/integrations';
import { formatPrice } from '@/lib/pricingEngine';
import { formatWeeks } from '@/lib/timelineEngine';
import { generateAssumptions, generateExclusions } from '@/lib/exportUtils';
import { CheckCircle2, AlertTriangle, Clock, DollarSign, Shield, type LucideIcon } from 'lucide-react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
      <h3 className="text-xs font-semibold text-white/65 uppercase tracking-widest mb-4">{title}</h3>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          className="flex items-start gap-2.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#656656]/60 flex-shrink-0 mt-1.5" />
          <span className="text-sm text-white/55 leading-relaxed">{item}</span>
        </motion.li>
      ))}
    </ul>
  );
}

export function ScopeSummaryStep() {
  const { state, scores } = useProject();

  const projectType = PROJECT_TYPES.find(pt => pt.id === state.projectType);
  const featureLabels = state.features.map(fid => FEATURES.find(f => f.id === fid)?.label).filter(Boolean) as string[];
  const integrationLabels = state.integrations.map(iid => INTEGRATIONS.find(i => i.id === iid)?.label).filter(Boolean) as string[];
  const exclusions = generateExclusions(state);
  const assumptions = generateAssumptions(state, scores, state.rateConfig);
  const currency = state.rateConfig.currency;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Scope Summary</h2>
        <p className="text-white/65 text-sm">Your complete project scope document, ready to export or share with clients.</p>
      </div>

      {/* Score bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Complexity', value: scores.complexityLabel, color: scores.complexityColor, icon: Shield as LucideIcon },
          { label: 'Risk Level', value: scores.riskLabel, color: scores.riskColor, icon: AlertTriangle as LucideIcon },
          { label: 'Scope Health', value: `${scores.scopeHealth}%`, color: scores.scopeHealth >= 70 ? '#586851' : '#656656', icon: CheckCircle2 as LucideIcon },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-3.5 text-center">
              <Icon className="w-4 h-4 mx-auto mb-2" style={{ color: stat.color }} />
              <div className="text-[10px] text-white/60 uppercase tracking-wider mb-1">{stat.label}</div>
              <div className="text-base font-bold" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Project Overview */}
      <Section title="Project Overview">
        <div className="space-y-3">
          {projectType && (
            <div>
              <span className="text-[10px] text-white/60 uppercase tracking-wider block mb-1">Type</span>
              <span className="text-sm font-semibold text-white">{projectType.label}</span>
              <span className="text-xs text-white/65 ml-2">— {projectType.description}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-white/60 uppercase tracking-wider block mb-1">Timeline</span>
              <div className="flex items-baseline gap-1">
                <Clock className="w-3.5 h-3.5 text-[#656656]/80" />
                <span className="text-sm font-semibold text-white ml-1">{formatWeeks(scores.timeline.total)}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-white/60 uppercase tracking-wider block mb-1">Budget Range</span>
              <div className="flex items-baseline gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#586851]/80" />
                <span className="text-sm font-semibold text-white">{formatPrice(scores.pricing.minimum, currency)} – {formatPrice(scores.pricing.premium, currency)}</span>
              </div>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-white/60 uppercase tracking-wider block mb-1">Recommended Quote</span>
            <span className="text-2xl font-black text-white">{formatPrice(scores.pricing.realistic, currency)}</span>
            {scores.pricing.pricingSource === 'override' && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-[#656656]/25 text-[#656656] font-medium">Custom</span>
            )}
          </div>
        </div>
      </Section>

      {/* Deliverables */}
      <Section title="Included Deliverables">
        {featureLabels.length > 0 ? (
          <>
            <BulletList items={featureLabels} />
            {integrationLabels.length > 0 && (
              <div className="mt-4">
                <div className="text-[10px] text-white/60 uppercase tracking-wider mb-2">Integrations</div>
                <BulletList items={integrationLabels} />
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-white/65 italic">No features selected yet.</p>
        )}
      </Section>

      {/* Exclusions */}
      <Section title="Exclusions">
        <BulletList items={exclusions} />
      </Section>

      {/* Assumptions */}
      <Section title="Assumptions">
        <BulletList items={assumptions} />
      </Section>

      {/* Risks */}
      <Section title="Risk Flags">
        {scores.riskFlags.length > 0 ? (
          <div className="space-y-4">
            {scores.riskFlags.map((flag, i) => (
              <motion.div
                key={flag.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="space-y-1"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#656656]/80 flex-shrink-0" />
                  <div className="text-sm font-semibold text-white/80">{flag.clientLabel}</div>
                </div>
                <p className="text-xs text-white/55 leading-relaxed pl-5">{flag.description}</p>
                <p className="text-xs text-white/45 leading-relaxed pl-5 italic">
                  <span className="not-italic text-white/55 font-medium">Mitigation:</span> {flag.mitigation}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[#586851]/80">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm">No major risks detected.</span>
          </div>
        )}
      </Section>

      {/* Timeline breakdown */}
      <Section title="Timeline Breakdown">
        <div className="space-y-2.5">
          {[
            { label: 'Discovery & Requirements', value: scores.timeline.discovery },
            { label: 'Design & UI/UX', value: scores.timeline.design },
            { label: 'Development & Build', value: scores.timeline.development },
            { label: 'QA & Testing', value: scores.timeline.qa },
            { label: 'Launch & Deployment', value: scores.timeline.launch },
          ].map(phase => (
            <div key={phase.label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
              <span className="text-sm text-white/55">{phase.label}</span>
              <span className="text-sm font-semibold text-white/70">{formatWeeks(phase.value)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between py-2 pt-3">
            <span className="text-sm font-semibold text-white/70">Total Estimate</span>
            <span className="text-base font-black text-white">{formatWeeks(scores.timeline.total)}</span>
          </div>
        </div>
      </Section>

      {/* Export */}
      <ExportPanel />
    </div>
  );
}
