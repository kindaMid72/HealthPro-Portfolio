import type { Locale } from '@/i18n/config';
import { getDictionaryFor } from '@/i18n/dictionary';
import { absoluteUrl } from '@/i18n/path';
import { getAllSiteData, getPublishedArticles } from '@/lib/content';
import { getSiteUrl, splitList } from '@/lib/seo';

export async function buildLlmsTxt(locale: Locale): Promise<string> {
  const dict = await getDictionaryFor(locale);
  const [{ profile, locations, services }, articles] = await Promise.all([
    getAllSiteData(locale),
    getPublishedArticles(50, locale),
  ]);
  const siteUrl = getSiteUrl();
  const localizedHome = absoluteUrl(locale, '/');

  const lines: string[] = [];
  const section = (title: string, items: string[]) => {
    if (items.length === 0) return;
    lines.push('', `## ${title}`, ...items);
  };

  lines.push(
    `# ${profile.full_name}`,
    '',
    `> ${profile.specialty}. ${dict.llms.officialSite}`,
    '',
    `${dict.llms.siteLabel}: ${localizedHome}`,
    dict.llms.languageName,
  );
  if (profile.email) lines.push(`Email: ${profile.email}`);
  if (profile.str_sip_display && !/belum diisi/i.test(profile.str_sip_display)) {
    lines.push(`STR/SIP: ${profile.str_sip_display}`);
  }
  if (profile.booking_url) lines.push(`Booking: ${profile.booking_url}`);

  section(dict.llms.education, splitList(profile.education).map((e) => `- ${e}`));
  section(dict.llms.experience, splitList(profile.experience_history).map((e) => `- ${e}`));
  section(dict.llms.certifications, splitList(profile.certifications).map((e) => `- ${e}`));
  section(dict.llms.organizations, splitList(profile.organizations).map((e) => `- ${e}`));
  section(
    dict.llms.services,
    services.map((s) =>
      s.hasDetail
        ? `- [${s.service_name}](${absoluteUrl(locale, `/layanan/${s.slug}`)})`
        : `- ${s.service_name}`,
    ),
  );
  section(
    dict.llms.locationsAndSchedule,
    locations.flatMap((l) => {
      const row = [
        `- **${l.location_name}**`,
        `  - ${dict.llms.address}: ${l.address}`,
        `  - ${dict.llms.practiceHours}: ${l.practice_hours}`,
      ];
      if (l.whatsapp) row.push(`  - WhatsApp: ${l.whatsapp}`);
      if (l.phone) row.push(`  - Telepon: ${l.phone}`);
      return row;
    }),
  );
  section(
    dict.llms.articles,
    articles.map(
      (a) =>
        `- [${a.title}](${absoluteUrl(locale, `/artikel/${a.slug}`)}) [${a.categoryLabel}]: ${a.excerpt || a.title}`,
    ),
  );
  section(dict.llms.links, [
    `- [${dict.llms.mainPage}](${localizedHome}): ${dict.llms.mainPageDesc}`,
    `- [${dict.llms.articleIndex}](${absoluteUrl(locale, '/artikel')})`,
    `- [Sitemap](${siteUrl}/sitemap.xml)`,
  ]);
  lines.push('', `## ${dict.llms.notes}`, dict.llms.disclaimer, '');

  return lines.join('\n');
}
