# Technical Requirement Document (TRD)
## Project: Padho — Accessible Document Reader

**Status:** Draft v1.0
**Last updated:** [date]

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

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | React (Vite) | You already know React; Vite gives fast dev builds |
| App type | PWA (installable, manifest + service worker) | Free, instant demo link, no app store needed for v1 |
| Styling | CSS Modules or plain CSS (no heavy UI library) | Full control over accessibility (contrast, font scaling) |
| Backend | Node.js + Express | Matches MERN; simple REST API |
| Database | MongoDB Atlas (free tier, Mongoose ODM) | Stores preferences, scan summaries, reminders — not images |
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
| POST | `/api/analyze` | Accepts OCR'd text + language; returns `{ documentType, confidence, plainSummary, keyFields, actionCard, warnings }` |
| GET | `/api/health` | Basic health check |

### 4.2 Authenticated (optional, for history/caregiver features)
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account (email or phone) |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/history` | Get user's saved scan summaries |
| POST | `/api/history` | Save a new scan summary (text only) |
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
  "documentType": "medicine_label" | "bill" | "government_letter" | "general",
  "confidence": 0.0-1.0,
  "plainSummary": "short plain-language explanation",
  "keyFields": {
    "amount": "...",      // if bill
    "dueDate": "...",     // if bill/letter
    "dosage": "...",      // if medicine
    "timing": "..."       // if medicine
  },
  "actionCard": {
    "whatIsThis": "...",
    "needsAction": true,
    "byWhen": "..."
  },
  "warnings": ["Please confirm dosage with your pharmacist or doctor."]
}
```

During development, this endpoint is served by a mock/rule-based function with the exact same shape (see project instructions, Section 8). Swapping to the real LLM call later changes only the function body, not the contract — so the frontend never needs to change.

## 6. OCR Pipeline (client-side)

1. Capture image (camera or file input)
2. Preprocess: grayscale, contrast boost, resize (improves Tesseract accuracy)
3. Run Tesseract.js with selected language pack(s)
4. Return extracted text + per-word confidence
5. If overall confidence is below threshold, flag it in the UI before proceeding

## 7. Text-to-Speech & Voice Commands

- Use `speechSynthesis.getVoices()` to list available voices; let user pick one if multiple exist for their language
- Expose rate control (slow/normal) via `utterance.rate`
- Word-highlighting via `onboundary` events on the `SpeechSynthesisUtterance`
- Voice commands via `SpeechRecognition`; test primarily on Chrome Android since support elsewhere is inconsistent — document this limitation

## 8. Environment Variables

```
# server/.env (never committed — see .env.example)
MONGODB_URI=
JWT_SECRET=
LLM_API_KEY=         # only needed once real API calls are enabled
LLM_API_URL=
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
          index.js         # switches between the two via env flag
      middleware/
    .env.example
  docs/             # PRD, TRD, this whole set of documents
  PROJECT_STATE.md
```

## 10. Non-Functional Requirements

- **Performance:** OCR + analyze round trip should complete within ~5-8 seconds on a mid-range Android phone; show a clear loading state throughout
- **Offline resilience:** core reading of a previously-scanned document should work offline (stretch goal, Phase 6+)
- **Security:** no API keys in frontend code; JWT with reasonable expiry; input validation on all backend routes
- **Browser support target:** Chrome on Android (primary); should degrade gracefully (not crash) on browsers lacking Web Speech API support
