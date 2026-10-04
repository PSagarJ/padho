# Project State: Padho

**Last updated:** 2026-10-04

## Current Phase

Phase 2: Capture & OCR — **complete** (exit check passed 2026-10-04: phone-camera photo read with text + visible confidence)
Next: Phase 3 — Reader View & Speech

## Live URLs

- Backend (Render, free tier): https://padho-api.onrender.com (health check: /api/health)
- Frontend (Vercel): https://padho-six.vercel.app
- Note: Render free tier sleeps after ~15 min idle. Open /api/health once before any demo to wake it.

## Decisions Log

- Project name: Padho
- Stack: MERN (React/Vite + Express + MongoDB), PWA for v1, possible Expo port later
- LLM calls mocked during development; real API only for tuning/demo (cost control)
- Images never leave the device; only OCR'd text is sent to backend
- Target users: older adults and limited-literacy users, India-focused (Hindi/Marathi/English)
- Interviews showed the core gap is understanding, not reading: users can read forms but don't know what fields mean
- Further research confirmed the medicine and bill needs (even educated people google medicine names)
- Added `form` document type (explain fields, never fill or store)
- One pipeline for medicine, form and bill/letter types; priority: medicine, forms, bills
- Medicine v1 reads only what is printed; general drug info deferred for safety
- Form contents and ID numbers (e.g., Aadhaar) are never stored or logged
- Phase 1: client and server in one repo as two apps (client/ and server/)
- Phase 1: Express uses ES modules; /api/health reports database status
- Phase 1: allowed CORS origins come from a comma-separated CLIENT_ORIGIN env variable
- Phase 1: ESLint as linter
- Phase 1: PWA via vite-plugin-pwa (autoUpdate service worker); icons generated from public/icon.svg
- Phase 1: free hosting: Vercel (frontend), Render (backend), MongoDB Atlas (database); secrets only in host settings
- Phase 2: OCR sits behind a single recognizeText() wrapper (client/src/services/ocr/index.js) so the engine can be swapped (ML Kit, cloud OCR) without touching the UI
- Phase 2: camera and upload fallback both use a file input with capture="environment" instead of a live getUserMedia preview; live preview parked for later
- Phase 2: preprocessing (resize to max 2000px, grayscale, 1%-clipped contrast stretch) is switchable; adaptive threshold exists but is off by default (it lowered confidence in tests)
- Phase 2: page confidence alone is misleading, so words below 60% are underlined (wavy underline + background, not colour alone) and the badge asks the user to check them
- Phase 2: Hindi/Marathi are paired with English packs (hin+eng, mar+eng) because Indian documents mix scripts
- Phase 2: one Tesseract worker per scan, terminated afterwards (avoids memory leaks on low-end phones)
- Phase 2: output with fewer than 30% real words counts as "couldn't read this" even if the confidence number looks fine
- Phase 2: default segmentation stays the app default; sparse mode (psm=11) is far better on box-heavy forms but worse on text-heavy pages; automatic mode choice deferred to Phase 4/6
- Phase 2: dev switches (?psm, ?size, ?adaptive, ?debug=1) are kept for Phase 7 comparisons; the debug panel only shows with ?debug=1

## Done

- Phase 0: user interviews, PRD v1.1, TRD v1.1, schema/UI/App Flow/Implementation docs, wireframes v1, GitHub repo
- Phase 1: server + MongoDB Atlas, Vite + React client, installable PWA, both deployed; exit check passed 2026-10-03
- Phase 2: capture screen (camera + upload), preprocessing, Tesseract.js v7 OCR (eng/hin/mar), progress screen, result screen with page confidence badge and word-level underlining, empty-text and error handling, readable-text check, dev experiment switches
- Phase 2: experiments logged in docs/ocr-experiments.md (about 14 runs on newspapers and four forms)

## Pending / Next Up

