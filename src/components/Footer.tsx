import Link from 'next/link';
import { ArrowUp, TriangleAlert } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries/id';
import { format } from '@/i18n/dictionary';
import { localePath } from '@/i18n/path';
import { NAV_LINKS } from '@/lib/nav';
import type { Profile } from '@/lib/types';
import BrandMark from './BrandMark';

interface FooterProps {
  profile: Profile;
  locale: Locale;
  dict: Dictionary;
}

export default function Footer({ profile, locale, dict }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-primary-dark px-4 py-12 text-white/80 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 text-sm md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <BrandMark className="h-9 w-9 shrink-0 text-white" />
              <div>
                <p className="font-display text-lg font-semibold text-white">{profile.full_name}</p>
                <p className="mt-0.5">{profile.specialty}</p>
              </div>
            </div>
            {profile.sub_specialty && (
              <p className="mt-4 max-w-sm leading-relaxed text-white/70">{profile.sub_specialty}</p>
            )}
          </div>

          <nav aria-label={dict.footer.navigationAria} className="md:col-span-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
              {dict.footer.navigationHeading}
            </p>
            <ul className="space-y-2">
              {NAV_LINKS.map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={localePath(locale, href)}
                    className="transition-colors hover:text-white hover:underline"
                  >
                    {dict.nav[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-3 rounded-2xl border border-white/15 bg-white/5 p-4 leading-relaxed md:col-span-4">
            <p>{dict.footer.disclaimer}</p>
            <p className="flex items-start gap-2 border-t border-white/15 pt-3 text-white">
              <TriangleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
              <span>{dict.common.emergencyNote}</span>
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/15 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>{format(dict.footer.copyright, { year, name: profile.full_name })}</p>
          <a href="#top" className="inline-flex items-center gap-1.5 hover:text-white">
            <ArrowUp size={14} aria-hidden="true" />
            {dict.footer.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
