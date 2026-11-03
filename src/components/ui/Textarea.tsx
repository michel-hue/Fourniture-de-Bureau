import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

/** Textarea — même champ que Input (border 1px `line-strong`, radius 8). */
const fieldClasses =
  'min-h-24 w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-ink shadow-sm transition-[border-color,box-shadow] focus:border-primary-600 focus:outline-none focus:ring-[3px] focus:ring-primary-600/12 disabled:cursor-not-allowed disabled:bg-page disabled:text-ink-soft';

export function Textarea({ label, error, helper, id, className = '', ...props }: TextareaProps) {
  const textareaId = id ?? props.name;

  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={textareaId} className="mb-1.5 block text-[13px] font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`${fieldClasses} ${error ? 'border-error-500 ring-[3px] ring-error-500/10' : 'border-line-strong hover:border-ink-muted'} ${className}`}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-[13px] text-error-600">{error}</p>
      ) : helper ? (
        <p className="mt-1.5 text-xs text-ink-soft">{helper}</p>
      ) : null}
    </div>
  );
}
