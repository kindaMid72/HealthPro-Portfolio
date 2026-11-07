# 01 — Spec (Requirements)

## Objective
Doctor profile website for an ENT specialist (Otolaryngologist - Head & Neck Surgeon) serving as a **digital CV / personal branding platform** and a **Patient Health Education Portal (`/artikel`)**, equipped with an **Admin Dashboard (`/admin`)** for autonomous management, along with CTAs directing visitors to book appointments via **external links** or practice location WhatsApp.

## Target Audience
- Prospective patients looking for doctor credentials or reading educational articles on ENT symptoms before deciding on a consultation.
- Returning patients who need quick access to contact information, practice locations, and clinic hours.
- The doctor and partner/assistant admins who write, review (`in_review`), and publish educational articles, as well as update practice schedules via `/admin`.

## Scope — In
- Doctor profile page (bio/personal story, education, certifications, experience, professional organizations).
- Clinical medical services & specialties section.
- Multi-location practice info & schedule.
- "Book Now" CTA → redirect to external URL or fallback to WhatsApp.
- ENT Health Education Article Portal (`/artikel`, `/artikel/halaman/[page]`, `/artikel/[slug]`):
  - Filter by 5 ENT categories (`telinga`, `hidung`, `tenggorok`, `kepala-leher`, `umum`) and keyword search.
  - Automatic reading time estimation, automatic Table of Contents (TOC) from `H2`/`H3` subheadings, unique reader counter (`viewCount`), WhatsApp share button, *"Medically reviewed by dr. Yuliana"* badge, related articles, and `MedicalWebPage` + `BlogPosting` JSON-LD.
- Admin Dashboard (`/admin`):
  - Cookie session login (`httpOnly`) with brute-force lockout protection (5 failed attempts → 15-minute lockout).
  - Dashboard analytics overview of articles, readership, & website data completeness indicators.
  - Tiptap v3 rich text article editor (Headings, Lists, Blockquotes, Tables, Images + Captions, draft autosave, `draft` → `in_review` → `published` workflow, review notes).
  - CRUD for Doctor Profile (+ WebP profile photo upload), Practice Locations, Medical Services, and Account/Password Management.

## Scope — Out (explicitly excluded)
- Internal booking/appointment system with patient database.
- Patient portal (patient login, electronic medical records).
- E-commerce / online payment.
- Real-time live chat feature.

## Functional Requirements
- **FR-1**: WHEN a visitor opens the home page, the system SHALL display the doctor's name, photo, specialty, and booking CTA above the fold on mobile screens.
- **FR-2**: WHEN a visitor clicks the "Book Now" button, the system SHALL open a new tab pointing to the external URL defined in the data source, WITHOUT processing any booking internally.
- **FR-3**: WHEN an admin saves changes to the profile, locations, services, or publishes an article in `/admin`, the system SHALL update the PostgreSQL database and trigger `revalidatePublicSite` so changes are immediately reflected on public pages.
- **FR-4**: WHEN a field is empty/unfilled or the database is unavailable, the system SHALL display safe fallbacks (`data/fallback-*.json`).
- **FR-5**: WHEN the site is accessed from a mobile device (viewport < 768px), the system SHALL present a legible layout with thumb-friendly CTAs.
- **FR-6**: WHEN a visitor opens an article page `/artikel/[slug]`, the system SHALL display medical content in `published` status, complete with medical review badge, Table of Contents (if ≥ 2 subheadings), reading time, and consultation CTA.
- **FR-7**: WHEN a service has detail content (non-empty `content` column), the system SHALL serve the `/layanan/[slug]` page and link to it from the service card on the homepage; WHEN content is empty, the system SHALL NOT serve the page or the link.
