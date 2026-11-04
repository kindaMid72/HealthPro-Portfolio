/**
 * components/HeroSection.tsx
 * Section pertama, harus above the fold di mobile 375×667 (FR-1):
 * nama, foto, spesialisasi, dan CTA terlihat tanpa scroll.
 *
 * Logika CTA booking (FR-4):
 *  1. booking_url ada → "Booking sekarang" (+ WhatsApp sekunder bila ada)
 *  2. booking_url kosong & WhatsApp ada → "Hubungi via WhatsApp"
 *  3. Keduanya kosong → tanpa tombol (tidak ada link rusak)
 */

import Image from "next/image";
import { CalendarCheck, MessageCircle, ShieldCheck } from "lucide-react";
import type { Profile } from "@/lib/types";
import type { PracticeSlot } from "@/lib/schedule";
import TodayStatus from "./TodayStatus";

interface HeroSectionProps {
  profile: Profile;
  bookingUrl: string | null;
  whatsappFallback: string | null;
  slots: PracticeSlot[];
  serviceArea: string | null;
}

export default function HeroSection({
  profile,
  bookingUrl,
  whatsappFallback,
  slots,
  serviceArea,
}: HeroSectionProps) {
  const initials = profile.full_name
    .split(" ")
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const strSip =
    profile.str_sip_display && !profile.str_sip_display.includes("[BELUM DIISI]")
      ? profile.str_sip_display
      : null;

  return (
    <section id="hero" aria-label="Profil Dokter" className="bg-bg px-4 pb-12 pt-6 md:px-6 md:pb-20 md:pt-14">
      <div className="mx-auto grid max-w-6xl grid-cols-[5.5rem_1fr] gap-x-4 gap-y-5 md:grid-cols-12 md:grid-rows-[1fr_repeat(5,auto)_1fr] md:gap-x-10 md:gap-y-0">
        {/* Foto: tile kecil di samping nama (mobile), panel besar di kanan (desktop) */}
        <div className="relative col-start-1 row-start-1 h-[6.875rem] w-[5.5rem] overflow-hidden rounded-xl bg-primary-tint md:col-span-5 md:col-start-8 md:row-span-7 md:h-auto md:w-full md:self-center md:aspect-[4/5] md:rounded-[1.75rem]">
          {profile.photo_url ? (
            <Image
              src={profile.photo_url}
              alt={`Foto ${profile.full_name}, ${profile.specialty}`}
              fill
              unoptimized={profile.photo_url.startsWith("/media/")}
              priority
              sizes="(max-width: 767px) 88px, 40vw"
              className="object-cover object-top md:object-contain md:object-bottom"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary md:text-6xl"
            >
              {initials || "Dr"}
            </span>
          )}
        </div>

        <div className="col-start-2 row-start-1 self-center md:col-span-7 md:col-start-1 md:row-start-2">
          <h1
            id="doctor-name"
            className="animate-fade-in-up text-[1.75rem] font-bold leading-tight md:text-display"
          >
            {profile.full_name}
          </h1>
          <p
            id="doctor-specialty"
            className="animate-fade-in-up mt-2 font-semibold text-primary md:text-xl"
            style={{ animationDelay: "80ms" }}
          >
            {profile.specialty}
          </p>
          {profile.sub_specialty && (
            <p id="doctor-subspecialty" className="mt-1 text-text-body">
              {profile.sub_specialty}
            </p>
          )}
        </div>

        {serviceArea && (
          <p id="doctor-geography" className="col-span-2 max-w-xl md:col-span-7 md:row-start-3 md:mt-5">
            {serviceArea}
          </p>
        )}

        {strSip && (
          <div className="col-span-2 md:col-span-7 md:row-start-4 md:mt-4">
            <span id="hero-str-sip" className="chip bg-primary-tint text-primary gap-2">
              <ShieldCheck size={16} aria-hidden="true" />
              STR/SIP {strSip}
            </span>
          </div>
        )}

        {(bookingUrl || whatsappFallback) && (
          <div
            id="hero-cta-group"
            className="animate-fade-in-up col-span-2 flex flex-col gap-3 sm:flex-row md:col-span-7 md:row-start-5 md:mt-7"
            style={{ animationDelay: "160ms" }}
          >
            {bookingUrl ? (
              <a
                id="cta-booking-hero"
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-accent"
              >
                <CalendarCheck size={18} aria-hidden="true" />
                Booking sekarang
              </a>
            ) : (
              <a
                id="cta-whatsapp-hero"
                href={whatsappFallback ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-accent"
              >
                <MessageCircle size={18} aria-hidden="true" />
                Hubungi via WhatsApp
              </a>
            )}
            {bookingUrl && whatsappFallback && (
              <a
                id="cta-whatsapp-secondary-hero"
                href={whatsappFallback}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <MessageCircle size={18} aria-hidden="true" />
                WhatsApp
              </a>
            )}
          </div>
        )}

        <div className="col-span-2 md:col-span-7 md:row-start-6 md:mt-7 md:max-w-xl">
          <TodayStatus slots={slots} />
        </div>
      </div>
    </section>
  );
}
