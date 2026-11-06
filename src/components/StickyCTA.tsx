/**
 * components/StickyCTA.tsx
 * Bilah aksi tetap di bawah untuk mobile (FR-5), disembunyikan di desktop.
 * - bookingUrl ada → "Booking sekarang" (+ tombol WA sempit bila ada)
 * - hanya WhatsApp → tombol WhatsApp penuh
 * - keduanya null → tidak dirender
 */

import { CalendarCheck, MessageCircle } from "lucide-react";

interface StickyCTAProps {
  bookingUrl: string | null;
  whatsappFallback: string | null;
}

export default function StickyCTA({ bookingUrl, whatsappFallback }: StickyCTAProps) {
  if (!bookingUrl && !whatsappFallback) return null;

  return (
    <div
      id="sticky-cta-mobile"
      role="navigation"
      aria-label="Navigasi aksi cepat"
      className="fixed inset-x-3 bottom-3 z-40 flex gap-2.5 rounded-2xl border border-border bg-surface/95 p-2.5 shadow-elevated backdrop-blur-md md:hidden"
    >
      {bookingUrl ? (
        <a
          id="sticky-cta-booking"
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-accent flex-1"
        >
          <CalendarCheck size={18} aria-hidden="true" />
          Booking sekarang
        </a>
      ) : null}

      {whatsappFallback ? (
        <a
          id="sticky-cta-whatsapp"
          href={whatsappFallback}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn ${bookingUrl ? "btn-secondary w-28 shrink-0" : "btn-accent flex-1"}`}
        >
          <MessageCircle size={18} aria-hidden="true" />
          WhatsApp
        </a>
      ) : null}
    </div>
  );
}
