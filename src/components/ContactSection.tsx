/**
 * components/ContactSection.tsx
 * Section kontak — agregasi semua channel komunikasi.
 *
 * Nomor WA diambil dari semua lokasi yang punya kontaknya (deduplicated).
 * Email diambil dari profile.
 * Kalau semua kosong → fallback message (FR-4).
 *
 * Styling: sesuai 04-design.md — background gradient subtle, ikon Lucide,
 *          hover via CSS class saja (Server Component compatible).
 *
 * CATATAN: ContactRow menggunakan inline-flex items-center agar ikon selalu
 * sejajar dengan label dan teks — termasuk untuk "Hubungi via WhatsApp".
 */

import { MessageCircle, Phone, Mail, ArrowRight } from "lucide-react";
import { Profile, Location } from "@/lib/types";

interface ContactSectionProps {
  profile: Profile;
  locations: Location[];
}

/** Konversi nomor WA Indonesia ke format wa.me */
function toWaLink(wa: string): string {
  const digits = wa.replace(/\D/g, "");
  const normalized = digits.startsWith("0")
    ? `62${digits.slice(1)}`
    : digits;
  return `https://wa.me/${normalized}`;
}

interface ContactRowProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  href: string;
  displayText: string;
  isExternal?: boolean;
}

function ContactRow({
  id,
  icon,
  label,
  href,
  displayText,
  isExternal = false,
}: ContactRowProps) {
  return (
    <a
      id={id}
      href={href}
      {...(isExternal
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className="group flex items-center gap-4 rounded-2xl px-5 py-4 bg-surface border border-border
                 hover:shadow-md hover:border-primary/25 hover:-translate-y-0.5
                 transition-all duration-300"
    >
      {/* Icon circle */}
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/18 transition-colors duration-200"
        aria-label={label}
      >
        {icon}
      </span>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-text-body/60">
          {label}
        </p>
        <span className="truncate text-sm font-semibold text-primary group-hover:text-primary-dark transition-colors duration-200 block">
          {displayText}
        </span>
      </div>

      {/* Arrow */}
      <ArrowRight
        size={16}
        aria-hidden="true"
        className="shrink-0 text-text-body/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200"
      />
    </a>
  );
}

export default function ContactSection({
  profile,
  locations,
}: ContactSectionProps) {
  // Kumpulkan nomor WA unik dari semua lokasi
  const allWhatsapps = [
    ...new Set(locations.filter((l) => l.whatsapp).map((l) => l.whatsapp!)),
  ];

  // Kumpulkan nomor telepon unik dari semua lokasi
  const allPhones = [
    ...new Set(locations.filter((l) => l.phone).map((l) => l.phone!)),
  ];

  const hasAnyContact =
    allWhatsapps.length > 0 || allPhones.length > 0 || !!profile.email;

  return (
    <section
      id="kontak"
      aria-labelledby="kontak-heading"
      className="section-divider section-spacing px-4"
      style={{
        background:
          "linear-gradient(160deg, #F7F8F7 0%, #EEF2F3 50%, #F7F8F7 100%)",
      }}
    >
      <div className="mx-auto max-w-3xl">
        {/* Heading dengan accent underline */}
        <div className="mb-12">
          <h2
            id="kontak-heading"
            className="text-3xl font-bold md:text-4xl text-primary-dark font-heading tracking-tight"
          >
            Hubungi Kami
          </h2>
          <div aria-hidden="true" className="mt-3 flex items-center gap-2">
            <div className="h-1 w-12 rounded-full bg-primary" />
            <div className="h-1 w-4 rounded-full bg-accent" />
          </div>
          <p className="mt-4 text-sm text-text-body/70 max-w-md">
            Ada pertanyaan atau ingin membuat janji temu? Hubungi kami melalui saluran berikut.
          </p>
        </div>

        {!hasAnyContact ? (
          <p id="contact-empty" className="text-text-body text-center py-8">
            Informasi kontak segera hadir.
          </p>
        ) : (
          <div className="space-y-3 max-w-xl">
            {/* WhatsApp — satu baris per nomor unik */}
            {allWhatsapps.map((wa, i) => (
              <ContactRow
                key={`wa-${i}`}
                id={`contact-wa-item-${i}`}
                icon={
                  <MessageCircle
                    size={22}
                    className="text-primary"
                    aria-hidden="true"
                  />
                }
                label="WhatsApp"
                href={toWaLink(wa)}
                displayText={wa}
                isExternal
              />
            ))}

            {/* Telepon */}
            {allPhones.map((phone, i) => (
              <ContactRow
                key={`phone-${i}`}
                id={`contact-phone-item-${i}`}
                icon={
                  <Phone
                    size={22}
                    className="text-primary"
                    aria-hidden="true"
                  />
                }
                label="Telepon"
                href={`tel:${phone}`}
                displayText={phone}
              />
            ))}

            {/* Email (dari profile, opsional) */}
            {profile.email && (
              <ContactRow
                id="contact-email-item"
                icon={
                  <Mail
                    size={22}
                    className="text-primary"
                    aria-hidden="true"
                  />
                }
                label="Email"
                href={`mailto:${profile.email}`}
                displayText={profile.email}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
