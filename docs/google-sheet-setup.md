# Google Sheet Setup — Complete Guide

> This document is for the **user (orchestrator)** — containing step-by-step instructions to create the Google Sheet that acts as the initial data source for dr. Yuliana's website.

---

## 🚀 Fastest Method: Import from Template CSV

CSV template files are prepared in the `docs/google-sheet-template/` folder. Data from the questionnaire is already pre-filled in the templates — simply upload and complete the remaining empty fields.

### Step 1 — Create a new Google Sheet

1. Open [sheets.new](https://sheets.new) (or [Google Sheets](https://sheets.google.com) → **+** Blank spreadsheet)
2. Name the spreadsheet: **`HealthPro - dr. Yuliana`** (free choice, but keep it consistent)

---

### Step 2 — Import Profile Tab

1. In the new Sheet, click the **"Sheet1" tab** at the bottom → right click → **Rename** → type **`Profile`**
2. Click menu **File → Import**
3. Upload file: `docs/google-sheet-template/tab-Profile.csv`
4. Select:
   - Import location: **Replace current sheet**
   - Separator type: **Comma**
   - Convert text to numbers: **No** (important!)
5. Click **Import data**

**Result**: row 1 = column headers, row 2 = doctor profile data.

---

### Step 3 — Add Locations Tab

1. Click **+** in the bottom-left corner to add a new sheet
2. Rename the new tab to **`Locations`** (capital L, exactly like this)
3. Import file `docs/google-sheet-template/tab-Locations.csv` into this tab (same as step 2)

---

### Step 4 — Add Services Tab

1. Add another new sheet, rename to **`Services`**
2. Import file `docs/google-sheet-template/tab-Services.csv`

---

### Step 5 — Publish to Web (Get CSV URLs)

Repeat this step **3 times** — once per tab:

1. **File → Share → Publish to web**
2. In the first dropdown select tab: **`Profile`** (repeat 3x for each tab)
3. In the second dropdown select: **`Comma-separated values (.csv)`**
4. Click **Publish** → OK
5. **Copy the URL** that appears

The URL will look like:
```
https://docs.google.com/spreadsheets/d/e/XXXXXXXXXX/pub?gid=0&single=true&output=csv
```

---

### Step 6 — Save URLs to .env.local

Open `.env.local` in the project root, and fill in the 3 copied URLs:

```env
SHEET_CSV_URL_PROFILE=https://docs.google.com/spreadsheets/d/e/XXX/pub?gid=PROFILE_GID&single=true&output=csv
SHEET_CSV_URL_LOCATIONS=https://docs.google.com/spreadsheets/d/e/XXX/pub?gid=LOCATIONS_GID&single=true&output=csv
SHEET_CSV_URL_SERVICES=https://docs.google.com/spreadsheets/d/e/XXX/pub?gid=SERVICES_GID&single=true&output=csv

# After Sheet URLs are filled, change this line to:
# USE_LOCAL_FIXTURE=false
USE_LOCAL_FIXTURE=true
```

> ⚠️ Do not commit `.env.local` to Git — this file is already in `.gitignore`.

---

## ✏️ Data Still Needing Completion in Sheet

After importing, fill in the following columns that remain empty (see `docs/02-content-data.md` for details):

| Tab | Field | Status |
|---|---|---|
| Profile | `str_sip_display` | 🔴 Not yet provided — actual STR/SIP number |
| Profile | `booking_url` | 🔴 **Highest priority** — required for "Book Now" button |
| Profile | `education` | 🟡 Needs completion (specialization institution & graduation year) |
| Locations | `whatsapp` (Angsana) | 🔴 Not yet provided |
| Locations | `whatsapp` (Kimia Farma) | 🔴 Not yet provided |
| Services | `service_description` (all) | 🔴 Must be filled by the doctor, not AI |

---

## 🔄 How to Update Content in the Future

Once setup is complete, the content update flow for admins:

1. Open Google Sheet
2. Edit the cells you wish to change (e.g. change practice hours)
3. The website automatically updates within **1 hour maximum** (ISR revalidation)
4. For an **immediate/instant** update: ping the developer to trigger a manual rebuild

---

## ⚠️ Important Rules

- **Do not rename tabs** from `Profile`, `Locations`, `Services` — the code expects these exact names
- **Do not add/remove columns** without coordinating with the developer — Zod schemas must be updated simultaneously
- **Do not store sensitive data** (patient data, internal notes) in this Sheet — its CSV URL is public and readable by anyone with the link
