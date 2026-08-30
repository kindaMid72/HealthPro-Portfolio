# Docs — Website Profil Dokter Spesialis

Susunan dokumen ini dibangun mengikuti dua pola standar untuk mengarahkan AI coding agent (per Agustus 2026):
- **AGENTS.md** — instruksi teknis pendek yang dibaca agent tiap sesi (konvensi de facto lintas Claude Code, Cursor, Codex, dll).
- **Spec-Driven Development** (pola ala GitHub Spec Kit: constitution → spec → plan → tasks) — dipecah jadi dokumen di `docs/`.

## Urutan Baca / Alur Kerja
1. `AGENTS.md` — root, selalu dibaca agent duluan.
2. `docs/00-constitution.md` — aturan non-negotiable proyek.
3. `docs/01-spec.md` — requirement & scope (functional/non-functional requirements).
4. `docs/02-content-data.md` — kontrak data dokter (isi manual, jangan dikarang agent).
5. `docs/03-sitemap.md` — struktur halaman.
6. `docs/04-design.md` — arahan visual (✅ final: modern-calm, teal+amber, Plus Jakarta Sans/Inter).
7. `docs/05-tech-plan.md` — stack & arsitektur overview (Next.js + Google Sheets sebagai CMS).
8. `docs/06-tasks.md` — breakdown fase kerja + status gate (update manual oleh orchestrator).
9. `docs/07-data-architecture.md` — detail teknis penyimpanan & manipulasi data.

## Status Proyek (28 Agustus 2026)
- Constitution, spec, sitemap, design, tech-plan, data-architecture: ✅ selesai/final.
- Content data (`02-content-data.md`): 🔴 belum diisi — development bisa mulai dengan data dummy.
- Tasks: Fase 0 (Setup) 🟢 siap dikerjakan agent.

## Cara Pakai
Kasih seluruh isi repo ini (termasuk `AGENTS.md`) ke AI coding agent (Claude Code, Cursor, dll) sebagai starting point. Agent akan otomatis membaca `AGENTS.md` dan merujuk `docs/` sesuai kebutuhan. Orchestrator (kamu) tetap approve tiap fase di `06-tasks.md` sebelum agent lanjut ke fase berikutnya.
