import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
}

type PageItem = number | 'ellipsis';

function getPageItems(page: number, totalPages: number): PageItem[] {
  const items: PageItem[] = [];

  const addPage = (p: number) => {
    if (items[items.length - 1] !== p) items.push(p);
  };
  const addEllipsis = () => {
    if (items[items.length - 1] !== 'ellipsis') items.push('ellipsis');
  };

  addPage(1);
  if (page > 3) addEllipsis();
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p += 1) {
    addPage(p);
  }
  if (page < totalPages - 2) addEllipsis();
  addPage(totalPages);

  return items;
}

export function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const items = getPageItems(page, totalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-sm text-ink-soft">
        {total !== undefined
          ? `Page ${page} sur ${totalPages} — ${total} résultat${total > 1 ? 's' : ''}`
          : `Page ${page} sur ${totalPages}`}
      </p>
      <nav className="flex items-center gap-1.5" aria-label="Pagination">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Page précédente"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-brand bg-white text-ink-soft transition-colors hover:border-primary-600 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-ink-soft"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={`h-9 w-9 rounded-lg border font-display text-sm font-semibold transition-colors ${
                item === page
                  ? 'border-primary-600 bg-primary-600 text-white'
                  : 'border-border-brand bg-white text-ink-soft hover:border-primary-600 hover:text-primary-600'
              }`}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Page suivante"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-brand bg-white text-ink-soft transition-colors hover:border-primary-600 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}