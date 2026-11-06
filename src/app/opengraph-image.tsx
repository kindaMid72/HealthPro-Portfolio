/**
 * app/opengraph-image.tsx — OG Image dinamis (Fase 4: SEO)
 *
 * Dirender oleh Next.js ImageResponse API saat path /opengraph-image di-hit.
 * Ukuran 1200×630 sesuai standar OG image untuk Facebook, WhatsApp, dll.
 *
 * CATATAN TEKNIS (Next.js ImageResponse constraints):
 *  - Tidak support: z-index, fit-content, CSS vars, gradient shorthand kompleks
 *  - Setiap <div> wajib display: flex; font kustom tidak dimuat (font default)
 *  - Geometri logo harus sinkron dengan src/components/BrandMark.tsx
 */

import { ImageResponse } from "next/og";
import { getAllSiteData } from "@/lib/content";
import { getCredentials, getDisplayName, getServiceAreas } from "@/lib/seo";

export const runtime = "nodejs";

export const revalidate = 3600;

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export const alt = "Profil dokter spesialis";

export default async function OGImage() {
  const { profile, locations } = await getAllSiteData();
  const areas = getServiceAreas(locations);
  const area = areas[areas.length - 1];
  const credentials = getCredentials(profile.full_name).join(", ");
  const specialtyLine = `${profile.specialty}${area ? ` di ${area}` : ""}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px 100px",
          background: "#13252c",
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
        <div style={{ display: "flex", fontSize: 80, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.1 }}>
          {getDisplayName(profile.full_name)}
        </div>
        {credentials ? (
          <div style={{ display: "flex", marginTop: 8, fontSize: 40, fontWeight: 500, color: "#A8B5BB" }}>
            {credentials}
          </div>
        ) : null}
        <div style={{ display: "flex", marginTop: 32, fontSize: 28, color: "#7BBDC5" }}>
          {specialtyLine}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
