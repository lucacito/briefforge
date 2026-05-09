'use client';

import { motion } from 'framer-motion';
import { TimelineBreakdown } from '@/types/project';

interface TimelineChartProps {
  timeline: TimelineBreakdown;
}

const PHASES = [
  { key: 'discovery' as const, label: 'Discovery', color: '#656656', desc: 'Research & requirements' },
  { key: 'design' as const, label: 'Design', color: '#626758', desc: 'UI/UX & visual design' },
  { key: 'development' as const, label: 'Development', color: '#586851', desc: 'Building the product' },
  { key: 'qa' as const, label: 'QA & Testing', color: '#4E5C48', desc: 'Quality assurance' },
  { key: 'launch' as const, label: 'Launch', color: '#7F2020', desc: 'Deploy & go live' },
];

export function TimelineChart({ timeline }: TimelineChartProps) {
  const total = timeline.total || 1;

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xs text-white/60 uppercase tracking-widest font-medium mb-1">Timeline Estimate</h3>
          <div className="text-2xl font-bold text-white">{timeline.total} <span className="text-sm text-white/65 font-normal">weeks</span></div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/60">≈ {Math.round(timeline.total / 4.3)} months</div>
        </div>
      </div>

      {/* Gantt-style bars */}
      <div className="space-y-3">
        {PHASES.map((phase, i) => {
          const weeks = timeline[phase.key];
          const pct = (weeks / total) * 100;
          const offset = PHASES.slice(0, i).reduce((acc, p) => acc + (timeline[p.key] / total) * 100, 0);

          return (
            <div key={phase.key} className="flex items-center gap-3">
              <div className="w-20 flex-shrink-0 text-right">
                <div className="text-[11px] text-white/65 font-medium">{phase.label}</div>
                <div className="text-[9px] text-white/60">{weeks}w</div>
              </div>
              <div className="flex-1 relative h-6 bg-white/[0.04] rounded-lg overflow-hidden">
                <motion.div
                  className="absolute top-0 bottom-0 rounded-lg flex items-center px-2"
                  style={{
                    left: `${offset}%`,
                    backgroundColor: phase.color + '25',
                    borderLeft: `2px solid ${phase.color}60`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
                >
                  {pct > 10 && (
                    <span className="text-[9px] font-medium" style={{ color: phase.color }}>{phase.desc}</span>
                  )}
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Week markers */}
      <div className="mt-4 ml-[92px] relative h-4">
        <div className="absolute inset-x-0 flex justify-between">
          {[0, Math.round(total * 0.25), Math.round(total * 0.5), Math.round(total * 0.75), total].map(w => (
            <span key={w} className="text-[9px] text-white/60">{w}w</span>
          ))}
        </div>
      </div>
    </div>
  );
}
