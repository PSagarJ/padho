# UI/UX Design Brief

## Project: Padho — Accessible Document Reader

**Status:** Draft v1.0
**Last updated:** [date]
**Wireframes:** see `docs/wireframes/` for sketches of Home, Camera, Action Card, Reader View and Form Result.

---

## 1. Design Philosophy

Design for a user's **hardest, most anxious moment** — a confusing medicine label or an intimidating government letter — not for a confident power user. Every choice defaults to clarity and calm over density or cleverness. If a design decision makes the app feel more "modern" but less obvious, choose obvious.

**Three rules that override all others:**

1. If in doubt, make it bigger (text, buttons, spacing).
2. If in doubt, say it out loud, don't just show it.
3. If in doubt, remove the element rather than add one.

## 2. Color Palette

Must meet **WCAG AA contrast minimum (4.5:1 for body text, 3:1 for large text/UI components)** in both normal and high-contrast modes.

### Normal mode

| Role                               | Color           | Hex (example) | Notes                                                                  |
| ---------------------------------- | --------------- | ------------- | ---------------------------------------------------------------------- |
| Background                         | Warm off-white  | `#FAF8F3`     | Not pure white — reduces glare                                         |
| Primary text                       | Near-black      | `#1A1A1A`     | Not pure black, softer on eyes                                         |
| Primary action (Scan button)       | Deep teal       | `#0B6E6E`     | Calm, trustworthy, distinct from red/green (avoids color-only meaning) |
| Secondary action                   | Muted blue-gray | `#4A5A6A`     |                                                                        |
| Success / "no action needed"       | Forest green    | `#2E7D32`     | Paired with a checkmark icon, never color alone                        |
| Warning / "action needed"          | Amber-orange    | `#B8560A`     | Paired with an icon, never color alone                                 |
| Danger / safety warning (medicine) | Deep red        | `#A3261A`     | Reserved only for medicine safety notices                              |
| Borders/dividers                   | Light gray      | `#D8D3C8`     |                                                                        |

### High-contrast mode

| Role           | Color                                          |
| -------------- | ---------------------------------------------- |
| Background     | `#000000`                                      |
| Primary text   | `#FFFFFF`                                      |
| Primary action | `#00C2C2` (bright teal, AAA contrast on black) |
| Warning        | `#FFB84D`                                      |
| Danger         | `#FF6B5E`                                      |

**Rule:** Never convey meaning by color alone — every status (success/warning/danger) always pairs with an icon and a short text label, for colorblind users and for low-vision users who may have contrast/high-contrast mode on.

## 3. Typography

| Use                | Font                                                    | Size (base)                                 | Notes                                                      |
| ------------------ | ------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------- |
| All UI text        | System font stack (`-apple-system, Roboto, sans-serif`) | —                                           | Fast load, no external font dependency, familiar to the OS |
| Body / reader text | Same, regular weight                                    | 20px minimum, scalable to 32px via Settings | Line height 1.5+                                           |
| Headings           | Same, bold                                              | 24-28px                                     | Short, plain-language phrasing only                        |
| Buttons/labels     | Same, semi-bold                                         | 18px minimum                                | Always paired with icon                                    |

- No decorative or script fonts, anywhere.
- No all-caps text (harder to read for dyslexia and low vision).
- Avoid justified text (ragged-right only) — justified text creates uneven spacing that's harder to scan.

## 4. Layout & Spacing

- **Single-column layout** on all screens — no side-by-side panels, no multi-column text.
- **One primary action per screen.** Secondary actions are smaller and visually subordinate.
- Minimum touch target: **56x56px**, with at least 12px spacing between tappable elements, to prevent mis-taps.
- Generous white space — avoid dense grouping of elements.
- Sticky/fixed primary action (e.g., the Scan button on Home, Play/Pause in Reader View) so it's always reachable without scrolling.
- Safe margins: minimum 16px screen edge padding; more on larger font-size settings.

## 5. Iconography

- Use a single consistent icon set (e.g., Lucide or Material Symbols — outlined style, not filled, for clarity at large sizes).
- Every icon is paired with a text label. No icon-only buttons anywhere in the app.
- Icons should be literal and familiar: a camera for Scan, a speaker for Read Aloud, a gear for Settings, a house for Home. Avoid abstract or trendy iconography.

## 6. Component Guidelines

### Home Screen

- One giant circular or rounded-square "Scan" button, centered, taking up a significant portion of the screen, with a camera icon and the word "Scan" (or the equivalent in the selected language) inside it.
- Settings icon in a corner, clearly labeled, but visually secondary.
- No ads, no promotional banners, no onboarding tips cluttering this screen after first use.

### Action Card (Result Screen)

- Three clearly separated sections, each with an icon: **What is this** / **Do I need to act** / **By when**.
- A persistent "Read full text" button below the card.
- Warnings (e.g., medicine disclaimer) appear in a visually distinct bordered box using the Danger color, with a warning icon, placed above the fold.

### Reader View

- Text displayed in large type with generous line spacing.
- Currently-spoken word highlighted with a background color (not just bold — bold alone is a weak signal at a glance).
- Playback controls (Play/Pause, Read Again, Slower/Faster) as large buttons in a fixed bottom bar, each icon + label.

### Form Result (Field Explainer)

- One card per form field, stacked in a single column, in the same order as on the form.
- Each card has: the field name as printed, its plain meaning, and what kind of answer is expected (never a suggested value).
- Each card has its own "Read this field" button (icon + label) so users can hear one field at a time.
- Abbreviations (e.g., "A/C No.") are always expanded in the meaning line.
- A short note at the top: "I explain what each box means. I never fill in the form."

### Settings Screen

- Each setting is its own full-width row with a clear label and large, simple controls (stepper buttons for font size, not sliders — sliders are hard to control precisely for users with limited dexterity).

## 7. Motion & Feedback

- Minimal animation; where used, keep it slow and purposeful (e.g., a gentle pulse on the Scan button, not a flashy transition).
- Every action gets immediate feedback: a visual state change AND (where appropriate) a short spoken confirmation ("Got it, reading now").
- Loading states always show a short, plain-language message ("Reading your document...") rather than a bare spinner.

## 8. Voice & Tone (UI copy)

- Plain language, grade 5-6 reading level, short sentences.
- Warm but not childish or condescending — speak to the user as a capable adult who simply wants things clear.
- First person from the app where natural ("I couldn't read that clearly — can you try again?") rather than passive/technical phrasing ("OCR confidence below threshold").
- Avoid jargon entirely in user-facing text: no "OCR," "API," "sync," etc.

## 9. Localization Notes

- All UI copy, not just document content, should be translatable (English, Hindi, Marathi for v1).
- Font stack must render Devanagari script cleanly — verify system font fallback covers this; do not rely on Latin-only fonts.
- Keep UI strings short, since translated text can run longer than English and must still fit large-text layouts without wrapping awkwardly.

## 10. What "Good" Looks Like (acceptance check)

Before marking any screen done, confirm:

- [ ] Can be understood and used by someone who reads slowly or not at all
- [ ] Passes a screen-reader pass (logical focus order, labeled controls)
- [ ] Meets AA contrast in both normal and high-contrast mode
- [ ] Has exactly one obvious primary action
- [ ] Works with large system font size settings without breaking layout
- [ ] No meaning conveyed by color alone
