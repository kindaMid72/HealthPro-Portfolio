import type { Metadata } from "next";
import { Figtree, Literata } from "next/font/google";
import "./globals.css";
import { getAllSiteData } from "@/lib/content";
import { buildDescription, getServiceAreas, getSiteUrl } from "@/lib/seo";

/** Figtree — font UI & isi halaman (variable font). */
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap", // cegah CLS saat font load
});

/** Literata — judul display (h1/h2) dan isi artikel/layanan panjang. */
const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

/**
 * generateMetadata — Fase 4 (SEO)
 * Metadata dinamis diambil dari Google Sheet via getProfile().
 * Next.js otomatis dedup request ini dengan page.tsx (satu render cycle).
 */
export async function generateMetadata(): Promise<Metadata> {
  const { profile, locations, services } = await getAllSiteData();

  const siteUrl = getSiteUrl();
  const doctorName = profile.full_name;
  const specialty = profile.specialty;
  const areas = getServiceAreas(locations);

  // Title & description murni dari data Sheet (nama, spesialisasi, lokasi, layanan)
  const title = areas.length
    ? `${doctorName} — ${specialty} di ${areas[areas.length - 1]}`
    : `${doctorName} — ${specialty}`;
  const description = buildDescription(profile, locations, services);

  // OG image: pakai route opengraph-image.tsx yang dirender Next.js otomatis,
  // atau fallback ke /images/dokter-1.png jika route belum tersedia.
  const ogImageUrl = `${siteUrl}/opengraph-image`;

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: doctorName,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${doctorName} — ${specialty}`,
        },
      ],
      locale: "id_ID",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    authors: [{ name: doctorName, url: siteUrl }],
    keywords: [doctorName, specialty, ...services.map((s) => s.service_name), ...areas],
    alternates: {
      canonical: siteUrl,
      languages: { "id-ID": siteUrl, "x-default": siteUrl },
      types: { "text/markdown": `${siteUrl}/llms.txt` },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${figtree.variable} ${literata.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
