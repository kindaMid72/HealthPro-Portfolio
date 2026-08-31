/**
 * components/StickyCTA.tsx
 * Fixed bottom navigation bar untuk mobile (FR-5).
 * Tersembunyi di desktop via md:hidden.
 *
 * Logika:
 * - bookingUrl ada → tombol "Booking Sekarang" (primary, accent amber)
 * - whatsappFallback ada → tombol "WhatsApp" (outline primary)
 * - Keduanya null → komponen tidak di-render sama sekali
 *
 * Styling: sesuai 04-design.md — accent untuk booking, primary untuk WA,
 *          pill shape, min tap target 44px. Hover via CSS class saja.
 * Note: onTouchStart/End dihapus — Server Component tidak bisa event handlers.
 *       Touch feedback di-handle via CSS :active pseudo-class.
 */

import { CalendarCheck, MessageCircle } from "lucide-react";

interface StickyCTAProps {
  bookingUrl: string | null;
  whatsappFallback: string | null;
}

export default function StickyCTA({
  bookingUrl,
  whatsappFallback,
}: StickyCTAProps) {
  // Tidak render kalau tidak ada CTA sama sekali
  if (!bookingUrl && !whatsappFallback) return null;

  return (
    <div
      id="sticky-cta-mobile"
      role="navigation"
      aria-label="Navigasi aksi cepat"
      className="fixed bottom-0 left-0 right-0 z-50 flex gap-3 p-4 pb-safe md:hidden bg-white/85 backdrop-blur-lg border-t border-border shadow-[0_-8px_30px_rgba(36,49,56,0.08)]"
    >
      {bookingUrl ? (
        <a
          id="sticky-cta-booking"
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white bg-accent hover:brightness-90 active:scale-[0.98] transition-all duration-200 shadow-md font-heading"
        >
          <CalendarCheck size={17} aria-hidden="true" />
          Booking Sekarang
        </a>
      ) : null}

      {whatsappFallback ? (
        <a
          id="sticky-cta-whatsapp"
          href={whatsappFallback}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white active:scale-[0.98] transition-all duration-200 font-heading bg-white/50 ${
            bookingUrl ? "w-28 shrink-0" : "flex-1"
          }`}
        >
          <MessageCircle size={17} aria-hidden="true" />
          {bookingUrl ? "WA" : "WhatsApp"}
        </a>
      ) : null}
    </div>
  );
}
