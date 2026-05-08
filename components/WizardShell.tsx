'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProject } from '@/lib/context';
import { Sidebar } from '@/components/Sidebar';
import { SummaryPanel } from '@/components/SummaryPanel';
import { ProjectTypeStep } from '@/components/steps/ProjectTypeStep';
import { FeaturesStep } from '@/components/steps/FeaturesStep';
import { ContentAssetsStep } from '@/components/steps/ContentAssetsStep';
import { IntegrationsStep } from '@/components/steps/IntegrationsStep';
import { TeamWorkflowStep } from '@/components/steps/TeamWorkflowStep';
import { ConstraintsStep } from '@/components/steps/ConstraintsStep';
import { PricingTimelineStep } from '@/components/steps/PricingTimelineStep';
import { ScopeSummaryStep } from '@/components/steps/ScopeSummaryStep';

const STEPS = [
  { component: ProjectTypeStep, label: 'Project Type' },
  { component: FeaturesStep, label: 'Core Features' },
  { component: ContentAssetsStep, label: 'Content & Assets' },
  { component: IntegrationsStep, label: 'Integrations' },
  { component: TeamWorkflowStep, label: 'Team & Workflow' },
  { component: ConstraintsStep, label: 'Constraints' },
  { component: PricingTimelineStep, label: 'Pricing & Timeline' },
  { component: ScopeSummaryStep, label: 'Scope Summary' },
];

interface WizardShellProps {
  onDashboard: () => void;
}

export function WizardShell({ onDashboard }: WizardShellProps) {
  const { state, goToStep } = useProject();
  const currentStep = Math.min(state.currentStep, STEPS.length - 1);
  const StepComponent = STEPS[currentStep].component;
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;

  return (
    <div className="flex h-screen bg-[#080810] overflow-hidden">
      {/* Left sidebar */}
      <div className="w-56 flex-shrink-0 flex flex-col border-r border-white/[0.06]">
        <Sidebar onDashboard={onDashboard} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Step header */}
        <div className="flex-shrink-0 flex items-center justify-between px-8 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/60 uppercase tracking-widest font-medium">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span className="text-white/20" aria-hidden="true">·</span>
            <span className="text-xs text-white/65 font-medium">{STEPS[currentStep].label}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToStep(currentStep - 1)}
              disabled={isFirst}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white/80 hover:bg-white/[0.06] disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>
            {!isLast && (
              <button
                onClick={() => goToStep(currentStep + 1)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 hover:border-violet-500/50 font-medium transition-all duration-150"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            {isLast && (
              <span className="text-xs text-emerald-400/60 font-medium px-3 py-1.5">
                ✓ Scope Complete
              </span>
            )}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
              >
                <StepComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Step indicator dots */}
        <div className="flex-shrink-0 flex items-center justify-center gap-2 py-4 border-t border-white/[0.04]">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => goToStep(i)}
              className={`rounded-full transition-all duration-200 ${
                i === currentStep
                  ? 'w-6 h-1.5 bg-violet-400'
                  : i < currentStep
                  ? 'w-1.5 h-1.5 bg-white/30'
                  : 'w-1.5 h-1.5 bg-white/10 hover:bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col border-l border-white/[0.06]">
        <SummaryPanel />
      </div>
    </div>
  );
}
