import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
