import { Fragment, type ReactNode } from 'react';
import { ArrowRight, Globe, Mail, MessageCircle, Phone } from 'lucide-react';
import type { Dictionary } from '@/i18n/dictionaries/id';
import { format } from '@/i18n/dictionary';
import { toWaLink } from '@/lib/cta';
import { formatPhoneId } from '@/lib/format';
import { parseSocialLinks } from '@/lib/seo';
import type { Location, Profile } from '@/lib/types';
import SectionHeading from './SectionHeading';

interface ContactRowProps {
  id: string;
  icon: ReactNode;
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
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="card-clinical card-clinical-interactive group flex min-w-0 max-w-full items-center justify-between gap-4 overflow-hidden p-4"
    >
      <span className="flex min-w-0 flex-1 items-center gap-3.5">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary transition-colors group-hover:bg-primary group-hover:text-white"
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-semibold uppercase tracking-wider text-text-muted">
            {label}
          </span>
          <span className="block truncate font-semibold text-text-heading group-hover:text-primary">
            {displayText}
          </span>
        </span>
      </span>
      <ArrowRight
        size={16}
        aria-hidden="true"
        className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
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

interface ContactSectionProps {
  profile: Profile;
  locations: Location[];
  dict: Dictionary;
  surface?: boolean;
}

export default function ContactSection({
  profile,
  locations,
  dict,
  surface = true,
}: ContactSectionProps) {
  const locationsWithContact = locations.filter((l) => l.whatsapp || l.phone);
  const socials = parseSocialLinks(profile.social_links);
  const hasAnyContact = locationsWithContact.length > 0 || !!profile.email || socials.length > 0;

  return (
    <section
      id="kontak"
      aria-labelledby="kontak-heading"
      className={`section-spacing border-t border-border px-4 md:px-6 ${
        surface ? 'bg-surface' : 'bg-bg'
      }`}
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="kontak-heading"
          title={dict.contact.sectionTitle}
          intro={dict.contact.sectionIntro}
        />

        {!hasAnyContact ? (
          <p id="contact-empty" className="py-8 text-text-body">
            {dict.contact.empty}
          </p>
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2">
            {locationsWithContact.map((loc, i) => (
              <Fragment key={`loc-${i}`}>
                {loc.whatsapp && toWaLink(loc.whatsapp) && (
                  <ContactRow
                    id={`contact-wa-item-${i}`}
                    icon={<MessageCircle size={20} />}
                    label={format(dict.contact.whatsappAt, { location: loc.location_name })}
                    href={toWaLink(loc.whatsapp) ?? '#'}
                    displayText={formatPhoneId(loc.whatsapp)}
                    isExternal
                  />
                )}
                {loc.phone && (
                  <ContactRow
                    id={`contact-phone-item-${i}`}
                    icon={<Phone size={20} />}
                    label={format(dict.contact.phoneAt, { location: loc.location_name })}
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
                label={dict.contact.email}
                href={`mailto:${profile.email}`}
                displayText={profile.email}
              />
            )}
            {socials.map((url) => (
              <ContactRow
                key={url}
                id={`contact-social-${hostname(url)}`}
                icon={<Globe size={20} />}
                label={dict.contact.socialMedia}
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
