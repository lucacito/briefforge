'use client';

import { motion } from 'framer-motion';
import { useProject } from '@/lib/context';
import { ExportPanel } from '@/components/ExportPanel';
import { PROJECT_TYPES } from '@/data/projectTypes';
import { FEATURES } from '@/data/features';
import { INTEGRATIONS } from '@/data/integrations';
import { formatPrice } from '@/lib/pricingEngine';
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
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400/50 flex-shrink-0 mt-1.5" />
          <span className="text-sm text-white/55 leading-relaxed">{item}</span>
        </motion.li>
      ))}
    </ul>
  );
}

function getExclusions(state: ReturnType<typeof useProject>['state']): string[] {
  const exclusions: string[] = [];
  if (state.contentReadiness !== 'ready') exclusions.push('Content entry and population into the CMS');
  if (!state.features.includes('api-integrations')) exclusions.push('Custom API development beyond listed integrations');
  if (!state.maintenanceNeeded) exclusions.push('Ongoing maintenance, support, or hosting post-launch');
  if (state.imageAssets !== 'full-art') exclusions.push('Custom photography, video production, or 3D assets');
  if (!state.features.includes('multi-language')) exclusions.push('Translation, localization, and RTL language support');
  if (!state.documentationRequired) exclusions.push('Technical documentation and developer handoff docs');
  exclusions.push('Third-party software licenses, subscriptions, and hosting costs');
  exclusions.push('Scope changes requested after design sign-off');
  return exclusions;
}

function getAssumptions(state: ReturnType<typeof useProject>['state']): string[] {
  const a: string[] = [];
  a.push('Client provides timely feedback within agreed revision windows (typically 5 business days)');
  if (state.contentReadiness !== 'ready') a.push('Content delays will not block development — placeholder content may be used');
  if (state.hostingResponsibility === 'client') a.push('Client manages their own hosting infrastructure and DNS');
  if (state.hostingResponsibility === 'agency') a.push('Hosting setup is billed separately from the project scope');
  a.push('All required third-party API credentials, keys, and accounts are provided at kickoff');
  if (state.branding === 'existing') a.push('Existing brand assets are provided in vector format (SVG/AI/EPS)');
  if (state.migration !== 'none') a.push('Full access to existing platform or database is granted at project start');
  a.push('A single primary point of contact on the client side handles internal coordination');
  return a;
}

export function ScopeSummaryStep() {
  const { state, scores } = useProject();

  const projectType = PROJECT_TYPES.find(pt => pt.id === state.projectType);
  const featureLabels = state.features.map(fid => FEATURES.find(f => f.id === fid)?.label).filter(Boolean) as string[];
  const integrationLabels = state.integrations.map(iid => INTEGRATIONS.find(i => i.id === iid)?.label).filter(Boolean) as string[];
  const exclusions = getExclusions(state);
  const assumptions = getAssumptions(state);

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
          { label: 'Scope Health', value: `${scores.scopeHealth}%`, color: scores.scopeHealth >= 70 ? '#22c55e' : '#eab308', icon: CheckCircle2 as LucideIcon },
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
                <Clock className="w-3.5 h-3.5 text-blue-400/60" />
                <span className="text-sm font-semibold text-white ml-1">{scores.timeline.total} weeks</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-white/60 uppercase tracking-wider block mb-1">Budget Range</span>
              <div className="flex items-baseline gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400/60" />
                <span className="text-sm font-semibold text-white">{formatPrice(scores.pricing.minimum)} – {formatPrice(scores.pricing.premium)}</span>
              </div>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-white/60 uppercase tracking-wider block mb-1">Recommended Quote</span>
            <span className="text-2xl font-black text-white">{formatPrice(scores.pricing.realistic)}</span>
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
          <div className="space-y-3">
            {scores.riskFlags.map((flag, i) => (
              <motion.div
                key={flag.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-3"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400/60 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-white/70">{flag.label}</div>
                  <div className="text-xs text-white/65 mt-0.5 leading-relaxed">{flag.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-emerald-400/60">
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
              <span className="text-sm font-semibold text-white/70">{phase.value} {phase.value === 1 ? 'week' : 'weeks'}</span>
            </div>
          ))}
          <div className="flex items-center justify-between py-2 pt-3">
            <span className="text-sm font-semibold text-white/70">Total Estimate</span>
            <span className="text-base font-black text-white">{scores.timeline.total} weeks</span>
          </div>
        </div>
      </Section>

      {/* Export */}
      <ExportPanel />
    </div>
  );
}
