/**
 * components/ContactSection.tsx
 * Agregasi kanal kontak: WhatsApp/telepon per lokasi, email, tautan sosial.
 * Semua kosong → pesan fallback (FR-4).
 */

import { Fragment, type ReactNode } from "react";
import { MessageCircle, Phone, Mail, Globe, ArrowRight } from "lucide-react";
import type { Profile, Location } from "@/lib/types";
import { toWaLink } from "@/lib/cta";
import { parseSocialLinks } from "@/lib/seo";
import { formatPhoneId } from "@/lib/format";
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
      className="card-clinical card-clinical-interactive group flex items-center justify-between gap-4 p-4"
    >
      <span className="flex min-w-0 flex-1 items-center gap-3.5">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary"
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium text-text-muted">{label}</span>
          <span className="block truncate text-base font-semibold tabular-nums text-text-heading">{displayText}</span>
        </span>
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
      className="section-spacing border-t border-border bg-bg px-4 md:px-6"
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
          <div className="grid gap-3.5 sm:grid-cols-2">
            {locationsWithContact.map((loc, i) => (
              <Fragment key={`loc-${i}`}>
                {loc.whatsapp && toWaLink(loc.whatsapp) && (
                  <ContactRow
                    id={`contact-wa-item-${i}`}
                    icon={<MessageCircle size={20} />}
                    label={`WhatsApp — ${loc.location_name}`}
                    href={toWaLink(loc.whatsapp) ?? "#"}
                    displayText={formatPhoneId(loc.whatsapp)}
                    isExternal
                  />
                )}
                {loc.phone && (
                  <ContactRow
                    id={`contact-phone-item-${i}`}
                    icon={<Phone size={20} />}
                    label={`Telepon — ${loc.location_name}`}
                    href={`tel:${loc.phone}`}
                    displayText={formatPhoneId(loc.phone)}
                  />
                )}
              </Fragment>
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
      </div>
    </section>
  );
}
