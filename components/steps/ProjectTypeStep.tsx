'use client';

import { motion } from 'framer-motion';
import {
  Globe, ShoppingCart, Users, BookOpen, Monitor,
  Rocket, RefreshCw, Store, Settings, Check
} from 'lucide-react';
import { useProject } from '@/lib/context';
import { PROJECT_TYPES } from '@/data/projectTypes';
import { ProjectTypeId } from '@/types/project';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe, ShoppingCart, Users, BookOpen, Monitor,
  Rocket, RefreshCw, Store, Settings,
};

const COMPLEXITY_COLORS: Record<string, string> = {
  Simple: '#586851',
  Moderate: '#656656',
  Complex: '#9B3030',
  Advanced: '#7F2020',
};

function getComplexityTier(score: number) {
  if (score < 25) return 'Simple';
  if (score < 45) return 'Moderate';
  if (score < 65) return 'Complex';
  return 'Advanced';
}

export function ProjectTypeStep() {
  const { state, updateState, goToStep } = useProject();

  const handleSelect = (id: ProjectTypeId) => {
    updateState({ projectType: id });
    setTimeout(() => goToStep(1), 300);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">What are we building?</h2>
        <p className="text-white/65 text-sm">Select the project type that best describes the engagement. This sets the baseline scope.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
        {PROJECT_TYPES.map((type, i) => {
          const Icon = ICONS[type.icon] ?? Globe;
          const isSelected = state.projectType === type.id;
          const tier = getComplexityTier(type.baseComplexity);
          const tierColor = COMPLEXITY_COLORS[tier];

          return (
            <motion.button
              key={type.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(type.id)}
              className={`relative text-left p-5 rounded-2xl border transition-all duration-200 group ${
                isSelected
                  ? 'bg-white/[0.12] border-white/[0.35] shadow-lg shadow-black/30'
                  : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.15]'
              }`}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#7F2020] flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}

              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-200 ${
                isSelected
                  ? 'bg-white/[0.16] border border-white/[0.35]'
                  : 'bg-white/[0.06] border border-white/[0.08] group-hover:border-white/[0.16]'
              }`}>
                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-white/70'}`} />
              </div>

              <div className={`text-sm font-semibold mb-1.5 ${isSelected ? 'text-white' : 'text-white/85'}`}>
                {type.label}
              </div>
              <div className="text-xs text-white/65 leading-snug mb-3">{type.description}</div>

              <div className="flex flex-wrap gap-1 mb-3">
                {type.highlights.map(h => (
                  <span key={h} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.10] text-white/85">
                    {h}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/60 uppercase tracking-wider">Complexity</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ color: tierColor, backgroundColor: `${tierColor}18` }}>
                  {tier}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
