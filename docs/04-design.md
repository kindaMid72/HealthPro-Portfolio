# 04 — Design & Brand Direction

> Status: ✅ **Final** — confirmed by user on August 28, 2026. Archetype: **Modern-calm**. Context: serious/clinical specialty. No existing visual identity (free to define new).

## Mood
Calm, clean, credible. Neither a cold "corporate hospital brochure" nor overly "warm & playful" — because the context is a serious specialty (surgery, internal medicine, cardiology, etc.), the intended impression is **calm yet competent**: patients seeking care usually need assurance, not visual entertainment.

## Color Palette

| Role | Color | Hex | Notes |
|---|---|---|---|
| Primary (calming) | Muted teal-blue-gray | `#3F6B74` | Main brand color — headers, icons, identity elements. Not a generic medical blue; more "calm & modern" aligned with 2026 trends. |
| Primary Dark | Deep slate | `#243138` | Heading text, high-contrast elements (not pure black). |
| Neutral Background | Off-white | `#F7F8F7` | Main page background, softer than harsh pure white. |
| Neutral Surface | White | `#FFFFFF` | Cards, alternate sections. |
| Neutral Text | Warm dark gray | `#4A5257` | Body text — sufficient contrast without the harshness of pure black. |
| Muted Text | Medium gray | `#5F686D` | Secondary text (dates, metadata). Contrast 5.35:1 against background (former `#6E777D` was only 4.29:1, failing AA). |
| Primary Hover | Dark teal | `#2F5560` | Primary button hover state. |
| Primary Tint | Very light teal | `#EAF0F1` | Soft panel background: hero photo frame, practice status card, active chips, medical review notes. |
| Accent (CTA/action) | Muted amber | `#D98C4A` | **Exclusively for booking CTAs & action elements** — warm contrast against cool primary, drawing attention without the alarmist feel of red. |
| Border/Divider | Very light gray | `#E4E7E6` | Subtle dividers; avoid heavy/dark borders. |

**Important Rule**: the accent color (`#D98C4A`) is ONLY used for CTAs and elements requiring immediate attention (booking buttons, important links). Do not use it for excessive decoration — if everything is accented, nothing stands out.

**Text on accent** uses `#243138` (contrast 4.96:1), not white (2.69:1, fails AA). Accent hover: `#E39A5E`.

## Typography
- **UI & page body**: `Figtree` (variable font, utility `font-sans`) across the public site and admin.
- **Display headings (public h1/h2)**: `Literata` via utility `font-display font-semibold`; h3 downwards and admin remain sans.
- **Long-form reading**: `Literata` (class `.font-reading`) for article body (`/artikel/[slug]`) and services (`/layanan/[slug]`), "About" quotes, and writing view in admin editor. Not used in cards or UI elements.
- Base body size: 17px (no smaller, for elderly patient legibility). Page headings use fluid `text-display`, section headings `text-h2`.
- Generous line-height: 1.65 for paragraphs.
- Avoid all-caps for long paragraphs — acceptable only for small uppercase labels (e.g. "SPECIALTY").

## Layout Principles & Components
- **Generous whitespace** — not cramped; allow at least 64–96px between sections on desktop, 40–56px on mobile.
- **Cards & elements**: softly rounded corners — `rounded-full` for public CTAs/chips, `rounded-xl` (12px) for cards/panels, `rounded-lg` for admin inputs and buttons. Single subtle card shadow (`--shadow-card`) — calm look, neither razor-sharp flat nor heavy skeuomorphic. Cards are ONLY for dense data (locations, contact rows, articles); Services use a clinical domain grouped list, not cards. No decorative eyebrows/chips repeating section titles; chips only carry functional info (category filters, "Today", admin status).
- **Homepage structure** oriented to patient needs: Hero (+ "Practice today" status) → Schedule & Locations → Services → About → Articles → Contact. No background clutter (blobs, grids, glassmorphism) and no animations beyond a single hero entrance; `prefers-reduced-motion` is honored.
- **Doctor's portrait** is the primary visual element in the hero — use an authentic professional photo (not stock generic), natural proportions, avoid excessive filters. If a photo is not yet available, temporary treatment: neutral gray silhouette/placeholder; NEVER substitute a random stock model (misleading).
- **Icons**: line icons, 1.5–2px stroke, rounded caps/joins, color matching `primary` or `neutral text` — consistent icon set (e.g. Lucide/Phosphor), do not mix icon styles. **Logo**: the only mark is `BrandMark` (`src/components/BrandMark.tsx`: letter "Y" = stethoscope tubing), used in navbar, footer, admin, favicon (`src/app/icon.svg`) and OG image — keep geometry synchronized.
- **Booking CTA**: pill/rounded-rect button (`border-radius: 8–999px`, choose one consistently), accent color, high-contrast text, sufficiently sized for mobile tap target (min 44x44px).
- **Micro-interactions**: subtle 150–200ms transitions on hover/tap (slight opacity or small translate), no large/distracting animations.
- **Trust signals** placed prominently but tastefully: certification/affiliation badges near the doctor's name, not buried in the footer.

## Tone of Voice
Formal yet accessible — standard Indonesian, never bureaucratic. Avoid unnecessary medical jargon in primary copy; if technical terms are necessary, provide a brief plain-language explanation. Consistent with the "calm yet competent" mood: concise, clear sentences.

## Reference Direction (not exact replication)
Research pattern: the restraint of Doctolib (uncompromising focus on booking actions, zero unnecessary decoration) paired with warm accent highlights of modern clinical platforms — resulting in a calm, non-sterile presence.

## Accessibility
- Text-to-background color contrast meets at least WCAG AA (4.5:1 for body text).
- All CTAs must have clear focus states (keyboard navigation).
- Alt text is mandatory for all images (especially doctor portrait & service icons).
