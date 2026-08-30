                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            # 03 — Sitemap & Page Content

Scope halaman untuk MVP. Agent tidak boleh menambah halaman di luar daftar ini tanpa approval (lihat `AGENTS.md`).

## Struktur (MVP)
Single-page atau multi-page dengan anchor scroll — direkomendasikan **single-page** dulu karena kontennya belum banyak (profil personal, bukan institusi besar). Bisa dipecah jadi multi-page di fase nanti kalau konten (artikel dsb) bertambah.

### 1. Hero / Home
- Foto dokter, nama + gelar, spesialisasi.
- CTA utama: "Booking Sekarang" (redirect eksternal, FR-2).
- CTA sekunder: "Hubungi via WhatsApp".

### 2. Tentang / Profil
- Bio singkat.
- Pendidikan.
- Sertifikasi & pelatihan.
- Pengalaman kerja.
- Organisasi profesi.

### 3. Layanan / Spesialisasi
- Daftar layanan (dari data `Services`).
- Tiap item: nama + deskripsi singkat.

### 4. Lokasi & Jadwal Praktik — ⚠️ Multi-lokasi
Data real: dokter praktik di **3 lokasi berbeda** (Klinik Simpang, Praktek Angsana, Apotik Kimia Farma Batulicin), masing-masing dengan alamat, jam, dan kontak sendiri. Lihat `02-content-data.md` tab "Locations".

- Tampilkan sebagai **list/kartu sejajar, semua lokasi setara** (bukan 1 utama + sisanya sekunder) — keputusan dikonfirmasi 28 Agustus 2026.
- Tiap kartu lokasi: nama, alamat (bisa embed Google Maps per lokasi), jam praktik, tombol kontak (WA/telepon) KALAU tersedia untuk lokasi tsb.
- Kalau lokasi belum punya kontak terisi (lihat gap di `02-content-data.md`), kartu tetap tampil (alamat+jam) tapi tanpa tombol kontak — bukan disembunyikan total, karena info lokasi & jam tetap berguna buat pasien.
- CTA booking utama (kalau `booking_url` sudah terisi) tetap muncul terpisah, tidak per-lokasi, kecuali nanti ada kebutuhan booking berbeda per lokasi.

### 5. Kontak
- WhatsApp, telepon, email.
- (Opsional) form kontak sederhana — evaluasi kebutuhan, kalau cuma WA/telpon sudah cukup, form tidak perlu (kurangi kompleksitas, sesuai constitution "no database": form butuh handler, bukan trivial).

## Fase Berikutnya (di luar MVP, jangan dikerjakan dulu)
- `/artikel` — daftar & detail artikel edukasi kesehatan.
- Section testimoni pasien — **dikonfirmasi ditunda** 28 Agustus 2026 (bukan skip permanen, evaluasi lagi setelah MVP jalan, tetap perlu izin tertulis pasien nanti sesuai catatan etik di `kuisioner-profil-dokter.md`).
- Galeri foto klinik.

## Navigasi
- Mobile: sticky bottom CTA bar (Booking + WhatsApp) supaya selalu gampang dijangkau (FR-5).
- Desktop: navbar sederhana dengan anchor link ke tiap section.
