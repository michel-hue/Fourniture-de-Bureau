import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export function Textarea({ label, error, helper, id, className = '', ...props }: TextareaProps) {
  const textareaId = id ?? props.name;

  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`min-h-24 w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 focus:border-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${error ? 'border-error-500 ring-4 ring-error-500/10' : 'border-slate-300'} ${className}`}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-sm text-error-600">{error}</p>
      ) : helper ? (
        <p className="mt-1.5 text-xs text-slate-500">{helper}</p>
      ) : null}
    </div>
  );
}