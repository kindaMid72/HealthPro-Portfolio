'use client';

import { useEffect, useState } from 'react';
import { INTL_LOCALE, type Locale } from '@/i18n/config';
import { format } from '@/i18n/format';

interface ArticleViewTrackerProps {
  slug: string;
  initialViews: number;
  locale?: Locale;
  template?: string;
}

export default function ArticleViewTracker({
  slug,
  initialViews,
  locale = 'id',
  template = '{count} kali dibaca',
}: ArticleViewTrackerProps) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    let active = true;
    fetch(`/api/articles/${encodeURIComponent(slug)}/view`, {
      method: 'POST',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { viewCount?: number | null } | null) => {
        if (active && typeof data?.viewCount === 'number') {
          setViews(data.viewCount);
        }
      })
      .catch(() => {
        // Abaikan kegagalan jaringan untuk analitik pembaca
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const countFormatted = views.toLocaleString(INTL_LOCALE[locale]);

  return <span>{format(template, { count: countFormatted })}</span>;
}
