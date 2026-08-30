# 07 — Data Architecture (Detail)

Dokumen ini adalah rincian teknis dari keputusan di `05-tech-plan.md`. Kalau ada konflik, `00-constitution.md` tetap yang menang (no database, no backend custom).

## 1. Filosofi
Data dipisah jadi dua kategori dengan karakteristik beda, dan **ditangani dengan cara berbeda**:

| Kategori | Contoh | Frekuensi berubah | Siapa yang edit | Disimpan di |
|---|---|---|---|---|
| **Konten teks/struktural** | Bio, jam praktik, layanan, nomor kontak, `booking_url` | Sering (mingguan/bulanan) | Non-developer (dokter/admin) | Google Sheets |
| **Media/aset visual** | Foto profil, ikon | Jarang (sekali pasang, ganti tahunan) | Developer/agent (lewat PR) | Static file di repo (`/public`) |

Kenapa dipisah: Google Sheets bagus untuk teks terstruktur, tapi **tidak reliable untuk hosting gambar** (link share Google Drive sering diblokir hotlink, butuh konversi manual, dan bisa berubah jadi request-quota-limited). Foto yang jarang berubah lebih aman sebagai file statis yang di-bundle saat build — cepat, tidak bisa "putus link" tiba-tiba.

## 2. Lapisan Arsitektur

```
┌─────────────────────┐
│   Google Sheets      │  ← admin edit di sini (tab "Profile", tab "Services")
│  (Publish to web)    │
└──────────┬───────────┘
           │  HTTP GET (CSV, public read-only)
           ▼
┌─────────────────────┐
│  lib/sheets.ts        │  ← fetch layer
│  - fetch CSV           │
│  - parse CSV → object  │
│  - validasi (Zod)       │
│  - fallback kalau gagal  │
└──────────┬───────────┘
           │  typed object (sesuai schema)
           ▼
┌─────────────────────┐
│  Next.js Page (SSG/ISR)│  ← render komponen dengan data tervalidasi
└──────────┬───────────┘
           │
           ▼
    Static HTML (deployed ke Vercel/CDN)
```

Prinsip kunci: **komponen React TIDAK PERNAH fetch Sheet langsung**. Semua akses data lewat `lib/sheets.ts` sebagai satu titik kontrol — supaya kalau nanti sumber data ganti (mis. ke Opsi B/API atau CMS lain), cukup ubah file ini, komponen tidak perlu disentuh.

## 3. Skema Data

### Tab `Profile` (1 baris data, kolom = field)
> **Update 28 Agustus 2026**: data lokasi ternyata multi-lokasi (3 tempat praktik berbeda) — dipisah jadi tab `Locations` tersendiri (lihat di bawah), TIDAK lagi flat field di Profile. `booking_url` tetap di level Profile (berlaku global, bukan per-lokasi) sampai ada kebutuhan sebaliknya.

```typescript
// lib/types.ts
export const ProfileSchema = z.object({
  full_name: z.string().min(1),
  specialty: z.string().min(1),
  sub_specialty: z.string().optional(),
  str_sip_display: z.string().optional(),   // nomor STR/SIP, ditampilkan kalau diisi
  photo_url: z.string(), // path relatif ke /public, BUKAN URL Sheet/Drive
  education: z.string(),
  certifications: z.string().optional(),
  experience_history: z.string(),
  organizations: z.string().optional(),
  booking_url: z.string().url().optional(),   // WAJIB ada isi sebelum Fase 3 — dipakai FR-2. Optional di schema supaya build tidak gagal total selama masih kosong, TAPI komponen CTA wajib fallback (lihat 02-content-data.md)
  email: z.string().email().optional(),
  social_links: z.string().optional(),
  personal_story: z.string().optional(),
});
export type Profile = z.infer<typeof ProfileSchema>;
```

