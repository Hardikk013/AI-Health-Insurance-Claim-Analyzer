import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-6 inset-x-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-full border shadow-soft-lg text-xs font-medium backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-surface/95 border-teal/40 text-ink'
                : toast.type === 'error'
                ? 'bg-[#FCEBEB] border-red-200 text-[#791F1F]'
                : 'bg-surface/95 border-line text-ink'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="size-4 text-teal shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="size-4 text-[#791F1F] shrink-0" />}
            {toast.type === 'info' && <Info className="size-4 text-accent shrink-0" />}

            <span>{toast.message}</span>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="ml-1 p-0.5 rounded-full hover:bg-black/5 text-muted transition-colors cursor-pointer"
            >
              <X className="size-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
