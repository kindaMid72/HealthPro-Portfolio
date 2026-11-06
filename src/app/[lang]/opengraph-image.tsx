import { ImageResponse } from 'next/og';
import { hasLocale, type Locale } from '@/i18n/config';
import { getDictionaryFor } from '@/i18n/dictionary';
import { getAllSiteData } from '@/lib/content';
import { getCredentials, getDisplayName, getServiceAreas } from '@/lib/seo';

export const runtime = 'nodejs';
export const revalidate = 3600;

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function OGImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const locale: Locale = hasLocale(rawLang) ? rawLang : 'id';
  const dict = await getDictionaryFor(locale);
  const { profile, locations } = await getAllSiteData(locale);

  const areas = getServiceAreas(locations);
  const area = areas[areas.length - 1];
  const credentials = getCredentials(profile.full_name).join(', ');
  const areaPart = area ? `${dict.og.inAreaPrefix}${area}` : '';
  const specialtyLine = dict.og.atArea
    .replace('{specialty}', profile.specialty)
    .replace('{area}', areaPart);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '80px 100px',
          background: '#13252c',
        }}
      >
        <svg width="96" height="96" viewBox="0 0 48 48" fill="none" style={{ marginBottom: 40 }}>
          <path
            d="M12 9C12 19 17 24.5 24 26.5C31 24.5 36 19 36 9"
            stroke="#FFFFFF"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24 26.5V34"
            stroke="#FFFFFF"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="39.5" r="4.6" stroke="#FFFFFF" strokeWidth="3.4" />
          <circle cx="12" cy="8" r="2.4" fill="#FFFFFF" />
          <circle cx="36" cy="8" r="2.4" fill="#FFFFFF" />
        </svg>
        <div style={{ display: 'flex', fontSize: 80, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1 }}>
          {getDisplayName(profile.full_name)}
        </div>
        {credentials ? (
          <div style={{ display: 'flex', marginTop: 8, fontSize: 40, fontWeight: 500, color: '#A8B5BB' }}>
            {credentials}
          </div>
        ) : null}
        <div style={{ display: 'flex', marginTop: 32, fontSize: 28, color: '#7BBDC5' }}>
          {specialtyLine}
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
