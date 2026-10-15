import type { ReactNode } from 'react';

type CardVariant = 'default' | 'hover' | 'plain';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'rounded-3xl border border-slate-200 bg-white shadow-sm',
  hover: 'rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-slate-300',
  plain: 'rounded-3xl border-0 shadow-none',
};

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  return <div className={`${variantClasses[variant]} ${className}`}>{children}</div>;
}

interface CardSectionProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardSectionProps) {
  return <div className={`border-b border-slate-200 px-6 py-4 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }: CardSectionProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: CardSectionProps) {
  return (
    <div className={`rounded-b-3xl border-t border-slate-200 bg-slate-50 px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}