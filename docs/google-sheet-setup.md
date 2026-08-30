# Google Sheet Setup — Panduan Lengkap

> Dokumen ini untuk **user (orchestrator)** — berisi panduan step-by-step membuat Google Sheet yang menjadi sumber data website dr. Yuliana.

---

## 🚀 Cara Tercepat: Import dari Template CSV

File template CSV sudah disiapkan di folder `docs/google-sheet-template/`. Data dari kuisioner sudah diisi ke dalam template — tinggal upload dan lengkapi field yang masih kosong.

### Langkah 1 — Buat Google Sheet baru

1. Buka [sheets.new](https://sheets.new) (atau [Google Sheets](https://sheets.google.com) → **+** Blank spreadsheet)
2. Beri nama spreadsheet: **`HealthPro - dr. Yuliana`** (bebas, tapi konsisten)

---

### Langkah 2 — Import Tab Profile

1. Di Sheet baru, klik **tab "Sheet1"** di bawah → klik kanan → **Rename** → ketik **`Profile`**
2. Klik menu **File → Import**
3. Upload file: `docs/google-sheet-template/tab-Profile.csv`
4. Pilih:
   - Import location: **Replace current sheet**
   - Separator type: **Comma**
   - Convert text to numbers: **No** (penting!)
5. Klik **Import data**

**Hasil**: baris 1 = header kolom, baris 2 = data profil dokter.

---

### Langkah 3 — Tambah Tab Locations

1. Klik **+** di pojok kiri bawah untuk tambah sheet baru
2. Rename tab baru jadi **`Locations`** (huruf besar L, persis begini)
3. Import file `docs/google-sheet-template/tab-Locations.csv` ke tab ini (sama seperti langkah 2)

---

### Langkah 4 — Tambah Tab Services

1. Tambah sheet baru lagi, rename jadi **`Services`**
2. Import file `docs/google-sheet-template/tab-Services.csv`

---

### Langkah 5 — Publish ke Web (ambil URL CSV)

Ulangi langkah ini **3 kali** — satu per tab:

1. **File → Share → Publish to web**
2. Di dropdown pertama pilih tab: **`Profile`** (lakukan 3x untuk masing-masing)
3. Di dropdown kedua pilih: **`Comma-separated values (.csv)`**
4. Klik **Publish** → OK
5. **Copy URL** yang muncul

URL akan terlihat seperti:
```
https://docs.google.com/spreadsheets/d/e/XXXXXXXXXX/pub?gid=0&single=true&output=csv
```

---

### Langkah 6 — Simpan URL ke .env.local

Buka file `.env.local` di root proyek, isi 3 URL yang tadi di-copy:

```env
SHEET_CSV_URL_PROFILE=https://docs.google.com/spreadsheets/d/e/XXX/pub?gid=PROFILE_GID&single=true&output=csv
SHEET_CSV_URL_LOCATIONS=https://docs.google.com/spreadsheets/d/e/XXX/pub?gid=LOCATIONS_GID&single=true&output=csv
SHEET_CSV_URL_SERVICES=https://docs.google.com/spreadsheets/d/e/XXX/pub?gid=SERVICES_GID&single=true&output=csv

# Setelah URL Sheet diisi, ubah baris ini jadi:
# USE_LOCAL_FIXTURE=false
USE_LOCAL_FIXTURE=true
```

> ⚠️ Jangan commit `.env.local` ke Git — file ini sudah ada di `.gitignore`.

---

## ✏️ Data yang Masih Perlu Dilengkapi di Sheet

Setelah import, isi kolom-kolom berikut yang masih kosong (lihat `docs/02-content-data.md` untuk detail):

| Tab | Field | Status |
|---|---|---|
| Profile | `str_sip_display` | 🔴 Belum diisi — nomor STR/SIP aktual |
| Profile | `booking_url` | 🔴 **Prioritas tertinggi** — diperlukan untuk tombol "Booking Sekarang" |
| Profile | `education` | 🟡 Perlu dilengkapi (kampus & tahun spesialisasi) |
| Locations | `whatsapp` (Angsana) | 🔴 Belum diisi |
| Locations | `whatsapp` (Kimia Farma) | 🔴 Belum diisi |
| Services | `service_description` (semua) | 🔴 Harus diisi dokter, bukan AI |

---

## 🔄 Cara Update Konten di Masa Depan

Setelah setup selesai, alur update konten untuk admin:

1. Buka Google Sheet
2. Edit sel yang ingin diubah (misal: ubah jam praktik)
3. Website otomatis update dalam **maksimal 1 jam** (ISR revalidate)
4. Kalau ingin update **langsung/instan**: ping developer untuk trigger rebuild manual

---

## ⚠️ Aturan Penting

- **Jangan rename tab** dari `Profile`, `Locations`, `Services` — kode mengharapkan nama persis ini
- **Jangan tambah/hapus kolom** tanpa koordinasi dengan developer — schema Zod harus diupdate bersamaan
- **Jangan simpan data sensitif** (data pasien, info internal) di Sheet ini — URL CSV-nya publik dan bisa dibaca siapa saja yang tahu URL-nya
