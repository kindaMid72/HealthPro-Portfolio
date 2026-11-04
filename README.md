# Website Profil & Portal Edukasi Kesehatan — dr. Yuliana, Sp.THTBKL, M.Kes

Website profil resmi dokter spesialis THT-BKL, dilengkapi **Portal Artikel Edukasi Pasien (`/artikel`)** dan **Admin Dashboard (`/admin`)** berbasis **Next.js 16 App Router**, **PostgreSQL**, **Drizzle ORM**, dan **Tiptap v3**.

## Fitur Utama
- **Profil & Jadwal Praktik Multi-Lokasi (`/`)**: Informasi kredensial dokter, layanan tindakan THT-BKL, jadwal & peta lokasi praktik, serta tombol CTA konsultasi/booking.
- **Portal Artikel Edukasi Kesehatan THT (`/artikel` & `/artikel/[slug]`)**:
  - Kategori topik THT (`Telinga & Pendengaran`, `Hidung & Sinus`, `Tenggorok & Suara`, `Bedah Kepala & Leher`, `Edukasi THT Umum`) dan pencarian artikel.
  - Estimasi waktu baca otomatis, Daftar Isi (TOC) otomatis dari subjudul `H2`/`H3`, penghitung pembaca unik, badge *"Ditinjau secara medis"*, tombol bagikan ke WhatsApp, artikel terkait, dan struktur data `MedicalWebPage` + `BlogPosting`.
- **Admin Dashboard (`/admin`)**:
  - Autentikasi sesi cookie `httpOnly` + proteksi lockout otomatis.
  - Statistik artikel, pembaca, & checklist kelengkapan data website.
  - Editor kaya Tiptap v3 (Heading, List, Kutipan, Tabel, Unggah Gambar WebP + Caption, Autosave draft, alur `draft` → `in_review` → `published`, catatan review).
  - Pengelolaan mandiri Profil Dokter, Lokasi Praktik, Layanan Medis, serta Akun & Kata Sandi.

## Persiapan Lokal (Quickstart)

1. **Jalankan PostgreSQL lokal via Docker Compose**:
   ```bash
   docker compose up -d db
   ```
2. **Konfigurasi `.env.local`**:
   Pastikan `DATABASE_URL=postgres://postgres:postgres@localhost:5432/mami` dan `NEXT_PUBLIC_SITE_URL=http://localhost:3000` terisi di `.env.local`.
3. **Install dependencies & jalankan migrasi database**:
   ```bash
   npm install
   npm run db:migrate
   ```
4. **Seed data awal (dari Google Sheets CSV atau fallback JSON lokal) & buat akun admin**:
   ```bash
   npm run db:import-sheets
   USER_PASSWORD='password-aman-123' npm run user:create -- admin@dryuliana.my.id "dr. Yuliana, Sp.THTBKL"
   ```
5. **Jalankan server development**:
   ```bash
   npm run dev
   ```
   - Halaman Publik: `http://localhost:3000`
   - Portal Artikel: `http://localhost:3000/artikel`
   - Admin Dashboard: `http://localhost:3000/admin`

## Struktur Dokumentasi (`docs/`)
1. `AGENTS.md` — Instruksi ringkas untuk AI coding agent.
2. `docs/00-constitution.md` — Prinsip dasar proyek (v2.0).
3. `docs/01-spec.md` — Spesifikasi fungsional & non-fungsional.
4. `docs/02-content-data.md` — Kontrak data faktual dokter.
5. `docs/03-sitemap.md` — Struktur halaman publik & admin.
6. `docs/04-design.md` — Arahan desain & palet warna.
7. `docs/05-tech-plan.md` — Rencana teknis & stack.
8. `docs/06-tasks.md` — Status tahapan pembangunan.
9. `docs/07-data-architecture.md` — Arsitektur database PostgreSQL & media.
