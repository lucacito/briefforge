'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, Menu } from 'lucide-react';
import { useProject } from '@/lib/context';
import { Toast } from '@/components/Toast';
import { Sidebar } from '@/components/Sidebar';
import { SummaryPanel } from '@/components/SummaryPanel';
import { formatPrice } from '@/lib/pricingEngine';
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

const SUMMARY_KEY = 'flyscope_summary_open';

const EASE_OUT: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const EASE_IN: [number, number, number, number] = [0.4, 0, 1, 1];

interface WizardShellProps {
  onDashboard: () => void;
}

export function WizardShell({ onDashboard }: WizardShellProps) {
  const { state, scores, goToStep, showFirstSaveBanner, dismissFirstSaveBanner } = useProject();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Restore summary open state from localStorage after hydration
  useEffect(() => {
    try {
      if (localStorage.getItem(SUMMARY_KEY) === 'true') setSummaryOpen(true);
    } catch {}
    setHydrated(true);
  }, []);

  // Persist summary open state
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(SUMMARY_KEY, String(summaryOpen)); } catch {}
  }, [summaryOpen, hydrated]);

  // Mobile detection
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const closeSummary = useCallback(() => setSummaryOpen(false), []);
  const closeNav = useCallback(() => setNavOpen(false), []);

  // Esc closes whichever panel is open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (summaryOpen) setSummaryOpen(false);
      else if (navOpen) setNavOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [summaryOpen, navOpen]);

  const currentStep = Math.min(state.currentStep, STEPS.length - 1);
  const StepComponent = STEPS[currentStep].component;
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;

  const priceLabel = state.projectType && scores.pricing.realistic > 0
    ? formatPrice(scores.pricing.realistic, state.rateConfig.currency)
    : null;
  const hasOverride = state.pricingOverride.realistic !== null;

  // Slide variants — computed once per render, direction determined by isMobile
  const panelVariants = isMobile
    ? {
        hidden: { y: '100%' },
        visible: { y: 0, transition: { duration: 0.24, ease: EASE_OUT } },
        exit:   { y: '100%', transition: { duration: 0.18, ease: EASE_IN } },
      }
    : {
        hidden: { x: '100%' },
        visible: { x: 0, transition: { duration: 0.24, ease: EASE_OUT } },
        exit:   { x: '100%', transition: { duration: 0.18, ease: EASE_IN } },
      };

  const navVariants = {
    hidden: { x: '-100%' },
    visible: { x: 0, transition: { duration: 0.24, ease: EASE_OUT } },
    exit:   { x: '-100%', transition: { duration: 0.18, ease: EASE_IN } },
  };

  return (
    <div className="flex h-screen bg-bg-main overflow-hidden">
      {/* Left sidebar — hidden on mobile */}
      <div className="hidden md:flex w-56 flex-shrink-0 flex-col border-r border-white/[0.06]">
        <Sidebar onDashboard={onDashboard} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Step header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setNavOpen(true)}
              className="md:hidden w-8 h-8 flex items-center justify-center text-white/60 hover:text-white/80 transition-colors"
              aria-label="Open navigation"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="text-xs text-white/60 uppercase tracking-widest font-medium">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span className="text-white/20 hidden sm:inline" aria-hidden="true">·</span>
            <span className="text-xs text-white/65 font-medium hidden sm:inline">{STEPS[currentStep].label}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Summary toggle */}
            <button
              onClick={() => setSummaryOpen(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all duration-150 ${
                summaryOpen
                  ? 'bg-white/[0.12] border-white/[0.30] text-white'
                  : 'bg-white/[0.05] border-white/[0.10] text-white/60 hover:text-white/80 hover:bg-white/[0.08]'
              }`}
            >
              {hasOverride && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#656656] flex-shrink-0" />
              )}
              {priceLabel ? <>{priceLabel} · Summary</> : 'Summary'}
            </button>

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
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs bg-white/[0.12] hover:bg-white/[0.20] text-white border border-white/[0.30] hover:border-white/[0.50] font-medium transition-all duration-150"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            {isLast && (
              <button
                onClick={onDashboard}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs bg-[#586851] hover:bg-[#657A5D] text-[#F6F3EB] border border-[#586851] hover:border-[#6B7A60] font-semibold transition-all duration-150"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Finish — Back to Projects
              </button>
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
                  ? 'w-6 h-1.5 bg-[#656656]'
                  : i < currentStep
                  ? 'w-1.5 h-1.5 bg-white/30'
                  : 'w-1.5 h-1.5 bg-white/10 hover:bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Summary drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {summaryOpen && (
          <>
            <motion.div
              key="summary-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={closeSummary}
              className={`fixed inset-0 z-40 ${isMobile ? 'bg-black/60' : 'bg-black/30'}`}
            />
            <motion.div
              key="summary-panel"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`fixed z-50 flex flex-col bg-bg-panel border-white/[0.06] overflow-hidden ${
                isMobile
                  ? 'bottom-0 left-0 right-0 rounded-t-2xl border-t max-h-[85vh]'
                  : 'top-0 right-0 bottom-0 w-[380px] border-l'
              }`}
            >
              <SummaryPanel onClose={closeSummary} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile nav drawer ──────────────────────────────────────── */}
      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div
              key="nav-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={closeNav}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
            />
            <motion.div
              key="nav-panel"
              variants={navVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col md:hidden"
            >
              <Sidebar onDashboard={() => { closeNav(); onDashboard(); }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* First-save banner */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {showFirstSaveBanner && (
            <Toast
              message="Project saved — find it on the dashboard anytime."
              onDismiss={dismissFirstSaveBanner}
              duration={6000}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
