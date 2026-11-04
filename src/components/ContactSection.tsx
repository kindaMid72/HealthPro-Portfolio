/**
 * components/ContactSection.tsx
 * Agregasi kanal kontak: WhatsApp/telepon per lokasi, email, tautan sosial.
 * Semua kosong → pesan fallback (FR-4).
 */

import type { ReactNode } from "react";
import { MessageCircle, Phone, Mail, Globe, ArrowRight } from "lucide-react";
import type { Profile, Location } from "@/lib/types";
import { toWaLink, EMERGENCY_NOTE } from "@/lib/cta";
import { parseSocialLinks } from "@/lib/seo";
import SectionHeading from "./SectionHeading";

interface ContactRowProps {
  id: string;
  icon: ReactNode;
  label: string;
  href: string;
  displayText: string;
  isExternal?: boolean;
}

function ContactRow({ id, icon, label, href, displayText, isExternal = false }: ContactRowProps) {
  return (
    <a
      id={id}
      href={href}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex items-center gap-4 rounded-xl border border-border bg-surface px-5 py-4 hover:border-primary"
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-primary"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-text-muted">{label}</span>
        <span className="block truncate text-base font-semibold text-text-heading">{displayText}</span>
      </span>
      <ArrowRight
        size={16}
        aria-hidden="true"
        className="shrink-0 text-text-muted group-hover:text-primary"
      />
    </a>
  );
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function ContactSection({ profile, locations }: { profile: Profile; locations: Location[] }) {
  const locationsWithContact = locations.filter((l) => l.whatsapp || l.phone);
  const socials = parseSocialLinks(profile.social_links);
  const hasAnyContact = locationsWithContact.length > 0 || !!profile.email || socials.length > 0;

  return (
    <section
      id="kontak"
      aria-labelledby="kontak-heading"
      className="section-spacing border-t border-border bg-surface px-4 md:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="kontak-heading"
          title="Kontak & pendaftaran"
          intro="Hubungi lokasi praktik untuk mendaftar atau bertanya."
        />

        {!hasAnyContact ? (
          <p id="contact-empty" className="py-8 text-text-body">
            Informasi kontak segera hadir.
          </p>
        ) : (
          <div className="grid max-w-3xl gap-3">
            {locationsWithContact.map((loc, i) => (
              <div key={`loc-${i}`} className="grid gap-3">
                {loc.whatsapp && toWaLink(loc.whatsapp) && (
                  <ContactRow
                    id={`contact-wa-item-${i}`}
                    icon={<MessageCircle size={20} />}
                    label={`WhatsApp — ${loc.location_name}`}
                    href={toWaLink(loc.whatsapp) ?? "#"}
                    displayText={loc.whatsapp}
                    isExternal
                  />
                )}
                {loc.phone && (
                  <ContactRow
                    id={`contact-phone-item-${i}`}
                    icon={<Phone size={20} />}
                    label={`Telepon — ${loc.location_name}`}
                    href={`tel:${loc.phone}`}
                    displayText={loc.phone}
                  />
                )}
              </div>
            ))}
            {profile.email && (
              <ContactRow
                id="contact-email-item"
                icon={<Mail size={20} />}
                label="Email"
                href={`mailto:${profile.email}`}
                displayText={profile.email}
              />
            )}
            {socials.map((url) => (
              <ContactRow
                key={url}
                id={`contact-social-${hostname(url)}`}
                icon={<Globe size={20} />}
                label="Media sosial"
                href={url}
                displayText={hostname(url)}
                isExternal
              />
            ))}
          </div>
        )}

        <p className="mt-6 max-w-3xl rounded-xl border border-border p-4 text-sm">{EMERGENCY_NOTE}</p>
      </div>
    </section>
  );
}
