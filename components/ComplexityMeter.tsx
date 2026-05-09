'use client';

import { motion } from 'framer-motion';

const LEVELS = [
  { label: 'Simple',     min: 0,   max: 30,  color: '#586851', bg: 'rgba(88,104,81,0.15)' },
  { label: 'Moderate',   min: 30,  max: 60,  color: '#656656', bg: 'rgba(101,102,86,0.15)' },
  { label: 'Complex',    min: 60,  max: 100, color: '#9B3030', bg: 'rgba(155,48,48,0.15)' },
  { label: 'Advanced',   min: 100, max: 150, color: '#7F2020', bg: 'rgba(127,32,32,0.18)' },
  { label: 'Enterprise', min: 150, max: 250, color: '#7F2020', bg: 'rgba(127,32,32,0.22)' },
];

function complexityBarPercent(score: number): number {
  const clamped = Math.min(score, 250);
  for (let i = 0; i < LEVELS.length; i++) {
    const { min, max } = LEVELS[i];
    if (clamped <= max) {
      return (i + (clamped - min) / (max - min)) * 20;
    }
  }
  return 100;
}

interface ComplexityMeterProps {
  score: number;
  label: string;
  color: string;
}

export function ComplexityMeter({ score, label, color }: ComplexityMeterProps) {
  const pct = complexityBarPercent(score);
  const level = LEVELS.find(l => score >= l.min && score < l.max) ?? LEVELS[LEVELS.length - 1];

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xs text-white/60 uppercase tracking-widest font-medium mb-1">Project Complexity</h3>
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold"
            style={{ color }}
          >
            {label}
          </motion.div>
        </div>
        <motion.div
          key={score}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-right"
        >
          <div className="text-4xl font-black" style={{ color }}>{score}</div>
          <div className="text-xs text-white/60 mt-0.5">pts</div>
        </motion.div>
      </div>

      {/* Progress bar — non-linear, each level = 20% */}
      <div className="relative h-3 bg-white/[0.06] rounded-full overflow-hidden mb-4">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* Level markers */}
      <div className="flex gap-1.5">
        {LEVELS.map(l => (
          <div
            key={l.label}
            className="flex-1 text-center py-1 rounded-lg text-[10px] font-medium transition-all duration-300"
            style={{
              color: score >= l.min ? l.color : 'rgba(255,255,255,0.2)',
              backgroundColor: score >= l.min ? l.bg : 'rgba(255,255,255,0.02)',
              border: `1px solid ${score >= l.min ? l.color + '30' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
