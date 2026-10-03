# Implementation Plan

## Project: Padho — Accessible Document Reader

**Status:** Draft v1.0
**Last updated:** [date]

This plan mirrors the phases already defined in the project instructions (Section 5). It exists so that "the AI" (me, in future chats) and you both have a step-by-step build order to follow without re-deriving it each time. Update the checkboxes and `PROJECT_STATE.md` as you go.

---

## Phase 0 — Discovery & Design

- [x] Write a short interview script (5-7 questions) for target users
- [x] Interview 2-3 people matching the target audience (older adult / limited literacy)
- [x] Sketch the core user flow (can reuse App Flow doc as a base, adjust from real feedback)
- [x] Rough wireframes for: Home, Camera Capture, Result/Action Card, Reader View, Settings
- [x] Finalize project name
- [x] Set up empty GitHub repo + `PROJECT_STATE.md`

**Exit check:** You can describe, in plain language, who this is for and what their single biggest frustration with existing tools is — ideally backed by a real quote from an interview.

## Phase 1 — Foundation

- [x] Initialize `client/` (Vite + React) and `server/` (Express) in one repo
- [x] Connect MongoDB Atlas, confirm connection from Express
- [x] Set up `.env` / `.env.example` for both client and server
- [x] Basic PWA setup: manifest, icons, service worker (installable on Android Chrome)
- [x] Deploy a "hello world" version of both client and server to confirm the hosting pipeline works end-to-end (Vercel + Render)

**Exit check:** A blank app is installable on your Android phone's home screen, and the frontend can successfully call a test endpoint on the deployed backend. **Passed 2026-10-03.**

## Phase 2 — Capture & OCR

- [ ] Build Camera Capture screen (live camera access + capture button; file upload fallback)
- [ ] Image preprocessing: grayscale, contrast boost, resize before OCR
- [ ] Integrate Tesseract.js with English + Hindi + Marathi language packs
- [ ] Display extracted text + confidence score
- [ ] Handle low-confidence and empty-text edge cases (per App Flow doc Section 8)

**Exit check:** You can photograph a real printed document and see reasonably accurate extracted text on screen, with a visible confidence indicator.

## Phase 3 — Reader View & Speech

- [ ] Build large-text Reader View component
- [ ] Integrate `speechSynthesis` for text-to-speech with rate control
- [ ] Implement word-by-word highlight synced to speech via `onboundary` events
- [ ] Add Read Again / Read Slower controls
- [ ] Build Settings screen: font size, contrast mode, voice choice, speed, language
- [ ] Persist settings (localStorage for anonymous users)

**Exit check:** Extracted text can be read aloud with visible word highlighting, and all settings visibly change the reading experience.

## Phase 4 — Intelligence (Mocked First)

- [ ] Define the `/api/analyze` contract (already drafted in TRD Section 5) — lock it in
- [ ] Build `mockAnalyze.js`: rule-based/hardcoded logic covering at least 4 sample document types (medicine label, bill, government letter, general text)
- [ ] Wire the frontend to call `/api/analyze` and render the Action Card from the response
- [ ] Build the Action Card UI (What is this / Do I need to act / By when) per UI/UX brief
- [ ] Add warnings display (safety box) for medicine-type documents
- [ ] ONLY once the above is solid: build `llmAnalyze.js` using a real LLM API (free tier), matching the exact same response contract, switchable via an env flag

**Exit check:** The full flow — scan, read aloud, see plain-language summary and action card — works end-to-end using mock data, with zero API cost. Real LLM swap-in changes no frontend code.

## Phase 5 — Voice-First UX

- [ ] Integrate `SpeechRecognition` for voice commands (Scan, Read Again, Slower/Faster, Home, Settings)
- [ ] Ensure every voice command has an equivalent tap control (voice is additive, never required)
- [ ] Polish the one-button Home screen flow end-to-end
- [ ] Add spoken confirmations for key actions ("Got it, reading now")

**Exit check:** A user could plausibly operate the entire core flow by voice alone on Chrome/Android, while every action remains fully tappable too.

## Phase 6 — Safety, Privacy, History

- [ ] Implement confidence-threshold logic + Low-Confidence Check screen
- [ ] Hard-code the medicine safety warning to always appear for `medicine_label` type, regardless of confidence
- [ ] Build optional auth (register/login, JWT) — only gates History & Caregiver features
- [ ] Build History screen + `/api/history` endpoints (GET/POST/DELETE)
- [ ] Build "Delete my data" flow (cascades to reminders if built)
- [ ] (Stretch) Reminders + Caregiver Link if time allows

**Exit check:** Medicine labels always show the safety disclaimer; a logged-in user can view and fully delete their history; anonymous use still works with zero account required.

## Phase 7 — Testing & Evaluation

- [ ] Build a test set of 30-50 real document photos across categories
- [ ] Measure OCR accuracy before/after preprocessing; record numbers
- [ ] Run the same 20 documents through Google Lens and your app; build a comparison table (wins and losses, honestly)
- [ ] Run usability sessions with 3-5 real target users; record task completion and friction points
- [ ] Run an accessibility audit: screen reader pass, contrast check, font-scaling check
- [ ] Update PRD Section 7 (Success Metrics) with actual results

**Exit check:** You have real numbers and real quotes, not just claims, to back up every differentiation point from the PRD.

## Phase 8 — Ship & Present

- [ ] Final deploy (frontend + backend), confirm it works on a real Android phone over mobile data, not just WiFi
- [ ] Write the README: problem, screenshots/GIF, architecture diagram, tech choices + why, results, limitations, next steps
- [ ] Record a 2-minute demo video showing eyes-free / minimal-reading use
- [ ] Prepare and rehearse your answer to "Isn't this just Google Lens?" using Phase 7's real comparison data
- [ ] Final commit, tag a release (e.g., `v1.0`) on GitHub

**Exit check:** Someone unfamiliar with the project can open your README, understand the problem and your solution in under 2 minutes, watch the demo, and try the live link themselves.

## Stretch (only after Phase 8, if time allows)

- [ ] Caregiver link + reminders (if not already done in Phase 6)
- [ ] Offline mode
- [ ] Port to React Native (Expo), reusing the Express/MongoDB backend unchanged

---

## Working Agreement Reminder

- Follow phases in order; don't skip ahead.
- At the end of each phase, update `PROJECT_STATE.md` with: what was built, key decisions made (and why), known issues, and next phase's starting point.
- Keep LLM calls mocked until explicitly testing the plain-language layer or preparing a real demo (see project instructions Section 8).
- Commit to Git at the end of every phase.
