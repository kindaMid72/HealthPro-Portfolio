'use client';

import { useEffect, useRef, useState } from 'react';
import { Share2, Link2, MessageCircle } from 'lucide-react';

interface ArticleShareBarProps {
  title: string;
  url: string;
}

export default function ArticleShareBar({ title, url }: ArticleShareBarProps) {
  const [canShare, setCanShare] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // navigator.share hanya tersedia di klien; cek setelah mount agar HTML server cocok.
    const id = setTimeout(() => setCanShare('share' in navigator), 0);
    return () => {
      clearTimeout(id);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;

  function flash(message: string) {
    setCopyMessage(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopyMessage(''), 2000);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      flash('Tautan tersalin');
    } catch {
      flash('Gagal menyalin. Salin tautan dari bilah alamat.');
    }
  }

  async function handleShare() {
    try {
      await navigator.share({ title, url });
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        flash('Gagal membagikan. Coba salin tautan.');
      }
    }
  }

  return (
    <div className="card-clinical my-8 flex flex-wrap items-center gap-3 px-5 py-4">
      <span className="font-semibold text-text-heading">Bagikan artikel</span>
      {canShare && (
        <button type="button" onClick={handleShare} className="btn btn-sm btn-secondary">
          <Share2 size={16} aria-hidden="true" />
          Bagikan
        </button>
      )}
      <a href={waShareUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary">
        <MessageCircle size={16} aria-hidden="true" />
        WhatsApp
      </a>
      <button type="button" onClick={handleCopy} className="btn btn-sm btn-secondary">
        <Link2 size={16} aria-hidden="true" />
        Salin tautan
      </button>
      <span aria-live="polite" className="text-sm text-text-muted">
        {copyMessage}
      </span>
    </div>
  );
}
