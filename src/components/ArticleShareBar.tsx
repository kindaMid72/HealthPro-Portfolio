'use client';

import { useState } from 'react';
import { Share2, Check, MessageCircle } from 'lucide-react';

interface ArticleShareBarProps {
  title: string;
  url: string;
}

export default function ArticleShareBar({ title, url }: ArticleShareBarProps) {
  const [copied, setCopied] = useState(false);

  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `${title}\n${url}`,
  )}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback jika clipboard tidak diizinkan
    }
  }

  return (
    <div className="my-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 shadow-xs">
      <span className="font-heading text-xs font-semibold text-primary-dark">
        Bagikan artikel edukasi ini:
      </span>

      <div className="flex flex-wrap items-center gap-2.5">
        <a
          href={waShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-heading text-xs font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <MessageCircle size={14} aria-hidden="true" />
          Bagikan ke WhatsApp
        </a>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-4 py-2 font-heading text-xs font-semibold text-text-body transition-colors hover:border-primary hover:text-primary"
        >
          {copied ? (
            <>
              <Check size={14} className="text-primary" aria-hidden="true" />
              Tautan Tersalin!
            </>
          ) : (
            <>
              <Share2 size={14} aria-hidden="true" />
              Salin Tautan
            </>
          )}
        </button>
      </div>
    </div>
  );
}
