import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helper?: string;
  leftIcon?: ReactNode;
}

/** Champ (spec §Inputs) : h 44 · border 1px `line-strong` · radius 8 · px 14 · Public Sans 15. */
const fieldClasses =
  'h-11 w-full rounded-lg border bg-white px-3.5 text-[15px] text-ink shadow-sm transition-[border-color,box-shadow] focus:border-primary-600 focus:outline-none focus:ring-[3px] focus:ring-primary-600/12 disabled:cursor-not-allowed disabled:bg-page disabled:text-ink-soft';

export function Input({ label, error, helper, leftIcon, id, className = '', ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col">
      <label htmlFor={inputId} className="mb-1.5 block text-[13px] font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={`${fieldClasses} ${leftIcon ? 'pl-10' : ''} ${error ? 'border-error-500 ring-[3px] ring-error-500/10' : 'border-line-strong hover:border-ink-muted'} ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-[13px] text-error-600">{error}</p>
      ) : helper ? (
        <p className="mt-1.5 text-xs text-ink-soft">{helper}</p>
      ) : null}
    </div>
  );
}
