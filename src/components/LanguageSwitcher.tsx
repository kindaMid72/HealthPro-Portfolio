'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import { localePath, stripLocalePrefix } from '@/i18n/path';

export interface LanguageSwitcherProps {
  locale: Locale;
  labels: {
    label: string;
    id: string;
    en: string;
    idAria: string;
    enAria: string;
  };
  className?: string;
}

export default function LanguageSwitcher({
  locale,
  labels,
  className = '',
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const stripped = stripLocalePrefix(pathname || '/');
  const idTarget = localePath('id', stripped);
  const enTarget = localePath('en', stripped);

  return (
    <div
      role="group"
      aria-label={labels.label}
      className={`inline-flex items-center gap-1 rounded-full border border-border bg-surface px-1.5 py-0.5 text-xs font-semibold shadow-2xs ${className}`}
    >
      <Link
        href={idTarget}
        hrefLang="id"
        lang="id"
        aria-label={labels.idAria}
        aria-current={locale === 'id' ? 'true' : undefined}
        className={`rounded-full px-2 py-0.5 transition-colors ${
          locale === 'id'
            ? 'bg-primary text-white'
            : 'text-text-muted hover:text-text-heading'
        }`}
      >
        {labels.id}
      </Link>
      <span className="text-border" aria-hidden="true">
        /
      </span>
      <Link
        href={enTarget}
        hrefLang="en"
        lang="en"
        aria-label={labels.enAria}
        aria-current={locale === 'en' ? 'true' : undefined}
        className={`rounded-full px-2 py-0.5 transition-colors ${
          locale === 'en'
            ? 'bg-primary text-white'
            : 'text-text-muted hover:text-text-heading'
        }`}
      >
        {labels.en}
      </Link>
    </div>
  );
}
