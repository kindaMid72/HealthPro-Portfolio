import Image from 'next/image';
import {
  CalendarCheck,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries/id';
import { getCredentials, getDisplayName } from '@/lib/seo';
import type { Location, Profile } from '@/lib/types';
import TodayStatus from './TodayStatus';

interface HeroSectionProps {
  profile: Profile;
  bookingUrl: string | null;
  whatsappFallback: string | null;
  locations: Location[];
  tagline: string | null;
  locale: Locale;
  dict: Dictionary;
}

export default function HeroSection({
  profile,
  bookingUrl,
  whatsappFallback,
  locations,
  tagline,
  locale,
  dict,
}: HeroSectionProps) {
  const initials =
    profile.full_name
      .split(' ')
      .filter((w) => /^[A-Za-z]/.test(w))
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('') || dict.hero.avatarInitials;

  const strSip =
    profile.str_sip_display && !profile.str_sip_display.includes('[BELUM DIISI]')
      ? profile.str_sip_display
      : null;

  const credentials = getCredentials(profile.full_name).join(', ');

  const portrait = profile.photo_url ? (
    <Image
      src={profile.photo_url}
      alt={profile.full_name}
      fill
      priority
      sizes="(max-width: 768px) 112px, 480px"
      className="object-cover object-top"
    />
  ) : (
    <span
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center font-display text-4xl font-bold text-primary"
    >
      {initials}
    </span>
  );

  return (
    <section
      id="hero"
      aria-label={dict.hero.doctorProfileAria}
      className="bg-bg px-4 pb-10 pt-6 md:px-6 md:pb-16 md:pt-12"
    >
      <div className="mx-auto max-w-6xl md:grid md:grid-cols-12 md:items-center md:gap-10">
        <div className="md:col-span-7">
          <div className="flex items-start gap-4 md:block">
            <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-b from-primary-tint via-[#EBF3F5] to-surface shadow-card sm:h-32 sm:w-28 md:hidden">
              {portrait}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-surface/90 to-transparent" />
            </div>
            <div className="min-w-0">
              <h1
                id="doctor-name"
                className="animate-fade-in-up font-display text-3xl font-semibold leading-tight sm:text-4xl md:text-display"
              >
                {getDisplayName(profile.full_name)}
                {credentials && (
                  <>
                    <span className="sr-only">, </span>
                    <span className="mt-1 block font-sans text-base font-medium tracking-normal text-text-body md:text-xl">
                      {credentials}
                    </span>
                  </>
                )}
              </h1>
              <p
                id="doctor-specialty"
                className="animate-fade-in-up mt-1 text-sm font-semibold text-primary sm:text-base md:mt-2 md:text-xl"
                style={{ animationDelay: '80ms' }}
              >
                {profile.specialty}
              </p>
            </div>
          </div>

          {profile.sub_specialty && (
            <p id="doctor-subspecialty" className="mt-4 text-text-body md:mt-3">
              {profile.sub_specialty}
            </p>
          )}

          {tagline && (
            <p
              id="doctor-geography"
              className="mt-3 flex max-w-xl items-start gap-2 text-sm text-text-body md:text-base"
            >
              <MapPin size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
              <span>{tagline}</span>
            </p>
          )}

          {strSip && (
            <p id="hero-str-sip" className="mt-3 flex items-center gap-2 text-sm text-text-muted">
              <ShieldCheck size={16} aria-hidden="true" className="text-primary" />
              {dict.hero.strSipPrefix} {strSip}
            </p>
          )}

          {(bookingUrl || whatsappFallback) && (
            <div
              id="hero-cta-group"
              className="animate-fade-in-up mt-5 flex flex-col gap-3 sm:flex-row md:mt-7"
              style={{ animationDelay: '160ms' }}
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
                  {profile.hero_booking_label ?? dict.common.bookingNow}
                </a>
              ) : (
                <a
                  id="cta-whatsapp-hero"
                  href={whatsappFallback ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-accent"
                >
                  <MessageCircle size={18} aria-hidden="true" />
                  {profile.hero_whatsapp_label ?? dict.common.contactWhatsApp}
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
                  {profile.hero_whatsapp_label ?? dict.common.whatsapp}
                </a>
              )}
            </div>
          )}

          <div className="mt-5 md:mt-7 md:max-w-xl">
            <TodayStatus locations={locations} locale={locale} labels={dict.schedule} />
          </div>
        </div>

        <div className="hidden md:col-span-5 md:block">
          <div className="card-clinical rounded-3xl p-3 shadow-elevated">
            <div className="relative aspect-[4/4.4] overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-b from-primary-tint via-[#EBF3F5] to-surface">
              {portrait}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface via-surface/90 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