### Tab `Locations` (BARU — banyak baris, 1 baris = 1 lokasi praktik)
```typescript
export const LocationSchema = z.object({
  location_name: z.string().min(1),
  address: z.string().min(1),
  practice_hours: z.string().min(1),
  whatsapp: z.string().optional(),
  phone: z.string().optional(),
  booking_url_override: z.string().url().optional(), // kalau lokasi ini punya link booking sendiri, beda dari Profile.booking_url
});
export const LocationsListSchema = z.array(LocationSchema);
export type Location = z.infer<typeof LocationSchema>;
```
Ditampilkan sebagai list/kartu sejajar (semua lokasi setara), sesuai keputusan di `03-sitemap.md`. Kartu lokasi tanpa `whatsapp`/`phone` tetap tampil (alamat & jam saja), tidak disembunyikan.

### Tab `Services` (banyak baris)
```typescript
export const ServiceSchema = z.object({
  service_name: z.string().min(1),
  service_description: z.string(), // wajib diisi dokter, agent TIDAK menulis deskripsi tindakan medis sendiri
});
export const ServicesListSchema = z.array(ServiceSchema);
```

**Kenapa pakai Zod (atau validator sejenis)**: Google Sheets diedit manual oleh non-developer — typo kolom, baris kosong ke-skip, atau field wajib ke-hapus tidak sengaja itu risiko nyata. Validasi di build time mengubah "website tampil rusak diam-diam" jadi "build gagal dengan pesan jelas", jauh lebih aman untuk didiagnosis.

## 4. Mekanisme Fetch: Build Time + ISR

```typescript
// lib/sheets.ts (pseudocode struktur, bukan implementasi final)
export async function getProfile(): Promise<Profile> {
  const res = await fetch(process.env.SHEET_CSV_URL_PROFILE!, {
    next: { revalidate: 3600 } // ISR: refresh tiap 1 jam
  });
  if (!res.ok) return getFallbackProfile(); // lihat bagian 6
  const csvText = await res.text();
  const parsed = parseCsvToObject(csvText); // 1 baris → 1 object
  const result = ProfileSchema.safeParse(parsed);
  if (!result.success) {
    console.error('Data Profile tidak valid:', result.error);
    return getFallbackProfile();
  }
  return result.data;
}

export async function getLocations(): Promise<Location[]> {
  const res = await fetch(process.env.SHEET_CSV_URL_LOCATIONS!, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) return getFallbackLocations();
  const csvText = await res.text();
  const rows = parseCsvToObjectArray(csvText);
  const result = LocationsListSchema.safeParse(rows);
  if (!result.success) {
    console.error('Data Locations tidak valid:', result.error);
    return getFallbackLocations();
  }
  return result.data;
}
```

- **Build time**: saat `next build`, data di-fetch sekali untuk generate halaman statis.
- **ISR (`revalidate: 3600`)**: di production, Next.js otomatis re-fetch data di background tiap 1 jam sekali ada request baru setelah window itu lewat — user tidak perlu redeploy manual tiap admin ubah Sheet.
- **Update lebih cepat dari 1 jam** (opsional, fase belakangan): tambahkan Google Apps Script trigger `onEdit` yang memanggil Vercel Deploy Hook / on-demand revalidation endpoint Next.js.

## 5. Caching Strategy
| Layer | Durasi | Catatan |
|---|---|---|
| Next.js ISR | 1 jam | Default, cukup untuk konten yang jarang berubah harian |
| Browser cache (static assets) | Long-term (immutable, hash-based) | Untuk JS/CSS/gambar hasil build |
| Tidak ada cache | - | Untuk halaman yang butuh data real-time (tidak ada di scope MVP ini) |

## 6. Fallback & Resilience (implementasi FR-4)
Google Sheets publish-to-web **bisa gagal sementara** (rate limit, maintenance Google, dsb). Strategi:

