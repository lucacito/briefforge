'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { RateConfig, DEFAULT_RATE_CONFIG } from '@/types/rateConfig';
import { saveDefaultRate } from '@/lib/storage';

const CURRENCIES: { value: RateConfig['currency']; label: string }[] = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD (CA$)' },
  { value: 'AUD', label: 'AUD (A$)' },
];

const OVERHEAD_MODELS: { value: RateConfig['overheadModel']; label: string; desc: string }[] = [
  { value: 'solo', label: 'Solo / Freelance', desc: '1.10×' },
  { value: 'small-agency', label: 'Small Agency', desc: '1.25×' },
  { value: 'agency', label: 'Agency', desc: '1.40×' },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [local, setLocal] = useState<RateConfig>(DEFAULT_RATE_CONFIG);

  const handleGetStarted = () => {
    saveDefaultRate(local);
    onComplete();
  };

  const handleSkip = () => {
    saveDefaultRate(DEFAULT_RATE_CONFIG);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <img src="/flyscope-favicon.png" alt="FlyScope" className="w-8 h-8 rounded-lg" />
          <div>
            <div className="font-bold text-white tracking-tight text-sm">FlyScope</div>
            <div className="text-[10px] text-white/55 -mt-0.5">Project Scoping Tool</div>
          </div>
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight mb-1">Set up your rate</h1>
        <p className="text-sm text-white/55 mb-7 leading-relaxed">
          These defaults are used to calculate pricing estimates. You can change them per-project at any time.
        </p>

        <div className="space-y-5">
          {/* Hourly Rate */}
          <div>
            <label className="text-[10px] text-white/55 uppercase tracking-wider font-medium mb-2 block">
              Hourly Rate
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={10}
                max={1000}
                step={5}
                value={local.hourlyRate}
                onChange={e => setLocal(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                className="flex-1 bg-white/[0.06] border border-white/[0.10] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-white/[0.28] transition-colors"
              />
              <span className="text-xs text-white/50">/hr</span>
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="text-[10px] text-white/55 uppercase tracking-wider font-medium mb-2 block">
              Currency
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {CURRENCIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => setLocal(prev => ({ ...prev, currency: c.value }))}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all border ${
                    local.currency === c.value
                      ? 'bg-white/[0.14] border-white/[0.35] text-white'
                      : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:bg-white/[0.08] hover:text-white/80'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hours per Week */}
          <div>
            <label className="text-[10px] text-white/55 uppercase tracking-wider font-medium mb-2 block">
              Hours / Week <span className="text-white/30 normal-case ml-1">for timeline math</span>
            </label>
            <input
              type="number"
              min={10}
              max={60}
              step={5}
              value={local.hoursPerWeek}
              onChange={e => setLocal(prev => ({ ...prev, hoursPerWeek: Number(e.target.value) }))}
              className="w-full bg-white/[0.06] border border-white/[0.10] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-white/[0.28] transition-colors"
            />
          </div>

          {/* Overhead Model */}
          <div>
            <label className="text-[10px] text-white/55 uppercase tracking-wider font-medium mb-2 block">
              Overhead Model
            </label>
            <div className="space-y-1.5">
              {OVERHEAD_MODELS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setLocal(prev => ({ ...prev, overheadModel: m.value }))}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all border ${
                    local.overheadModel === m.value
                      ? 'bg-white/[0.10] border-white/[0.28]'
                      : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="text-xs font-medium text-white/85">{m.label}</span>
                  <span className="text-[10px] text-white/45 font-mono">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-7 space-y-3">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGetStarted}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#7F2020] hover:bg-[#9B3030] text-[#F6F3EB] font-semibold text-sm shadow-lg shadow-[#7F2020]/25 transition-all duration-200"
          >
            Get started
            <ArrowRight className="w-4 h-4" />
          </motion.button>
          <button
            onClick={handleSkip}
            className="w-full py-2 text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            Skip for now — I'll set this up later
          </button>
        </div>
      </motion.div>
    </div>
  );
}
