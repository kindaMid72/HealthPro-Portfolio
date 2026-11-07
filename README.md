# Doctor Profile Website & Health Education Portal — dr. Yuliana, Sp.THTBKL, M.Kes

Official profile website of an ENT specialist (Otolaryngologist - Head & Neck Surgeon), equipped with a **Patient Health Education Article Portal (`/artikel`)** and an **Admin Dashboard (`/admin`)** built with **Next.js 16 App Router**, **PostgreSQL**, **Drizzle ORM**, and **Tiptap v3**.

## Key Features
- **Profile & Multi-Location Practice Schedule (`/`)**: Doctor credentials, ENT clinical services, practice schedules & location maps, and consultation/booking CTA buttons.
- **ENT Health Education Article Portal (`/artikel` & `/artikel/[slug]`)**:
  - ENT topic categories (`Ear & Hearing`, `Nose & Sinus`, `Throat & Voice`, `Head & Neck Surgery`, `General ENT Education`) and article search.
  - Automatic reading time estimation, automatic Table of Contents (TOC) from `H2`/`H3` subheadings, unique reader counter, *"Medically reviewed"* badge, share to WhatsApp button, related articles, and `MedicalWebPage` + `BlogPosting` structured data.
- **Admin Dashboard (`/admin`)**:
  - `httpOnly` cookie session authentication + automatic lockout protection.
  - Analytics on articles, readership, & website data completeness checklist.
  - Tiptap v3 rich text editor (Headings, Lists, Blockquotes, Tables, WebP Image Upload + Captions, draft autosave, `draft` → `in_review` → `published` workflow, review notes).
  - Self-management of Doctor Profile, Practice Locations, Medical Services, and Accounts & Passwords.

## Local Quickstart

1. **Run local PostgreSQL via Docker Compose**:
   ```bash
   docker compose up -d db
   ```
2. **Configure `.env.local`**:
   Ensure `DATABASE_URL=postgres://postgres:postgres@localhost:5432/mami` and `NEXT_PUBLIC_SITE_URL=http://localhost:3000` are configured in `.env.local`.
3. **Install dependencies & run database migrations**:
   ```bash
   npm install
   npm run db:migrate
   ```
4. **Seed initial data (from Google Sheets CSV or local JSON fallback) & create admin account**:
   ```bash
   npm run db:import-sheets
   USER_PASSWORD="$(openssl rand -base64 24 | tee /dev/stderr)" npm run user:create -- admin@example.com "Admin Name"
   ```
5. **Run development server**:
   ```bash
   npm run dev
   ```
   - Public Website: `http://localhost:3000`
   - Article Portal: `http://localhost:3000/artikel`
   - Admin Dashboard: `http://localhost:3000/admin`

## Documentation Structure (`docs/`)
1. `AGENTS.md` — Concise instructions for AI coding agents.
2. `docs/00-constitution.md` — Core project principles (v2.0).
3. `docs/01-spec.md` — Functional & non-functional specifications.
4. `docs/02-content-data.md` — Factual doctor data contract.
5. `docs/03-sitemap.md` — Public & admin page structure.
6. `docs/04-design.md` — Design direction & color palette.
7. `docs/05-tech-plan.md` — Technical plan & stack.
8. `docs/06-tasks.md` — Build phase status & task log.
9. `docs/07-data-architecture.md` — PostgreSQL database & media architecture.
