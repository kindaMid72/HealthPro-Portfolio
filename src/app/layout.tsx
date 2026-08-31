import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

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
 * Metadata placeholder Fase 1.
 * Akan diganti dengan generateMetadata() dinamis di Fase 4 (SEO).
 */
export const metadata: Metadata = {
  title: "Profil Dokter Spesialis THT-BKL",
  description:
    "Website profil dokter spesialis Telinga Hidung Tenggorok (THT-BKL). Informasi jadwal praktik, lokasi, dan layanan tersedia di sini.",
};

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
