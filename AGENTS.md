# AGENTS.md

Instruksi ini WAJIB dibaca dan diikuti oleh AI coding agent sebelum mengerjakan task apa pun di repo ini. File ini sengaja pendek — detail lengkap ada di `docs/`, rujuk ke sana kalau butuh konteks lebih.

## Ringkasan Proyek
Website profil dokter spesialis dan portal artikel edukasi kesehatan harian, dilengkapi panel admin internal.
Fungsi utama:
1. Personal branding/CV digital dokter spesialis THT-BKL.
2. Portal artikel edukasi kesehatan THT publik (`/artikel`, `/artikel/[slug]`).
3. Tombol booking yang **redirect ke link eksternal** (platform booking klinik) atau WhatsApp fallback (FR-4). Bukan aplikasi booking internal, bukan portal pasien.
4. Panel admin (`/admin`) untuk mengelola profil, lokasi, layanan, dan artikel harian, dengan media gambar tersimpan terkompresi di database.

Baca dulu sebelum mulai kerja:
1. `docs/00-constitution.md` — aturan main yang tidak boleh dilanggar
2. `docs/01-spec.md` — requirement & scope
3. `docs/05-tech-plan.md` — arsitektur & stack

## Setup & Build Commands

```bash
docker compose up -d db   # jalankan PostgreSQL lokal
npm install               # install dependencies
npm run db:migrate        # jalankan migrasi database
npm run dev               # local dev server
npm run build             # build static & dynamic output Next.js
npm run lint              # jalankan linter — WAJIB pass sebelum melaporkan task selesai
```

## Code Style
- TypeScript, strict mode.
- Komponen React fungsional, tanpa class component.
- Styling pakai Tailwind CSS utility classes — hindari inline style kecuali kepepet.
- Penamaan file: kebab-case untuk file, PascalCase untuk komponen.
- Tidak ada state management library eksternal (Redux, dsb) — proyek ini memakai React Server Components dan form action.

## Data & Content — ATURAN KRITIS
- **Semua konten faktual dokter** (nama, gelar, riwayat, jam praktik, dsb) HANYA boleh diambil dari database Postgres (melalui `src/lib/content.ts`).
- **Agent DILARANG mengarang/mengisi data medis atau data personal apa pun** — bio, sertifikasi, riwayat pendidikan, dll. Kalau data belum tersedia, gunakan placeholder yang jelas ditandai `[BELUM DIISI]`, jangan generate isi fiktif.
- Jangan hardcode data konten di dalam komponen — semua teks yang bisa berubah harus ditarik dari data layer (`src/lib/content.ts`).

## Batasan / Jangan Disentuh
- Jangan tambah backend berbayar (Firebase, Supabase, dll) — proyek memakai database Postgres mandiri (Neon di produksi, docker compose di lokal).
- Jangan implementasi sistem booking internal — tombol booking SELALU redirect ke URL eksternal dari data source atau fallback ke WhatsApp.
- Tidak ada database-driven permissions — semua akun admin setara.

## Testing & Verifikasi
- Sebelum melaporkan task selesai: jalankan `npm run lint` dan `npm run build`, pastikan tidak ada error.
- Cek tampilan responsif minimal di breakpoint mobile (375px) dan desktop (1280px) dan tes alur di browser.

## Commit Convention
- Commit kecil, per task/fase, pesan jelas: `feat: tambah halaman kontak`, `fix: perbaiki responsif navbar`, dst.
- Jangan commit file `.env`, API key, atau credential apa pun.
