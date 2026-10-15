import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type?: AlertType;
  message: string;
  title?: string;
  onClose?: () => void;
}

const alertConfig: Record<AlertType, { icon: LucideIcon; classes: string; iconClass: string }> = {
  success: {
    icon: CheckCircle2,
    classes: 'border-success-200 bg-success-50 text-success-800',
    iconClass: 'text-success-600',
  },
  error: {
    icon: AlertCircle,
    classes: 'border-error-200 bg-error-50 text-error-800',
    iconClass: 'text-error-600',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'border-warning-200 bg-warning-50 text-warning-800',
    iconClass: 'text-warning-600',
  },
  info: {
    icon: Info,
    classes: 'border-info-200 bg-info-50 text-info-800',
    iconClass: 'text-info-600',
  },
};

export function Alert({ type = 'info', message, title, onClose }: AlertProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${config.classes}`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${config.iconClass}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <p>{message}</p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="shrink-0 rounded-md p-1 text-current opacity-60 transition-opacity hover:bg-white/50 hover:opacity-100"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}