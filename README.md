# Website Profil Dokter Spesialis — dr. Yuliana, Sp.THTBKL, M.Kes

Website profil resmi dokter spesialis THT-BKL di Kabupaten Tanah Bumbu, Kalimantan Selatan, dilengkapi panel admin untuk pengelolaan data profil, lokasi praktik, layanan medis, dan artikel edukasi kesehatan harian.

## Arsitektur Singkat
- **Framework**: Next.js 16 (App Router) dengan Tailwind CSS v4.
- **Database**: PostgreSQL (Neon di produksi, PostgreSQL 17 docker compose di lokal) + Drizzle ORM.
- **Admin Panel**: `/admin` terproteksi dengan sesi cookie aman, lockout brute-force, dan WYSIWYG editor Tiptap.
- **Media**: Unggah gambar terkompresi otomatis ke format WebP via Sharp, disimpan langsung di database.
- **Artikel Publik**: `/artikel` dan `/artikel/[slug]` dengan ISR, semantic markup, breadcrumb, dan JSON-LD `MedicalWebPage`.

## Quick Start (Development Lokal)

```bash
# 1. Jalankan database PostgreSQL lokal
docker compose up -d db

# 2. Salin environment variables lokal
cp .env.local.example .env.local

# 3. Jalankan migrasi database
npm run db:migrate

# 4. Buat akun admin pertama
USER_PASSWORD="passwordkuat12345" npm run user:create -- admin@example.com "Nama Admin"

# 5. Jalankan server pengembangan
npm run dev

# 6. Akses website
# Publik:     http://localhost:3000
# Artikel:    http://localhost:3000/artikel
# Admin:      http://localhost:3000/admin/login
```

## Perintah Penting
- `npm run build` — Build produksi statis & dinamis Next.js.
- `npm run lint` — Validasi ESLint.
- `npm run db:generate` — Generate berkas migrasi SQL Drizzle dari `src/db/schema.ts`.
- `npm run db:migrate` — Menerapkan migrasi Drizzle ke database.
- `npm run user:create` — Menambah akun admin baru ke database.

## Dokumentasi Teknis
- `AGENTS.md` — Petunjuk khusus coding agent.
- `docs/00-constitution.md` — Prinsip inti proyek.
- `docs/01-spec.md` — Spesifikasi fungsional dan teknis.
- `docs/05-tech-plan.md` — Rincian arsitektur teknis dan alur data.
- `docs/06-tasks.md` — Pelacakan progres fase implementasi.
