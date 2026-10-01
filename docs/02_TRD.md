# Technical Requirement Document (TRD)
## Project: Padho: Accessible Document Reader

**Status:** Draft v1.1 (updated after Phase 0 user interviews)
**Last updated:** 2026-10-01

### Changelog
- **v1.1:** Added `form` document type and optional `fields` list to the `/api/analyze` contract. Added privacy rules for form contents (no storage, no logging). Added form notes to the OCR pipeline and mock/real analyze services. Added `docs/wireframes/` to the folder structure.
- **v1.0:** Initial draft.

---

## 1. Architecture Overview

```
[React PWA (client)]  <-->  [Express API (server)]  <-->  [MongoDB Atlas]
        |                           |
        |                           +--> [LLM API (mocked in dev, real in demo)]
        |
        +--> [Tesseract.js OCR]      (runs in-browser, on-device)
        +--> [Web Speech API]        (browser-native TTS + voice input)
```

Key principle: **images never leave the device.** OCR runs client-side. Only extracted *text* (not images) is ever sent to the backend, and only when calling the plain-language/classification step.

Second principle (added v1.1): **form contents are never stored or logged.** The app explains what a form asks for; it never saves what the user writes or any ID numbers (e.g., Aadhaar) found in the text.

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | React (Vite) | You already know React; Vite gives fast dev builds |
| App type | PWA (installable, manifest + service worker) | Free, instant demo link, no app store needed for v1 |
| Styling | CSS Modules or plain CSS (no heavy UI library) | Full control over accessibility (contrast, font scaling) |
| Backend | Node.js + Express | Matches MERN; simple REST API |
| Database | MongoDB Atlas (free tier, Mongoose ODM) | Stores preferences, scan summaries, reminders — not images, not form contents |
| OCR | Tesseract.js (client-side, WASM) | Free, on-device, supports eng + hin + mar language packs |
| Text-to-speech | Web Speech API (`speechSynthesis`) | Free, native to browser, no API key |
| Voice input | Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) | Free; Chrome has the best support |
| Plain-language + classification | LLM API, called server-side only | Mocked during build (see Section 8 of project instructions); real call only for tuning/demo |
| Auth (optional, for caregiver link/history) | JWT (jsonwebtoken + bcrypt) | Simple, standard, no paid service needed |
| Hosting — frontend | Vercel or Netlify (free tier) | Free HTTPS, free subdomain |
| Hosting — backend | Render or Railway (free tier) | Free tier sleeps when idle — acceptable for a demo |
| Hosting — database | MongoDB Atlas (free tier, 512MB) | Plenty for this project's scale |
| Version control | Git + GitHub | Standard |

## 3. Why PWA over native app (for v1)

- Zero app-store review process or fees
- One codebase, instant updates (no app store release cycle)
- Installable to home screen on Android, works offline once cached
- Easy to share a link with a teacher/interviewer — no APK install needed
- Can be ported to React Native (Expo) later, reusing the same Express/MongoDB backend unchanged

## 4. API Design (high-level — detailed endpoints defined during Phase 1/4)

### 4.1 Public (no auth required)
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/analyze` | Accepts OCR'd text + language; returns `{ documentType, confidence, plainSummary, keyFields, fields, actionCard, warnings }` |
| GET | `/api/health` | Basic health check |

### 4.2 Authenticated (optional, for history/caregiver features)
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account (email or phone) |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/history` | Get user's saved scan summaries |
| POST | `/api/history` | Save a new scan summary (text only; for `form` scans, summary and type only, never the extracted text) |
| DELETE | `/api/history/:id` | Delete one scan |
| DELETE | `/api/history` | Delete all history ("delete my data") |
| POST | `/api/caregiver/link` | (stretch) Link a caregiver account |

**Note:** `/api/analyze` never receives images — only text already extracted client-side. This keeps the privacy promise structural, not just policy.

## 5. The `/api/analyze` Contract (critical — mock and real implementation must match)

```json
// Request
{
  "text": "extracted OCR text...",
  "language": "en" | "hi" | "mr",
  "ocrConfidence": 0.82
}

// Response
{
  "documentType": "medicine_label" | "bill" | "government_letter" | "form" | "general",
  "confidence": 0.0-1.0,
  "plainSummary": "short plain-language explanation",
  "keyFields": {
    "amount": "...",      // if bill
    "dueDate": "...",     // if bill/letter
    "dosage": "...",      // if medicine (only if printed on the label)
    "timing": "..."       // if medicine (only if printed on the label)
  },
  "fields": [             // only for documentType "form"; otherwise omit or []
    {
      "label": "A/C No.",                           // field name as printed
      "meaning": "Your bank account number",        // plain-language meaning
      "expects": "A number, usually 10-16 digits"   // kind of answer expected, never a value
    }
  ],
  "actionCard": {
    "whatIsThis": "...",
    "needsAction": true,
    "byWhen": "..."
  },
  "warnings": ["Please confirm dosage with your pharmacist or doctor."]
}
```

