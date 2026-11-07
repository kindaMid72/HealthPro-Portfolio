# 02 — Content Data

> **For agents**: this file is a data contract, in sync with the schema in `07-data-architecture.md`. Fields marked `[BELUM DIISI]` MUST remain empty or explicit placeholders — DO NOT fabricate.

## Status
🟡 **Partially filled** — initial data received August 28, 2026 from questionnaire. Several crucial fields remain empty (see "Incomplete Data" section below). Development may proceed, but empty fields below **block** certain features — see notes on each field.

## ⚠️ Structural Changes
The original data turned out to contain **3 distinct practice locations** with their own respective schedules & contacts — not 1 location as initially assumed. The schema below has been adjusted accordingly: `locations` is now an **array/list** (separate Sheet tab, following the same pattern as `services`), rather than a flat field in the Profile tab. Display decision: **all locations are presented equally** (parallel list/cards, not 1 primary + secondary) — confirmed by user on August 28, 2026.

---

## "Profile" Tab (1 row of data)

| Field key | Current Content | Status |
|---|---|---|
| `full_name` | dr. Yuliana, Sp.THTBKL, M.Kes | ✅ |
| `specialty` | Spesialis Telinga Hidung Tenggorok (THT-BKL) | ✅ |
| `sub_specialty` | — | Not filled, assumed none |
| `str_sip_display` | *(wants displayed: "Yes")* | 🔴 **NOT YET PROVIDED (`[BELUM DIISI]`)** — actual STR/SIP numbers not yet given, though confirmed to be displayed. Needs follow-up. |
| `photo_url` | — | 🔴 **NOT YET PROVIDED (`[BELUM DIISI]`)** — no photo yet, photo session needs scheduling. **Blocks Phase 2** (hero styling, `06-tasks.md`). |
| `education` | S1: Universitas Hasanuddin | 🟡 Partial — specialization (Sp. THT-BKL) institution & graduation year not yet provided |
| `certifications` | — | 🔴 NOT YET PROVIDED (`[BELUM DIISI]`) (optional, but enhances credibility) |
| `experience_history` | RSUD Dr. H. Andi Abdurrahman Noor, 2016–2024 (history, completed — confirmed Aug 28, 2026) | ✅ |
| `organizations` | Anggota PERHATI Kalimantan Selatan | ✅ |
| `booking_url` | — | 🔴 **NOT YET PROVIDED (`[BELUM DIISI]`) — BLOCKS FR-2.** Without this, the "Book Now" button has no destination. Highest priority for follow-up. |
| `email` | — | Not filled (optional) |
| `social_links` | — | Not filled (optional) |
| `personal_story` | *(form input: "Menegakkan diagnosa dengan pemeriksaan fisis.")* | ⚠️ **Needs clarification** — this response sounds like a description of clinical approach/services, not a personal story about choosing the specialty. Likely entered into the wrong column during form submission. Do not use in "About" section before re-confirming with dr. Yuliana. |

## "Locations" Tab (array — 1 row per location, NEW)

| # | `location_name` | `address` | `practice_hours` | `whatsapp` | `phone` | `booking_url_override` |
|---|---|---|---|---|---|---|
| 1 | Klinik Simpang / Klinik Hamdi | Jl. Gawe Sabumi No. 33 RT 07 RW 02, Desa Bersujud, Kec. Simpang Empat, Kab. Tanah Bumbu | Senin–Sabtu, 17.00–21.00 | 08115553556 | — | — |
| 2 | Praktek Dokter THT Angsana | Jl. Sebamban 2 Blok F RT 011 RW 03, Angsana, Kab. Tanah Bumbu | Senin, Rabu, Sabtu, 13.00–15.00 | 🔴 NOT YET PROVIDED (`[BELUM DIISI]`) | — | — |
| 3 | Apotik Kimia Farma Batulicin | Jl. Raya Batulicin RT 05 RW 02, Kampung Baru, Simpang Empat, Kab. Tanah Bumbu | Selasa, Kamis, Jumat, 13.00–16.00 | 🔴 NOT YET PROVIDED (`[BELUM DIISI]`) | — | — |

**Notes**: 2 of 3 locations do not have contacts (WA/phone) at all yet. If still empty by Phase 3, display address & hours only without direct contact buttons for those locations (fallback per FR-4), BUT this should ideally be completed first as it reduces the utility of the contact section.

## "Services" Tab (array)

| `service_name` | `service_description` |
|---|---|
| Otoskopi | 🔴 Description not yet provided — original data only lists procedure names without explanation |
| Nasoendoskopi | 🔴 Description not yet provided |
| Laringoskopi | 🔴 Description not yet provided |

**Notes**: the "Full service list" field in the original questionnaire was empty; only "featured services" was filled (3 procedure names without description). Short descriptions for each service need to be requested separately — medical text should come directly from dr. Yuliana; agents must not write medical procedure descriptions themselves.

## Other Operational Data (BPJS / Insurance)
`insurance_info`: "Campuran" (BPJS & general private) — ✅ filled, but needs clarification: mixed per-location or identical across all locations? *(follow-up question)*

## Incomplete Data (Questionnaire Sections H & I skipped)
The completed form stopped at Question No. 27 — the following items need to be re-asked, see `kuisioner-followup.md`:
- Site language (ID only / + EN)
- Target patient demographics
- Mandatory/forbidden wording
- Day-to-day admin editor
- Google email for Sheets access (needed before Phase 0 completion, see `06-tasks.md`)
- Domain status

## Fallback Rule (FR-4)
- Empty field → hide related element or display "Coming soon", never empty text or an error.
- **Special case**: empty `booking_url` → "Book Now" button MUST NOT be displayed active/broken-link. Hide the button or swap for a secondary CTA (e.g. "Contact via WhatsApp") until `booking_url` is provided.
