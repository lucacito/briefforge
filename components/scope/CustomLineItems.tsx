'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { CustomLineItem } from '@/types/project';

const CATEGORIES: { value: CustomLineItem['category']; label: string }[] = [
  { value: 'feature', label: 'Feature' },
  { value: 'integration', label: 'Integration' },
  { value: 'content', label: 'Content' },
  { value: 'other', label: 'Other' },
];

interface CustomLineItemsProps {
  items: CustomLineItem[];
  onChange: (items: CustomLineItem[]) => void;
}

export function CustomLineItems({ items, onChange }: CustomLineItemsProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ label: '', hours: 8, category: 'other' as CustomLineItem['category'] });

  const add = () => {
    if (!draft.label.trim() || draft.hours <= 0) return;
    onChange([...items, { ...draft, label: draft.label.trim(), id: `cli_${Date.now()}` }]);
    setDraft({ label: '', hours: 8, category: 'other' });
    setAdding(false);
  };

  const remove = (id: string) => onChange(items.filter(i => i.id !== id));

  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-white/65 uppercase tracking-widest">Custom Scope Items</h3>
        <span className="text-[10px] text-white/30">
          {items.length > 0 ? `${items.reduce((s, i) => s + i.hours, 0)}h total` : 'affects pricing'}
        </span>
      </div>

      {items.length === 0 && !adding && (
        <p className="text-xs text-white/30 italic mb-2">Add ad-hoc work that doesn't fit predefined features. Hours flow into pricing.</p>
      )}

      {items.length > 0 && (
        <div className="space-y-1 mb-3">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 group py-1.5 border-b border-white/[0.04] last:border-0">
              <div className="flex-1 min-w-0">
                <span className="text-sm text-white/70">{item.label}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40 capitalize flex-shrink-0">
                {item.category}
              </span>
              <span className="text-xs text-white/55 font-mono flex-shrink-0">{item.hours}h</span>
              <button
                onClick={() => remove(item.id)}
                className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded text-white/30 hover:text-[#9B3030] hover:bg-[#7F2020]/10 transition-all flex-shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div className="space-y-3 mt-2 pt-2 border-t border-white/[0.06]">
          <div>
            <label className="text-[10px] text-white/50 uppercase tracking-wider mb-1 block">Description</label>
            <input
              type="text"
              autoFocus
              value={draft.label}
              onChange={e => setDraft(d => ({ ...d, label: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') add(); if (e.key === 'Escape') setAdding(false); }}
              placeholder="e.g. Legacy data cleanup"
              className="w-full bg-white/[0.05] border border-white/[0.12] rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-white/[0.28] transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-white/50 uppercase tracking-wider mb-1 block">Hours</label>
              <input
                type="number"
                min={1}
                max={500}
                value={draft.hours}
                onChange={e => setDraft(d => ({ ...d, hours: Math.max(1, Number(e.target.value)) }))}
                className="w-full bg-white/[0.05] border border-white/[0.12] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/[0.28] transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-white/50 uppercase tracking-wider mb-1 block">Category</label>
              <select
                value={draft.category}
                onChange={e => setDraft(d => ({ ...d, category: e.target.value as CustomLineItem['category'] }))}
                className="w-full bg-white/[0.05] border border-white/[0.12] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/[0.28] transition-colors"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value} className="bg-[#130c0a]">{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={add}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-[#586851]/30 hover:bg-[#586851]/50 text-[#9BC48A] border border-[#586851]/40 transition-colors">
              <Plus className="w-3 h-3" /> Add
            </button>
            <button onClick={() => setAdding(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/60 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition-colors">
          <Plus className="w-3 h-3" /> Add item
        </button>
      )}
    </div>
  );
}
