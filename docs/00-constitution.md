# 00 — Constitution

Dokumen ini berisi keputusan mendasar yang **tidak boleh dilanggar** oleh siapa pun yang mengerjakan proyek ini, termasuk AI agent. Kalau ada dokumen lain yang bertentangan dengan ini, dokumen ini yang menang. Perubahan di sini harus lewat persetujuan eksplisit orchestrator (user).

## Prinsip Inti

1. **No database.** Proyek ini tidak menggunakan database (SQL/NoSQL) dalam bentuk apa pun. Semua konten dinamis dikelola lewat spreadsheet (Google Sheets) yang berfungsi sebagai sumber data, bukan sistem backend.
2. **Static-first.** Output akhir website adalah static site (atau hybrid static-dengan-fetch-ringan). Tidak ada server aplikasi yang perlu terus jalan/dipelihara.
3. **Content diedit non-developer.** Orang yang update konten (dokter/admin klinik) tidak perlu tahu coding. Update = edit sel di spreadsheet, titik.
4. **Booking = redirect, bukan sistem.** Tidak ada logika booking/appointment yang dibangun sendiri. Tombol "Booking" selalu mengarah ke link eksternal (platform/klinik pihak ketiga).
5. **Tidak ada data medis/personal yang dikarang.** Semua data faktual tentang dokter (pendidikan, sertifikasi, pengalaman, dll) harus berasal dari sumber yang diverifikasi user. Placeholder eksplisit lebih baik daripada konten fiktif.
6. **Mobile-first.** Mayoritas pengunjung diasumsikan dari HP — semua keputusan desain & teknis memprioritaskan pengalaman mobile dulu.
7. **Biaya operasional minim.** Hosting & tooling diusahakan gratis/murah (Vercel/Netlify free tier, Google Sheets gratis, tanpa layanan berbayar wajib).

## Stack Boundaries (detail teknis di `05-tech-plan.md`)
- Bahasa: TypeScript.
- Tidak ada state management library eksternal.
- Tidak ada backend custom (API routes seminimal mungkin, hanya untuk fetch data dari Sheet kalau perlu server-side).

## Proses Persetujuan
- Setiap fase kerja di `06-tasks.md` butuh approval user sebelum lanjut ke fase berikutnya.
- Perubahan terhadap dokumen manapun di `docs/` yang sifatnya struktural (bukan sekadar isi data) harus dikonfirmasi ke user dulu oleh agent.

## Versi
- v1.0 — 28 Agustus 2026 — draft awal, disusun berdasarkan requirement awal user.
