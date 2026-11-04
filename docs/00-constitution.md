# 00 — Constitution

Dokumen ini berisi keputusan mendasar yang **tidak boleh dilanggar** oleh siapa pun yang mengerjakan proyek ini, termasuk AI agent. Kalau ada dokumen lain yang bertentangan dengan ini, dokumen ini yang menang. Perubahan di sini harus lewat persetujuan eksplisit orchestrator (user).

## Prinsip Inti

1. **PostgreSQL + Drizzle ORM sebagai sumber kebenaran tunggal.** Seluruh data dinamis (`profile`, `locations`, `services`, `articles`, `images`, `users`, `sessions`) disimpan di PostgreSQL (lokal via Docker Compose `postgres:17`, produksi via Neon Serverless Postgres free tier). Snapshot JSON (`data/fallback-*.json`) tetap dipertahankan sebagai fallback darurat bila database belum di-seed atau gangguan jaringan.
2. **Hybrid Static/ISR + On-Demand Revalidation.** Halaman publik (`/`, `/artikel`, `/artikel/[slug]`) disajikan cepat melalui ISR Next.js (`revalidate = 3600`) dan di-revalidate secara instan (`revalidatePublicSite`) setiap kali admin menyimpan perubahan di `/admin`.
3. **Content diedit non-developer lewat Admin Dashboard (`/admin`).** Dokter dan rekan/asisten klinik mengelola artikel edukasi (editor Tiptap v3 dengan alur `draft` → `in_review` → `published`), profil, lokasi, layanan, dan unggahan gambar WebP langsung dari UI berbahasa Indonesia tanpa menyentuh kode.
4. **Booking = redirect, bukan sistem.** Tidak ada logika booking/appointment pasien atau rekam medis yang dibangun sendiri. Tombol "Booking" selalu mengarah ke link eksternal (platform/klinik pihak ketiga) atau WhatsApp pendaftaran.
5. **Tidak ada data medis/personal yang dikarang.** Semua data faktual tentang dokter (pendidikan, sertifikasi, pengalaman, dll) harus berasal dari sumber yang diverifikasi user. Placeholder eksplisit lebih baik daripada konten fiktif.
6. **Mobile-first.** Mayoritas pengunjung diasumsikan dari HP — semua keputusan desain & teknis memprioritaskan pengalaman mobile dulu.
7. **Biaya operasional minim.** Hosting & database menggunakan layanan free tier (Vercel + Neon Postgres), dan gambar dikompresi ke WebP (`sharp`) lalu disimpan langsung di tabel `images` tanpa layanan object storage berbayar.

## Stack Boundaries (detail teknis di `05-tech-plan.md`)
- Bahasa: TypeScript (strict mode).
- Framework: Next.js 16 App Router (`16.3.3`), React 19, Tailwind CSS v4 + `@tailwindcss/typography`.
- Database & ORM: PostgreSQL + `drizzle-orm` / `drizzle-kit` + `postgres.js`.
- Rich Text Editor: Tiptap v3 (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-table`, `@tiptap/static-renderer`).
- Tidak ada state management library eksternal (Redux, Zustand, dsb).

## Proses Persetujuan
- Setiap fase kerja di `06-tasks.md` butuh approval user sebelum lanjut ke fase berikutnya.
- Perubahan terhadap dokumen manapun di `docs/` yang sifatnya struktural harus dikonfirmasi ke user dulu oleh agent.

## Versi
- v1.0 — 28 Agustus 2026 — draft awal (no-database, Google Sheets CSV).
- v2.0 — 22 April 2026 — migrasi ke PostgreSQL + Drizzle ORM, Admin Dashboard (`/admin`), dan Portal Artikel Edukasi Kesehatan THT (`/artikel`).
