import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { getProfile } from "@/lib/sheets";

/**
 * Plus Jakarta Sans — heading font (Semibold/Bold)
 * Modern, sedikit karakter tapi tetap profesional.
 * Sesuai 04-design.md.
 */
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap", // cegah CLS saat font load
});

/**
 * Inter — body font (Regular/Medium)
 * Sangat terbaca di ukuran kecil, penting untuk keterbacaan
 * konten medis lintas usia. Sesuai 04-design.md.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

/**
 * generateMetadata — Fase 4 (SEO)
 * Metadata dinamis diambil dari Google Sheet via getProfile().
 * Next.js otomatis dedup request ini dengan page.tsx (satu render cycle).
 */
export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://localhost:3000";
  const doctorName = profile.full_name;
  const specialty = profile.specialty;

  const title = `${doctorName} — ${specialty}`;
  const description = `Profil dan jadwal praktik ${doctorName}, ${specialty}. Tersedia di 3 lokasi praktik di Tanah Bumbu, Kalimantan Selatan. Informasi lokasi, layanan, dan cara booking tersedia di sini.`;

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
    alternates: {
      canonical: siteUrl,
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
      className={`${plusJakartaSans.variable} ${inter.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
