# AGENTS.md

Instruksi ini WAJIB dibaca dan diikuti oleh AI coding agent sebelum mengerjakan task apa pun di repo ini. File ini sengaja pendek — detail lengkap ada di `docs/`, rujuk ke sana kalau butuh konteks lebih.

## Ringkasan Proyek
Website profil dokter spesialis. Fungsi utama: personal branding/CV digital + tombol booking yang **redirect ke link eksternal** (platform booking klinik). Bukan aplikasi booking internal, bukan portal pasien, tidak ada database.

Baca dulu sebelum mulai kerja:
1. `docs/00-constitution.md` — aturan main yang tidak boleh dilanggar
2. `docs/01-spec.md` — requirement & scope
3. `docs/05-tech-plan.md` — arsitektur & stack

## Setup & Build Commands
> Isi bagian ini ulang begitu stack final ditentukan di `docs/05-tech-plan.md` dan project di-scaffold. Placeholder di bawah untuk arah default (Next.js static export).

```bash
npm install          # install dependencies
npm run dev           # local dev server
npm run build          # build static output
npm run lint            # jalankan linter — WAJIB pass sebelum melaporkan task selesai
```

## Code Style
- TypeScript, strict mode.
- Komponen React fungsional, tanpa class component.
- Styling pakai Tailwind CSS utility classes — hindari inline style kecuali kepepet.
- Penamaan file: kebab-case untuk file, PascalCase untuk komponen.
- Tidak ada state management library eksternal (Redux, dsb) — proyek ini static/CV site, tidak butuh.

## Data & Content — ATURAN KRITIS
- **Semua konten faktual dokter** (nama, gelar, riwayat, jam praktik, dsb) HANYA boleh diambil dari `docs/02-content-data.md` atau dari Google Sheet yang jadi sumber data resmi (lihat `docs/05-tech-plan.md`).
- **Agent DILARANG mengarang/mengisi data medis atau data personal apa pun** — bio, sertifikasi, riwayat pendidikan, dll. Kalau data belum tersedia, gunakan placeholder yang jelas ditandai `[BELUM DIISI]`, jangan generate isi fiktif.
- Jangan hardcode data konten di dalam komponen — semua teks yang bisa berubah harus ditarik dari data layer (Google Sheet / JSON hasil fetch), sesuai `docs/05-tech-plan.md`.

## Batasan / Jangan Disentuh
- Jangan tambah database atau backend berbayar (Firebase, Supabase, dll) tanpa persetujuan eksplisit — prinsip proyek ini "no database" (lihat constitution).
- Jangan implementasi sistem booking internal — tombol booking SELALU redirect ke URL eksternal dari data source.
- Jangan menambah halaman di luar yang terdaftar di `docs/03-sitemap.md` tanpa approval.

## Testing & Verifikasi
- Sebelum melaporkan task selesai: jalankan `npm run lint` dan `npm run build`, pastikan tidak ada error.
- Cek tampilan responsif minimal di breakpoint mobile (375px) dan desktop (1280px).

## Alur Kerja per Task
- Kerjakan HANYA task yang ada di fase aktif pada `docs/06-tasks.md`. Jangan loncat ke fase berikutnya tanpa approval dari orchestrator (user).
- Kalau instruksi di dokumen manapun bertentangan, tanya ke user dulu — jangan asumsi sepihak.
- Setelah selesai satu fase, laporkan ringkas: apa yang dikerjakan, file apa yang berubah, dan apa yang perlu direview user.

## Commit Convention
- Commit kecil, per task/fase, pesan jelas: `feat: tambah halaman kontak`, `fix: perbaiki responsif navbar`, dst.
- Jangan commit file `.env`, API key, atau credential apa pun.
