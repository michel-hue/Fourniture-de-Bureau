import type { ReactNode } from 'react';

type BadgeVariant = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

/** Pills statut (spec §Pills : radius 99, padding 3/10, Public Sans 700 12). */
const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-neutral-100 text-ink',
  primary: 'bg-surface text-primary-700',
  accent: 'bg-accent-100 text-accent-800',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-800',
  error: 'bg-error-100 text-error-700',
  info: 'bg-info-100 text-info-700',
};

export function Badge({ variant = 'neutral', dot = false, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-xs font-medium leading-5 ${variantClasses[variant]} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}