1. Simpan **snapshot terakhir yang valid** sebagai file JSON di repo: `data/fallback-profile.json`, `data/fallback-services.json` — di-generate otomatis tiap build sukses.
2. Kalau fetch ke Sheet gagal ATAU validasi Zod gagal → pakai fallback snapshot ini, JANGAN sampai build gagal total atau halaman blank.
3. Log warning jelas (di build log / opsional kirim notifikasi) supaya admin tahu ada baris data yang bermasalah dan perlu dicek manual.
4. Field individual yang kosong (bukan keseluuhan Sheet gagal) → tampilkan fallback per-UI sesuai aturan di `02-content-data.md` (sembunyikan section atau tampilkan "Segera hadir"), bukan crash seluruh halaman.

## 7. Media/Gambar — Alur Kerja
- Foto disimpan di `/public/images/` dalam repo, direferensikan lewat path relatif di kolom `photo_url` pada Sheet (mis. `/images/dr-profile.jpg`), **bukan link Google Drive**.
- Alur update foto: user kirim file foto ke developer/agent → agent optimasi (resize, compress via `next/image` atau tool build) → commit ke `/public/images/` → update path di Sheet kalau nama file berubah.
- **Keputusan final (28 Agustus 2026)**: tetap pakai alur commit lewat developer/agent, TIDAK pakai Cloudinary/ImgBB atau layanan image hosting eksternal apa pun. User (orchestrator) yang akan handle penggantian foto sendiri lewat repo. Opsi image hosting eksternal ditutup, tidak perlu dipertimbangkan lagi kecuali requirement berubah secara eksplisit di masa depan.

## 8. Local Development
- `.env.local` (tidak di-commit) berisi `SHEET_CSV_URL_PROFILE`, `SHEET_CSV_URL_SERVICES`.
- Untuk dev tanpa koneksi/tanpa mau bolak-balik hit Google: sediakan fixture lokal `data/dev-fixture.json` yang dipakai kalau `NODE_ENV=development` dan flag `USE_LOCAL_FIXTURE=true` di-set — mempercepat iterasi UI tanpa tergantung network.

## 9. Versioning & Rollback
- **Data** (isi Sheet): Google Sheets punya version history bawaan (File → Version history) — cukup untuk rollback data teks, tidak perlu tooling tambahan.
- **Skema & kode**: di-track lewat Git seperti biasa. Perubahan skema (`lib/types.ts`) harus selalu sinkron dengan `02-content-data.md` — kalau salah satu diubah, satunya WAJIB diupdate juga di PR yang sama.

## 10. Keamanan & Privasi
- **Publish to web = data bisa dibaca publik oleh siapa saja yang tahu URL CSV-nya.** Jangan pernah taruh data sensitif (mis. data pasien, informasi internal klinik yang tidak untuk publik) di Sheet ini — hanya data yang memang untuk ditampilkan di website publik.
- Tidak ada kredensial/API key yang perlu dirahasiakan untuk Opsi A (publish-to-web murni publik). Kalau nanti upgrade ke Opsi B (Sheets API), API key WAJIB disimpan sebagai environment variable di Vercel, tidak pernah di-commit ke repo.

## 11. Jalur Migrasi (kalau kebutuhan berkembang)
Karena semua akses data terisolasi di `lib/sheets.ts`, migrasi ke sumber lain di masa depan (Sheets API penuh, Airtable, headless CMS beneran seperti Sanity/Contentful) **tidak perlu mengubah komponen UI** — cukup ganti implementasi fetch & mapping di layer ini, schema Zod tetap jadi kontrak yang sama.

## 12. Ringkasan Keputusan
- [x] Sumber data teks: Google Sheets (publish-to-web CSV).
- [x] Validasi: Zod schema, fallback ke snapshot JSON kalau gagal.
- [x] Refresh: ISR 1 jam (upgrade ke webhook instant kalau dibutuhkan di fase lanjutan).
- [x] Gambar: static file di repo, terpisah dari alur Sheet.
- [x] Tidak ada database, tidak ada backend custom — sesuai constitution.
