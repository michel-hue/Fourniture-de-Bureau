import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
}

/** Select — même champ que Input (h 44, border 1px `line-strong`, radius 8). */
const fieldClasses =
  'h-11 w-full appearance-none rounded-lg border bg-white px-3.5 pr-9 text-[15px] text-ink shadow-sm transition-[border-color,box-shadow] focus:border-primary-600 focus:outline-none focus:ring-[3px] focus:ring-primary-600/12 disabled:cursor-not-allowed disabled:bg-page disabled:text-ink-soft';

export function Select({ label, error, helper, id, className = '', children, ...props }: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-[13px] font-medium text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`${fieldClasses} ${error ? 'border-error-500 ring-[3px] ring-error-500/10' : 'border-line-strong hover:border-ink-muted'} ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
          aria-hidden="true"
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
