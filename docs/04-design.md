# 04 — Design & Brand Direction

> Status: ✅ **Final** — dikonfirmasi user 28 Agustus 2026. Arketipe: **Modern-calm**. Konteks: spesialisasi serius/klinis. Tanpa identitas visual existing (bebas menentukan baru).

## Mood
Kalem, bersih, kredibel. Bukan "brosur RS korporat" yang dingin, tapi juga bukan "warm & playful" — karena konteksnya spesialisasi serius (bedah/penyakit dalam/kardiologi dst), kesan yang dituju adalah **tenang tapi kompeten**: pasien yang datang biasanya butuh keyakinan, bukan hiburan visual.

## Palet Warna

| Peran | Warna | Hex | Catatan |
|---|---|---|---|
| Primary (calming) | Teal-blue-gray muted | `#3F6B74` | Warna utama brand — header, ikon, elemen identitas. Bukan biru medis generik, lebih "tenang & modern" sesuai tren 2026. |
| Primary Dark | Slate deep | `#243138` | Teks heading, elemen kontras tinggi (bukan hitam pekat). |
| Neutral Background | Off-white | `#F7F8F7` | Background utama, lebih lembut dari putih pekat. |
| Neutral Surface | Putih | `#FFFFFF` | Card, section alternatif. |
| Neutral Text | Abu gelap hangat | `#4A5257` | Body text — kontras cukup tapi tidak setajam hitam. |
| Accent (CTA/action) | Amber muted | `#D98C4A` | **Khusus untuk CTA booking & elemen aksi** — kontras hangat terhadap primary yang dingin, menarik perhatian tanpa kesan alarm/urgent seperti merah. |
| Border/Divider | Abu sangat muda | `#E4E7E6` | Garis pemisah halus, jangan pakai border tebal/gelap. |

**Aturan penting**: warna accent (`#D98C4A`) HANYA dipakai untuk CTA dan elemen yang butuh perhatian (tombol booking, link penting). Jangan dipakai dekoratif berlebihan — kalau semua berwarna aksen, tidak ada yang menonjol.

## Tipografi
- **Heading**: `Plus Jakarta Sans` (Semibold/Bold) — modern, sedikit karakter tapi tetap profesional, bukan generic system font.
- **Body**: `Inter` (Regular/Medium) — sangat terbaca di ukuran kecil, standar aksesibilitas tinggi, penting untuk konten medis yang dibaca lintas usia.
- Ukuran dasar body: minimal 16px di mobile (jangan lebih kecil, demi keterbacaan pasien lanjut usia).
- Line-height lega: 1.5–1.6 untuk paragraf.
- Hindari huruf kapital semua (all-caps) untuk paragraf panjang — oke untuk label kecil saja (mis. "SPESIALISASI").

## Prinsip Layout & Komponen
- **Whitespace generous** — jangan padat, beri ruang antar section minimal 64–96px di desktop, 40–56px di mobile.
- **Card & elemen**: sudut membulat halus (`border-radius: 12px`), shadow sangat tipis (`0 1px 3px rgba(0,0,0,0.06)`) — kesan kalem, bukan flat tajam maupun skeuomorphic berat.
- **Foto dokter** jadi elemen visual utama di hero — pakai foto profesional asli (bukan stock generic), proporsi natural, hindari filter berlebihan. Kalau foto belum ada, treatment sementara: silhouette/placeholder abu netral, JANGAN pakai foto stock orang random sebagai pengganti (menyesatkan).
- **Ikon**: line icon, stroke 1.5–2px, sudut membulat (rounded cap/join), warna mengikuti `primary` atau `neutral text` — konsisten satu set ikon (mis. Lucide/Phosphor), jangan campur beberapa gaya ikon.
- **CTA booking**: tombol pill/rounded-rect (`border-radius: 8–999px`, pilih salah satu konsisten), warna accent, teks kontras tinggi, ukuran cukup besar untuk mobile tap target (min 44x44px).
- **Micro-interaction**: transisi halus 150–200ms pada hover/tap (opacity atau translate kecil), bukan animasi besar/mencolok.
- **Trust signals** ditempatkan menonjol tapi tidak berlebihan: badge sertifikasi/afiliasi dekat nama dokter, bukan disembunyikan di footer.

## Nada Bahasa (Tone of Voice)
Formal namun tidak kaku — bahasa Indonesia baku tapi tidak birokratis. Hindari jargon medis berlebihan di copy utama; kalau perlu istilah teknis, beri penjelasan singkat. Konsisten dengan mood "tenang tapi kompeten": kalimat pendek, jelas, tidak bertele-tele.

## Referensi Arah (bukan ditiru persis)
Pola dari riset: restraint ala Doctolib (fokus penuh ke aksi booking, tanpa dekorasi berlebih) digabung dengan kehangatan sentuhan warna aksen ala platform modern lain — hasilnya kalem tapi tidak dingin.

## Aksesibilitas
- Kontras warna teks-background minimal WCAG AA (4.5:1 untuk body text).
- Semua CTA harus punya focus state yang jelas (keyboard navigation).
- Alt text wajib untuk semua gambar (terutama foto dokter & ikon layanan).
