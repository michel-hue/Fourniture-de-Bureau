import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * En-tête de page unique (boutique, compte client et administration) :
 * eyebrow optionnel · titre Outfit 600 · sous-titre · actions alignées à droite.
 */
export function PageHeader({ title, description, eyebrow, actions, className = '' }: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-primary-600">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 font-display text-[26px] font-semibold leading-tight text-ink sm:text-[32px]">
          {title}
        </h1>
        {description && <p className="mt-1.5 text-sm text-ink-soft sm:text-[15px]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