### 5.1 Rules for the contract
- `fields` is only filled for `documentType: "form"`. For all other types it is omitted or an empty array. The frontend must handle both.
- `fields[].expects` describes the *kind* of answer ("a number", "your full name as on your ID", "a date"). It must **never** contain a suggested personal value.
- `keyFields.dosage` and `keyFields.timing` are filled **only** if printed on the label. If not printed, leave them empty and let the warning say so. Never guess dosage.
- For `medicine_label`, `warnings` always contains the pharmacist/doctor caution, regardless of confidence. This is enforced in server code, not only in the prompt.
- For `form`, `needsAction` is normally `true` (the user has to fill it); `byWhen` may be empty unless a deadline is printed.
- Validate the response shape on the server (both mock and LLM output) before returning it, so the frontend can trust it.

During development, this endpoint is served by a mock/rule-based function with the exact same shape (see project instructions, Section 8). Swapping to the real LLM call later changes only the function body, not the contract — so the frontend never needs to change.

### 5.2 Mock coverage (Phase 4)
The mock must cover at least these sample documents, so the whole UI can be built without any API cost:
1. Medicine label (with the always-on safety warning)
2. Bill (amount + due date)
3. Government/bank letter
4. **Form** (e.g., bank account opening form with a `fields` list including an abbreviation such as "A/C No.")
5. General text

## 6. OCR Pipeline (client-side)

1. Capture image (camera or file input)
2. Preprocess: grayscale, contrast boost, resize (improves Tesseract accuracy)
3. Run Tesseract.js with selected language pack(s)
4. Return extracted text + per-word confidence
5. If overall confidence is below threshold, flag it in the UI before proceeding

**Form notes (v1.1):** Forms contain boxes, tables and mixed Devanagari + English text, which are harder for Tesseract than plain paragraphs. Plan to test real forms early in Phase 2, record accuracy for forms separately, and consider Tesseract page segmentation modes suited to sparse text. If form OCR is too weak, document it honestly as a limitation.

## 7. Text-to-Speech & Voice Commands

- Use `speechSynthesis.getVoices()` to list available voices; let user pick one if multiple exist for their language
- Expose rate control (slow/normal) via `utterance.rate`
- Word-highlighting via `onboundary` events on the `SpeechSynthesisUtterance`
- Voice commands via `SpeechRecognition`; test primarily on Chrome Android since support elsewhere is inconsistent — document this limitation
- For forms, the field explainer is read aloud one field at a time (label, then meaning, then what is expected)

## 8. Environment Variables

```
# server/.env (never committed — see .env.example)
MONGODB_URI=
JWT_SECRET=
LLM_API_KEY=         # only needed once real API calls are enabled
LLM_API_URL=
ANALYZE_MODE=mock    # "mock" or "llm" — switches the analyze service
PORT=5000

# client/.env
VITE_API_BASE_URL=
```

## 9. Folder Structure (high-level — finalized in Phase 1)

```
padho/
  client/           # React + Vite PWA
    src/
      components/
      pages/
      hooks/
      services/     # API calls, OCR wrapper, speech wrapper
      utils/
    public/
      manifest.json
  server/
    src/
      routes/
      controllers/
      models/
      services/
        analyze/
          mockAnalyze.js   # rule-based, used during dev
          llmAnalyze.js    # real API call, used for demo
          validate.js      # checks the response matches the contract
          index.js         # switches between the two via env flag
      middleware/
    .env.example
  docs/             # PRD, TRD, this whole set of documents
    wireframes/     # photos/exports of wireframes (no real personal data)
  PROJECT_STATE.md
```

## 10. Non-Functional Requirements

- **Performance:** OCR + analyze round trip should complete within ~5-8 seconds on a mid-range Android phone; show a clear loading state throughout
- **Offline resilience:** core reading of a previously-scanned document should work offline (stretch goal, Phase 6+)
- **Security:** no API keys in frontend code; JWT with reasonable expiry; input validation on all backend routes
- **Privacy (added v1.1):** the server must not log request bodies for `/api/analyze` (the text may contain names, account numbers or ID numbers). Log only status codes and timing. Nothing from a `form` scan's text is persisted anywhere server-side.
- **Browser support target:** Chrome on Android (primary); should degrade gracefully (not crash) on browsers lacking Web Speech API support
