/**
 * components/ContactSection.tsx
 * Section kontak — agregasi semua channel komunikasi.
 *
 * Nomor WA diambil dari semua lokasi yang punya kontaknya (deduplicated).
 * Email diambil dari profile.
 * Kalau semua kosong → fallback message (FR-4).
 */

import { Profile, Location } from "@/lib/types";

interface ContactSectionProps {
  profile: Profile;
  locations: Location[];
}

/** Konversi nomor WA Indonesia ke format wa.me */
function toWaLink(wa: string): string {
  const digits = wa.replace(/\D/g, "");
  const normalized = digits.startsWith("0")
    ? `62${digits.slice(1)}`
    : digits;
  return `https://wa.me/${normalized}`;
}

export default function ContactSection({
  profile,
  locations,
}: ContactSectionProps) {
  // Kumpulkan nomor WA unik dari semua lokasi
  const allWhatsapps = [
    ...new Set(locations.filter((l) => l.whatsapp).map((l) => l.whatsapp!)),
  ];

  // Kumpulkan nomor telepon unik dari semua lokasi
  const allPhones = [
    ...new Set(locations.filter((l) => l.phone).map((l) => l.phone!)),
  ];

  const hasAnyContact =
    allWhatsapps.length > 0 || allPhones.length > 0 || !!profile.email;

  return (
    <section
      id="kontak"
      aria-labelledby="kontak-heading"
      className="border-t border-gray-100 bg-gray-50 px-4 py-16 md:py-24"
    >
      <div className="mx-auto max-w-3xl">
        <h2
          id="kontak-heading"
          className="mb-8 text-2xl font-bold text-gray-900 md:text-3xl"
        >
          Hubungi Kami
        </h2>

        {!hasAnyContact ? (
          <p id="contact-empty" className="text-gray-500">
            Informasi kontak segera hadir.
          </p>
        ) : (
          <div className="space-y-4">
            {/* WhatsApp — satu baris per nomor unik */}
            {allWhatsapps.map((wa, i) => (
              <div
                key={i}
                id={`contact-wa-item-${i}`}
                className="flex items-center gap-3"
              >
                <span
                  className="shrink-0 text-sm font-medium text-gray-700"
                  aria-label="WhatsApp"
                >
                  WhatsApp
                </span>
                <a
                  id={`contact-wa-${i}`}
                  href={toWaLink(wa)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-700 underline-offset-2 hover:underline"
                >
                  {wa}
                </a>
              </div>
            ))}

            {/* Telepon */}
            {allPhones.map((phone, i) => (
              <div
                key={i}
                id={`contact-phone-item-${i}`}
                className="flex items-center gap-3"
              >
                <span className="shrink-0 text-sm font-medium text-gray-700">
                  Telepon
                </span>
                <a
                  id={`contact-phone-${i}`}
                  href={`tel:${phone}`}
                  className="text-sm text-blue-700 underline-offset-2 hover:underline"
                >
                  {phone}
                </a>
              </div>
            ))}

            {/* Email (dari profile, opsional) */}
            {profile.email && (
              <div
                id="contact-email-item"
                className="flex items-center gap-3"
              >
                <span className="shrink-0 text-sm font-medium text-gray-700">
                  Email
                </span>
                <a
                  id="contact-email"
                  href={`mailto:${profile.email}`}
                  className="text-sm text-blue-700 underline-offset-2 hover:underline"
                >
                  {profile.email}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
