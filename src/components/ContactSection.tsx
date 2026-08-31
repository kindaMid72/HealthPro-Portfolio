/**
 * components/ContactSection.tsx
 * Section kontak — agregasi semua channel komunikasi.
 *
 * Nomor WA diambil dari semua lokasi yang punya kontaknya (deduplicated).
 * Email diambil dari profile.
 * Kalau semua kosong → fallback message (FR-4).
 *
 * Styling: sesuai 04-design.md — background off-white, ikon Lucide,
 *          hover via CSS class saja (Server Component compatible).
 */

import { MessageCircle, Phone, Mail } from "lucide-react";
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
    <div
      id={id}
      className="flex items-center gap-4 rounded-xl px-5 py-4 bg-surface border border-border hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 group"
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors"
        aria-label={label}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-body/70"
        >
          {label}
        </p>
        <a
          href={href}
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="truncate text-base font-semibold text-primary hover:text-primary-dark transition-colors duration-200 block"
        >
          {displayText}
        </a>
      </div>
    </div>
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
      className="section-divider section-spacing px-4 bg-bg"
    >
      <div className="mx-auto max-w-3xl">
        <h2
          id="kontak-heading"
          className="mb-10 text-3xl font-bold md:text-4xl text-primary-dark font-heading tracking-tight"
        >
          Hubungi Kami
        </h2>

        {!hasAnyContact ? (
          <p id="contact-empty" className="text-text-body text-center py-8">
            Informasi kontak segera hadir.
          </p>
        ) : (
          <div className="space-y-3">
            {/* WhatsApp — satu baris per nomor unik */}
            {allWhatsapps.map((wa, i) => (
              <ContactRow
                key={`wa-${i}`}
                id={`contact-wa-item-${i}`}
                icon={
                  <MessageCircle
                    size={20}
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
                    size={20}
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
                    size={20}
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
