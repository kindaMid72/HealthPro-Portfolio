'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ListTree } from 'lucide-react';
import type { Dictionary } from '@/i18n/dictionaries/id';
import { id as idDictionary } from '@/i18n/dictionaries/id';
import type { TocItem } from '@/lib/types';

interface TableOfContentsProps {
  items: TocItem[];
  placement: 'inline' | 'aside';
  dict?: Dictionary['toc'];
}

function TocList({ items, activeId }: { items: TocItem[]; activeId?: string }) {
  return (
    <ol className="space-y-1 text-[0.9375rem]">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <li key={item.id} className={item.level === 3 ? 'pl-4 text-sm' : undefined}>
            <a
              href={`#${item.id}`}
              aria-current={active ? 'location' : undefined}
              className={`block border-l-2 py-1 pl-3 hover:text-primary ${
                active ? 'border-primary font-semibold text-primary' : 'border-transparent text-text-body'
              }`}
            >
              {item.text}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

export default function TableOfContents({
  items,
  placement,
  dict = idDictionary.toc,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (placement !== 'aside') return;
    const targets = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px' },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items, placement]);

  if (items.length < 2) return null;

  if (placement === 'inline') {
    return (
      <details className="card-clinical group p-4 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-text-heading [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <ListTree size={18} className="text-primary" aria-hidden="true" />
            {dict.tableOfContents}
          </span>
          <ChevronDown
            size={18}
            className="text-text-muted transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="mt-3 border-t border-border pt-3">
          <TocList items={items} />
        </div>
      </details>
    );
  }

  return (
    <nav aria-label={dict.tableOfContentsAria} className="card-clinical hidden p-5 lg:sticky lg:top-24 lg:block">
      <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-text-heading">
        <ListTree size={14} aria-hidden="true" />
        {dict.tableOfContents}
      </p>
      <TocList items={items} activeId={activeId} />
    </nav>
  );
}
