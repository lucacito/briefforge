'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, EyeOff, Eye, Trash2, Plus, Check, X } from 'lucide-react';
import { ScopeItem } from '@/types/project';

// ── Inline text editor ────────────────────────────────────────────────────────

function InlineEditor({ initial, onSave, onCancel }: {
  initial: string;
  onSave: (text: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (value.trim()) onSave(value.trim()); }
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className="flex-1 flex flex-col gap-1.5">
      <textarea
        ref={ref}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        className="w-full bg-white/[0.06] border border-white/[0.20] rounded-lg px-3 py-2 text-sm text-white resize-none outline-none focus:border-white/[0.35] transition-colors"
      />
      <div className="flex gap-1.5">
        <button onClick={() => value.trim() && onSave(value.trim())}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[#586851]/30 hover:bg-[#586851]/50 text-[#9BC48A] border border-[#586851]/40 transition-colors">
          <Check className="w-3 h-3" /> Save
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-white/40 hover:text-white/60 transition-colors">
          <X className="w-3 h-3" /> Cancel
        </button>
      </div>
    </div>
  );
}

// ── Sortable row ──────────────────────────────────────────────────────────────

function SortableRow({ item, onEdit, onHide, onDelete }: {
  item: ScopeItem;
  onEdit: (id: string, text: string) => void;
  onHide: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const [editing, setEditing] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2 group py-1.5">
      <button {...attributes} {...listeners}
        className="flex-shrink-0 mt-1 text-white/20 hover:text-white/50 cursor-grab active:cursor-grabbing transition-colors touch-none">
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      {editing ? (
        <InlineEditor
          initial={item.text}
          onSave={text => { onEdit(item.id, text); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <span className="flex-1 text-sm text-white/70 leading-relaxed">{item.text}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            {item.source === 'user' && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#656656]/20 text-[#9a9880] border border-[#656656]/25">
                added
              </span>
            )}
            {item.source === 'user' && (
              <button onClick={() => setEditing(true)}
                className="w-6 h-6 flex items-center justify-center rounded text-white/30 hover:text-white/65 hover:bg-white/[0.07] transition-all">
                <Pencil className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => item.source === 'user' ? onDelete(item.id) : onHide(item.id)}
              className="w-6 h-6 flex items-center justify-center rounded text-white/30 hover:text-[#9B3030] hover:bg-[#7F2020]/10 transition-all"
              title={item.source === 'user' ? 'Remove' : 'Hide from export'}
            >
              {item.source === 'user' ? <Trash2 className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Add-item row ──────────────────────────────────────────────────────────────

function AddItemRow({ onAdd }: { onAdd: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (open) ref.current?.focus(); }, [open]);

  const submit = () => {
    if (text.trim()) { onAdd(text.trim()); setText(''); setOpen(false); }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 mt-2 text-xs text-white/35 hover:text-white/60 transition-colors">
        <Plus className="w-3 h-3" /> Add item
      </button>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <textarea
        ref={ref}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
          if (e.key === 'Escape') { setOpen(false); setText(''); }
        }}
        placeholder="Type and press Enter to add..."
        rows={2}
        className="w-full bg-white/[0.05] border border-white/[0.14] rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 resize-none outline-none focus:border-white/[0.28] transition-colors"
      />
      <div className="flex gap-1.5">
        <button onClick={submit}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[#586851]/30 hover:bg-[#586851]/50 text-[#9BC48A] border border-[#586851]/40 transition-colors">
          <Plus className="w-3 h-3" /> Add
        </button>
        <button onClick={() => { setOpen(false); setText(''); }}
          className="px-2.5 py-1 rounded-lg text-xs text-white/40 hover:text-white/60 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── EditableSection ───────────────────────────────────────────────────────────

interface EditableSectionProps {
  title: string;
  items: ScopeItem[];
  hiddenItems: ScopeItem[];
  onReorder: (items: ScopeItem[]) => void;
  onEdit: (id: string, text: string) => void;
  onHide: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (text: string) => void;
  onRestore: (id: string) => void;
}

export function EditableSection({
  title, items, hiddenItems, onReorder, onEdit, onHide, onDelete, onAdd, onRestore,
}: EditableSectionProps) {
  const [showHidden, setShowHidden] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-white/65 uppercase tracking-widest">{title}</h3>
        <span className="text-[10px] text-white/30">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="divide-y divide-white/[0.04]">
            {items.map(item => (
              <SortableRow
                key={item.id}
                item={item}
                onEdit={onEdit}
                onHide={onHide}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <AddItemRow onAdd={onAdd} />

      {hiddenItems.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/[0.04]">
          <button onClick={() => setShowHidden(v => !v)}
            className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white/50 transition-colors">
            <Eye className="w-3 h-3" />
            {showHidden ? 'Hide' : `Show ${hiddenItems.length} hidden item${hiddenItems.length !== 1 ? 's' : ''}`}
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
                  {hiddenItems.map(item => (
                    <div key={item.id} className="flex items-start gap-2 py-1 opacity-40">
                      <span className="flex-1 text-xs text-white/50 line-through leading-relaxed">{item.text}</span>
                      <button onClick={() => onRestore(item.id)}
                        className="flex-shrink-0 text-[10px] text-white/40 hover:text-white/70 underline transition-colors">
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
