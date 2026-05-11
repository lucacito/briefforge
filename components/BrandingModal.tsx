'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Trash2 } from 'lucide-react';
import { BrandingConfig, DEFAULT_BRANDING } from '@/types/branding';
import { saveBranding } from '@/lib/branding';

interface BrandingModalProps {
  branding: BrandingConfig;
  onSave: (branding: BrandingConfig) => void;
  onClose: () => void;
}

function resizeImageToDataUrl(file: File, maxWidth = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.naturalWidth);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('canvas context failed')); return; }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/png', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}

export function BrandingModal({ branding, onSave, onClose }: BrandingModalProps) {
  const [draft, setDraft] = useState<BrandingConfig>({ ...branding });
  const [logoError, setLogoError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof BrandingConfig>(key: K, value: BrandingConfig[K]) =>
    setDraft(d => ({ ...d, [key]: value }));

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError('');
    if (file.size > 500 * 1024) {
      setLogoError('Logo must be under 500 KB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setLogoError('Please upload an image file.');
      return;
    }
    try {
      const dataUrl = await resizeImageToDataUrl(file, 400);
      set('logoDataUrl', dataUrl);
    } catch {
      setLogoError('Failed to process image.');
    }
  };

  const handleSave = () => {
    saveBranding(draft);
    onSave(draft);
    onClose();
  };

  const field = (label: string, key: keyof BrandingConfig, placeholder = '') => (
    <div>
      <label className="text-[10px] text-white/50 uppercase tracking-wider mb-1.5 block">{label}</label>
      <input
        type="text"
        value={draft[key] as string}
        onChange={e => set(key, e.target.value as BrandingConfig[typeof key])}
        placeholder={placeholder}
        className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-white/[0.28] transition-colors"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#130c0a] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <h3 className="text-sm font-semibold text-white">Branding</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {field('Agency / Studio name', 'agencyName', 'Your agency name')}
          {field('Your name', 'preparedByName', 'e.g. Jane Smith')}
          {field('Contact email', 'contactEmail', 'hello@agency.com')}

          {/* Logo */}
          <div>
            <label className="text-[10px] text-white/50 uppercase tracking-wider mb-1.5 block">Logo</label>
            {draft.logoDataUrl ? (
              <div className="flex items-center gap-3">
                <img src={draft.logoDataUrl} alt="Logo preview" className="h-10 rounded border border-white/[0.10] object-contain bg-white/[0.04] px-2" />
                <button
                  onClick={() => { set('logoDataUrl', null); }}
                  className="flex items-center gap-1 text-xs text-[#9B3030] hover:text-[#C04040] transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white/75 border border-white/[0.10] hover:border-white/[0.20] bg-white/[0.03] transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload logo (PNG, SVG, JPG — max 500 KB)
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            {logoError && <p className="text-[10px] text-[#9B3030] mt-1">{logoError}</p>}
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/50 uppercase tracking-wider mb-1.5 block">Primary color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={draft.primaryColor}
                  onChange={e => set('primaryColor', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-white/[0.12] bg-transparent"
                />
                <input
                  type="text"
                  value={draft.primaryColor}
                  onChange={e => set('primaryColor', e.target.value)}
                  className="flex-1 bg-white/[0.06] border border-white/[0.12] rounded-lg px-2 py-1.5 text-xs text-white font-mono outline-none focus:border-white/[0.28] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-white/50 uppercase tracking-wider mb-1.5 block">Accent color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={draft.accentColor}
                  onChange={e => set('accentColor', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-white/[0.12] bg-transparent"
                />
                <input
                  type="text"
                  value={draft.accentColor}
                  onChange={e => set('accentColor', e.target.value)}
                  className="flex-1 bg-white/[0.06] border border-white/[0.12] rounded-lg px-2 py-1.5 text-xs text-white font-mono outline-none focus:border-white/[0.28] transition-colors"
                />
              </div>
            </div>
          </div>

          {field('Footer text', 'footerText', 'Generated with FlyScope')}

          {/* Hide branding toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white/70">Hide FlyScope branding</div>
              <div className="text-[10px] text-white/35 mt-0.5">Remove "Generated with FlyScope" from all exports</div>
            </div>
            <button
              onClick={() => set('hideFlyScopeBranding', !draft.hideFlyScopeBranding)}
              className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${draft.hideFlyScopeBranding ? 'bg-[#586851]' : 'bg-white/[0.12]'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${draft.hideFlyScopeBranding ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-white/[0.07]">
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-xl text-sm font-semibold bg-[#7F2020] hover:bg-[#9B3030] text-[#F6F3EB] transition-colors"
          >
            Save branding
          </button>
          <button
            onClick={() => { setDraft({ ...DEFAULT_BRANDING }); }}
            className="px-4 py-2 rounded-xl text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            Reset
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white/70 transition-colors">
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
