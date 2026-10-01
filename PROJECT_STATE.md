# Project State: Padho

## Current Phase
Phase 0: Discovery & Design (nearly complete)

## Decisions Log
- Project name: Padho
- Stack: MERN (React/Vite + Express + MongoDB), PWA for v1, possible Expo port later
- LLM calls mocked during development; real API only for tuning/demo (cost control)
- Images never leave the device; only OCR'd text is sent to backend
- Target users: older adults and limited-literacy users, India-focused (Hindi/Marathi/English)
- Interviews showed the core gap is understanding, not reading: users can read forms but don't know what fields mean
- Added `form` document type (explain fields, never fill or store)
- One pipeline for medicine, form and bill/letter types; priority: medicine, forms, bills
- Medicine v1 reads only what is printed; general drug info deferred for safety

## Done
- PRD v1.1, TRD, App Flow, UI/UX Brief, Backend Schema, Implementation Plan (see /docs)
- GitHub repo created
- User interviews with older and younger people from different regions

## Pending / Next Up
- Apply form/`fields` update to TRD and schema docs
- Sketch wireframes (Home, Camera, Action Card, Reader View, Form result)
- Phase 1: Foundation

## Known Issues / Open Questions
- Tesseract accuracy on Devanagari and on forms (boxes/tables) is untested
- Languages beyond English/Hindi/Marathi are out of scope for v1
- Next interview round: use open questions, include a medicine label and a bill
