import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string, duration: number = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, title, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Pop-up Container — Fixed at top with safe-area spacing */}
      <div className="fixed top-3 left-0 right-0 z-[100] flex flex-col items-center gap-2 px-3 sm:px-4 pointer-events-none safe-top w-full max-w-full overflow-hidden">
        {toasts.map((toast) => {
          const bgStyles = {
            success: 'bg-emerald-950/90 text-white border-emerald-500/30 shadow-emerald-950/40',
            error: 'bg-rose-950/90 text-white border-rose-500/30 shadow-rose-950/40',
            warning: 'bg-amber-950/90 text-white border-amber-500/30 shadow-amber-950/40',
            info: 'bg-gray-900/90 text-white border-gray-700/50 shadow-black/40',
          }[toast.type];

          const icon = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
            info: <Info className="w-5 h-5 text-sky-400 flex-shrink-0" />,
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 w-full max-w-[calc(100vw-1.5rem)] sm:max-w-sm px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-xl transition-all duration-300 animate-toast-slide-down ${bgStyles}`}
            >
              {icon}
              <div className="flex-1 min-w-0">
                {toast.title && <p className="text-xs font-bold uppercase tracking-wider text-gray-300">{toast.title}</p>}
                <p className="text-sm font-semibold leading-snug truncate">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
