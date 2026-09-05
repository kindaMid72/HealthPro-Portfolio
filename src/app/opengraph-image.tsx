/**
 * app/opengraph-image.tsx — OG Image dinamis (Fase 4: SEO)
 *
 * Dirender oleh Next.js ImageResponse API saat path /opengraph-image di-hit.
 * Ukuran 1200×630 sesuai standar OG image untuk Facebook, WhatsApp, dll.
 *
 * CATATAN TEKNIS (Next.js ImageResponse constraints):
 *  - Tidak support: z-index, fit-content, CSS vars, gradient shorthand kompleks
 *  - Image eksternal di build time bisa gagal load → pakai desain text-only saat ini
 *  - Setelah foto dokter asli tersedia sebagai file statis, bisa diganti pakai
 *    fs.readFile untuk embed base64 image
 */

import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#243138",
          padding: "80px 100px",
          position: "relative",
        }}
      >
        {/* Accent bar kiri */}
        <div
          style={{
            position: "absolute",
            left: "0px",
            top: "0px",
            bottom: "0px",
            width: "8px",
            background: "#D98C4A",
            display: "flex",
          }}
        />

        {/* Background dekoratif: lingkaran blur kanan */}
        <div
          style={{
            position: "absolute",
            right: "-120px",
            top: "-120px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            backgroundColor: "#3F6B7430",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "80px",
            bottom: "-80px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            backgroundColor: "#D98C4A20",
            display: "flex",
          }}
        />

        {/* Badge spesialisasi */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#3F6B7440",
            borderRadius: "999px",
            padding: "8px 24px",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              color: "#7BBDC5",
              fontSize: "16px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Spesialis THT-BKL · Tanah Bumbu, Kalimantan Selatan
          </span>
        </div>

        {/* Nama dokter */}
        <div
          style={{
            color: "#FFFFFF",
            fontSize: "72px",
            fontWeight: 700,
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
            display: "flex",
            marginBottom: "8px",
          }}
        >
          dr. Yuliana,
        </div>
        <div
          style={{
            color: "#FFFFFF",
            fontSize: "72px",
            fontWeight: 700,
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
            display: "flex",
            marginBottom: "32px",
          }}
        >
          Sp.THTBKL, M.Kes
        </div>

        {/* Deskripsi */}
        <div
          style={{
            color: "#A8B5BB",
            fontSize: "22px",
            lineHeight: 1.5,
            marginBottom: "40px",
            display: "flex",
            maxWidth: "700px",
          }}
        >
          Jadwal praktik, lokasi, dan informasi layanan kesehatan THT tersedia di sini.
        </div>

        {/* CTA pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#D98C4A",
            borderRadius: "999px",
            padding: "16px 40px",
          }}
        >
          <span
            style={{
              color: "#FFFFFF",
              fontSize: "20px",
              fontWeight: 700,
              display: "flex",
            }}
          >
            Booking Sekarang →
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
