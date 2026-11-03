import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  // Primaire : teal, hover teal foncé (spec §Boutons)
  primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700',
  // Highlight : jaune / navy, CTA promo & « Payer … FCFA »
  accent: 'bg-accent-500 text-ink hover:bg-accent-400 shadow-sm',
  secondary:
    'bg-white text-ink border border-line-strong shadow-sm hover:border-primary-600/40 hover:bg-page',
  outline: 'bg-white border border-primary-600/40 text-primary-700 hover:border-primary-600 hover:bg-primary-50',
  ghost: 'text-ink-soft hover:bg-surface hover:text-primary-700',
  danger: 'bg-error-600 text-white shadow-sm hover:bg-error-700',
};

const sizeClasses: Record<Size, string> = {
  // Bouton : 15/700 (mobile 14) · min-h 44 · px 20 · highlight 18/800 min-h 52 px 28
  sm: 'min-h-9 gap-1.5 px-3.5 text-[13px]',
  md: 'min-h-11 gap-2 px-5 text-[15px] max-sm:text-sm max-sm:px-4',
  lg: 'min-h-12 gap-2 px-6 text-base max-sm:min-h-11 max-sm:text-[15px] max-sm:px-5',
};

const baseClasses =
  'inline-flex items-center justify-center rounded-lg font-display font-semibold leading-none tracking-[-0.005em] transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  type = 'button',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'lg' ? 20 : 16} className="animate-spin" aria-hidden="true" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
