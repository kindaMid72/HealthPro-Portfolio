# 03 — Sitemap & Page Content

Scope halaman resmi proyek. Agent tidak boleh menambah halaman di luar daftar ini tanpa approval (lihat `AGENTS.md`).

## 1. Halaman Publik

### `/` — Beranda Profil Dokter
1. **Hero Section**: Foto dokter, nama + gelar, spesialisasi, badge STR/SIP, CTA utama ("Booking Sekarang" / "Hubungi via WhatsApp").
2. **Tentang (`/#tentang`)**: Pengantar pelayanan (`personal_story`), Pendidikan, Pengalaman, Sertifikasi, Organisasi profesi.
3. **Layanan (`/#layanan`)**: Daftar layanan pemeriksaan dan tindakan medis THT-BKL.
4. **Jadwal & Lokasi Praktik (`/#lokasi`)**: Kartu multi-lokasi sejajar (nama RS/klinik, alamat + tautan Google Maps, jam praktik, tombol WA/Telepon/Booking).
5. **Artikel Terbaru (`/#artikel`)**: Menampilkan hingga 3 artikel edukasi terbaru yang sudah terbit beserta tautan ke `/artikel`.
6. **Kontak (`/#kontak`)**: Agregasi saluran WhatsApp, telepon per lokasi, dan email.

### `/artikel` & `/artikel/halaman/[page]` — Indeks Artikel Edukasi THT
- Filter topik berdasarkan kategori (`Telinga & Pendengaran`, `Hidung & Sinus`, `Tenggorok & Suara`, `Bedah Kepala & Leher`, `Edukasi THT Umum`) dan pencarian judul/ringkasan (`?kategori=...&q=...`).
- Grid kartu artikel (9 artikel per halaman) dengan gambar sampul, kategori, tanggal terbit, estimasi waktu baca, ringkasan, dan nama penulis.

### `/artikel/[slug]` — Halaman Baca Artikel Edukasi
- Breadcrumb (`Beranda / Artikel / Kategori / Judul`).
- Judul, kategori, penulis, tanggal terbit, waktu baca, penghitung pembaca (`ArticleViewTracker`), dan **Medical Review Badge**.
- Daftar Isi (TOC) otomatis untuk artikel dengan minimal 2 subjudul `H2`/`H3`.
- Isi artikel (mendukung subjudul, daftar, kutipan, tautan, tabel klinis, gambar dengan caption).
- Tombol bagikan ke WhatsApp & salin tautan (`ArticleShareBar`), disclaimer medis, kartu CTA konsultasi, dan 3 **Artikel Terkait**.

### `/media/[id]` — Penyajian Gambar Terkompresi WebP
- Menyajikan blob gambar WebP dari tabel `images` dengan header `Cache-Control: public, max-age=31536000, immutable`.

### `/sitemap.xml`, `/robots.txt`, `/llms.txt` — SEO & GEO Endpoints
- Sitemap dan `/llms.txt` otomatis menyertakan seluruh artikel yang telah berstatus `published`.
- `robots.txt` mengecualikan `/admin` dan `/api/admin`.

---

## 2. Halaman Admin Dashboard (`/admin/*`)
Dilindungi oleh autentikasi sesi cookie (`mami_session`) dan header `noindex, nofollow`. Mendukung alias URL Bahasa Indonesia (`/admin/artikel`, `/admin/profil`, `/admin/lokasi`, `/admin/layanan`, `/admin/akun`).

- `/admin/login` — Halaman masuk admin.
- `/admin` — Ringkasan statistik artikel (`published`, `in_review`, `draft`, total pembaca), indikator kelengkapan data website, dan 5 artikel terakhir diperbarui.
- `/admin/articles` — Daftar seluruh artikel dengan filter status, kategori, dan pencarian.
- `/admin/articles/[id]` — Editor artikel Tiptap v3 dengan autosave draft, tabel, unggah gambar + caption, catatan review, dan kontrol publikasi.
- `/admin/articles/[id]/preview` — Pratinjau artikel sebelum diterbitkan.
- `/admin/profile` — Form pengelolaan profil dokter, foto profil, dan tautan booking.
- `/admin/locations` — CRUD dan pengurutan lokasi praktik.
- `/admin/services` — CRUD dan pengurutan layanan medis.
- `/admin/account` — Pengaturan nama tampilan, ganti kata sandi, dan pembuatan akun admin tambahan.
