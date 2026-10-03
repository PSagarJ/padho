# Project State: Padho

**Last updated:** 2026-10-03

## Current Phase

Phase 1: Foundation — **complete**
Next: Phase 2 — Capture & OCR

## Live URLs

- Backend (Render, free tier): https://padho-api.onrender.com (health check: /api/health)
- Frontend (Vercel):https://padho-six.vercel.app
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
- Phase 1: client and server live in one repo as two separate apps (client/ and server/)
- Phase 1: Express uses ES modules; /api/health reports database status so deploy problems are easy to diagnose
- Phase 1: allowed CORS origins come from a comma-separated CLIENT_ORIGIN env variable, so one codebase works for local dev, preview and production
- Phase 1: ESLint chosen as linter (standard, template default, well documented)
- Phase 1: PWA built with vite-plugin-pwa (autoUpdate service worker); icons generated from one SVG (public/icon.svg) with @vite-pwa/assets-generator
- Phase 1: free hosting — Vercel (frontend), Render (backend), MongoDB Atlas (database, own project and cluster for Padho); secrets only in host settings, never in the repo

## Done

- Phase 0: user interviews, PRD v1.1, TRD v1.1, schema/UI/App Flow/Implementation docs, wireframes v1, GitHub repo
- Phase 1: Express server connected to MongoDB Atlas with /api/health
- Phase 1: Vite + React client calling the backend and showing "Server: ok, database: connected"
- Phase 1: installable PWA (manifest, service worker, generated icons)
- Phase 1: backend deployed on Render, frontend deployed on Vercel
- Phase 1 exit check passed: app installed on an Android phone's home screen and the deployed frontend reached the deployed backend

## Pending / Next Up

- Phase 2: Capture & OCR (camera capture with file-upload fallback, image preprocessing, Tesseract.js with English + Hindi + Marathi, confidence display, low-confidence/empty-text handling)
- Split wireframes into separate per-screen images (later)
- Delete unused Vite template files in client/ (src/App.css, src/assets/hero.png, react.svg, vite.svg, public/icons.svg)

## Known Issues / Open Questions

- Wireframes v1 are a draft. Fix when building the real UI:
  - Medicine sample text must be label-only (no "what it treats" or "continue for life")
  - Add icons to the three Action Card sections
  - Add Home/Back controls on screens 2-5
  - Check body text (20px+), button labels (18px+) and touch targets (56px+) against the UI brief
- Render free tier cold start (30-60 s after idle); acceptable for demo, document in README
- Chrome DevTools shows optional "richer install UI" warnings about manifest screenshots; ignored for now
- Tesseract accuracy on Devanagari and on forms (boxes/tables) is untested
- Languages beyond English/Hindi/Marathi are out of scope for v1
- Users who cannot read or type need voice; full no-reading use is a stretch goal
- Next interview round: use open questions, include a medicine label and a bill

## Lessons Learned (Phase 1)

- Windows PowerShell here does not accept `&&`; use `;` between commands
- Always check the folder in the prompt before running `npm install`
- `.env` is read only at startup: restart the server after editing it
- Keep one setting per line in `.env` (two on one line silently broke CORS)
- Test the PWA with `npm run build` then `npm run preview`; the service worker does not exist in `npm run dev`

## Next Phase Starting Point

Phase 2 exit check: you can photograph a real printed document and see reasonably accurate extracted text on screen, with a visible confidence indicator.
