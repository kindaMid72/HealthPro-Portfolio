# 06 — Tasks (Build Plan per Fase)

> Rencana Eksekusi: "Admin Panel + Database (Neon) + Artikel Harian"
> Disetujui: 23 Oktober 2026

## Fase 1 — Infra DB (PostgreSQL + Drizzle)
Status: ✅ Selesai (23 Oktober 2026)
- [x] Dependencies terpasang: drizzle-orm, postgres, drizzle-kit, tsx, tiptap, tailwindcss typography, sharp.
- [x] `compose.yaml` PostgreSQL 17 lokal di port 5432 aktif.
- [x] Schema Drizzle 7 tabel: `users`, `sessions`, `images`, `profile`, `locations`, `services`, `articles`.
- [x] Migrasi `0000_sparkling_skullbuster.sql` berhasil diterapkan ke database.
- [x] Client database lazy singleton di `src/db/client.ts`.

## Fase 2 — Data Layer Refactor
Status: ✅ Selesai (23 Oktober 2026)
- [x] `src/lib/content.ts` membaca dari database Postgres dengan fallback JSON jika DB offline.
- [x] Tautan CTA terpusat di `src/lib/cta.ts` (normalisasi nomor WhatsApp Indonesia).
- [x] `SiteShell.tsx` membungkus konsistensi layout, Navbar, dan Footer.
- [x] Anchor navigasi menggunakan Next.js `Link`.

## Fase 3 — Migrasi & Akun Admin
Status: ✅ Selesai (23 Oktober 2026)
- [x] Hashing password Scrypt di `src/lib/password.ts`.
- [x] Skrip impor data Google Sheet ke database: `npm run db:import-sheets`.
- [x] Skrip pembuatan user admin: `npm run user:create`.

## Fase 4 — Autentikasi Admin
Status: ✅ Selesai (23 Oktober 2026)
- [x] Sesi cookie 30 hari httpOnly di `src/lib/session.ts` (hash sha256 di DB).
- [x] Lockout otomatis 15 menit setelah 5x gagal login berturut-turut.
- [x] Server actions login & logout di `src/app/admin/actions.ts`.
- [x] Halaman login `/admin/login` & layout terproteksi `/admin`.
- [x] Helper `revalidatePublicSite()` untuk purge cache ISR saat ada perubahan.

## Fase 5 — Upload & Kompresi Media
Status: ✅ Selesai (23 Oktober 2026)
- [x] Kompresi otomatis WebP via Sharp di `src/lib/images.ts`.
- [x] Route handler publik `/media/[id]` dengan header cache immutable 1 tahun.
- [x] Endpoint upload admin `/api/admin/images`.

## Fase 6 — Admin Artikel
Status: ✅ Selesai (23 Oktober 2026)
- [x] Domain logic artikel, slugify unik, dan validasi publikasi di `src/lib/articles.ts`.
- [x] Server actions artikel di `src/app/admin/articles/actions.ts`.
- [x] Editor artikel Tiptap WYSIWYG di `/admin/articles/[id]`.
- [x] Pratinjau artikel admin di `/admin/articles/[id]/preview`.
- [x] Daftar artikel dan filter status di `/admin/articles`.

## Fase 7 — Admin Profil, Lokasi, dan Layanan
Status: ✅ Selesai (23 Oktober 2026)
- [x] Form edit profil dokter & upload foto di `/admin/profile`.
- [x] CRUD dan reorder lokasi praktik di `/admin/locations`.
- [x] CRUD dan reorder layanan medis di `/admin/services`.

## Fase 8 — Halaman Publik Artikel & SEO
Status: ✅ Selesai (23 Oktober 2026)
- [x] Halaman indeks artikel `/artikel` dengan grid kartu `ArticleCard`.
- [x] Halaman baca artikel `/artikel/[slug]` dengan semantic HTML dan ISR.
- [x] Structured data JSON-LD `MedicalWebPage`.
- [x] Sitemap dinamis memuat semua artikel terbit di `/sitemap.xml`.
- [x] Rangkuman artikel untuk AI search di `/llms.txt`.

## Fase 9 — Dokumentasi & Verifikasi Akhir
Status: 🟢 Aktif (23 Oktober 2026)
- [x] Sinkronisasi dokumentasi (constitution, spec, tech-plan, tasks, AGENTS.md, README.md).
- [ ] Verifikasi lokal menyeluruh (1-13).
