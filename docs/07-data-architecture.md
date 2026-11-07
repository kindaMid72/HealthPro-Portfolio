# 07 — Data Architecture (Detailed)

This document describes the storage and data management architecture based on **PostgreSQL + Drizzle ORM** in accordance with `00-constitution.md` v2.0 and `05-tech-plan.md`.

## 1. PostgreSQL Table Schema (`src/db/schema.ts`)

### Enums
- `article_status`: `'draft' | 'in_review' | 'published'`
- `article_category`: `'telinga' | 'hidung' | 'tenggorok' | 'kepala-leher' | 'umum'`

### Tables
1. **`users`**: Stores admin accounts (`id`, unique `email`, `name`, scrypt `password_hash`, `failed_login_count`, `locked_until`, `created_at`). All accounts possess equal permissions for collaborative article writing and reviewing.
2. **`sessions`**: Stores active login sessions (`id` formatted as SHA-256 hex of the `mami_session` cookie token, `user_id`, `expires_at`, `created_at`).
3. **`images`**: Stores WebP compressed image blobs (`id`, optional `article_id` with `ON DELETE CASCADE`, `mime_type`, bytea `data`, `width`, `height`, `byte_size`, `created_by`, `created_at`).
4. **`profile`**: Singleton table (`CHECK (id = 1)`) storing doctor biographical data (`full_name`, `specialty`, `sub_specialty`, `str_sip_display`, `education`, `certifications`, `experience_history`, `organizations`, `booking_url`, `email`, `social_links`, `personal_story`, `photo_image_id`, `updated_at`).
5. **`locations`**: Practice locations ordered by `sort_order` (`location_name`, `address`, `practice_hours`, `whatsapp`, `phone`, `booking_url_override`).
6. **`services`**: Medical services ordered by `sort_order` (`service_name`, short `service_description` for homepage cards, unique `slug` for `/layanan/[slug]`, Tiptap document `content` for detail page — empty means no page, optional `category` linking to related article topics). Short descriptions that are placeholders or < 20 characters are hidden on the public site.
7. **`articles`**: Stores health education articles (unique `slug`, `title`, `excerpt`, `category`, `cover_image_id`, `cover_alt`, Tiptap JSONB `content`, `status`, `review_note`, `reading_time_minutes`, `view_count`, `author_id`, `updated_by`, `created_at`, `updated_at`, `published_at`).

## 2. Data Resilience & Fallbacks (`src/lib/content.ts`)
- All public data reads pass through `src/lib/content.ts` wrapped in `React.cache`.
- If the database is not yet seeded or connection fails during initial static build, `getProfile()`, `getLocations()`, and `getServices()` automatically fall back to snapshot files `data/fallback-profile.json`, `data/fallback-locations.json`, and `data/fallback-services.json`.
- `npm run db:import-sheets` overwrites all rows in `locations` and `services` (including service `content` written via admin). Run only for initial seeding.

## 3. Image Lifecycle & Garbage Collection
- Image uploads via `/api/admin/images` are validated (max 10 MB, JPEG/PNG/WebP/AVIF/GIF) and compressed by `sharp` into WebP format (max 1600×1600 px, quality 80).
- When an article is saved (`updateArticle`), images associated with `article_id` that are no longer referenced by `cover_image_id` or `image` nodes in Tiptap JSON are automatically purged from the `images` table.
- When the doctor's profile photo is replaced (`saveProfileAction`), the old photo blob is automatically deleted via `deleteImageIfUnused`.
