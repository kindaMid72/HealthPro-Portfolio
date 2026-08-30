# 02 — Content Data

> **Untuk agent**: file ini kontrak data, sinkron dengan skema di `07-data-architecture.md`. Field bertanda `[BELUM DIISI]` WAJIB tetap kosong/placeholder eksplisit — JANGAN dikarang.

## Status
🟡 **Sebagian terisi** — data awal masuk 28 Agustus 2026 dari kuisioner. Beberapa field krusial masih kosong (lihat bagian "Belum Lengkap" di bawah). Development boleh mulai jalan, tapi field kosong di bawah **memblokir** beberapa fitur — lihat catatan di tiap field.

## ⚠️ Perubahan Struktural
Data asli ternyata punya **3 lokasi praktik berbeda** dengan jadwal & kontak masing-masing — bukan 1 lokasi seperti asumsi awal. Skema di bawah sudah disesuaikan: `locations` sekarang jadi **array/list** (tab Sheet terpisah, sama pola dengan `services`), bukan field flat di tab Profile. Keputusan tampilan: **semua lokasi ditampilkan setara** (list/kartu sejajar, bukan 1 utama + sisanya sekunder) — dikonfirmasi user 28 Agustus 2026.

---

## Tab "Profile" (1 baris data)

| Field key | Isi saat ini | Status |
|---|---|---|
| `full_name` | dr. Yuliana, Sp.THTBKL, M.Kes | ✅ |
| `specialty` | Spesialis Telinga Hidung Tenggorok (THT-BKL) | ✅ |
| `sub_specialty` | — | Tidak diisi, dianggap tidak ada |
| `str_sip_display` | *(mau ditampilkan: "Ya")* | 🔴 **BELUM DIISI** — nomor STR/SIP aktual belum dikasih, padahal sudah dikonfirmasi mau tampil. Perlu di-follow-up. |
| `photo_url` | — | 🔴 **BELUM DIISI** — belum ada foto, perlu dijadwalkan pemotretan. **Blocking Fase 2** (styling hero, `06-tasks.md`). |
| `education` | S1: Universitas Hasanuddin | 🟡 Sebagian — spesialisasi (Sp. THT-BKL) dari kampus mana & tahun lulus belum ada |
| `certifications` | — | 🔴 BELUM DIISI (opsional, tapi menambah kredibilitas) |
| `experience_history` | RSUD Dr. H. Andi Abdurrahman Noor, 2016–2024 (riwayat, sudah selesai — dikonfirmasi 28 Agt 2026) | ✅ |
| `organizations` | Anggota PERHATI Kalimantan Selatan | ✅ |
| `booking_url` | — | 🔴 **BELUM DIISI — BLOCKING FR-2.** Tanpa ini tombol "Booking Sekarang" tidak punya tujuan. Prioritas paling tinggi untuk di-follow-up. |
| `email` | — | Tidak diisi (opsional) |
| `social_links` | — | Tidak diisi (opsional) |
| `personal_story` | *(isi form: "Menegakkan diagnosa dengan pemeriksaan fisis.")* | ⚠️ **Perlu klarifikasi** — jawaban ini terdengar seperti deskripsi pendekatan klinis/layanan, bukan cerita personal alasan memilih spesialisasi. Kemungkinan salah kolom saat mengisi form. Jangan dipakai di section "Tentang" sebelum dikonfirmasi ulang ke dr. Yuliana. |

## Tab "Locations" (array — 1 baris per lokasi, BARU)

| # | `location_name` | `address` | `practice_hours` | `whatsapp` | `phone` | `booking_url_override` |
|---|---|---|---|---|---|---|
| 1 | Klinik Simpang / Klinik Hamdi | Jl. Gawe Sabumi No. 33 RT 07 RW 02, Desa Bersujud, Kec. Simpang Empat, Kab. Tanah Bumbu | Senin–Sabtu, 17.00–21.00 | 08115553556 | — | — |
| 2 | Praktek Dokter THT Angsana | Jl. Sebamban 2 Blok F RT 011 RW 03, Angsana, Kab. Tanah Bumbu | Senin, Rabu, Sabtu, 13.00–15.00 | 🔴 BELUM DIISI | — | — |
| 3 | Apotik Kimia Farma Batulicin | Jl. Raya Batulicin RT 05 RW 02, Kampung Baru, Simpang Empat, Kab. Tanah Bumbu | Selasa, Kamis, Jumat, 13.00–16.00 | 🔴 BELUM DIISI | — | — |

**Catatan**: 2 dari 3 lokasi belum punya kontak (WA/telepon) sama sekali. Kalau sampai Fase 3 masih kosong, tampilkan alamat & jam saja tanpa tombol kontak langsung untuk lokasi tsb (fallback per FR-4), TAPI ini idealnya dilengkapi dulu karena mengurangi kegunaan halaman kontak.

## Tab "Services" (array)

| `service_name` | `service_description` |
|---|---|
| Otoskopi | 🔴 Deskripsi belum ada — data asli cuma daftar nama tindakan tanpa penjelasan |
| Nasoendoskopi | 🔴 Deskripsi belum ada |
| Laringoskopi | 🔴 Deskripsi belum ada |

**Catatan**: field "Daftar layanan lengkap" di kuisioner asli kosong; yang terisi cuma "layanan unggulan" (3 nama tindakan tanpa deskripsi). Deskripsi singkat tiap layanan perlu diminta terpisah — teks medis, sebaiknya dari dr. Yuliana langsung, agent tidak boleh menulis deskripsi tindakan medis sendiri.

## Data Operasional Lain (BPJS/asuransi)
`insurance_info`: "Campuran" (BPJS & umum) — ✅ terisi, tapi perlu diperjelas: campuran per-lokasi atau semua lokasi sama? *(pertanyaan follow-up)*

## Belum Lengkap Sama Sekali (Section H & I kuisioner terlewat)
Form yang diisi berhenti di pertanyaan No. 27 — berikut yang perlu ditanyakan ulang, lihat `kuisioner-followup.md`:
- Bahasa situs (ID saja / + EN)
- Target usia pasien
- Kata yang wajib/dihindari
- Admin pengubah konten sehari-hari
- Email Google untuk akses Sheets (dibutuhkan sebelum Fase 0 selesai, lihat `06-tasks.md`)
- Status domain

## Fallback Rule (FR-4)
- Field kosong → sembunyikan elemen terkait atau tampilkan "Segera hadir", bukan teks kosong/error.
- **Kasus khusus**: `booking_url` kosong → tombol "Booking Sekarang" TIDAK BOLEH tampil aktif/broken-link. Sembunyikan tombol, ganti CTA sekunder (mis. "Hubungi via WhatsApp") sampai `booking_url` terisi.
