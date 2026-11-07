# 00 — Constitution

This document contains fundamental decisions that **must not be violated** by anyone working on this project, including AI agents. If any other document conflicts with this one, this document takes precedence. Any change here requires explicit orchestrator (user) approval.

## Core Principles

1. **PostgreSQL + Drizzle ORM as the single source of truth.** All dynamic data (`profile`, `locations`, `services`, `articles`, `images`, `users`, `sessions`) is stored in PostgreSQL (locally via Docker Compose `postgres:17`, production via Neon Serverless Postgres free tier). JSON snapshots (`data/fallback-*.json`) are retained as emergency fallbacks if the database is not yet seeded or during network disruptions.
2. **Hybrid Static/ISR + On-Demand Revalidation.** Public pages (`/`, `/artikel`, `/artikel/[slug]`) are served quickly via Next.js ISR (`revalidate = 3600`) and instantly revalidated (`revalidatePublicSite`) whenever an admin saves changes in `/admin`.
3. **Content edited by non-developers via Admin Dashboard (`/admin`).** The doctor and clinic partners/assistants manage educational articles (Tiptap v3 editor with `draft` → `in_review` → `published` workflow), profile, locations, services, and WebP image uploads directly through an Indonesian-language UI without touching code.
4. **Booking = redirect, not a system.** No custom patient booking/appointment logic or electronic medical records are built. The "Booking" button always directs to an external link (third-party clinic platform) or registration WhatsApp.
5. **No fabricated medical/personal data.** All factual data about the doctor (education, certifications, experience, etc.) must originate from user-verified sources. Explicit placeholders are strictly preferred over fictitious content.
6. **Mobile-first.** The vast majority of visitors are assumed to be on mobile phones — all design and technical decisions prioritize the mobile experience first.
7. **Minimal operating cost.** Hosting and database utilize free-tier services (Vercel + Neon Postgres), and images are compressed to WebP (`sharp`) and stored directly in the `images` table without paid object storage services.

## Stack Boundaries (technical details in `05-tech-plan.md`)
- Language: TypeScript (strict mode).
- Framework: Next.js 16 App Router (`16.3.3`), React 19, Tailwind CSS v4 + `@tailwindcss/typography`.
- Database & ORM: PostgreSQL + `drizzle-orm` / `drizzle-kit` + `postgres.js`.
- Rich Text Editor: Tiptap v3 (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-table`, `@tiptap/static-renderer`).
- No external state management library (Redux, Zustand, etc.).

## Approval Process
- Each work phase in `06-tasks.md` requires user approval before moving to the next phase.
- Any structural changes to any document in `docs/` must first be confirmed with the user by the agent.

## Versions
- v1.0 — August 28, 2026 — initial draft (no-database, Google Sheets CSV).
- v2.0 — April 22, 2026 — migration to PostgreSQL + Drizzle ORM, Admin Dashboard (`/admin`), and ENT Health Education Article Portal (`/artikel`).
