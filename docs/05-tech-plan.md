# 05 — Technical Plan

## Stack
- **Framework**: Next.js 16 App Router (`16.3.3`), React 19, TypeScript (strict mode).
- **Styling**: Tailwind CSS v4 + `@tailwindcss/typography`.
- **Database & ORM**: PostgreSQL (`postgres:17` via Docker Compose untuk lokal, Neon Serverless Postgres untuk produksi) + `drizzle-orm` (`0.45.4`) + `drizzle-kit` + driver `postgres` (`prepare: false` untuk kompatibilitas connection pooler).
- **Rich Text Editor**: Tiptap v3 (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-table`, `@tiptap/static-renderer`).
- **Pemrosesan Gambar**: `sharp` — setiap gambar yang diunggah melalui `/api/admin/images` di-orientasi otomatis, diubah ukurannya (maks 1600×1600), dikompresi ke WebP (`quality: 80`), dan disimpan di kolom `bytea` tabel `images`.
- **Autentikasi Admin**: Sesi berbasis database (`sessions` + `users`), password di-hash dengan `node:crypto` `scrypt` (`N=16384, r=8, p=1`), token sesi disimpan di cookie `httpOnly` (`mami_session`) dan SHA-256 hash-nya di tabel `sessions`.

## Alur Data (Runtime & Build)
```
PostgreSQL (Neon / Docker lokal)
   ↑↓ Drizzle ORM (src/db/client.ts & src/db/schema.ts)
   ├── Jalur Baca Publik: src/lib/content.ts (React.cache + fallback JSON lokal)
   │      → Halaman Publik (/, /artikel, /artikel/[slug], /sitemap.xml, /llms.txt)
   └── Jalur Tulis Admin: Server Actions di src/app/admin/**/actions.ts
          → Simpan ke PostgreSQL + panggil revalidatePublicSite()
```

## Struktur Folder Utama
```
/src
  /db
    schema.ts          -> Definisi 2 enum & 7 tabel PostgreSQL
    client.ts          -> Singleton koneksi postgres.js + Drizzle
  /lib
    types.ts           -> Zod schemas & kontrak tipe publik/artikel
    content.ts         -> Data reader publik (React.cache + fallback JSON)
    articles.ts        -> Domain logic artikel, Tiptap HTML/TOC renderer, statistik admin
    images.ts          -> Kompresi Sharp WebP & penyimpanan tabel images
    password.ts        -> Hash & verifikasi password scrypt
    session.ts         -> Manajemen cookie sesi & guard requireUser()
    revalidate.ts      -> Helper revalidatePublicSite()
    cta.ts             -> Formatter nomor WhatsApp & resolusi CTA
    format.ts          -> Formatter tanggal Bahasa Indonesia (WITA)
    seo.ts             -> Helper URL kanonis, schema.org, & parsing teks
  /app
    /page.tsx          -> Beranda profil dokter
    /artikel           -> Indeks, paginasi, dan halaman baca artikel (/artikel/[slug])
    /media/[id]        -> Route handler penyaji gambar WebP dari DB
    /api/admin/images  -> Endpoint unggah gambar admin
    /api/articles/[slug]/view -> Endpoint penghitung pembaca artikel
    /admin             -> Login & seluruh halaman panel admin
/scripts
  import-from-sheets.ts -> Seed awal database dari Google Sheets CSV / fallback JSON
  create-user.ts        -> CLI pembuatan akun admin
```

## Environment Variables
- `DATABASE_URL` — Connection string PostgreSQL (pooled di produksi).
- `DATABASE_URL_UNPOOLED` — (Opsional, produksi) Connection string direct untuk `drizzle-kit migrate`.
- `NEXT_PUBLIC_SITE_URL` — URL kanonis website (contoh: `https://dryuliana.my.id`).
- `SHEET_CSV_URL_PROFILE`, `SHEET_CSV_URL_LOCATIONS`, `SHEET_CSV_URL_SERVICES` — (Opsional) Hanya dipakai sekali oleh skrip `npm run db:import-sheets`.
