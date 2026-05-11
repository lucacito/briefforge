'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProject } from '@/lib/context';
import { ExportPanel } from '@/components/ExportPanel';
import { PROJECT_TYPES } from '@/data/projectTypes';
import { formatPrice } from '@/lib/pricingEngine';
import { formatWeeks } from '@/lib/timelineEngine';
import { composeScope, generateExecSummary, stableId } from '@/lib/scopeComposer';
import { EditableSection } from '@/components/scope/EditableSection';
import { EditableRisks } from '@/components/scope/EditableRisks';
import { CustomLineItems } from '@/components/scope/CustomLineItems';
import {
  CheckCircle2, AlertTriangle, Clock, DollarSign, Shield,
  Pencil, RotateCcw, type LucideIcon,
} from 'lucide-react';
import {
  ScopeItem, EditableRisk, CustomLineItem, ScopeEdits,
} from '@/types/project';

// ── Helpers ───────────────────────────────────────────────────────────────────

function patchEdits(prev: ScopeEdits, patch: Partial<ScopeEdits>): ScopeEdits {
  return { ...prev, ...patch };
}

type ListKey = 'deliverables' | 'assumptions' | 'exclusions' | 'nextSteps';

// ── Executive summary block ───────────────────────────────────────────────────

function ExecSummaryBlock({ text, isOverride, onEdit, onReset }: {
  text: string;
  isOverride: boolean;
  onEdit: (text: string) => void;
  onReset: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);

  if (editing) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.12] rounded-2xl p-5 space-y-3">
        <textarea
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={5}
          className="w-full bg-white/[0.05] border border-white/[0.14] rounded-lg px-3 py-2.5 text-sm text-white/80 leading-relaxed resize-none outline-none focus:border-white/[0.28] transition-colors"
        />
        <div className="flex gap-2">
          <button
            onClick={() => { onEdit(draft); setEditing(false); }}
            className="px-3 py-1.5 rounded-lg text-xs bg-[#586851]/30 hover:bg-[#586851]/50 text-[#9BC48A] border border-[#586851]/40 transition-colors"
          >
            Save
          </button>
          <button onClick={() => setEditing(false)}
            className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/60 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-xs font-semibold text-white/65 uppercase tracking-widest">Executive Summary</h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isOverride && (
            <button onClick={onReset}
              className="flex items-center gap-1 text-[10px] text-white/35 hover:text-white/60 transition-colors">
              <RotateCcw className="w-3 h-3" /> Reset to generated
            </button>
          )}
          <button
            onClick={() => { setDraft(text); setEditing(true); }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-white/40 hover:text-white/65 hover:bg-white/[0.06] transition-all"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
        </div>
      </div>
      <p className="text-sm text-white/60 leading-relaxed">{text}</p>
    </div>
  );
}

// ── Main step ─────────────────────────────────────────────────────────────────

