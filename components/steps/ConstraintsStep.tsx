'use client';

import { motion } from 'framer-motion';
import { useProject } from '@/lib/context';
import { ComplianceType, BrowserSupport, HostingResponsibility } from '@/types/project';
import { Shield, Zap, AlertTriangle, type LucideIcon } from 'lucide-react';

const URGENCY_LABELS = ['Relaxed', 'Normal', 'Urgent', 'Very Urgent', 'Impossible'];
const URGENCY_COLORS = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];

function getUrgencyLabel(val: number) {
  const idx = Math.floor((val / 100) * (URGENCY_LABELS.length - 1));
  return URGENCY_LABELS[Math.min(idx, URGENCY_LABELS.length - 1)];
}

function getUrgencyColor(val: number) {
  const idx = Math.floor((val / 100) * (URGENCY_COLORS.length - 1));
  return URGENCY_COLORS[Math.min(idx, URGENCY_COLORS.length - 1)];
}

const COMPLIANCE_OPTIONS: { id: ComplianceType; label: string; description: string; icon: LucideIcon; severity: string }[] = [
  { id: 'gdpr', label: 'GDPR', description: 'EU data privacy compliance', icon: Shield, severity: 'medium' },
  { id: 'accessibility', label: 'Accessibility (WCAG)', description: 'AA/AAA accessibility standards', icon: Zap, severity: 'medium' },
  { id: 'legal-review', label: 'Legal Review', description: 'Content or contract legal sign-off', icon: Shield, severity: 'medium' },
  { id: 'hipaa', label: 'HIPAA', description: 'US healthcare data compliance', icon: AlertTriangle, severity: 'critical' },
  { id: 'enterprise-security', label: 'Enterprise Security', description: 'Pen testing, SOC 2, security audit', icon: Shield, severity: 'high' },
];

