# 05 — Technical Plan

## Stack
- **Framework**: Next.js 16 (App Router), ISR + Server Actions + Dynamic routes.
- **Database & ORM**: PostgreSQL (Neon di produksi, PostgreSQL 17 docker compose di lokal) + Drizzle ORM.
- **Styling**: Tailwind CSS v4 + `@tailwindcss/typography` untuk artikel edukasi.
- **Rich Text Editor**: Tiptap (StarterKit, Image, Static Renderer).
- **Pemrosesan Gambar**: Sharp (kompresi otomatis ke WebP kualitas 80, maks 1600px, disimpan di tabel `images` PostgreSQL).
- **Hosting**: Vercel (Next.js serverless runtime).
- **Autentikasi Admin**: Cookie session httpOnly (`mami_session`) dengan token 32-byte acak; sha256 tersimpan di tabel `sessions`, lockout 15 menit setelah 5x gagal, password hash via Scrypt (`node:crypto`).

## Alur Data & Arsitektur

```
[Pengunjung Publik]
  ├── / (Beranda)                -> ISR 1 jam + SiteShell + fallback JSON aman
  ├── /artikel (Daftar Artikel)  -> ISR 1 jam
  ├── /artikel/[slug] (Detail)   -> ISR 1 jam + generateStaticParams + JSON-LD
  ├── /media/[id] (Gambar WebP)  -> Cache 1 tahun immutable dari database
  ├── /sitemap.xml               -> Dinamis memuat semua artikel terbit
  └── /llms.txt                  -> Ringkasan teks untuk LLM / AI Search

[Admin Panel]
  ├── /admin/login               -> Form masuk admin + lockout 15 menit
  └── /admin                     -> Layout terproteksi (requireUser)
        ├── /admin/profile       -> Form biografi, STR/SIP, foto dokter
        ├── /admin/locations     -> CRUD & urutan lokasi praktik
        ├── /admin/services      -> CRUD & urutan layanan medis
        ├── /admin/articles      -> Daftar artikel & filter status
        ├── /admin/articles/[id] -> Editor Tiptap, upload cover, simpan/terbitkan
        └── /admin/articles/[id]/preview -> Pratinjau dengan tampilan publik
```

## Struktur Database (Drizzle Schema)
1. `users`: Akun admin (email unik, passwordHash scrypt, failedLoginCount, lockedUntil).
2. `sessions`: Sesi cookie (id sha256, userId cascade, expiresAt 30 hari).
3. `images`: Blob WebP terkompresi (mimeType, data bytea, width, height, byteSize, articleId, createdBy).
4. `profile`: Singleton row (`id = 1`) menyimpan data dokter, STR/SIP, biografi, kontak, photoImageId.
5. `locations`: Lokasi praktik klinik/RS, alamat, jadwal, WhatsApp, telepon, bookingUrlOverride, sortOrder.
6. `services`: Layanan spesialis THT, deskripsi, sortOrder.
7. `articles`: Artikel edukasi (slug unik, title, excerpt, coverImageId, content jsonb, status: `draft` | `in_review` | `published`, reviewNote, publishedAt).

## Revalidasi & Caching
- Saat admin mengubah profil, lokasi, layanan, atau artikel, helper `revalidatePublicSite()` memanggil `revalidatePath` untuk:
  - `/` (layout)
  - `/artikel`
  - `/artikel/[slug]`
  - `/llms.txt`
  - `/sitemap.xml`
- Halaman publik langsung menyajikan data terbaru tanpa menunggu interval ISR 1 jam habis.

## Environment Variables
- `DATABASE_URL`: Connection string PostgreSQL (Neon pooled di Vercel, `postgres://postgres:postgres@localhost:5432/mami` di lokal).
- `DATABASE_URL_UNPOOLED`: Connection string langsung untuk migrasi Drizzle.
