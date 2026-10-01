# Project State: Padho

**Last updated:** 2026-10-01

## Current Phase
Phase 0: Discovery & Design — **complete**
Next: Phase 1 — Foundation

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

## Done
- User interviews with older and younger people from different regions
- Biggest frustration identified, with a real quote: "I am able to read this, but I don't know what to fill in this specific section."
- PRD v1.1 and TRD v1.1 (form explainer, updated `/api/analyze` contract with `fields`)
- Backend Schema updated (`form` type; form contents never stored)
- UI/UX Brief updated (Form Result screen, wireframes reference)
- App Flow and Implementation Plan written (see /docs)
- Wireframes v1 (one combined image of 5 screens) in `docs/wireframes/`
- GitHub repo created and docs pushed

## Pending / Next Up
- Phase 1: Foundation (client/ with Vite + React, server/ with Express, MongoDB Atlas connection, .env.example files, basic PWA install, hello-world deploy)
- Split wireframes into separate per-screen images (later)

## Known Issues / Open Questions
- Wireframes v1 are a draft. Fix when building the real UI:
  - Medicine sample text must be label-only (no "what it treats" or "continue for life")
  - Add icons to the three Action Card sections
  - Add Home/Back controls on screens 2-5
  - Check body text (20px+), button labels (18px+) and touch targets (56px+) against the UI brief
- Tesseract accuracy on Devanagari and on forms (boxes/tables) is untested
- Languages beyond English/Hindi/Marathi are out of scope for v1
- Users who cannot read or type need voice; full no-reading use is a stretch goal
- Next interview round: use open questions, include a medicine label and a bill

## Next Phase Starting Point
Phase 1 exit check: a blank app is installable on an Android phone's home screen, and the deployed frontend can call a test endpoint on the deployed backend.
