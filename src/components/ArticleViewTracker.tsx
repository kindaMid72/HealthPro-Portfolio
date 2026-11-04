'use client';

import { useEffect, useState } from 'react';

interface ArticleViewTrackerProps {
  slug: string;
  initialViews: number;
}

export default function ArticleViewTracker({
  slug,
  initialViews,
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

  return (
    <span>{views.toLocaleString('id-ID')} kali dibaca</span>
  );
}
