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
 * Styling: Layout dua kolom untuk desktop, stacked untuk mobile. Dirancang 
 * khusus untuk foto dokter tanpa background (no-bg) agar terlihat profesional.
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
      className="relative flex min-h-[calc(100dvh-64px)] w-full items-center justify-center overflow-hidden bg-bg px-4 pt-16 md:pt-24"
    >
      {/* ── Latar Dekoratif Premium ── */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        {/* Blob kanan atas — primary tone */}
        <div className="absolute -top-[15%] -right-[15%] h-[65%] w-[65%] rounded-full bg-primary/8 blur-[100px]" />
        {/* Blob kiri bawah — accent tone */}
        <div className="absolute top-[55%] -left-[20%] h-[55%] w-[55%] rounded-full bg-accent/6 blur-[90px]" />
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

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-12 md:flex-row md:items-center">
        {/* ── Kiri: Teks & CTA ── */}
        <div className="z-10 flex w-full flex-col items-center text-center md:w-1/2 md:items-start md:text-left md:pr-8">
          <h1
            id="doctor-name"
            className="mb-3 animate-fade-in-up font-heading text-4xl font-bold tracking-tight text-primary-dark md:text-5xl lg:text-6xl"
          >
            {profile.full_name}
          </h1>

          <p
            id="doctor-specialty"
            className="mb-2 animate-fade-in-up font-body text-lg font-semibold text-primary md:text-2xl"
            style={{ animationDelay: "60ms" }}
          >
            {profile.specialty}
          </p>

          {profile.sub_specialty && (
            <p
              id="doctor-subspecialty"
              className="mb-4 animate-fade-in-up text-base text-text-body md:text-lg"
              style={{ animationDelay: "100ms" }}
            >
              {profile.sub_specialty}
            </p>
          )}

          {profile.str_sip_display && (
            <div className="mb-8 mt-2 animate-fade-in-up" style={{ animationDelay: "130ms" }}>
              <span
                id="hero-str-sip"
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary shadow-sm"
              >
                <ShieldCheck size={14} aria-hidden="true" />
                No. STR/SIP: {profile.str_sip_display}
              </span>
            </div>
          )}

          {/* ── CTA booking — logika fallback FR-4 ── */}
          <div
            id="hero-cta-group"
            className="flex w-full max-w-xs animate-fade-in-up flex-col gap-3 sm:max-w-none sm:flex-row md:justify-start"
            style={{ animationDelay: "160ms" }}
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

            {/* Tombol WA sekunder */}
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
        </div>

        {/* ── Kanan: Foto Tanpa Background ── */}
        <div className="relative z-10 flex w-full justify-center md:w-1/2 md:justify-end md:self-end">
          {hasPhoto ? (
            <div className="relative flex h-[400px] w-full items-end justify-center md:h-[600px] lg:h-[700px]">
              {/* Lingkaran highlight di belakang foto agar foto lebih stand out */}
              <div className="absolute bottom-0 h-64 w-64 rounded-full bg-gradient-to-t from-primary/20 to-transparent blur-3xl md:h-[500px] md:w-[500px]"></div>
              
              <Image
                src={profile.photo_url}
                alt={`Foto ${profile.full_name}`}
                fill
                className="animate-fade-in object-contain object-bottom drop-shadow-2xl md:scale-110 md:origin-bottom"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ animationDelay: "200ms" }}
              />
            </div>
          ) : (
            <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full text-3xl font-bold text-white md:h-48 md:w-48 font-heading ring-4 ring-surface shadow-2xl shadow-primary/30"
              style={{ background: "linear-gradient(135deg, #3F6B74 0%, #243138 100%)" }}
            >
              {initials || "Dr"}
            </div>
          )}
        </div>
      </div>

      {/* ── Scroll indicator — absolute bottom ── */}
      <div
        id="hero-scroll-hint"
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex animate-fade-in"
        style={{ animationDelay: "600ms" }}
      >
        <span className="font-body text-xs font-medium tracking-widest text-text-body/40 uppercase">
          Scroll
        </span>
        <div className="flex h-8 w-5 items-start justify-center rounded-full border-2 border-text-body/20 pt-1.5 relative">
          <div className="h-2 w-1 animate-bounce rounded-full bg-text-body/30" />
        </div>
      </div>
    </section>
  );
}
