import type { ReactNode } from 'react';

type CardVariant = 'default' | 'hover' | 'plain';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
}

/** Card : blanc, bordure 1px `border-brand`, radius 12, ombre card. */
const variantClasses: Record<CardVariant, string> = {
  default: 'rounded-xl border border-border-brand bg-white shadow-card',
  hover: 'rounded-xl border border-border-brand bg-white shadow-card transition-all duration-200 hover:border-primary-200 hover:shadow-hover',
  plain: 'rounded-xl border-0 shadow-none',
};

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  return <div className={`${variantClasses[variant]} ${className}`}>{children}</div>;
}

interface CardSectionProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardSectionProps) {
  return <div className={`border-b border-border-brand px-5 py-4 sm:px-6 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }: CardSectionProps) {
  return <div className={`p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: CardSectionProps) {
  return (
    <div className={`rounded-b-xl border-t border-border-brand bg-page px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}
