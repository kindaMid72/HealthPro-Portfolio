# 05 — Technical Plan

## Stack
- **Framework**: Next.js 16 App Router (`16.3.3`), React 19, TypeScript (strict mode).
- **Styling**: Tailwind CSS v4 + `@tailwindcss/typography`.
- **Database & ORM**: PostgreSQL (`postgres:17` via Docker Compose for local development, Neon Serverless Postgres for production) + `drizzle-orm` (`0.45.4`) + `drizzle-kit` + driver `postgres` (`prepare: false` for connection pooler compatibility).
- **Rich Text Editor**: Tiptap v3 (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-table`, `@tiptap/static-renderer`).
- **Image Processing**: `sharp` — every image uploaded via `/api/admin/images` is auto-oriented, resized (max 1600×1600), compressed to WebP (`quality: 80`), and stored in the `bytea` column of the `images` table.
- **Admin Authentication**: Database-backed sessions (`sessions` + `users`), passwords hashed with `node:crypto` `scrypt` (`N=16384, r=8, p=1`), session tokens stored in `httpOnly` cookie (`mami_session`) and their SHA-256 hashes in the `sessions` table.

## Data Flow (Runtime & Build)
```
PostgreSQL (Neon / local Docker)
   ↑↓ Drizzle ORM (src/db/client.ts & src/db/schema.ts)
   ├── Public Read Path: src/lib/content.ts (React.cache + local fallback JSON)
   │      → Public Pages (/, /artikel, /artikel/[slug], /sitemap.xml, /llms.txt)
   └── Admin Write Path: Server Actions in src/app/admin/**/actions.ts
          → Save to PostgreSQL + call revalidatePublicSite()
```

## Main Directory Structure
```
/src
  /db
    schema.ts          -> 2 enum & 7 table PostgreSQL definitions
    client.ts          -> postgres.js connection singleton + Drizzle
  /lib
    types.ts           -> Zod schemas & public/article type contracts
    content.ts         -> Public data reader (React.cache + fallback JSON)
    articles.ts        -> Article domain logic, Tiptap HTML/TOC renderer, admin analytics
    images.ts          -> Sharp WebP compression & images table storage
    password.ts        -> scrypt password hashing & verification
    session.ts         -> Session cookie management & requireUser() guard
    revalidate.ts      -> revalidatePublicSite() helper
    cta.ts             -> WhatsApp number formatter & CTA resolution
    format.ts          -> Date formatter (WITA)
    seo.ts             -> Canonical URL helpers, schema.org, & text parsing
  /app
    /page.tsx          -> Doctor profile homepage
    /artikel           -> Index, pagination, and article reading page (/artikel/[slug])
    /media/[id]        -> Route handler serving WebP images from DB
    /api/admin/images  -> Admin image upload endpoint
    /api/articles/[slug]/view -> Article reader view counter endpoint
    /admin             -> Login & full admin panel pages
/scripts
  import-from-sheets.ts -> Initial database seed from Google Sheets CSV / fallback JSON
  create-user.ts        -> Admin account creation CLI
```

## Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (pooled in production).
- `DATABASE_URL_UNPOOLED` — (Optional, production) Direct connection string for `drizzle-kit migrate`.
- `NEXT_PUBLIC_SITE_URL` — Canonical site URL (e.g., `https://dryuliana.my.id`).
- `SHEET_CSV_URL_PROFILE`, `SHEET_CSV_URL_LOCATIONS`, `SHEET_CSV_URL_SERVICES` — (Optional) Used only once by `npm run db:import-sheets`.
