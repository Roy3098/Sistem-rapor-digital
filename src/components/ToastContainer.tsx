import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-16 right-3 sm:top-auto sm:bottom-5 sm:right-5 z-[70] flex flex-col items-end gap-2 max-w-[320px] w-auto pointer-events-none no-print"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            style={{
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            }}
            className={`pointer-events-auto cursor-pointer flex items-center gap-2.5 px-3 py-2 rounded-xl border shadow-[0_8px_30px_rgb(15,23,42,0.10)] ring-1 ring-white/60 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-white/65 border-emerald-500/30 text-slate-800'
                : isError
                ? 'bg-white/65 border-rose-500/35 text-slate-800'
                : 'bg-white/65 border-slate-300/60 text-slate-800'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                isSuccess
                  ? 'bg-emerald-500/15 text-emerald-700'
                  : isError
                  ? 'bg-rose-500/15 text-rose-600'
                  : 'bg-sky-500/15 text-sky-700'
              }`}
            >
              {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.25]" />}
              {isError && <AlertCircle className="w-3.5 h-3.5 stroke-[2.25]" />}
              {!isSuccess && !isError && <Info className="w-3.5 h-3.5 stroke-[2.25]" />}
            </div>

            <div className="flex-1 min-w-0 text-[11.5px] font-semibold tracking-tight text-slate-800 leading-snug">
              {toast.message}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              aria-label="Tutup notifikasi"
              className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-900/5 transition-colors shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
