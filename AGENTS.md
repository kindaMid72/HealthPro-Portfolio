# AGENTS.md

Instruksi ini WAJIB dibaca dan diikuti oleh AI coding agent sebelum mengerjakan task apa pun di repo ini. File ini sengaja pendek — detail lengkap ada di `docs/`, rujuk ke sana kalau butuh konteks lebih.

## Ringkasan Proyek
Website profil dokter spesialis THT-BKL + Portal Artikel Edukasi Kesehatan (`/artikel`) + Admin Dashboard (`/admin`). Menggunakan **Next.js 16 App Router**, **PostgreSQL**, dan **Drizzle ORM**. Tombol booking tetap **redirect ke link eksternal** atau WhatsApp lokasi praktik (bukan aplikasi antrean/rekam medis pasien).

Baca dulu sebelum mulai kerja:
1. `docs/00-constitution.md` — aturan main yang tidak boleh dilanggar
2. `docs/01-spec.md` — requirement & scope
3. `docs/05-tech-plan.md` — arsitektur & stack
4. `docs/07-data-architecture.md` — skema database PostgreSQL & alur data

## Setup, Database, & Build Commands

```bash
docker compose up -d db       # jalankan PostgreSQL 17 lokal
npm install                   # install dependencies
npm run db:generate           # generate SQL migration dari src/db/schema.ts
npm run db:migrate            # jalankan migrasi database
npm run db:import-sheets      # seed data awal dari Google Sheets / fallback JSON
USER_PASSWORD='...' npm run user:create -- <email> "<Nama>" # buat akun admin
npm run dev                   # local dev server
npm run build                 # build production output
npm run lint                  # jalankan linter — WAJIB pass sebelum melaporkan task selesai
```

## Code Style
- TypeScript, strict mode.
- Komponen React fungsional, tanpa class component.
- Styling pakai Tailwind CSS v4 utility classes + `@tailwindcss/typography` untuk konten artikel.
- Tidak ada state management library eksternal (Redux, dsb).

## Data & Content — ATURAN KRITIS
- **Semua konten faktual dokter** (nama, gelar, riwayat, jam praktik, dsb) HANYA boleh diambil dari database PostgreSQL (yang di-seed dari `docs/02-content-data.md` / `data/fallback-*.json`) atau diinput dokter melalui `/admin`.
- **Agent DILARANG mengarang/mengisi data medis atau data personal apa pun** — bio, sertifikasi, riwayat pendidikan, dll. Kalau data belum tersedia, gunakan placeholder yang jelas ditandai `[BELUM DIISI]`.
- Jangan hardcode data konten di dalam komponen — semua data publik wajib ditarik melalui `src/lib/content.ts`.

## Batasan / Jangan Disentuh
- Jangan implementasi sistem booking/rekam medis pasien internal — tombol booking SELALU redirect ke URL eksternal atau WhatsApp dari data source.
- Jangan menambah halaman di luar yang terdaftar di `docs/03-sitemap.md` tanpa approval.

## Privileged Execution (Root/Sudo)
Jika sebuah task mutlak membutuhkan hak akses root (misal instalasi dependensi sistem atau manajemen service):
- Gunakan binary wrapper: `agent-sudo <command>` (sudah ada di `$PATH`).
- **Graceful Fallback**: Jika vault dicabut/tidak aktif atau sudo meminta password interaktif, **JANGAN CRASH atau HANG**. Tampilkan perintah yang dibutuhkan kepada user dan minta user menjalankannya secara manual di terminal.
- **Mindful Guardrails**: Dilarang menggunakan `sudo` untuk operasi ruang user biasa (seperti `npm install` di direktori proyek) dan dilarang menjalankan perintah destruktif terhadap sistem/partisi.

## Testing & Verifikasi
- Sebelum melaporkan task selesai: jalankan `npm run lint` dan `npm run build`, pastikan tidak ada error.
- Cek tampilan responsif minimal di breakpoint mobile (375px) dan desktop (1280px).

## Commit Convention
- Commit kecil, per task/fase, pesan jelas: `feat: tambah halaman artikel`, `fix: perbaiki responsif navbar`, dst.
- Jangan commit file `.env*`, API key, atau credential apa pun.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
