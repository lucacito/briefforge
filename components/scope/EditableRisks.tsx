'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, EyeOff, Eye, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { EditableRisk } from '@/types/project';

const SEVERITY_COLORS: Record<string, string> = {
  low: '#586851',
  medium: '#656656',
  high: '#9B3030',
  critical: '#7F2020',
};

// ── Risk edit modal ───────────────────────────────────────────────────────────

function RiskModal({ risk, onSave, onClose }: {
  risk: EditableRisk;
  onSave: (updated: EditableRisk) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState({ ...risk });

  const field = (key: keyof EditableRisk, label: string, multiline = false) => (
    <div>
      <label className="text-[10px] text-white/50 uppercase tracking-wider mb-1.5 block">{label}</label>
      {multiline ? (
        <textarea
          value={draft[key] as string}
          onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
          rows={3}
          className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-3 py-2 text-sm text-white resize-none outline-none focus:border-white/[0.28] transition-colors"
        />
      ) : (
        <input
          type="text"
          value={draft[key] as string}
          onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
          className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/[0.28] transition-colors"
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-[#130c0a] border border-white/[0.12] rounded-2xl p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Edit Risk</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 text-xs transition-colors">✕</button>
        </div>

        {field('clientLabel', 'Client-facing label')}
        {field('description', 'Description', true)}
        {field('mitigation', 'Mitigation', true)}

        <div>
          <label className="text-[10px] text-white/50 uppercase tracking-wider mb-1.5 block">Severity</label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high', 'critical'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setDraft(d => ({ ...d, severity: sev }))}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border ${
                  draft.severity === sev
                    ? 'bg-white/[0.12] border-white/[0.35] text-white'
                    : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:bg-white/[0.06]'
                }`}
                style={draft.severity === sev ? { color: SEVERITY_COLORS[sev] } : {}}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onSave(draft)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold bg-[#7F2020] hover:bg-[#9B3030] text-[#F6F3EB] transition-colors"
          >
            Save changes
          </button>
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white/70 transition-colors">
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Sortable risk row ─────────────────────────────────────────────────────────

function SortableRiskRow({ risk, onEdit, onHide, onDelete }: {
  risk: EditableRisk;
  onEdit: (updated: EditableRisk) => void;
  onHide: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: risk.id });
  const [editing, setEditing] = useState(false);

  const color = SEVERITY_COLORS[risk.severity] ?? '#656656';

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <div ref={setNodeRef} style={style} className="flex items-start gap-2 group py-2">
        <button {...attributes} {...listeners}
          className="flex-shrink-0 mt-1 text-white/20 hover:text-white/50 cursor-grab active:cursor-grabbing transition-colors touch-none">
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color }} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-white/80">{risk.clientLabel}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded capitalize font-medium"
              style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}30` }}>
              {risk.severity}
            </span>
            {risk.source === 'user' && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#656656]/20 text-[#9a9880] border border-[#656656]/25">
                added
              </span>
            )}
          </div>
          <p className="text-xs text-white/50 leading-relaxed">{risk.description}</p>
          <p className="text-xs text-white/40 italic mt-0.5">
            <span className="not-italic text-white/50 font-medium">Mitigation:</span> {risk.mitigation}
          </p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1">
          <button onClick={() => setEditing(true)}
            className="w-6 h-6 flex items-center justify-center rounded text-white/30 hover:text-white/65 hover:bg-white/[0.07] transition-all">
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={() => risk.source === 'user' ? onDelete(risk.id) : onHide(risk.id)}
            className="w-6 h-6 flex items-center justify-center rounded text-white/30 hover:text-[#9B3030] hover:bg-[#7F2020]/10 transition-all"
            title={risk.source === 'user' ? 'Remove' : 'Hide'}
          >
            {risk.source === 'user' ? <Trash2 className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {editing && (
          <RiskModal
            risk={risk}
            onSave={updated => { onEdit(updated); setEditing(false); }}
            onClose={() => setEditing(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Add risk ──────────────────────────────────────────────────────────────────

function AddRiskRow({ onAdd }: { onAdd: (risk: EditableRisk) => void }) {
  const [open, setOpen] = useState(false);
  const blank: EditableRisk = {
    id: '', label: '', clientLabel: '', description: '', mitigation: '',
    severity: 'medium', source: 'user',
  };

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 mt-2 text-xs text-white/35 hover:text-white/60 transition-colors">
          <Plus className="w-3 h-3" /> Add risk
        </button>
      )}
      <AnimatePresence>
        {open && (
          <RiskModal
            risk={blank}
            onSave={draft => {
              onAdd({ ...draft, id: `user_risk_${Date.now()}`, source: 'user' });
              setOpen(false);
            }}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── EditableRisks ─────────────────────────────────────────────────────────────

interface EditableRisksProps {
  risks: EditableRisk[];
  hiddenRisks: EditableRisk[];
  onReorder: (risks: EditableRisk[]) => void;
  onEdit: (updated: EditableRisk) => void;
  onHide: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (risk: EditableRisk) => void;
  onRestore: (id: string) => void;
}

export function EditableRisks({
  risks, hiddenRisks, onReorder, onEdit, onHide, onDelete, onAdd, onRestore,
}: EditableRisksProps) {
  const [showHidden, setShowHidden] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = risks.findIndex(r => r.id === active.id);
      const newIndex = risks.findIndex(r => r.id === over.id);
      onReorder(arrayMove(risks, oldIndex, newIndex));
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-white/65 uppercase tracking-widest">Risk Flags</h3>
        <span className="text-[10px] text-white/30">{risks.length} item{risks.length !== 1 ? 's' : ''}</span>
      </div>

      {risks.length === 0 && (
        <p className="text-xs text-white/35 italic mb-2">No risks flagged.</p>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={risks.map(r => r.id)} strategy={verticalListSortingStrategy}>
          <div className="divide-y divide-white/[0.04]">
            {risks.map(risk => (
              <SortableRiskRow
                key={risk.id}
                risk={risk}
                onEdit={onEdit}
                onHide={onHide}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <AddRiskRow onAdd={onAdd} />

      {hiddenRisks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/[0.04]">
          <button onClick={() => setShowHidden(v => !v)}
            className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white/50 transition-colors">
            <Eye className="w-3 h-3" />
            {showHidden ? 'Hide' : `Show ${hiddenRisks.length} hidden risk${hiddenRisks.length !== 1 ? 's' : ''}`}
          </button>
          <AnimatePresence>
            {showHidden && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-1">
                  {hiddenRisks.map(risk => (
                    <div key={risk.id} className="flex items-center gap-2 py-1 opacity-40">
                      <span className="flex-1 text-xs text-white/50 line-through">{risk.clientLabel}</span>
                      <button onClick={() => onRestore(risk.id)}
                        className="text-[10px] text-white/40 hover:text-white/70 underline transition-colors flex-shrink-0">
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
