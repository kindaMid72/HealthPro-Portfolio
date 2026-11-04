"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/types";

interface TableOfContentsProps {
  items: TocItem[];
  placement: "inline" | "aside";
}

function TocList({ items, activeId }: { items: TocItem[]; activeId?: string }) {
  return (
    <ol className="space-y-1 text-[0.9375rem]">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <li key={item.id} className={item.level === 3 ? "pl-4 text-sm" : undefined}>
            <a
              href={`#${item.id}`}
              aria-current={active ? "location" : undefined}
              className={`block border-l-2 py-1 pl-3 hover:text-primary ${
                active ? "border-primary font-semibold text-primary" : "border-transparent text-text-body"
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

export default function TableOfContents({ items, placement }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (placement !== "aside") return;
    const targets = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items, placement]);

  if (items.length < 2) return null;

  if (placement === "inline") {
    return (
      <details className="rounded-xl border border-border bg-surface lg:hidden">
        <summary className="cursor-pointer px-4 py-3 font-semibold text-text-heading">Daftar isi</summary>
        <div className="px-4 pb-4">
          <TocList items={items} />
        </div>
      </details>
    );
  }

  return (
    <nav aria-label="Daftar isi" className="hidden lg:sticky lg:top-24 lg:block">
      <p className="mb-3 font-semibold text-text-heading">Daftar isi</p>
      <TocList items={items} activeId={activeId} />
    </nav>
  );
}
