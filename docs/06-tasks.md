# 06 — Tasks (Build Plan per Fase)

> Aturan: agent HANYA mengerjakan task di fase yang berstatus 🟢 Aktif. Setelah fase selesai, agent laporkan ke user, tunggu approval sebelum mengubah status fase berikutnya jadi 🟢.

## Fase 0 — Setup Proyek
Status: ✅ Selesai (31 Agustus 2026)
- [x] Init repo, scaffold Next.js + TypeScript + Tailwind.
- [x] Tambahkan `AGENTS.md` dan folder `docs/` ke root repo.
- [x] Setup struktur folder sesuai `05-tech-plan.md`.
- [x] Buat Google Sheet template sesuai `02-content-data.md` (tab Profile & Locations & Services) — file CSV siap import di `docs/google-sheet-template/`, panduan di `docs/google-sheet-setup.md`.
- [x] Publish sheet ke web (CSV), simpan URL ke `.env.local` (jangan commit) — template `.env.local.example` tersedia; URL Sheet asli diisi user setelah buat Sheet.
- [x] Buat `lib/sheets.ts` untuk fetch + parse CSV jadi JSON typed (dengan Zod validation, fallback snapshot, dev-fixture mode).
- **Definition of Done**: ✅ `npm run build` sukses, data dummy dari `dev-fixture.json` berhasil ditarik dan di-console.log tanpa error (lihat build output 31 Agustus 2026).


## Fase 1 — Struktur Halaman (Static, data dummy)
Status: ✅ Selesai (31 Agustus 2026)
- [x] Bangun semua section di `03-sitemap.md` sebagai komponen React, pakai data dummy dari Fase 0.
- [x] Implementasi CTA booking (redirect ke `booking_url` dari data, FR-2).
- [x] Implementasi sticky bottom CTA di mobile.
- **Definition of Done**: semua section tampil, navigasi/anchor jalan, belum perlu cantik — fokus struktur & data binding benar.

## Fase 2 — Styling & Responsif
Status: 🔲 Belum aktif
- [ ] Terapkan arahan desain dari `04-design.md` (setelah dikonfirmasi user).
- [ ] Pastikan responsif mobile (375px) & desktop (1280px) sesuai FR-5.
- [ ] Optimasi gambar (next/image, lazy load).
- **Definition of Done**: tampilan matching arahan desain, lolos cek responsif manual di 2 breakpoint.

## Fase 3 — Integrasi Data Real + ISR
Status: 🔲 Belum aktif
- [ ] Ganti data dummy dengan data asli dari `02-content-data.md` (setelah user isi).
- [ ] Setup ISR revalidate (default: 1 jam, sesuai `05-tech-plan.md`).
- [ ] Uji: ubah 1 field di Sheet, verifikasi muncul di website setelah revalidate.
- **Definition of Done**: acceptance criteria di `01-spec.md` bagian "data diambil dari Google Sheet" terpenuhi.

## Fase 4 — SEO, Performance, Deploy
Status: 🔲 Belum aktif
- [ ] Tambah meta tags dasar (title, description, OG image).
- [ ] Cek Lighthouse score (target Performance & Accessibility ≥ 90 mobile, sesuai NFR di `01-spec.md`).
- [ ] Deploy ke Vercel, hubungkan domain (kalau ada).
- **Definition of Done**: site live di URL production, checklist acceptance criteria `01-spec.md` semua tercentang.

## Fase 5+ — Nice-to-have (di luar MVP)
Status: 🔲 Belum aktif, tunggu MVP selesai & approval user
- [ ] Halaman artikel edukasi.
- [ ] Section testimoni.
- [ ] Galeri foto.

---

**Catatan untuk orchestrator (user)**: update status fase (🔲 → 🟢 → ✅) secara manual di file ini setiap kali approve lanjut, supaya agent selalu tahu batas kerjanya di sesi berikutnya.
