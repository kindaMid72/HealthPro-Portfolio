# 05 — Technical Plan

## Stack
- **Framework**: Next.js (App Router), static export / ISR — pilihan populer, dokumentasi luas, gampang dikerjakan agent, deploy gratis di Vercel.
- **Styling**: Tailwind CSS.
- **Hosting**: Vercel (free tier cukup untuk trafik personal branding site).
- **Data source**: Google Sheets (lihat mekanisme di bawah).
- **Tanpa database**, sesuai constitution.

## Mekanisme "Google Sheets sebagai CMS"
Ada dua opsi realistis, direkomendasikan mulai dari **Opsi A** karena paling simpel dan gratis:

### Opsi A (default/rekomendasi) — Publish to Web + fetch CSV saat build
1. Di Google Sheets: **File → Share → Publish to web** → pilih sheet/tab tertentu → format CSV.
2. Dapat URL publik CSV, mis: `https://docs.google.com/spreadsheets/d/e/{ID}/pub?gid={GID}&single=true&output=csv`.
3. Saat build (`next build`), fetch URL CSV tersebut, parse jadi JSON (pakai library ringan seperti `papaparse` atau parser CSV manual), lalu generate halaman statis dari data itu (Static Site Generation).
4. **Kelebihan**: zero backend, zero API key, zero biaya, setup 10 menit.
5. **Kekurangan**: perubahan di Sheet baru muncul di website setelah **rebuild**. Solusinya: pakai **ISR (Incremental Static Regeneration)** Next.js dengan `revalidate` (mis. tiap 1 jam) — jadi website auto-refresh data secara berkala tanpa perlu manual redeploy, ATAU set up webhook sederhana (Apps Script trigger → panggil Vercel Deploy Hook) kalau butuh update instan.

### Opsi B (kalau butuh update lebih real-time) — Google Sheets API v4 read-only
- Pakai API key read-only (bukan OAuth penuh) untuk fetch data langsung dari Sheets API tiap request/ISR cycle.
- Lebih fleksibel (bisa multi-tab lebih terstruktur), tapi butuh setup Google Cloud project + API key — sedikit lebih ribet dibanding Opsi A.
- Direkomendasikan HANYA kalau di fase berjalan ternyata Opsi A kurang cukup (mis. butuh update konten sangat sering/real-time).

> **Keputusan default untuk MVP: Opsi A + ISR revalidate tiap 1 jam.** Agent mulai dari sini kecuali user eksplisit minta Opsi B.

## Struktur Data
Mapping 1:1 dengan `02-content-data.md`:
- Tab `Profile` → 1 baris data (key-value atau 1 baris dengan kolom = field).
- Tab `Services` → banyak baris, tiap baris = 1 layanan.

## Alur Data (runtime)
```
Google Sheet (published CSV)
   → fetch saat build/ISR revalidate
   → parse CSV → JSON typed (sesuai skema 02-content-data.md)
   → render ke komponen React
```

## Struktur Folder (usulan awal)
```
/app
  /page.tsx          -> Home (hero, CTA)
  /layout.tsx
/components
  Hero.tsx
  About.tsx
  Services.tsx
  Location.tsx
  Contact.tsx
  StickyCTA.tsx        (mobile bottom bar)
/lib
  sheets.ts          -> fetch & parse Google Sheet
  types.ts           -> tipe data sesuai 02-content-data.md
/docs
  ...(dokumen ini)
AGENTS.md
```

## Detail Arsitektur Data
Rincian lengkap (schema, validasi, fallback, caching, media, keamanan) ada di **`docs/07-data-architecture.md`** — dokumen ini hanya overview, implementasi harus rujuk ke sana.

## Environment Variables
- `SHEET_CSV_URL_PROFILE` — URL publish-to-web CSV untuk tab Profile.
- `SHEET_CSV_URL_LOCATIONS` — URL publish-to-web CSV untuk tab Locations (BARU — data ternyata multi-lokasi, lihat `02-content-data.md` & `07-data-architecture.md`).
- `SHEET_CSV_URL_SERVICES` — URL publish-to-web CSV untuk tab Services.
- (Kalau pakai Opsi B nanti) `GOOGLE_SHEETS_API_KEY`, `SHEET_ID`.

## Hal yang Perlu Dikonfirmasi User Sebelum Implementasi
- [ ] Setuju pakai Next.js + Vercel? (kalau user punya preferensi hosting lain, sesuaikan)
- [ ] Google Sheet sumber data akan dibuat oleh siapa — user atau agent buatkan template-nya?
