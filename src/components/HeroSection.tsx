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
 * PENTING: btn-accent dan btn-outline-primary SUDAH terdefinisi di globals.css.
 * Mereka sudah include flex, items-center, gap — jadi ikon dan teks otomatis sejajar.
 *
 * Styling: sesuai 04-design.md — warna accent untuk CTA, primary untuk brand,
 *          next/image dengan priority (above-the-fold LCP).
 */

import Image from "next/image";
import { CalendarCheck, MessageCircle, ShieldCheck } from "lucide-react";
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
      className="relative flex min-h-[calc(100dvh-64px)] flex-col items-center justify-center px-4 py-16 text-center md:py-24 bg-bg overflow-hidden"
    >
      {/* ── Latar Dekoratif Premium ── */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        {/* Blob kanan atas — primary tone */}
        <div className="absolute -top-[15%] -right-[15%] w-[65%] h-[65%] rounded-full bg-primary/8 blur-[100px]" />
        {/* Blob kiri bawah — accent tone */}
        <div className="absolute top-[55%] -left-[20%] w-[55%] h-[55%] rounded-full bg-accent/6 blur-[90px]" />
        {/* Grid pattern subtle */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #3F6B74 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ── Foto / Avatar placeholder ── */}
      <div id="hero-photo" className="mb-8 animate-fade-in-up">
        {hasPhoto ? (
          <div className="relative mx-auto w-fit">
            {/* Ring dekoratif animasi */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring scale-110"
            />
            <Image
              src={profile.photo_url}
              alt={`Foto ${profile.full_name}`}
              width={192}
              height={192}
              className="relative mx-auto h-36 w-36 rounded-full object-cover shadow-2xl shadow-primary/25 ring-4 ring-surface md:h-48 md:w-48"
              priority
              sizes="(max-width: 768px) 144px, 192px"
            />
          </div>
        ) : (
          <div className="relative mx-auto w-fit">
            {/* Ring dekoratif animasi */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring scale-110"
            />
            <div
              aria-label={`Avatar ${profile.full_name}`}
              className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full text-3xl font-bold text-white md:h-48 md:w-48 font-heading ring-4 ring-surface shadow-2xl shadow-primary/30"
              style={{
                background:
                  "linear-gradient(135deg, #3F6B74 0%, #243138 100%)",
              }}
            >
              {initials || "Dr"}
            </div>
          </div>
        )}
      </div>

      {/* ── Nama dokter — heading utama halaman (h1) ── */}
      <h1
        id="doctor-name"
        className="mb-2 text-3xl font-bold md:text-5xl animate-fade-in-up text-primary-dark font-heading tracking-tight"
        style={{ animationDelay: "60ms" }}
      >
        {profile.full_name}
      </h1>

      {/* ── Spesialisasi ── */}
      <p
        id="doctor-specialty"
        className="mb-1 text-base font-semibold md:text-xl animate-fade-in-up text-primary font-body"
        style={{ animationDelay: "100ms" }}
      >
        {profile.specialty}
      </p>

      {/* ── Sub-spesialisasi (opsional) ── */}
      {profile.sub_specialty && (
        <p
          id="doctor-subspecialty"
          className="mb-3 text-sm md:text-base animate-fade-in-up text-text-body"
          style={{ animationDelay: "130ms" }}
        >
          {profile.sub_specialty}
        </p>
      )}

      {/* ── STR/SIP badge — trust signal dekat nama ── */}
      {profile.str_sip_display && (
        <div
          className="mb-8 mt-3 animate-fade-in-up"
          style={{ animationDelay: "160ms" }}
        >
          <span
            id="hero-str-sip"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide bg-primary/8 border border-primary/20 text-primary shadow-sm"
          >
            <ShieldCheck size={13} aria-hidden="true" />
            No. STR/SIP: {profile.str_sip_display}
          </span>
        </div>
      )}

      {/* ── CTA booking — logika fallback FR-4 ── */}
      {/* btn-accent & btn-outline-primary sudah terdefinisi di globals.css:
          keduanya include inline-flex + items-center + gap → ikon & teks sejajar */}
      <div
        id="hero-cta-group"
        className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center animate-fade-in-up w-full max-w-xs sm:max-w-none"
        style={{ animationDelay: "200ms" }}
      >
        {bookingUrl ? (
          <a
            id="cta-booking-hero"
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-accent w-full sm:w-auto"
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
            className="btn-accent w-full sm:w-auto"
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
            className="btn-outline-primary w-full sm:w-auto"
          >
            <MessageCircle size={18} aria-hidden="true" />
            WhatsApp
          </a>
        )}
      </div>

      {/* ── Scroll indicator — absolute bottom ── */}
      <div
        id="hero-scroll-hint"
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden flex-col items-center gap-2 md:flex animate-fade-in"
        style={{ animationDelay: "600ms" }}
      >
        <span className="text-xs font-medium tracking-widest uppercase text-text-body/40">
          Scroll
        </span>
        <div className="relative w-5 h-8 rounded-full border-2 border-text-body/20 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-text-body/30 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
