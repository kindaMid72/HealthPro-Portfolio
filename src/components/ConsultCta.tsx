import Link from 'next/link';
import { CalendarCheck, MessageCircle } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries/id';
import { id as idDictionary } from '@/i18n/dictionaries/id';
import { format } from '@/i18n/dictionary';
import { localePath } from '@/i18n/path';

interface ConsultCtaProps {
  heading: string;
  doctorName: string;
  bookingUrl: string | null;
  whatsappFallback: string | null;
  locale?: Locale;
  labels?: Dictionary['cta'];
}

export default function ConsultCta({
  heading,
  doctorName,
  bookingUrl,
  whatsappFallback,
  locale = 'id',
  labels = idDictionary.cta,
}: ConsultCtaProps) {
  if (!bookingUrl && !whatsappFallback) return null;

  return (
    <section
      aria-label={labels.consultHeadingDefault}
      className="rounded-2xl bg-primary-dark p-6 text-white shadow-elevated md:p-8"
    >
      <h2 className="font-display text-xl font-semibold text-white md:text-2xl">{heading}</h2>
      <p className="mt-2 text-white/80">
        {format(labels.consultIntro, { name: doctorName })}
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        {bookingUrl && (
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-accent"
          >
            <CalendarCheck size={18} aria-hidden="true" />
            {labels.scheduleConsultation}
          </a>
        )}
        {whatsappFallback && (
          <a
            href={whatsappFallback}
            target="_blank"
            rel="noopener noreferrer"
            className={
              bookingUrl
                ? 'btn border border-white/25 bg-white/10 text-white hover:bg-white/20'
                : 'btn btn-accent'
            }
          >
            <MessageCircle size={18} aria-hidden="true" />
            {labels.chatWhatsApp}
          </a>
        )}
        <Link
          href={localePath(locale, '/#lokasi')}
          className="text-sm font-semibold text-white underline underline-offset-4 hover:text-white/80 sm:ml-2"
        >
          {labels.viewSchedule}
        </Link>
      </div>
    </section>
  );
}
