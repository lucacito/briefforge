'use client';

import { motion } from 'framer-motion';

const LEVELS = [
  { label: 'Simple', min: 0, max: 30, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  { label: 'Moderate', min: 30, max: 60, color: '#eab308', bg: 'rgba(234,179,8,0.12)' },
  { label: 'Complex', min: 60, max: 100, color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  { label: 'Advanced', min: 100, max: 150, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  { label: 'Monster', min: 150, max: 250, color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
];

interface ComplexityMeterProps {
  score: number;
  label: string;
  color: string;
}

export function ComplexityMeter({ score, label, color }: ComplexityMeterProps) {
  const MAX = 250;
  const pct = Math.min(100, (score / MAX) * 100);
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

      {/* Progress bar */}
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
