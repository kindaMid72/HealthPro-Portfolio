# 01 — Spec (Requirements)

## Tujuan
Website profil dokter spesialis sebagai **CV digital / personal branding**, dengan CTA yang mengarahkan pengunjung untuk booking lewat **link eksternal** ke platform/klinik tempat praktik.

## Target Pengguna
- Calon pasien baru yang mencari info dokter sebelum memutuskan booking.
- Pasien lama yang butuh info kontak/lokasi/jam praktik dengan cepat.
- (Opsional, tidak prioritas) Sejawat/rujukan profesional.

## Scope — In
- Halaman profil dokter (bio, pendidikan, sertifikasi, pengalaman).
- Halaman/section layanan & spesialisasi.
- Info lokasi & jadwal praktik.
- CTA "Booking Sekarang" → redirect ke URL eksternal (diambil dari data source).
- Kontak (WhatsApp/telepon/email).
- Fully responsive, prioritas mobile.
- Konten dikelola lewat Google Sheets (lihat `05-tech-plan.md`).

## Scope — Out (eksplisit tidak dikerjakan)
- Sistem booking/appointment internal dengan database pasien.
- Portal pasien (login, riwayat medis).
- E-commerce / pembayaran online.
- Fitur real-time chat.

## Scope — Fase Selanjutnya (nice-to-have, di luar MVP)
- Halaman artikel/edukasi kesehatan.
- Testimoni pasien.
- Galeri foto klinik.
- SEO lanjutan / schema markup local business.

## Functional Requirements
Ditulis gaya WHEN/SHALL biar jelas dan bisa dicek agent:

- **FR-1**: WHEN pengunjung membuka halaman utama, sistem SHALL menampilkan nama, foto, spesialisasi, dan CTA booking di atas fold (above the fold) pada layar mobile.
- **FR-2**: WHEN pengunjung klik tombol "Booking Sekarang", sistem SHALL membuka tab baru menuju URL eksternal yang didefinisikan di data source, TANPA memproses booking apa pun secara internal.
- **FR-3**: WHEN admin mengubah data di Google Sheet (mis. jam praktik), sistem SHALL merefleksikan perubahan tersebut di website tanpa perlu developer mengubah kode.
- **FR-4**: WHEN data suatu field kosong/belum diisi di sumber data, sistem SHALL menampilkan fallback yang aman (bukan crash, bukan teks kosong membingungkan) — lihat `02-content-data.md`.
- **FR-5**: WHEN halaman diakses dari perangkat mobile (viewport < 768px), sistem SHALL menampilkan layout yang tetap terbaca dan CTA tetap mudah dijangkau (thumb-friendly).

## Non-Functional Requirements
- Waktu load halaman utama < 2.5s di koneksi 4G biasa.
- Skor Lighthouse mobile minimal 90 untuk Performance & Accessibility (target, bukan hard block di MVP).
- Tidak ada dependency berbayar wajib untuk menjalankan situs.

## Acceptance Criteria (MVP "Selesai" kalau...)
- [ ] Semua halaman di `03-sitemap.md` dapat diakses dan responsif.
- [ ] Data diambil dari Google Sheet, bukan hardcoded.
- [ ] CTA booking terverifikasi redirect ke URL yang benar.
- [ ] Placeholder konten diganti data asli (setelah `02-content-data.md` diisi user).
- [ ] Lolos `npm run build` tanpa error, deploy berhasil.
