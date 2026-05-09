'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RotateCcw, FileText, Sun, Moon, Settings } from 'lucide-react';
import { useProject } from '@/lib/context';
import { useTheme } from '@/lib/themeContext';
import { RateConfigModal } from '@/components/RateConfigModal';

const STEPS = [
  { label: 'Project Type', description: 'What are we building?' },
  { label: 'Core Features', description: 'What does it do?' },
  { label: 'Content & Assets', description: 'What do we have?' },
  { label: 'Integrations', description: 'What connects to it?' },
  { label: 'Team & Workflow', description: 'Who\'s involved?' },
  { label: 'Constraints', description: 'What limits us?' },
  { label: 'Pricing & Timeline', description: 'What does it cost?' },
  { label: 'Scope Summary', description: 'The full picture' },
];

interface SidebarProps {
  onDashboard: () => void;
}

export function Sidebar({ onDashboard }: SidebarProps) {
  const { state, scores, goToStep, resetProject, updateState } = useProject();
  const { theme, toggleTheme } = useTheme();
  const [resetConfirm, setResetConfirm] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDone = (i: number) => state.visitedSteps.includes(i) || i < state.currentStep;
  const doneCount = STEPS.filter((_, i) => isDone(i)).length;
  const progress = Math.round((doneCount / STEPS.length) * 100);

  const handleReset = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      resetTimerRef.current = setTimeout(() => setResetConfirm(false), 2500);
    } else {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetProject();
      setResetConfirm(false);
    }
  };

  return (
    <>
      <aside className="flex flex-col h-full bg-bg-panel border-r border-white/[0.06]">
        {/* Logo */}
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <button onClick={onDashboard} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#7F2020] flex items-center justify-center shadow-lg shadow-[#7F2020]/30 flex-shrink-0">
              <FileText className="w-4 h-4 text-[#F6F3EB]" />
            </div>
            <span className="font-semibold text-white text-sm tracking-tight">FlyScope</span>
          </button>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowRateModal(true)}
              title="Rate configuration"
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] text-white/60 hover:text-white/80 transition-all duration-200 flex-shrink-0"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] text-white/60 hover:text-white/80 transition-all duration-200 flex-shrink-0"
            >
              {theme === 'dark'
                ? <Sun className="w-3.5 h-3.5" />
                : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/60 font-medium uppercase tracking-wider">Progress</span>
            <span className="text-xs font-semibold text-white/70">{progress}%</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#7F2020] to-[#586851] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <input
            type="text"
            value={state.name}
            onChange={e => updateState({ name: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
            className="mt-2 w-full text-xs text-white/75 bg-transparent border-none outline-none focus:text-white placeholder-white/30 transition-colors cursor-text"
            placeholder="Project name…"
          />
        </div>

        {/* Steps */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {STEPS.map((step, i) => {
            const done = isDone(i);
            const isActive = state.currentStep === i;

            return (
              <motion.button
                key={i}
                onClick={() => goToStep(i)}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl mb-1 text-left transition-all duration-200 group ${
                  isActive
                    ? 'bg-white/[0.12] border border-white/[0.35]'
                    : 'hover:bg-white/[0.04] border border-transparent'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${
                  done
                    ? 'bg-[#586851]/20 border border-[#586851]/40'
                    : isActive
                    ? 'bg-white/[0.20] border border-white/[0.45]'
                    : 'bg-white/[0.06] border border-white/[0.1]'
                }`}>
                  {done ? (
                    <Check className="w-3 h-3 text-[#586851]" />
                  ) : (
                    <span className={`text-[10px] font-bold ${isActive ? 'text-white' : 'text-white/70'}`}>
                      {i + 1}
                    </span>
                  )}
                </div>
                <div>
                  <div className={`text-xs font-medium leading-tight ${
                    isActive ? 'text-white' : done ? 'text-white/85' : 'text-white/70'
                  }`}>
                    {step.label}
                  </div>
                  <div className="text-[10px] text-white/55 mt-0.5 leading-tight">{step.description}</div>
                </div>
              </motion.button>
            );
          })}
        </nav>

        {/* Scope Health */}
        <div className="px-5 py-3 border-t border-white/[0.06]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Scope Health</span>
            <span className={`text-xs font-bold ${
              scores.scopeHealth >= 80 ? 'text-[#586851]' :
              scores.scopeHealth >= 60 ? 'text-[#656656]' : 'text-[#7F2020]'
            }`}>{scores.scopeHealth}%</span>
          </div>
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                scores.scopeHealth >= 80 ? 'bg-[#586851]' :
                scores.scopeHealth >= 60 ? 'bg-[#656656]' : 'bg-[#7F2020]'
              }`}
              animate={{ width: `${scores.scopeHealth}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-white/[0.06]">
          <button
            onClick={handleReset}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200 ${
              resetConfirm
                ? 'bg-[#7F2020]/15 border-[#7F2020]/40 text-[#9B3030]'
                : 'hover:bg-[#7F2020]/10 border-transparent hover:border-[#7F2020]/20 text-white/60 hover:text-[#9B3030]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <AnimatePresence mode="wait">
              <motion.span
                key={resetConfirm ? 'confirm' : 'idle'}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                {resetConfirm ? 'Click again to confirm' : 'Reset Project'}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {showRateModal && (
          <RateConfigModal
            rateConfig={state.rateConfig}
            onSave={rateConfig => updateState({ rateConfig })}
            onClose={() => setShowRateModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
