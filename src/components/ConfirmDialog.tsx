import { AlertTriangle, Info, Trash2, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const iconMap = {
    danger: <Trash2 className="w-6 h-6 text-rose-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    info: <Info className="w-6 h-6 text-brand-600" />,
  };

  const bgIconMap = {
    danger: 'bg-rose-100 ring-4 ring-rose-50',
    warning: 'bg-amber-100 ring-4 ring-amber-50',
    info: 'bg-orange-100 ring-4 ring-orange-50',
  };

  const buttonStyleMap = {
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-rose-600/25',
    warning: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 shadow-amber-600/25',
    info: 'bg-brand-500 hover:bg-brand-600 active:bg-brand-700 shadow-brand-500/25',
  };

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in no-print"
      onClick={onCancel}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-popup border border-gray-100 flex flex-col safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${bgIconMap[variant]}`}>
              {iconMap[variant]}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">{title}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Please confirm your action</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mt-4 leading-relaxed bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
          {message}
        </p>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3.5 px-4 rounded-xl sm:rounded-2xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-bold text-sm sm:text-base transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-3.5 px-4 rounded-xl sm:rounded-2xl text-white font-bold text-sm sm:text-base shadow-lg transition-all active:scale-[0.98] ${buttonStyleMap[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
