'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { RateConfig } from '@/types/rateConfig';
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

interface RateConfigModalProps {
  rateConfig: RateConfig;
  onSave: (config: RateConfig) => void;
  onClose: () => void;
}

export function RateConfigModal({ rateConfig, onSave, onClose }: RateConfigModalProps) {
  const [local, setLocal] = useState<RateConfig>(rateConfig);
  const [savedDefault, setSavedDefault] = useState(false);

  const handleSaveDefault = () => {
    saveDefaultRate(local);
    setSavedDefault(true);
    setTimeout(() => setSavedDefault(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        className="relative bg-bg-panel border border-white/[0.12] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-white">Rate Configuration</h3>
            <p className="text-[10px] text-white/55 mt-0.5">Affects pricing estimates for this project</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Hourly Rate */}
          <div>
            <label className="text-[10px] text-white/60 uppercase tracking-wider font-medium mb-1.5 block">
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
                className="flex-1 bg-white/[0.06] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/[0.28] transition-colors"
              />
              <span className="text-xs text-white/55">/hr</span>
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="text-[10px] text-white/60 uppercase tracking-wider font-medium mb-1.5 block">
              Currency
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {CURRENCIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => setLocal(prev => ({ ...prev, currency: c.value }))}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    local.currency === c.value
                      ? 'bg-white/[0.14] border-white/[0.35] text-white'
                      : 'bg-white/[0.04] border-white/[0.08] text-white/65 hover:bg-white/[0.08] hover:text-white/85'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hours per Week */}
          <div>
            <label className="text-[10px] text-white/60 uppercase tracking-wider font-medium mb-1.5 block">
              Hours / Week <span className="text-white/35 normal-case ml-1">for timeline math</span>
            </label>
            <input
              type="number"
              min={10}
              max={60}
              step={5}
              value={local.hoursPerWeek}
              onChange={e => setLocal(prev => ({ ...prev, hoursPerWeek: Number(e.target.value) }))}
              className="w-full bg-white/[0.06] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/[0.28] transition-colors"
            />
          </div>

          {/* Overhead Model */}
          <div>
            <label className="text-[10px] text-white/60 uppercase tracking-wider font-medium mb-1.5 block">
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
                  <span className="text-[10px] text-white/50 font-mono">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={handleSaveDefault}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-white/[0.10] text-xs text-white/60 hover:text-white/80 hover:bg-white/[0.04] transition-all"
          >
            {savedDefault && <Check className="w-3 h-3 text-[#586851]" />}
            {savedDefault ? 'Saved as default' : 'Set as my default'}
          </button>
          <button
            onClick={() => { onSave(local); onClose(); }}
            className="flex-1 py-2 rounded-lg bg-[#7F2020]/20 border border-[#7F2020]/30 text-xs text-white font-medium hover:bg-[#7F2020]/30 transition-all"
          >
            Apply to project
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
