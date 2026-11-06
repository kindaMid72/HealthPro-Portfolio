import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

export interface NavCtaLabels {
  booking: string;
  whatsapp: string;
  viewSchedule: string;
}

interface NavCtaProps {
  bookingUrl: string | null;
  whatsappFallback: string | null;
  locale?: Locale;
  labels?: NavCtaLabels;
  className?: string;
  size?: 'sm' | 'md';
}

const DEFAULT_LABELS: NavCtaLabels = {
  booking: 'Booking',
  whatsapp: 'WhatsApp',
  viewSchedule: 'Lihat jadwal',
};

/** CTA utama navbar: booking → WhatsApp → lihat jadwal. */
export default function NavCta({
  bookingUrl,
  whatsappFallback,
  locale = 'id',
  labels = DEFAULT_LABELS,
  className = '',
  size = 'sm',
}: NavCtaProps) {
  const sizeClass = size === 'sm' ? 'btn-sm' : '';
  const external = bookingUrl ?? whatsappFallback;
  if (external) {
    return (
      <a
        href={external}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn btn-accent ${sizeClass} ${className}`}
      >
        {bookingUrl ? labels.booking : labels.whatsapp}
      </a>
    );
  }
  return (
    <Link
      href={localePath(locale, '/#lokasi')}
      className={`btn btn-secondary ${sizeClass} ${className}`}
    >
      {labels.viewSchedule}
    </Link>
  );
}
