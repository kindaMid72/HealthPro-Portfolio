import Link from "next/link";
import { CalendarCheck, MessageCircle } from "lucide-react";

interface ConsultCtaProps {
  heading: string;
  doctorName: string;
  bookingUrl: string | null;
  whatsappFallback: string | null;
}

export default function ConsultCta({ heading, doctorName, bookingUrl, whatsappFallback }: ConsultCtaProps) {
  if (!bookingUrl && !whatsappFallback) return null;
  return (
    <section aria-label="Konsultasi" className="rounded-2xl bg-primary-dark p-6 text-white shadow-elevated md:p-8">
      <h2 className="font-display text-xl font-semibold text-white md:text-2xl">{heading}</h2>
      <p className="mt-2 text-white/80">
        Konsultasikan keluhan Anda langsung dengan {doctorName}.
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
            Jadwalkan konsultasi
          </a>
        )}
        {whatsappFallback && (
          <a
            href={whatsappFallback}
            target="_blank"
            rel="noopener noreferrer"
            className={
              bookingUrl
                ? "btn border border-white/25 bg-white/10 text-white hover:bg-white/20"
                : "btn btn-accent"
            }
          >
            <MessageCircle size={18} aria-hidden="true" />
            Chat WhatsApp
          </a>
        )}
        <Link
          href="/#lokasi"
          className="text-sm font-semibold text-white underline underline-offset-4 hover:text-white/80 sm:ml-2"
        >
          Lihat jadwal praktik
        </Link>
      </div>
    </section>
  );
}
