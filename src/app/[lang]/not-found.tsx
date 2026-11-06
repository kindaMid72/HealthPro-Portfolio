import type { Metadata } from 'next';
import Link from 'next/link';
import { lang } from 'next/root-params';
import SiteShell from '@/components/SiteShell';
import { hasLocale, type Locale } from '@/i18n/config';
import { getDictionaryFor } from '@/i18n/dictionary';
import { localePath } from '@/i18n/path';
import { getAllSiteData } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Halaman Tidak Ditemukan',
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  const currentLang = await lang();
  const locale: Locale = hasLocale(currentLang) ? currentLang : 'id';
  const dict = await getDictionaryFor(locale);
  const { profile, locations } = await getAllSiteData(locale);

  return (
    <SiteShell profile={profile} locations={locations} locale={locale} dict={dict}>
      <section className="bg-bg px-4 py-20 md:py-28">
        <div className="card-clinical mx-auto max-w-xl p-8 text-center md:p-10">
          <h1 className="font-display text-h2 font-semibold">{dict.notFound.heading}</h1>
          <p className="mt-4 text-text-body">{dict.notFound.description}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={localePath(locale, '/')} className="btn btn-primary">
              {dict.notFound.backHome}
            </Link>
            <Link href={localePath(locale, '/artikel')} className="btn btn-secondary">
              {dict.notFound.viewArticles}
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
