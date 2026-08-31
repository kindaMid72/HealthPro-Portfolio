/**
 * components/HeroSection.tsx
 * Section pertama, harus above the fold di mobile (FR-1).
 * Berisi foto, nama, spesialisasi, dan CTA booking (FR-2 + FR-4).
 *
 * Logika CTA booking:
 *  1. booking_url ada  → tombol "Booking Sekarang" → buka tab baru
 *  2. booking_url kosong & whatsapp ada → tombol "Hubungi via WhatsApp"
 *  3. Keduanya kosong → tidak ada CTA booking (jangan broken link)
 *
 * Styling: sesuai 04-design.md — warna accent untuk CTA, primary untuk brand,
 *          next/image dengan priority (above-the-fold LCP).
 */

import Image from "next/image";
import { CalendarCheck, MessageCircle } from "lucide-react";
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
  // Tentukan apakah ada foto (termasuk placeholder)
  const hasPhoto = !!profile.photo_url;

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
      className="flex min-h-[calc(100dvh-64px)] flex-col items-center justify-center px-4 py-12 text-center md:py-20 bg-bg relative overflow-hidden"
    >
      {/* Latar Belakang Dekoratif (Gradients / Glassmorphism subtle) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[40%] -left-[20%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      {/* Foto / Avatar placeholder */}
      <div id="hero-photo" className="mb-7 animate-fade-in-up">
        {hasPhoto ? (
          <Image
            src={profile.photo_url}
            alt={`Foto ${profile.full_name}`}
            width={192}
            height={192}
            className="mx-auto rounded-full object-cover shadow-2xl shadow-primary/20 ring-4 ring-surface"
            priority
            sizes="(max-width: 768px) 144px, 192px"
          />
        ) : (
          <div
            aria-label={`Avatar ${profile.full_name}`}
            className="mx-auto flex h-36 w-36 items-center justify-center rounded-full text-4xl font-bold text-white md:h-48 md:w-48 bg-primary shadow-2xl shadow-primary/30 ring-4 ring-surface font-heading"
          >
            {initials || "?"}
          </div>
        )}
      </div>

      {/* Nama dokter — heading utama halaman (h1) */}
      <h1
        id="doctor-name"
        className="mb-2 text-3xl font-bold md:text-5xl animate-fade-in-up text-primary-dark font-heading tracking-tight"
        style={{ animationDelay: "60ms" }}
      >
        {profile.full_name}
      </h1>

      {/* Spesialisasi */}
      <p
        id="doctor-specialty"
        className="mb-1 text-base font-medium md:text-xl animate-fade-in-up text-primary font-body"
        style={{ animationDelay: "100ms" }}
      >
        {profile.specialty}
      </p>

      {/* Sub-spesialisasi (opsional) */}
      {profile.sub_specialty && (
        <p
          id="doctor-subspecialty"
          className="mb-2 text-sm md:text-base animate-fade-in-up text-text-body"
          style={{ animationDelay: "130ms" }}
        >
          {profile.sub_specialty}
        </p>
      )}

      {/* STR/SIP badge — trust signal dekat nama */}
      {profile.str_sip_display && (
        <span
          id="hero-str-sip"
          className="mb-6 mt-2 inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide animate-fade-in-up bg-surface border border-border text-text-body shadow-sm"
          style={{ animationDelay: "160ms" }}
        >
          No. STR/SIP: {profile.str_sip_display}
        </span>
      )}

      {/* CTA booking — logika fallback FR-4 */}
      <div
        id="hero-cta-group"
        className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-fade-in-up w-full px-4"
        style={{ animationDelay: "200ms" }}
      >
        {bookingUrl ? (
          <a
            id="cta-booking-hero"
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-accent"
          >
            <CalendarCheck size={18} aria-hidden="true" />
            Booking Sekarang
          </a>
        ) : whatsappFallback ? (
          <a
            id="cta-whatsapp-hero"
            href={whatsappFallback}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-accent"
          >
            <MessageCircle size={18} aria-hidden="true" />
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
            className="btn-outline-primary"
          >
            <MessageCircle size={18} aria-hidden="true" />
            WhatsApp
          </a>
        )}
      </div>

      {/* Scroll indicator */}
      <div
        id="hero-scroll-hint"
        aria-hidden="true"
        className="mt-14 hidden text-sm font-medium tracking-wide animate-bounce md:block text-text-body/60"
      >
        ↓ Scroll untuk info selengkapnya
      </div>
    </section>
  );
}
