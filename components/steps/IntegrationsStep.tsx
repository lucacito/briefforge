'use client';

import { motion } from 'framer-motion';
import { Check, Minus, Plus } from 'lucide-react';
import { useProject } from '@/lib/context';
import { INTEGRATIONS, INTEGRATION_CATEGORIES } from '@/data/integrations';
import { useState } from 'react';

const CATEGORY_COLORS: Record<string, string> = {
  Payment: '#22c55e',
  Marketing: '#f59e0b',
  CRM: '#3b82f6',
  Automation: '#8b5cf6',
  Analytics: '#06b6d4',
  Scheduling: '#ec4899',
  Communication: '#14b8a6',
  Productivity: '#6366f1',
  Custom: '#ef4444',
};

export function IntegrationsStep() {
  const { state, updateState } = useProject();
  const [activeCategory, setActiveCategory] = useState('All');

  const toggle = (id: string) => {
    const integrations = state.integrations.includes(id)
      ? state.integrations.filter(i => i !== id)
      : [...state.integrations, id];
    updateState({ integrations });
  };

  const filtered = activeCategory === 'All' ? INTEGRATIONS : INTEGRATIONS.filter(i => i.category === activeCategory);
  const categories = ['All', ...INTEGRATION_CATEGORIES];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Integrations</h2>
        <p className="text-white/65 text-sm">Select all third-party services this project needs to connect with.</p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 p-3.5 bg-white/[0.03] rounded-xl border border-white/[0.07]">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-white">{state.integrations.length}</span>
          <span className="text-xs text-white/65">integrations selected</span>
        </div>
        <div className="w-px h-6 bg-white/[0.08]" />
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-blue-300">{state.externalSystems}</span>
          <span className="text-xs text-white/65">external systems</span>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => {
          const color = CATEGORY_COLORS[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? 'text-white border'
                  : 'bg-white/[0.04] text-white/60 border border-white/[0.07] hover:bg-white/[0.07] hover:text-white/80'
              }`}
              style={activeCategory === cat ? {
                backgroundColor: `${color || '#8b5cf6'}18`,
                borderColor: `${color || '#8b5cf6'}40`,
                color: color || '#a78bfa',
              } : {}}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Integrations grid */}
      <motion.div
        key={activeCategory}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 xl:grid-cols-3 gap-2.5"
      >
        {filtered.map((integ, i) => {
          const isSelected = state.integrations.includes(integ.id);
          const color = CATEGORY_COLORS[integ.category] ?? '#8b5cf6';
          return (
            <motion.button
              key={integ.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => toggle(integ.id)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-150 ${
                isSelected
                  ? 'border-opacity-50'
                  : 'bg-white/[0.025] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]'
              }`}
              style={isSelected ? {
                backgroundColor: `${color}12`,
                borderColor: `${color}40`,
              } : {}}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{ backgroundColor: `${color}${isSelected ? '25' : '14'}`, color }}>
                {integ.label.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/60'}`}>{integ.label}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] rounded px-1.5 py-0.5" style={{ color, backgroundColor: `${color}15` }}>
                    {integ.category}
                  </span>
                  <span className="text-[10px] text-white/60">+{integ.complexityPoints}pts</span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border flex-shrink-0 transition-all duration-150 ${
                isSelected ? 'border-opacity-50' : 'bg-white/[0.04] border-white/[0.1]'
              }`}
                style={isSelected ? { backgroundColor: color, borderColor: color } : {}}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* External systems slider */}
      <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/[0.07]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold text-white/75">Number of External Systems</div>
            <div className="text-xs text-white/65 mt-0.5">APIs, databases, or platforms beyond the list above</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => updateState({ externalSystems: Math.max(0, state.externalSystems - 1) })}
              className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] flex items-center justify-center text-white/50 hover:text-white transition-all"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xl font-bold text-white w-8 text-center">{state.externalSystems}</span>
            <button
              onClick={() => updateState({ externalSystems: Math.min(10, state.externalSystems + 1) })}
              className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] flex items-center justify-center text-white/50 hover:text-white transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="relative h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500/60 to-blue-500"
            animate={{ width: `${(state.externalSystems / 10) * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-white/60">0</span>
          <span className="text-[10px] text-white/60">10</span>
        </div>
      </div>
    </div>
  );
}
