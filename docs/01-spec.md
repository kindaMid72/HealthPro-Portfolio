# 01 — Spec (Requirements)

## Tujuan
Website profil dokter spesialis THT-BKL sebagai **CV digital / personal branding** sekaligus **Portal Edukasi Kesehatan Pasien (`/artikel`)**, dilengkapi **Admin Dashboard (`/admin`)** untuk pengelolaan mandiri serta CTA yang mengarahkan pengunjung untuk booking lewat **link eksternal** atau WhatsApp lokasi praktik.

## Target Pengguna
- Calon pasien baru yang mencari info dokter atau membaca artikel edukasi gejala THT sebelum memutuskan konsultasi.
- Pasien lama yang butuh info kontak/lokasi/jam praktik dengan cepat.
- Dokter & rekan/asisten admin yang menulis, meninjau (`in_review`), dan menerbitkan artikel edukasi serta memperbarui jadwal praktik melalui `/admin`.

## Scope — In
- Halaman profil dokter (bio/personal story, pendidikan, sertifikasi, pengalaman, organisasi).
- Section layanan & spesialisasi medis.
- Info lokasi & jadwal praktik multi-lokasi.
- CTA "Booking Sekarang" → redirect ke URL eksternal atau fallback ke WhatsApp.
- Portal Artikel Edukasi Kesehatan THT (`/artikel`, `/artikel/halaman/[page]`, `/artikel/[slug]`):
  - Filter berdasarkan 5 kategori THT (`telinga`, `hidung`, `tenggorok`, `kepala-leher`, `umum`) dan pencarian kata kunci.
  - Estimasi waktu baca otomatis, Daftar Isi (TOC) otomatis dari subjudul `H2`/`H3`, penghitung pembaca unik (`viewCount`), tombol bagikan ke WhatsApp, badge *"Ditinjau secara medis oleh dr. Yuliana"*, artikel terkait, dan JSON-LD `MedicalWebPage` + `BlogPosting`.
- Admin Dashboard (`/admin`):
  - Login sesi cookie (`httpOnly`) dengan proteksi brute-force lockout (5x gagal → kunci 15 menit).
  - Beranda statistik artikel, pembaca, & indikator kelengkapan data website.
  - Editor artikel kaya Tiptap v3 (Heading, List, Kutipan, Tabel, Gambar + Caption, Autosave draft, alur `draft` → `in_review` → `published`, catatan review).
  - CRUD Profil Dokter (+ unggah foto profil WebP), Lokasi Praktik, Layanan Medis, dan Manajemen Akun/Password.

## Scope — Out (eksplisit tidak dikerjakan)
- Sistem booking/appointment internal dengan database pasien.
- Portal pasien (login pasien, rekam medis).
- E-commerce / pembayaran online.
- Fitur real-time live chat.

## Functional Requirements
- **FR-1**: WHEN pengunjung membuka halaman utama, sistem SHALL menampilkan nama, foto, spesialisasi, dan CTA booking di atas fold (above the fold) pada layar mobile.
- **FR-2**: WHEN pengunjung klik tombol "Booking Sekarang", sistem SHALL membuka tab baru menuju URL eksternal yang didefinisikan di data source, TANPA memproses booking apa pun secara internal.
- **FR-3**: WHEN admin menyimpan perubahan profil, lokasi, layanan, atau menerbitkan artikel di `/admin`, sistem SHALL memperbarui database PostgreSQL dan memicu `revalidatePublicSite` agar perubahan langsung tercermin di halaman publik.
- **FR-4**: WHEN data suatu field kosong/belum diisi atau database belum tersedia, sistem SHALL menampilkan fallback yang aman (`data/fallback-*.json`).
- **FR-5**: WHEN halaman diakses dari perangkat mobile (viewport < 768px), sistem SHALL menampilkan layout yang tetap terbaca dan CTA tetap mudah dijangkau (thumb-friendly).
- **FR-6**: WHEN pengunjung membuka halaman artikel `/artikel/[slug]`, sistem SHALL menampilkan informasi medis yang telah berstatus `published`, lengkap dengan badge tinjauan medis, Daftar Isi (bila ≥ 2 subjudul), waktu baca, dan CTA konsultasi.
- **FR-7**: WHEN sebuah layanan memiliki konten detail (kolom `content` tidak kosong), sistem SHALL menyajikan halaman `/layanan/[slug]` dan menautkannya dari kartu layanan di beranda; WHEN konten kosong, sistem SHALL TIDAK menyajikan halaman maupun tautan tersebut.
