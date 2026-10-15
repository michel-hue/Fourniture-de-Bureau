import { useCallback, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastContext } from '../../contexts/toast-context';
import type { ToastType } from '../../contexts/toast-context';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

const toastConfig: Record<ToastType, { icon: LucideIcon; iconClass: string }> = {
  success: { icon: CheckCircle2, iconClass: 'text-success-500' },
  error: { icon: AlertCircle, iconClass: 'text-error-500' },
  warning: { icon: AlertTriangle, iconClass: 'text-warning-500' },
  info: { icon: Info, iconClass: 'text-info-500' },
};

const AUTO_DISMISS_MS = 4000;

function ToastItemView({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      role="status"
      className="flex animate-toast-in items-center gap-3 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg"
    >
      <Icon size={18} className={`shrink-0 ${config.iconClass}`} aria-hidden="true" />
      <p className="min-w-0 flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Fermer la notification"
        className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string) => {
      idRef.current += 1;
      const id = idRef.current;
      setToasts((prev) => [...prev, { id, type, message }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[60] flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItemView key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}