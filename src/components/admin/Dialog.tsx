'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** Variasi tata letak: dialog tengah (default) atau laci kiri untuk navigasi mobile. */
  variant?: 'center' | 'drawer';
  /** false = Escape dan klik latar diabaikan (mis. saat aksi sedang berjalan). */
  dismissible?: boolean;
}

export default function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  variant = 'center',
  dismissible = true,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const pressedOnBackdrop = useRef(false);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const layout =
    variant === 'drawer'
      ? 'm-0 h-dvh max-h-none w-72 max-w-[85vw] rounded-none'
      : 'm-auto max-h-[calc(100dvh-2rem)] w-[min(32rem,calc(100vw-2rem))] rounded-2xl shadow-elevated';

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) onClose();
      }}
      onMouseDown={(e) => {
        pressedOnBackdrop.current = e.target === ref.current;
      }}
      onClick={(e) => {
        // Tutup hanya bila tekan DAN lepas di latar; seret teks dari input ke luar tidak menutup.
        if (dismissible && pressedOnBackdrop.current && e.target === ref.current) onClose();
        pressedOnBackdrop.current = false;
      }}
      className={`border border-border bg-surface p-0 text-text-body backdrop:bg-primary-dark/50 backdrop:backdrop-blur-xs ${layout}`}
    >
      {open && variant === 'drawer' && (
        <div className="flex h-full flex-col">
          <h2 id={titleId} className="flex h-14 shrink-0 items-center border-b border-border px-5 text-base font-bold">
            {title}
          </h2>
          <div className="min-h-0 flex-1">{children}</div>
        </div>
      )}
      {open && variant === 'center' && (
        <div className="flex max-h-[inherit] flex-col">
          <div className="p-5">
            <h2 id={titleId} className="text-lg font-bold">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1.5 text-sm text-text-body">
                {description}
              </p>
            )}
            {children && <div className="mt-4">{children}</div>}
          </div>
          {footer && (
            <div className="flex flex-wrap justify-end gap-2 border-t border-border bg-bg px-5 py-3">
              {footer}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