export function ScopeSummaryStep() {
  const { state, scores, updateState } = useProject();
  const projectType = PROJECT_TYPES.find(pt => pt.id === state.projectType);
  const currency = state.rateConfig.currency;

  const composed = composeScope(state, scores);

  // Helpers to update scopeEdits
  const patchScopeEdits = useCallback((patch: Partial<ScopeEdits>) => {
    updateState({ scopeEdits: patchEdits(state.scopeEdits, patch) });
  }, [state.scopeEdits, updateState]);

  // ── Generic section handlers ────────────────────────────────────────────────

  const makeHandlers = (key: ListKey) => {
    const getEdits = (): ScopeItem[] => state.scopeEdits[key];

    // On first reorder/mutation, snapshot the full composed list into scopeEdits
    const snapshot = (currentComposed: ScopeItem[]): ScopeItem[] => {
      const edits = getEdits();
      if (edits.length === 0) return currentComposed;
      return edits;
    };

    return {
      onReorder: (reordered: ScopeItem[]) => {
        patchScopeEdits({ [key]: reordered });
      },
      onEdit: (id: string, text: string) => {
        const list = snapshot(composed[key]);
        patchScopeEdits({ [key]: list.map(i => i.id === id ? { ...i, text } : i) });
      },
      onHide: (id: string) => {
        const edits = getEdits();
        const existing = edits.find(i => i.id === id);
        if (existing) {
          patchScopeEdits({ [key]: edits.map(i => i.id === id ? { ...i, hidden: true } : i) });
        } else {
          // First time hiding a generated item — add a hidden entry
          patchScopeEdits({ [key]: [...edits, { id, text: '', source: 'generated' as const, hidden: true }] });
        }
      },
      onDelete: (id: string) => {
        patchScopeEdits({ [key]: getEdits().filter(i => i.id !== id) });
      },
      onAdd: (text: string) => {
        const list = snapshot(composed[key]);
        const newItem: ScopeItem = { id: `user_${Date.now()}`, text, source: 'user' };
        patchScopeEdits({ [key]: [...list, newItem] });
      },
      onRestore: (id: string) => {
        patchScopeEdits({ [key]: getEdits().map(i => i.id === id ? { ...i, hidden: false } : i) });
      },
    };
  };

  const deliverableHandlers = makeHandlers('deliverables');
  const assumptionHandlers = makeHandlers('assumptions');
  const exclusionHandlers = makeHandlers('exclusions');
  const nextStepHandlers = makeHandlers('nextSteps');

  // ── Risk handlers ───────────────────────────────────────────────────────────

  const getRiskEdits = () => state.scopeEdits.risks;

  const snapshotRisks = (): EditableRisk[] => {
    const edits = getRiskEdits();
    return edits.length === 0 ? composed.risks : edits;
  };

  const riskHandlers = {
    onReorder: (reordered: EditableRisk[]) => patchScopeEdits({ risks: reordered }),
    onEdit: (updated: EditableRisk) => {
      const list = snapshotRisks();
      patchScopeEdits({ risks: list.map(r => r.id === updated.id ? { ...r, ...updated } : r) });
    },
    onHide: (id: string) => {
      const edits = getRiskEdits();
      const existing = edits.find(r => r.id === id);
      if (existing) {
        patchScopeEdits({ risks: edits.map(r => r.id === id ? { ...r, hidden: true } : r) });
      } else {
        const gen = composed.risks.find(r => r.id === id);
        if (gen) patchScopeEdits({ risks: [...edits, { ...gen, hidden: true }] });
      }
    },
    onDelete: (id: string) => patchScopeEdits({ risks: getRiskEdits().filter(r => r.id !== id) }),
    onAdd: (risk: EditableRisk) => {
      const list = snapshotRisks();
      patchScopeEdits({ risks: [...list, risk] });
    },
    onRestore: (id: string) => {
      patchScopeEdits({ risks: getRiskEdits().map(r => r.id === id ? { ...r, hidden: false } : r) });
    },
  };

  // Compute hidden items for each section
  const hiddenFor = (key: ListKey, allGenerated: ScopeItem[]): ScopeItem[] => {
    const edits = state.scopeEdits[key];
    return edits
      .filter(e => e.hidden)
      .map(e => allGenerated.find(g => g.id === e.id))
      .filter(Boolean) as ScopeItem[];
  };

  const hiddenRisks = state.scopeEdits.risks
    .filter(r => r.hidden)
    .map(r => composed.risks.find(g => g.id === r.id) ?? r)
    .filter(Boolean) as EditableRisk[];

  // For hiddenFor, we need the full generated list (before filtering hidden)
  const { composeScope: _cs, ..._ } = { composeScope };
  void _;
  // Just re-derive generated lists for hidden tracking
  const genDeliverables = composeScope({ ...state, scopeEdits: { ...state.scopeEdits, deliverables: [] } }, scores).deliverables;
  const genAssumptions = composeScope({ ...state, scopeEdits: { ...state.scopeEdits, assumptions: [] } }, scores).assumptions;
  const genExclusions = composeScope({ ...state, scopeEdits: { ...state.scopeEdits, exclusions: [] } }, scores).exclusions;
  const genNextSteps = composeScope({ ...state, scopeEdits: { ...state.scopeEdits, nextSteps: [] } }, scores).nextSteps;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Scope Summary</h2>
        <p className="text-white/65 text-sm">Review and edit every section before exporting. Edits are saved to this project.</p>
      </div>

      {/* Score bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Complexity', value: scores.complexityLabel, color: scores.complexityColor, icon: Shield as LucideIcon },
          { label: 'Risk Level', value: scores.riskLabel, color: scores.riskColor, icon: AlertTriangle as LucideIcon },
          { label: 'Scope Health', value: `${scores.scopeHealth}%`, color: scores.scopeHealth >= 70 ? '#586851' : '#656656', icon: CheckCircle2 as LucideIcon },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-3.5 text-center">
              <Icon className="w-4 h-4 mx-auto mb-2" style={{ color: stat.color }} />
              <div className="text-[10px] text-white/60 uppercase tracking-wider mb-1">{stat.label}</div>
              <div className="text-base font-bold" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Project Overview */}
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-white/65 uppercase tracking-widest mb-3">Project Overview</h3>
        <div className="space-y-3">
          {projectType && (
            <div>
              <span className="text-[10px] text-white/60 uppercase tracking-wider block mb-1">Type</span>
              <span className="text-sm font-semibold text-white">{projectType.label}</span>
              <span className="text-xs text-white/65 ml-2">— {projectType.description}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-white/60 uppercase tracking-wider block mb-1">Timeline</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#656656]/80" />
                <span className="text-sm font-semibold text-white">{formatWeeks(scores.timeline.total)}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-white/60 uppercase tracking-wider block mb-1">Budget Range</span>
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#586851]/80" />
                <span className="text-sm font-semibold text-white">
                  {formatPrice(scores.pricing.minimum, currency)} – {formatPrice(scores.pricing.premium, currency)}
                </span>
              </div>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-white/60 uppercase tracking-wider block mb-1">Recommended Quote</span>
            <span className="text-2xl font-black text-white">{formatPrice(scores.pricing.realistic, currency)}</span>
            {scores.pricing.pricingSource === 'override' && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-[#656656]/25 text-[#656656] font-medium">Custom</span>
            )}
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <ExecSummaryBlock
        text={composed.executiveSummary}
        isOverride={state.scopeEdits.executiveSummaryOverride !== null}
        onEdit={text => patchScopeEdits({ executiveSummaryOverride: text })}
        onReset={() => patchScopeEdits({ executiveSummaryOverride: null })}
      />

      {/* Deliverables */}
      <EditableSection
        title="Deliverables"
        items={composed.deliverables}
        hiddenItems={hiddenFor('deliverables', genDeliverables)}
        {...deliverableHandlers}
      />

      {/* Custom line items */}
      <CustomLineItems
        items={composed.customLineItems}
        onChange={items => patchScopeEdits({ customLineItems: items })}
      />

      {/* Assumptions */}
      <EditableSection
        title="Assumptions"
        items={composed.assumptions}
        hiddenItems={hiddenFor('assumptions', genAssumptions)}
        {...assumptionHandlers}
      />

      {/* Exclusions */}
      <EditableSection
        title="Exclusions"
        items={composed.exclusions}
        hiddenItems={hiddenFor('exclusions', genExclusions)}
        {...exclusionHandlers}
      />

      {/* Risks */}
      <EditableRisks
        risks={composed.risks}
        hiddenRisks={hiddenRisks}
        {...riskHandlers}
      />

      {/* Next Steps */}
      <EditableSection
        title="Next Steps"
        items={composed.nextSteps}
        hiddenItems={hiddenFor('nextSteps', genNextSteps)}
        {...nextStepHandlers}
      />

      {/* Timeline breakdown */}
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-white/65 uppercase tracking-widest mb-3">Timeline Breakdown</h3>
        <div className="space-y-2.5">
          {[
            { label: 'Discovery & Requirements', value: scores.timeline.discovery },
            { label: 'Design & UI/UX', value: scores.timeline.design },
            { label: 'Development & Build', value: scores.timeline.development },
            { label: 'QA & Testing', value: scores.timeline.qa },
            { label: 'Launch & Deployment', value: scores.timeline.launch },
          ].map(phase => (
            <div key={phase.label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
              <span className="text-sm text-white/55">{phase.label}</span>
              <span className="text-sm font-semibold text-white/70">{formatWeeks(phase.value)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between py-2 pt-3">
            <span className="text-sm font-semibold text-white/70">Total Estimate</span>
            <span className="text-base font-black text-white">{formatWeeks(scores.timeline.total)}</span>
          </div>
        </div>
      </div>

      {/* Scope Notes */}
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-white/65 uppercase tracking-widest">Additional Notes for Client</h3>
          <span className="text-[10px] text-white/30">
            {composed.scopeNotes.length > 0 ? `${composed.scopeNotes.length} chars` : 'appended to exports'}
          </span>
        </div>
        <textarea
          value={composed.scopeNotes}
          onChange={e => patchScopeEdits({ scopeNotes: e.target.value })}
          placeholder="Any context, caveats, or personal notes for the client that don't fit elsewhere..."
          rows={4}
          className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-3 text-sm text-white/70 placeholder-white/20 resize-none outline-none focus:border-white/[0.22] transition-colors leading-relaxed"
        />
        {composed.scopeNotes.length > 2000 && (
          <p className="text-[10px] text-[#9B3030] mt-1.5">
            {composed.scopeNotes.length} characters — consider trimming for cleaner exports.
          </p>
        )}
      </div>

      {/* Export */}
      <ExportPanel />
    </div>
  );
}
