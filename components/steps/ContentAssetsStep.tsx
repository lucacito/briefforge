'use client';

import { motion } from 'framer-motion';
import { useProject } from '@/lib/context';
import { ContentReadiness, CopywritingLevel, ImageAssets, BrandingLevel, MigrationLevel } from '@/types/project';

interface OptionGroupProps<T extends string> {
  label: string;
  description?: string;
  options: { value: T; label: string; sub?: string }[];
  value: T;
  onChange: (v: T) => void;
}

function OptionGroup<T extends string>({ label, description, options, value, onChange }: OptionGroupProps<T>) {
  return (
    <div>
      <div className="mb-3">
        <div className="text-sm font-semibold text-white/75">{label}</div>
        {description && <div className="text-xs text-white/65 mt-0.5">{description}</div>}
      </div>
      <div className="flex gap-2 flex-wrap">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl border text-left transition-all duration-150 ${
              value === opt.value
                ? 'bg-violet-500/15 border-violet-500/45 text-white'
                : 'bg-white/[0.03] border-white/[0.07] text-white/50 hover:bg-white/[0.06] hover:text-white/70 hover:border-white/[0.14]'
            }`}
          >
            <div className="text-xs font-medium">{opt.label}</div>
            {opt.sub && <div className="text-[10px] text-white/65 mt-0.5 leading-tight">{opt.sub}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({ label, description, value, onChange }: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-white/[0.05] last:border-0">
      <div>
        <div className="text-sm text-white/70 font-medium">{label}</div>
        {description && <div className="text-xs text-white/65 mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5.5 rounded-full transition-all duration-200 flex-shrink-0 ml-4 ${
          value ? 'bg-violet-500' : 'bg-white/[0.1]'
        }`}
        style={{ height: 22, width: 40 }}
      >
        <motion.div
          className="absolute top-0.5 bottom-0.5 w-4 rounded-full bg-white shadow-sm"
          animate={{ left: value ? 'calc(100% - 18px)' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          style={{ width: 18 }}
        />
      </button>
    </div>
  );
}

export function ContentAssetsStep() {
  const { state, updateState } = useProject();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Content & Assets</h2>
        <p className="text-white/65 text-sm">The state of your content and assets dramatically impacts scope, cost, and risk.</p>
      </div>

      <div className="space-y-5 bg-white/[0.02] rounded-2xl p-6 border border-white/[0.07]">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <OptionGroup<ContentReadiness>
            label="Content Readiness"
            description="How much of the written content is prepared?"
            value={state.contentReadiness}
            onChange={v => updateState({ contentReadiness: v })}
            options={[
              { value: 'ready', label: 'Content Ready', sub: 'All copy provided' },
              { value: 'partial', label: 'Partial', sub: 'Some pages ready' },
              { value: 'none', label: 'No Content', sub: 'Starting from scratch' },
            ]}
          />
        </motion.div>

        <div className="w-full h-px bg-white/[0.05]" />

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <OptionGroup<CopywritingLevel>
            label="Copywriting Needed"
            description="Will the project require writing or editing?'"
            value={state.copywriting}
            onChange={v => updateState({ copywriting: v })}
            options={[
              { value: 'none', label: 'None', sub: 'Content is final' },
              { value: 'light', label: 'Light Edits', sub: 'Minor polish' },
              { value: 'full', label: 'Full Copy', sub: 'Write everything' },
            ]}
          />
        </motion.div>

        <div className="w-full h-px bg-white/[0.05]" />

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <OptionGroup<ImageAssets>
            label="Image Assets"
            description="What's the status of photography, illustrations, and graphics?"
            value={state.imageAssets}
            onChange={v => updateState({ imageAssets: v })}
            options={[
              { value: 'provided', label: 'All Provided', sub: 'Assets ready' },
              { value: 'partial', label: 'Partial', sub: 'Some missing' },
              { value: 'stock', label: 'Stock Needed', sub: 'Source stock' },
              { value: 'full-art', label: 'Full Art Direction', sub: 'Custom creation' },
            ]}
          />
        </motion.div>

        <div className="w-full h-px bg-white/[0.05]" />

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <OptionGroup<BrandingLevel>
            label="Branding"
            description="How developed is the brand identity?"
            value={state.branding}
            onChange={v => updateState({ branding: v })}
            options={[
              { value: 'existing', label: 'Existing Brand', sub: 'Guidelines ready' },
              { value: 'partial', label: 'Partial Brand', sub: 'Some elements' },
              { value: 'full', label: 'Full Branding', sub: 'Create from scratch' },
            ]}
          />
        </motion.div>

        <div className="w-full h-px bg-white/[0.05]" />

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <OptionGroup<MigrationLevel>
            label="Content Migration"
            description="Is existing content being migrated from another platform?"
            value={state.migration}
            onChange={v => updateState({ migration: v })}
            options={[
              { value: 'none', label: 'No Migration', sub: 'Fresh start' },
              { value: 'simple', label: 'Simple', sub: 'A few pages' },
              { value: 'full', label: 'Full Migration', sub: 'Entire site/store' },
            ]}
          />
        </motion.div>
      </div>

      <div className="bg-white/[0.02] rounded-2xl border border-white/[0.07] px-6 pt-2 pb-1">
        <Toggle
          label="SEO Migration Required"
          description="Preserve URL structures, redirects, and search rankings during migration"
          value={state.seoMigration}
          onChange={v => updateState({ seoMigration: v })}
        />
      </div>
    </div>
  );
}