function Toggle({ label, description, value, onChange }: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-white/[0.05] last:border-0">
      <div>
        <div className="text-sm text-white/70 font-medium">{label}</div>
        {description && <div className="text-xs text-white/65 mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative rounded-full transition-all duration-200 flex-shrink-0 ml-4"
        style={{ width: 40, height: 22, backgroundColor: value ? '#8b5cf6' : 'rgba(255,255,255,0.1)' }}
      >
        <motion.div
          className="absolute top-0.5 bottom-0.5 rounded-full bg-white shadow-sm"
          animate={{ left: value ? 'calc(100% - 18px)' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          style={{ width: 18 }}
        />
      </button>
    </div>
  );
}

function RadioGroup<T extends string>({ label, description, options, value, onChange }: {
  label: string;
  description?: string;
  options: { value: T; label: string; sub?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <div className="mb-3">
        <div className="text-sm font-semibold text-white/75">{label}</div>
        {description && <div className="text-xs text-white/65 mt-0.5">{description}</div>}
      </div>
      <div className="flex gap-2 flex-wrap">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-xl border text-left transition-all duration-150 ${
              value === opt.value
                ? 'bg-violet-500/15 border-violet-500/45 text-white'
                : 'bg-white/[0.03] border-white/[0.07] text-white/60 hover:bg-white/[0.06] hover:text-white/80 hover:border-white/[0.14]'
            }`}
          >
            <div className="text-xs font-medium">{opt.label}</div>
            {opt.sub && <div className="text-[10px] text-white/65 mt-0.5">{opt.sub}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ConstraintsStep() {
  const { state, updateState } = useProject();
  const urgencyColor = getUrgencyColor(state.deadlineUrgency);
  const urgencyLabel = getUrgencyLabel(state.deadlineUrgency);

  const toggleCompliance = (id: ComplianceType) => {
    const compliance = state.compliance.includes(id)
      ? state.compliance.filter(c => c !== id)
      : [...state.compliance, id];
    updateState({ compliance });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Constraints & Risks</h2>
        <p className="text-white/65 text-sm">Define what limits this project — timelines, compliance, and operational expectations.</p>
      </div>

      {/* Deadline urgency */}
      <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/[0.07]">
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <div className="text-sm font-semibold text-white/75">Deadline Urgency</div>
            <div className="text-xs text-white/65 mt-0.5">How much time pressure is on this project?</div>
          </div>
          <motion.div
            key={urgencyLabel}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-base font-bold"
            style={{ color: urgencyColor }}
          >
            {urgencyLabel}
          </motion.div>
        </div>

        <div className="relative h-3 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-150"
            style={{
              width: `${state.deadlineUrgency}%`,
              background: `linear-gradient(90deg, #22c55e, ${urgencyColor})`,
            }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={state.deadlineUrgency}
            onChange={e => updateState({ deadlineUrgency: Number(e.target.value) })}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
            style={{ height: '100%' }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {URGENCY_LABELS.map((label, i) => (
            <span key={label} className="text-[10px]" style={{ color: URGENCY_COLORS[i] + '70' }}>{label}</span>
          ))}
        </div>
      </div>

      {/* Compliance */}
      <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/[0.07]">
        <div className="mb-4">
          <div className="text-sm font-semibold text-white/75">Compliance Requirements</div>
          <div className="text-xs text-white/65 mt-0.5">Select all that apply — each adds complexity and cost</div>
        </div>
        <div className="grid grid-cols-1 gap-2.5">
          {COMPLIANCE_OPTIONS.map((opt, i) => {
            const isSelected = state.compliance.includes(opt.id);
            const Icon = opt.icon;
            const colors = {
              medium: { color: '#eab308', bg: 'rgba(234,179,8,0.10)', border: 'rgba(234,179,8,0.25)' },
              high: { color: '#f97316', bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.25)' },
              critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.25)' },
            };
            const cfg = colors[opt.severity as keyof typeof colors];
            return (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => toggleCompliance(opt.id)}
                className="flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all duration-150"
                style={isSelected ? { backgroundColor: cfg.bg, borderColor: cfg.border } : { backgroundColor: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${cfg.color}18` }}>
                  <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-white/55'}`}>{opt.label}</div>
                  <div className="text-xs text-white/65 mt-0.5">{opt.description}</div>
                </div>
                <div className="w-5 h-5 rounded-md flex items-center justify-center border flex-shrink-0 transition-all"
                  style={isSelected ? { backgroundColor: cfg.color, borderColor: cfg.color } : { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  {isSelected && <span className="text-white text-xs">✓</span>}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Other constraints */}
      <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/[0.07] space-y-5">
        <RadioGroup<BrowserSupport>
          label="Browser & Device Support"
          description="Which environments must be supported?"
          value={state.browserSupport}
          onChange={v => updateState({ browserSupport: v })}
          options={[
            { value: 'modern', label: 'Modern Browsers', sub: 'Chrome, Safari, Firefox (last 2 years)' },
            { value: 'legacy', label: 'Legacy Support', sub: 'IE11, older mobile — adds dev overhead' },
          ]}
        />
        <div className="w-full h-px bg-white/[0.05]" />
        <RadioGroup<HostingResponsibility>
          label="Hosting Responsibility"
          description="Who manages the production infrastructure?"
          value={state.hostingResponsibility}
          onChange={v => updateState({ hostingResponsibility: v })}
          options={[
            { value: 'client', label: 'Client', sub: 'Client owns hosting' },
            { value: 'agency', label: 'Agency', sub: 'We provision & manage' },
            { value: 'undecided', label: 'Undecided', sub: '⚠ Risk flag' },
          ]}
        />
      </div>

      <div className="bg-white/[0.02] rounded-2xl border border-white/[0.07] px-6 pt-2 pb-1">
        <Toggle
          label="Ongoing Maintenance"
          description="Will the project require a maintenance retainer after launch?"
          value={state.maintenanceNeeded}
          onChange={v => updateState({ maintenanceNeeded: v })}
        />
      </div>
    </div>
  );
}
