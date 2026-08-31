/**
 * components/HeroSection.tsx
 * Section pertama, harus above the fold di mobile (FR-1).
 * Berisi foto, nama, spesialisasi, dan CTA booking (FR-2 + FR-4).
 *
 * Logika CTA booking:
 *  1. booking_url ada  → tombol "Booking Sekarang" → buka tab baru
 *  2. booking_url kosong & whatsapp ada → tombol "Hubungi via WhatsApp"
 *  3. Keduanya kosong → tidak ada CTA booking (jangan broken link)
 */

import { Profile } from "@/lib/types";

interface HeroSectionProps {
  profile: Profile;
  bookingUrl: string | null;
  whatsappFallback: string | null;
}

export default function HeroSection({
  profile,
  bookingUrl,
  whatsappFallback,
}: HeroSectionProps) {
  // Tentukan apakah ada foto asli (bukan placeholder bawaan)
  const hasPhoto =
    !!profile.photo_url &&
    !profile.photo_url.startsWith("/images/dr-profile-placeholder");

  // Inisial untuk avatar placeholder
  const initials = profile.full_name
    .split(" ")
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <section
      id="hero"
      aria-label="Profil Dokter"
      className="flex min-h-[calc(100dvh-var(--navbar-height))] flex-col items-center justify-center px-4 py-12 text-center md:py-20"
    >
      {/* Foto / Avatar placeholder */}
      <div id="hero-photo" className="mb-6">
        {hasPhoto ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={profile.photo_url}
            alt={`Foto ${profile.full_name}`}
            className="mx-auto h-36 w-36 rounded-full object-cover shadow-md md:h-48 md:w-48"
            width={192}
            height={192}
          />
        ) : (
          <div
            aria-label={`Avatar ${profile.full_name}`}
            className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-gray-200 text-4xl font-bold text-gray-500 shadow-md md:h-48 md:w-48"
          >
            {initials || "?"}
          </div>
        )}
      </div>

      {/* Nama dokter — heading utama halaman (h1) */}
      <h1
        id="doctor-name"
        className="mb-2 text-2xl font-bold text-gray-900 md:text-4xl"
      >
        {profile.full_name}
      </h1>

      {/* Spesialisasi */}
      <p
        id="doctor-specialty"
        className="mb-1 text-base text-gray-600 md:text-xl"
      >
        {profile.specialty}
      </p>

      {/* Sub-spesialisasi (opsional) */}
      {profile.sub_specialty && (
        <p
          id="doctor-subspecialty"
          className="mb-4 text-sm text-gray-500 md:text-base"
        >
          {profile.sub_specialty}
        </p>
      )}

      {/* CTA booking — logika fallback FR-4 */}
      <div
        id="hero-cta-group"
        className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
      >
        {bookingUrl ? (
          <a
            id="cta-booking-hero"
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Booking Sekarang
          </a>
        ) : whatsappFallback ? (
          <a
            id="cta-whatsapp-hero"
            href={whatsappFallback}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            Hubungi via WhatsApp
          </a>
        ) : null}

        {/* Tombol WA sekunder (selalu tampil kalau ada, terlepas dari booking_url) */}
        {bookingUrl && whatsappFallback && (
          <a
            id="cta-whatsapp-secondary-hero"
            href={whatsappFallback}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg border border-green-600 px-6 py-3 text-sm font-semibold text-green-700 transition-colors hover:bg-green-50"
          >
            WhatsApp
          </a>
        )}
      </div>

      {/* Scroll indicator */}
      <div
        id="hero-scroll-hint"
        aria-hidden="true"
        className="mt-10 hidden text-xs text-gray-400 md:block"
      >
        ↓ Scroll untuk info selengkapnya
      </div>
    </section>
  );
}
