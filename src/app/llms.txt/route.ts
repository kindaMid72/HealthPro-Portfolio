/**
 * app/llms.txt/route.ts — /llms.txt (GEO: ringkasan situs untuk LLM/AI crawler)
 *
 * Markdown polos berisi fakta inti dokter, diturunkan dari data Sheet yang sama
 * dengan halaman utama. Field kosong dilewati — tidak ada data dikarang.
 * Spec: https://llmstxt.org
 */

import { getAllSiteData } from "@/lib/sheets";
import { getSiteUrl, splitList } from "@/lib/seo";

export const revalidate = 3600; // sama dengan ISR data Sheet

export async function GET() {
  const { profile, locations, services } = await getAllSiteData();
  const siteUrl = getSiteUrl();

  const lines: string[] = [];
  const section = (title: string, items: string[]) => {
    if (items.length === 0) return;
    lines.push("", `## ${title}`, ...items);
  };

  lines.push(
    `# ${profile.full_name}`,
    "",
    `> ${profile.specialty}. Situs profil resmi dokter: jadwal praktik, lokasi, layanan, dan tautan booking.`,
    "",
    `Situs: ${siteUrl}`,
    "Bahasa: Indonesia",
  );
  if (profile.email) lines.push(`Email: ${profile.email}`);
  if (profile.str_sip_display && !/belum diisi/i.test(profile.str_sip_display)) lines.push(`STR/SIP: ${profile.str_sip_display}`);
  if (profile.booking_url) lines.push(`Booking: ${profile.booking_url}`);

  section("Pendidikan", splitList(profile.education).map((e) => `- ${e}`));
  section("Pengalaman", splitList(profile.experience_history).map((e) => `- ${e}`));
  section("Sertifikasi", splitList(profile.certifications).map((e) => `- ${e}`));
  section("Organisasi profesi", splitList(profile.organizations).map((e) => `- ${e}`));
  section(
    "Layanan",
    services.map((s) => `- ${s.service_name}`),
  );
  section(
    "Lokasi & jadwal praktik",
    locations.flatMap((l) => {
      const row = [`- **${l.location_name}**`, `  - Alamat: ${l.address}`, `  - Jam praktik: ${l.practice_hours}`];
      if (l.whatsapp) row.push(`  - WhatsApp: ${l.whatsapp}`);
      if (l.phone) row.push(`  - Telepon: ${l.phone}`);
      return row;
    }),
  );
  section("Tautan", [`- [Halaman utama](${siteUrl}): profil lengkap`, `- [Sitemap](${siteUrl}/sitemap.xml)`]);

  lines.push(
    "",
    "## Catatan",
    "Informasi di situs ini bersifat umum dan bukan pengganti konsultasi medis. Untuk kondisi darurat, segera ke fasilitas kesehatan terdekat.",
    "",
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
