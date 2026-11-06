'use client';

import { useEffect, useRef, useState } from 'react';
import { Link2, MessageCircle, Share2 } from 'lucide-react';
import type { Dictionary } from '@/i18n/dictionaries/id';
import { id as idDictionary } from '@/i18n/dictionaries/id';

interface ArticleShareBarProps {
  title: string;
  url: string;
  dict?: Dictionary['share'];
}

export default function ArticleShareBar({
  title,
  url,
  dict = idDictionary.share,
}: ArticleShareBarProps) {
  const [canShare, setCanShare] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const id = window.setTimeout(() => setCanShare('share' in navigator), 0);
    return () => {
      window.clearTimeout(id);
      window.clearTimeout(timer.current);
    };
  }, []);

  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;

  function flash(message: string) {
    setCopyMessage(message);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopyMessage(''), 2000);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      flash(dict.copied);
    } catch {
      flash(dict.copyFailed);
    }
  }

  async function handleShare() {
    try {
      await navigator.share({ title, url });
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        flash(dict.shareFailed);
      }
    }
  }

  return (
    <div className="card-clinical my-8 flex flex-wrap items-center gap-3 px-5 py-4">
      <span className="font-semibold text-text-heading">{dict.shareArticle}</span>
      {canShare && (
        <button type="button" onClick={handleShare} className="btn btn-sm btn-secondary">
          <Share2 size={16} aria-hidden="true" />
          {dict.share}
        </button>
      )}
      <a href={waShareUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary">
        <MessageCircle size={16} aria-hidden="true" />
        WhatsApp
      </a>
      <button type="button" onClick={handleCopy} className="btn btn-sm btn-secondary">
        <Link2 size={16} aria-hidden="true" />
        {dict.copyLink}
      </button>
      <span aria-live="polite" className="text-sm text-text-muted">
        {copyMessage}
      </span>
    </div>
  );
}
