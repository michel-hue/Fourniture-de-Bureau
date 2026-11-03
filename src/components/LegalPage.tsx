import type { ReactNode } from 'react';

interface LegalPageProps {
  title: string;
  updatedAt: string;
  children: ReactNode;
}

export function LegalPage({ title, updatedAt, children }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-600">
        Informations légales
      </p>
      <h1 className="mt-2 font-display text-[26px] font-semibold leading-tight text-ink sm:text-[32px]">
        {title}
      </h1>
      <p className="mt-2 text-sm text-ink-soft">Dernière mise à jour : {updatedAt}</p>
      <div className="mt-8 space-y-8 rounded-xl border border-border-brand bg-white p-5 text-sm leading-relaxed text-ink-soft shadow-card sm:p-7">
        {children}
      </div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-[18px] font-semibold text-ink">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
