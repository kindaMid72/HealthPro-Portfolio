# AGENTS.md

These instructions MUST be read and followed by any AI coding agent before working on any task in this repository. This file is intentionally concise — full details reside in `docs/`; refer there for deeper context.

## Project Summary
Doctor profile website for an ENT specialist (Otolaryngologist - Head & Neck Surgeon) + Health Education Article Portal (`/artikel`) + Admin Dashboard (`/admin`). Built using **Next.js 16 App Router**, **PostgreSQL**, and **Drizzle ORM**. Booking buttons **always redirect to external links** or the practice location's WhatsApp (not an internal patient queue/medical records app).

Read these before starting work:
1. `docs/00-constitution.md` — non-negotiable core rules
2. `docs/01-spec.md` — requirements & scope
3. `docs/05-tech-plan.md` — architecture & stack
4. `docs/07-data-architecture.md` — PostgreSQL database schema & data flow

## Setup, Database, & Build Commands

```bash
docker compose up -d db       # run local PostgreSQL 17
npm install                   # install dependencies
npm run db:generate           # generate SQL migration from src/db/schema.ts
npm run db:migrate            # run database migrations
npm run db:import-sheets      # seed initial data from Google Sheets / JSON fallback
USER_PASSWORD='...' npm run user:create -- <email> "<Name>" # create admin account
npm run dev                   # local dev server
npm run build                 # build production output
npm run lint                  # run linter — MUST pass before reporting task complete
```

## Code Style
- TypeScript, strict mode.
- Functional React components, no class components.
- Styling with Tailwind CSS v4 utility classes + `@tailwindcss/typography` for article content.
- No external state management libraries (Redux, etc.).

## Data & Content — CRITICAL RULES
- **All factual doctor content** (name, credentials, background, practice hours, etc.) MUST ONLY be pulled from the PostgreSQL database (seeded from `docs/02-content-data.md` / `data/fallback-*.json`) or entered by the doctor via `/admin`.
- **Agents are STRICTLY FORBIDDEN from inventing or fabricating any medical or personal data** — bio, certifications, educational background, etc. If data is not yet available, use a placeholder clearly marked `[BELUM DIISI]`.
- Do not hardcode content data inside components — all public data must be retrieved through `src/lib/content.ts`.

## Boundaries / Do Not Touch
- Do not implement an internal patient booking/medical records system — booking buttons ALWAYS redirect to an external URL or WhatsApp from the data source.
- Do not add pages outside of those listed in `docs/03-sitemap.md` without approval.

## Privileged Execution (Root/Sudo)
If a task strictly requires root privileges (e.g. system dependency installation or service management):
- Use the binary wrapper: `agent-sudo <command>` (already in `$PATH`).
- **Graceful Fallback**: If the vault is revoked/inactive or sudo prompts for an interactive password, **DO NOT CRASH OR HANG**. Display the required command to the user and ask them to run it manually in their terminal.
- **Mindful Guardrails**: Using `sudo` is forbidden for normal user-space operations (such as `npm install` in the project directory) and destructive commands against the system/partitions are prohibited.

## Testing & Verification
- Before reporting a task complete: run `npm run lint` and `npm run build`, ensuring zero errors.
- Check responsive layouts at minimum on mobile (375px) and desktop (1280px) breakpoints.

## Commit Convention
- Small commits per task/phase with clear messages: `feat: add article page`, `fix: improve navbar responsiveness`, etc.
- Never commit `.env*` files, API keys, or any credentials.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
