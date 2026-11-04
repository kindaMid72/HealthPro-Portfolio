# 07 — Data Architecture (Detail)

Dokumen ini menjelaskan arsitektur penyimpanan dan pengelolaan data berbasis **PostgreSQL + Drizzle ORM** sesuai `00-constitution.md` v2.0 dan `05-tech-plan.md`.

## 1. Skema Tabel PostgreSQL (`src/db/schema.ts`)

### Enum
- `article_status`: `'draft' | 'in_review' | 'published'`
- `article_category`: `'telinga' | 'hidung' | 'tenggorok' | 'kepala-leher' | 'umum'`

### Tabel
1. **`users`**: Menyimpan akun admin (`id`, `email` unik, `name`, `password_hash` scrypt, `failed_login_count`, `locked_until`, `created_at`). Semua akun memiliki hak setara untuk kolaborasi penulisan dan review artikel.
2. **`sessions`**: Menyimpan sesi login aktif (`id` berupa SHA-256 hex dari token cookie `mami_session`, `user_id`, `expires_at`, `created_at`).
3. **`images`**: Menyimpan blob gambar hasil kompresi WebP (`id`, `article_id` opsional dengan `ON DELETE CASCADE`, `mime_type`, `data` bytea, `width`, `height`, `byte_size`, `created_by`, `created_at`).
4. **`profile`**: Tabel singleton (`CHECK (id = 1)`) yang menyimpan biodata dokter (`full_name`, `specialty`, `sub_specialty`, `str_sip_display`, `education`, `certifications`, `experience_history`, `organizations`, `booking_url`, `email`, `social_links`, `personal_story`, `photo_image_id`, `updated_at`).
5. **`locations`**: Daftar lokasi praktik terurut berdasarkan `sort_order` (`location_name`, `address`, `practice_hours`, `whatsapp`, `phone`, `booking_url_override`).
6. **`services`**: Daftar layanan medis terurut berdasarkan `sort_order` (`service_name`, `service_description`).
7. **`articles`**: Menyimpan artikel edukasi kesehatan (`slug` unik, `title`, `excerpt`, `category`, `cover_image_id`, `cover_alt`, `content` JSONB Tiptap, `status`, `review_note`, `reading_time_minutes`, `view_count`, `author_id`, `updated_by`, `created_at`, `updated_at`, `published_at`).

## 2. Ketahanan Data & Fallback (`src/lib/content.ts`)
- Semua pembacaan data publik melewati `src/lib/content.ts` yang dibungkus `React.cache`.
- Apabila database belum di-seed atau koneksi gagal saat build statis awal, `getProfile()`, `getLocations()`, dan `getServices()` otomatis beralih ke file snapshot `data/fallback-profile.json`, `data/fallback-locations.json`, dan `data/fallback-services.json`.

## 3. Siklus Hidup Gambar & Garbage Collection
- Unggahan gambar melalui `/api/admin/images` divalidasi (maks 10 MB, format JPEG/PNG/WebP/AVIF/GIF) dan dikompresi oleh `sharp` ke format WebP (maks 1600×1600 px, kualitas 80).
- Saat artikel disimpan (`updateArticle`), gambar ber-`article_id` yang tidak lagi direferensikan oleh `cover_image_id` maupun node `image` di dalam JSON Tiptap otomatis dihapus dari tabel `images`.
- Saat foto profil dokter diganti (`saveProfileAction`), blob foto lama otomatis dihapus melalui `deleteImageIfUnused`.
