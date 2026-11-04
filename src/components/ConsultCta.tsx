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
    <section aria-label="Konsultasi" className="rounded-xl bg-primary-tint p-6 md:p-8">
      <h2 className="text-xl font-bold md:text-2xl">{heading}</h2>
      <p className="mt-2 text-text-body">
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
            className={bookingUrl ? "btn btn-secondary" : "btn btn-accent"}
          >
            <MessageCircle size={18} aria-hidden="true" />
            Chat WhatsApp
          </a>
        )}
        <Link href="/#lokasi" className="link sm:ml-2">
          Lihat jadwal praktik
        </Link>
      </div>
    </section>
  );
}
