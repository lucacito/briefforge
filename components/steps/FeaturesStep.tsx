'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info } from 'lucide-react';
import { useProject } from '@/lib/context';
import { FEATURES, FEATURE_CATEGORIES } from '@/data/features';

export function FeaturesStep() {
  const { state, updateState } = useProject();
  const [activeCategory, setActiveCategory] = useState('All');
  const [tooltip, setTooltip] = useState<string | null>(null);

  const toggle = (id: string) => {
    const features = state.features.includes(id)
      ? state.features.filter(f => f !== id)
      : [...state.features, id];
    updateState({ features });
  };

  const filtered = activeCategory === 'All' ? FEATURES : FEATURES.filter(f => f.category === activeCategory);

  const complexityTotal = state.features.reduce((acc, fid) => {
    const f = FEATURES.find(feat => feat.id === fid);
    return acc + (f ? f.complexityPoints : 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">What does it do?</h2>
        <p className="text-white/65 text-sm">Select all features this project needs. Each adds complexity and timeline impact.</p>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 p-3.5 bg-white/[0.03] rounded-xl border border-white/[0.07]">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-white">{state.features.length}</span>
          <span className="text-xs text-white/65">features selected</span>
        </div>
        <div className="w-px h-6 bg-white/[0.08]" />
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-violet-300">{complexityTotal}</span>
          <span className="text-xs text-white/65">complexity points</span>
        </div>
        <div className="flex-1" />
        {state.features.length > 0 && (
          <button
            onClick={() => updateState({ features: [] })}
            className="text-xs text-white/60 hover:text-white/80 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {FEATURE_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/35'
                : 'bg-white/[0.04] text-white/60 border border-white/[0.07] hover:bg-white/[0.07] hover:text-white/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feature grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="grid grid-cols-2 xl:grid-cols-3 gap-2.5"
        >
          {filtered.map((feature, i) => {
            const isSelected = state.features.includes(feature.id);
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                className={`relative group flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-violet-500/12 border-violet-500/40'
                    : 'bg-white/[0.025] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]'
                }`}
                onClick={() => toggle(feature.id)}
              >
                {/* Checkbox */}
                <div className={`w-4.5 h-4.5 rounded-md flex-shrink-0 flex items-center justify-center border transition-all duration-150 mt-0.5 ${
                  isSelected
                    ? 'bg-violet-500 border-violet-400'
                    : 'bg-white/[0.04] border-white/[0.12] group-hover:border-white/[0.25]'
                }`} style={{ width: 18, height: 18 }}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <span className={`text-sm font-medium leading-tight ${isSelected ? 'text-white' : 'text-white/65'}`}>
                      {feature.label}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); setTooltip(tooltip === feature.id ? null : feature.id); }}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Info className="w-3.5 h-3.5 text-white/55 hover:text-white/80" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-white/65">{feature.category}</span>
                    <span className="text-[10px] text-white/30" aria-hidden="true">·</span>
                    <span className={`text-[10px] font-medium ${isSelected ? 'text-violet-300/90' : 'text-white/65'}`}>
                      +{feature.complexityPoints} pts
                    </span>
                    <span className="text-[10px] text-white/30" aria-hidden="true">·</span>
                    <span className="text-[10px] text-white/65">{feature.timelineImpact}w</span>
                  </div>
                  <AnimatePresence>
                    {tooltip === feature.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-[11px] text-white/65 leading-relaxed mt-2 pr-2">{feature.description}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
