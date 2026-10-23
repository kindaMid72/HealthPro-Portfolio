# 00 — Constitution

Dokumen ini berisi keputusan mendasar yang **tidak boleh dilanggar** oleh siapa pun yang mengerjakan proyek ini, termasuk AI agent. Kalau ada dokumen lain yang bertentangan dengan ini, dokumen ini yang menang. Perubahan di sini harus lewat persetujuan eksplisit orchestrator (user).

## Prinsip Inti

1. **Database tunggal & mandiri (Postgres + Drizzle).** Konten dinamis dokter, artikel harian, dan aset gambar disimpan dalam database Postgres (Neon di produksi, docker compose di pengembangan lokal) dengan ORM Drizzle. Tidak ada backend berbayar proprietary pihak ketiga (Firebase, Supabase, dsb).
2. **Hybrid Static/Dynamic + ISR.** Halaman publik diprerender statis dengan ISR (revalidate 1 jam) dan langsung direvalidasi (`revalidatePath`) saat admin menyimpan konten.
3. **Content diedit lewat Panel Admin.** Dokter atau staf mengelola konten profil, layanan, lokasi, dan artikel melalui panel `/admin` yang aman, berbahasa Indonesia, tanpa perlu menyentuh kode.
4. **Booking = redirect, bukan sistem.** Tidak ada logika booking/appointment internal yang dibangun sendiri. Tombol "Booking" selalu mengarah ke link eksternal (platform/klinik pihak ketiga) atau fallback ke WhatsApp jika kosong.
5. **Tidak ada data medis/personal yang dikarang.** Semua data faktual tentang dokter (pendidikan, sertifikasi, pengalaman, dll) harus berasal dari sumber yang diverifikasi user. Placeholder eksplisit lebih baik daripada konten fiktif.
6. **Mobile-first.** Mayoritas pengunjung diasumsikan dari HP — semua keputusan desain & teknis memprioritaskan pengalaman mobile dulu.
7. **Biaya operasional minim.** Hosting & tooling diusahakan gratis/murah (Vercel/Netlify free tier, Google Sheets gratis, tanpa layanan berbayar wajib).

## Stack Boundaries (detail teknis di `05-tech-plan.md`)
- Bahasa: TypeScript.
- Tidak ada state management library eksternal (Redux, dsb).
- Next.js App Router (Server Actions & Route Handlers untuk admin dan serve media).
## Proses Persetujuan
- Setiap fase kerja di `06-tasks.md` butuh approval user sebelum lanjut ke fase berikutnya.
- Perubahan terhadap dokumen manapun di `docs/` yang sifatnya struktural (bukan sekadar isi data) harus dikonfirmasi ke user dulu oleh agent.

- v2.0 — 23 Oktober 2026 — arsitektur disetujui: migrasi dari Google Sheets ke Postgres (Neon), penambahan panel admin `/admin`, artikel harian `/artikel`, dan penyimpanan media terkompresi.
- v1.0 — 28 Agustus 2026 — draft awal Google Sheets.
