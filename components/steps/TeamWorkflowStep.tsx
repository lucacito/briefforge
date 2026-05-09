'use client';

import { motion } from 'framer-motion';
import { useProject } from '@/lib/context';
import { ApprovalLayers, CommunicationStyle } from '@/types/project';

function Slider({ label, description, value, min, max, step = 1, onChange, formatValue }: {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <div className="text-sm font-semibold text-white/75">{label}</div>
          {description && <div className="text-xs text-white/65 mt-0.5">{description}</div>}
        </div>
        <span className="text-lg font-bold text-white ml-3 flex-shrink-0">{formatValue ? formatValue(value) : value}</span>
      </div>
      <div className="relative h-2 bg-white/[0.06] rounded-full cursor-pointer group">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#7F2020]/70 to-[#7F2020]"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.15 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ height: '100%' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg shadow-[#7F2020]/20 border-2 border-[#7F2020] transition-all duration-150"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
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
            className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl border text-left transition-all duration-150 ${
              value === opt.value
                ? 'bg-white/[0.14] border-white/[0.40] text-white'
                : 'bg-white/[0.03] border-white/[0.10] text-white/75 hover:bg-white/[0.08] hover:text-white hover:border-white/[0.22]'
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
        style={{ width: 40, height: 22, backgroundColor: value ? '#7F2020' : 'rgba(255,255,255,0.1)' }}
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

export function TeamWorkflowStep() {
  const { state, updateState } = useProject();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Team & Workflow</h2>
        <p className="text-white/65 text-sm">How people are involved shapes the cost, timeline, and complexity just as much as features.</p>
      </div>

      <div className="space-y-6 bg-white/[0.02] rounded-2xl p-6 border border-white/[0.07]">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Slider
            label="Number of Stakeholders"
            description="People with decision-making power or approval authority"
            value={state.stakeholders}
            min={1}
            max={10}
            onChange={v => updateState({ stakeholders: v })}
            formatValue={v => v === 10 ? '10+' : String(v)}
          />
        </motion.div>

        <div className="w-full h-px bg-white/[0.05]" />

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <RadioGroup<ApprovalLayers>
            label="Approval Layers"
            description="How decisions get approved and signed off"
            value={state.approvalLayers}
            onChange={v => updateState({ approvalLayers: v })}
            options={[
              { value: 'direct', label: 'Direct Client', sub: 'One person decides' },
              { value: 'manager', label: 'Manager Approval', sub: 'Goes up one level' },
              { value: 'committee', label: 'Committee', sub: 'Group consensus required' },
            ]}
          />
        </motion.div>

        <div className="w-full h-px bg-white/[0.05]" />

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Slider
            label="Revision Rounds"
            description="How many full rounds of changes are included in scope"
            value={state.revisionRounds}
            min={1}
            max={10}
            onChange={v => updateState({ revisionRounds: v })}
          />
        </motion.div>

        <div className="w-full h-px bg-white/[0.05]" />

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <RadioGroup<CommunicationStyle>
            label="Communication Style"
            description="How does the team prefer to communicate during the project?"
            value={state.communicationStyle}
            onChange={v => updateState({ communicationStyle: v })}
            options={[
              { value: 'async', label: 'Async', sub: 'Mostly email/Slack' },
              { value: 'weekly', label: 'Weekly Meetings', sub: 'Regular check-ins' },
              { value: 'frequent', label: 'Frequent Calls', sub: 'Multiple times/week' },
            ]}
          />
        </motion.div>
      </div>

      <div className="bg-white/[0.02] rounded-2xl border border-white/[0.07] px-6 pt-2 pb-1">
        <Toggle
          label="Training Required"
          description="Will the client team need training on how to use the product?"
          value={state.trainingRequired}
          onChange={v => updateState({ trainingRequired: v })}
        />
        <Toggle
          label="Documentation Required"
          description="Will technical or user documentation need to be written?"
          value={state.documentationRequired}
          onChange={v => updateState({ documentationRequired: v })}
        />
      </div>
    </div>
  );
}
