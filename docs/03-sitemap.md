# 03 — Sitemap & Page Content

Official project page scope. Agents must not add pages outside of this list without approval (see `AGENTS.md`).

## 1. Public Pages

### `/` — Doctor Profile Homepage
Section order oriented around patient needs ("when & where the doctor practices", "does she treat my symptoms", "how to contact"):
1. **Hero Section**: Doctor's photo, name + credentials, specialty, service area (derived from practice location addresses), STR/SIP badge (if filled), primary CTA ("Book now" / "Contact via WhatsApp"), and **"Practice today"** status card (calculated client-side in WITA time zone from clinic hours).
2. **Practice Schedule & Locations (`/#lokasi`)**: Weekly schedule board (Monday–Sunday, today highlighted) + parallel multi-location cards (hospital/clinic name, address + Google Maps link, practice hours, WhatsApp/Phone/Booking buttons).
3. **Services (`/#layanan`)**: Directory of ENT examination and medical procedure services. Services with detail content link to `/layanan/[slug]`.
4. **About (`/#tentang`)**: Practice introduction (`personal_story`), Education, Experience, Certifications, Professional organizations.
5. **Latest Articles (`/#artikel`)**: Displays up to 3 latest published educational articles with links to `/artikel`.
6. **Contact (`/#kontak`)**: Aggregation of WhatsApp channels, phone numbers per location, email, social media links, and emergency guidance notes.

### `/layanan/[slug]` — Service Detail Page
- Only exists for services with non-empty `content` column (not an empty Tiptap doc); otherwise returns 404 and the homepage does not link to it (FR-7).
- Breadcrumb (`Home / Services / Service name`), title, short description (if display-eligible), and **Medical Review Badge**.
- Service content (Tiptap: subheadings, lists, blockquotes, links, tables; without images) with automatic Table of Contents when ≥ 2 subheadings.
- Per-location practice schedule summary, medical disclaimer, consultation CTA card, and **Related Articles** (if the service is linked to an article topic).
- JSON-LD `MedicalWebPage` + `MedicalProcedure` + `BreadcrumbList`; included in `sitemap.xml` and `/llms.txt`.

### `/artikel` & `/artikel/halaman/[page]` — ENT Educational Article Index
- Topic filter by category (`Ear & Hearing`, `Nose & Sinus`, `Throat & Voice`, `Head & Neck Surgery`, `General ENT Education`) and title/summary search (`?kategori=...&q=...`).
- Article card grid (9 articles per page) with cover image, category, publication date, reading time estimate, excerpt, and author name.

### `/artikel/[slug]` — Educational Article Reading Page
- Breadcrumb (`Home / Articles / Category / Title`).
- Title, category, author, publication date, reading time, reader view counter (`ArticleViewTracker`), and **Medical Review Badge**.
- Automatic Table of Contents (TOC) for articles with at least 2 `H2`/`H3` subheadings.
- Article body (supports subheadings, lists, blockquotes, links, clinical tables, images with captions).
- Share to WhatsApp & copy link buttons (`ArticleShareBar`), medical disclaimer, consultation CTA card, and 3 **Related Articles**.

### `/media/[id]` — Compressed WebP Image Serving
- Serves WebP image blob from the `images` table with header `Cache-Control: public, max-age=31536000, immutable`.

### `/sitemap.xml`, `/robots.txt`, `/llms.txt` — SEO & GEO Endpoints
- Sitemap and `/llms.txt` automatically include all published articles and services with detail pages.
- `robots.txt` excludes `/admin` and `/api/admin`.

---

## 2. Admin Dashboard Pages (`/admin/*`)
Protected by cookie session authentication (`mami_session`) and `noindex, nofollow` headers. Supports Indonesian URL aliases (`/admin/artikel`, `/admin/profil`, `/admin/lokasi`, `/admin/layanan`, `/admin/akun`; alias `/admin/layanan/[id]` → `/admin/services/[id]`).

- `/admin/login` — Admin login page.
- `/admin` — Statistical overview of articles (`published`, `in_review`, `draft`, total readers), website data completeness indicator, and last 5 updated articles.
- `/admin/articles` — Full article list with status filters, categories, and search.
- `/admin/articles/[id]` — Tiptap v3 article editor with draft autosave, tables, image upload + caption, review notes, and publishing controls.
- `/admin/articles/[id]/preview` — Article preview before publication.
- `/admin/profile` — Doctor profile management form, profile photo, and booking link.
- `/admin/locations` — CRUD and reordering of practice locations.
- `/admin/services` — List, reordering, creation, and deletion of medical services.
- `/admin/services/[id]` — Service editor: name, URL slug, short description, related article topic, and detail content (Tiptap) for `/layanan/[slug]`.
- `/admin/account` — Display name settings, password changes, and creation of additional admin accounts.
