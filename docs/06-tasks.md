# 06 — Tasks (Build Plan per Fase)

> Aturan: agent HANYA mengerjakan task di fase yang berstatus 🟢 Aktif. Setelah fase selesai, agent laporkan ke user, tunggu approval sebelum mengubah status fase berikutnya jadi 🟢.

## Fase 0 — Setup Proyek
Status: ✅ Selesai (31 Agustus 2026)
- [x] Init repo, scaffold Next.js + TypeScript + Tailwind.
- [x] Tambahkan `AGENTS.md` dan folder `docs/` ke root repo.

## Fase 1 — Struktur Halaman
Status: ✅ Selesai (31 Agustus 2026)
- [x] Bangun semua section di `03-sitemap.md` sebagai komponen React.
- [x] Implementasi CTA booking & sticky bottom CTA di mobile.

## Fase 2 — Styling & Responsif
Status: ✅ Selesai (31 Agustus 2026)
- [x] Terapkan arahan desain dari `04-design.md`.
- [x] Pastikan responsif mobile (375px) & desktop (1280px) sesuai FR-5.

## Fase 3 — Integrasi Data Real + ISR
Status: ✅ Selesai (2 September 2026)
- [x] Integrasi data asli dr. Yuliana dan fallback JSON.

## Fase 4 — SEO, Performance, Deploy
Status: ✅ Selesai (5 September 2026)
- [x] Meta tags dinamis, OG image, sitemap, robots.txt, JSON-LD Physician, dan `/llms.txt`.

## Fase 5 — Migrasi PostgreSQL, Admin Dashboard, & Portal Artikel Edukasi THT
Status: ✅ Selesai (22 April 2026)
- [x] Setup `compose.yaml` (`postgres:17`), `drizzle.config.ts`, `src/db/schema.ts` (7 tabel & 2 enum), `src/db/client.ts`, dan migrasi SQL (`drizzle/`).
- [x] Implementasi keamanan password (`scrypt`), sesi cookie `httpOnly`, kompresi gambar WebP via `sharp`, serta route `/media/[id]` dan `/api/admin/images`.
- [x] Buat skrip CLI `scripts/import-from-sheets.ts` dan `scripts/create-user.ts`.
- [x] Bangun data layer `src/lib/content.ts` & `src/lib/articles.ts` (ekstensi Tiptap, injeksi ID heading & Daftar Isi otomatis, kalkulasi waktu baca, view counter, garbage collection gambar).
- [x] Bangun portal publik `/artikel`, `/artikel/halaman/[page]`, dan `/artikel/[slug]` lengkap dengan filter kategori THT, pencarian, TOC, Medical Review Badge, share WhatsApp, artikel terkait, dan JSON-LD `MedicalWebPage` + `BlogPosting`.
- [x] Bangun Admin Dashboard (`/admin`) berbahasa Indonesia: Statistik & Indikator Kelengkapan Data, Editor Artikel Tiptap v3 (tabel, gambar + caption, autosave draft, alur `draft` → `in_review` → `published`), Profil Dokter, Lokasi Praktik, Layanan Medis, dan Manajemen Akun/Password.

## Fase 6 — Redesign UI/UX menyeluruh
Status: ✅ Selesai (4 November 2026)
- [x] Fondasi desain: token warna/font (Plus Jakarta Sans + Literata untuk bacaan panjang), komponen dasar.
- [x] Logika jadwal praktik (`src/lib/schedule.ts`) + status "Praktik hari ini".
- [x] Navbar, menu mobile, sticky CTA, dan footer baru.
- [x] Beranda berorientasi kebutuhan pasien (Hero → Jadwal & Lokasi → Layanan → Tentang → Artikel → Kontak).
- [x] Portal artikel: indeks, paginasi, halaman baca dengan TOC sticky.
- [x] Halaman detail layanan `/layanan/[slug]` + skema konten layanan + editor admin.
- [x] Primitif UI admin + shell sidebar, lalu seluruh halaman admin dipindah ke primitif baru.
