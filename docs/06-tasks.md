# 06 — Tasks (Phase-by-Phase Build Plan)

> Rule: agents ONLY work on tasks in phases marked 🟢 Active. After a phase is complete, the agent reports to the user and awaits approval before changing the next phase status to 🟢.

## Phase 0 — Project Setup
Status: ✅ Complete (August 31, 2026)
- [x] Init repo, scaffold Next.js + TypeScript + Tailwind.
- [x] Add `AGENTS.md` and `docs/` folder to repo root.

## Phase 1 — Page Structure
Status: ✅ Complete (August 31, 2026)
- [x] Build all sections in `03-sitemap.md` as React components.
- [x] Implement booking CTA & mobile sticky bottom CTA.

## Phase 2 — Styling & Responsiveness
Status: ✅ Complete (August 31, 2026)
- [x] Apply design direction from `04-design.md`.
- [x] Ensure responsive design on mobile (375px) & desktop (1280px) per FR-5.

## Phase 3 — Real Data Integration & ISR
Status: ✅ Complete (September 2, 2026)
- [x] Integrate authentic data for dr. Yuliana and fallback JSON.

## Phase 4 — SEO, Performance, Deploy
Status: ✅ Complete (September 5, 2026)
- [x] Dynamic meta tags, OG image, sitemap, robots.txt, Physician JSON-LD, and `/llms.txt`.

## Phase 5 — PostgreSQL Migration, Admin Dashboard, & ENT Educational Article Portal
Status: ✅ Complete (April 22, 2026)
- [x] Set up `compose.yaml` (`postgres:17`), `drizzle.config.ts`, `src/db/schema.ts` (7 tables & 2 enums), `src/db/client.ts`, and SQL migrations (`drizzle/`).
- [x] Implement password security (`scrypt`), `httpOnly` cookie sessions, WebP image compression via `sharp`, and `/media/[id]` & `/api/admin/images` routes.
- [x] Build CLI scripts `scripts/import-from-sheets.ts` and `scripts/create-user.ts`.
- [x] Build data layer `src/lib/content.ts` & `src/lib/articles.ts` (Tiptap extensions, automatic heading ID injection & Table of Contents, reading time calculation, view counter, image garbage collection).
- [x] Build public portal `/artikel`, `/artikel/halaman/[page]`, and `/artikel/[slug]` complete with ENT category filters, search, TOC, Medical Review Badge, WhatsApp share, related articles, and `MedicalWebPage` + `BlogPosting` JSON-LD.
- [x] Build Indonesian-language Admin Dashboard (`/admin`): Statistics & Data Completeness Indicator, Tiptap v3 Article Editor (tables, images + captions, draft autosave, `draft` → `in_review` → `published` workflow), Doctor Profile, Practice Locations, Medical Services, and Account/Password Management.

## Phase 6 — Comprehensive UI/UX Redesign
Status: ✅ Complete (November 4, 2026)
- [x] Design foundation: color/font tokens (Plus Jakarta Sans + Literata for long-form reading), core components.
- [x] Practice schedule logic (`src/lib/schedule.ts`) + "Practice today" status.
- [x] New navbar, mobile menu, sticky CTA, and footer.
- [x] Patient-oriented homepage (Hero → Schedule & Locations → Services → About → Articles → Contact).
- [x] Article portal: index, pagination, reading page with sticky TOC.
- [x] Service detail page `/layanan/[slug]` + service content schema + admin editor.
- [x] Admin UI primitives + sidebar shell, then migrated all admin pages to new primitives.
