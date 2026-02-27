'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'danger';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Conferma',
  cancelText = 'Annulla',
  showCancel = true,
}: ModalProps) {
  // Close on ESC
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const icons = {
    info: <HelpCircle className="text-indigo-600" size={24} />,
    success: <CheckCircle2 className="text-emerald-600" size={24} />,
    warning: <AlertCircle className="text-amber-600" size={24} />,
    danger: <AlertCircle className="text-rose-600" size={24} />,
  };

  const colors = {
    info: 'bg-indigo-50',
    success: 'bg-emerald-50',
    warning: 'bg-amber-50',
    danger: 'bg-rose-50',
  };

  const buttonColors = {
    info: 'bg-indigo-600 hover:bg-indigo-700',
    success: 'bg-emerald-600 hover:bg-emerald-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
    danger: 'bg-rose-600 hover:bg-rose-700',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-zinc-100"
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className={cn("p-3 rounded-2xl", colors[type])}>
                  {icons[type]}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-2xl font-display font-bold text-zinc-900 mb-2">
                {title}
              </h3>
              <p className="text-zinc-500 leading-relaxed">
                {message}
              </p>

              <div className="mt-8 flex items-center gap-3">
                {showCancel && (
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 text-sm font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors"
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (onConfirm) onConfirm();
                    onClose();
                  }}
                  className={cn(
                    "flex-1 px-6 py-3 text-sm font-bold text-white rounded-xl transition-colors shadow-lg shadow-indigo-200",
                    buttonColors[type]
                  )}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
