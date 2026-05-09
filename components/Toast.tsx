'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  onUndo?: () => void;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, onUndo, onDismiss, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="flex items-center gap-3 px-4 py-3 bg-[#1a1210] border border-white/[0.14] rounded-xl shadow-2xl text-sm min-w-[260px]"
    >
      <span className="text-white/80 flex-1 text-xs">{message}</span>
      {onUndo && (
        <button
          onClick={onUndo}
          className="text-[#9B3030] hover:text-[#C05050] font-semibold text-xs transition-colors flex-shrink-0"
        >
          Undo
        </button>
      )}
      <button
        onClick={onDismiss}
        className="text-white/40 hover:text-white/70 transition-colors flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