- Phase 3: Reader View, speech (speechSynthesis), word-by-word highlight, Settings screen (the OCR word list in result.paragraphs feeds the highlighting)
- Phase 4 design notes from OCR testing:
  - The form result must never imply it found every field (address-table labels were lost on a Marathi form); say "if a box is missing, scan that part again"
  - One page can hold several separate applications (voter ID Form 8); help the user find which section applies to them
- Phase 6 / UX notes:
  - Low-Confidence screen should offer a retry in sparse mode (psm=11); consider auto-retry when page confidence < 60%
  - Handle sideways photos (manual Rotate button; test Tesseract's auto-rotate option, untested in v7)
  - Ask for language on first run and remember it (wrong language gives confident-looking junk)
  - When almost every word is flagged, skip the underlining and show the Low-Confidence screen instead
- Phase 7 experiments to run on the real test set:
  - default vs psm=11 per layout type; candidate rule to choose between them: count of confident real words (conf >= 60%, 3+ letters), not page average
  - mar vs mar+eng; preprocessing on vs off; plain text vs forms
  - whether punctuation attached to words lowers their confidence
  - Latin-looking word inside a Devanagari paragraph as a suspicion heuristic (forms legitimately contain English)
- Delete unused Vite template files in client/ (src/App.css, src/assets/hero.png, react.svg, vite.svg, public/icons.svg) after checking nothing imports them
- Move temporary inline styles to CSS when the real UI is built
- Split wireframes into separate per-screen images (later)

## Known Issues / Open Questions

- Wireframes v1 are a draft. Fix when building the real UI:
  - Medicine sample text must be label-only (no "what it treats" or "continue for life")
  - Add icons to the three Action Card sections
  - Add Home/Back controls on screens 2-5
  - Check body text (20px+), button labels (18px+) and touch targets (56px+) against the UI brief
- Render free tier cold start (30-60 s after idle); acceptable for demo, document in README
- Chrome DevTools shows optional "richer install UI" warnings about manifest screenshots; ignored for now
- Confidence is not accuracy: a wrong word (प्रवेज्) scored 79% while correct words scored 73-83%, so no single threshold separates them. Medicine labels must always carry the pharmacist warning regardless of confidence.
- mar+eng can turn unreadable Devanagari into Latin-looking words (e.g. "Hazmat")
- Page confidence is not comparable across psm modes (sparse mode can raise the score while the text gets worse)
- Grids of one-character boxes confuse OCR and can swallow nearby labels
- Sideways photos give pure junk; the wrong language gives confident-looking junk in the wrong script
- First scan in a language is slow (language pack download); cached afterwards
- Languages beyond English/Hindi/Marathi are out of scope for v1
- Users who cannot read or type need voice; full no-reading use is a stretch goal
- Next interview round: use open questions, include a medicine label and a bill

## Lessons Learned

Phase 1:

- Windows PowerShell here does not accept `&&`; use `;` between commands
- Always check the folder in the prompt before running `npm install`
- `.env` is read only at startup: restart the server after editing it
- Keep one setting per line in `.env`
- Test the PWA with `npm run build` then `npm run preview`; the service worker does not exist in `npm run dev`

Phase 2:

- Check the basics before tuning anything: image orientation (preview it) and the selected language. Both changed results more than any OCR setting.
- Change one thing at a time and keep the same photo; compare the text, not just the percentage
- Tesseract.js v6+ returns only plain text unless asked; word-level data needs `worker.recognize(image, {}, { blocks: true })` (v7 confirmed)
- `capture="environment"` only opens the camera on phones; on a laptop it falls back to a file picker
- The code never upscales, so `size=3200` does nothing for smaller images
- A cached PWA can serve old code: open the URL in normal Chrome and reload twice
- Import paths are case-sensitive on Vercel (Linux) even though Windows forgives them

## Next Phase Starting Point

Phase 3 builds on `result.paragraphs` (words with confidence) from the OCR wrapper. Phase 3 exit check: extracted text can be read aloud with visible word highlighting, and all settings visibly change the reading experience.
