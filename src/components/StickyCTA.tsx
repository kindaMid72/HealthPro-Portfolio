/**
 * components/StickyCTA.tsx
 * Fixed bottom navigation bar untuk mobile (FR-5).
 * Tersembunyi di desktop via md:hidden (tidak butuh JS/useEffect).
 *
 * Logika:
 * - bookingUrl ada → tombol "Booking Sekarang" (primary)
 * - whatsappFallback ada → tombol "WhatsApp" (secondary)
 * - Keduanya null → komponen tidak di-render sama sekali
 *
 * Safe area inset (pb-safe) didefinisikan di globals.css untuk
 * mengakomodasi home indicator iPhone.
 */

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
      className="fixed bottom-0 left-0 right-0 z-50 flex gap-2 border-t border-gray-200 bg-white p-3 pb-safe md:hidden"
    >
      {bookingUrl ? (
        <a
          id="sticky-cta-booking"
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white"
        >
          Booking Sekarang
        </a>
      ) : null}

      {whatsappFallback ? (
        <a
          id="sticky-cta-whatsapp"
          href={whatsappFallback}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center rounded-lg border border-green-600 py-3 text-sm font-semibold text-green-700 ${
            bookingUrl ? "w-24" : "flex-1"
          }`}
        >
          WhatsApp
        </a>
      ) : null}
    </div>
  );
}
