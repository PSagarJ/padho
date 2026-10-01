# App Flow Document
## Project: Padho — Accessible Document Reader

**Status:** Draft v1.0
**Last updated:** [date]

---

## 1. Guiding Principle

Every screen should answer one question for the user: **"What do I do right now?"** No screen should require reading more than one short sentence to understand its purpose. Navigation should be reachable by a single tap or a single voice command from the home screen.

## 2. Screen Inventory

| # | Screen | Purpose |
|---|---|---|
| 1 | Home | One giant Scan button; nothing else competes for attention |
| 2 | Camera Capture | Live camera view with a capture control |
| 3 | Processing | Loading state while OCR + analysis run |
| 4 | Low-Confidence Check | Shown only if OCR confidence is low; asks user to confirm or rescan |
| 5 | Result — Action Card | "What is this / Do I need to act / By when" at a glance |
| 6 | Result — Reader View | Full text, large font, word-highlight during playback |
| 7 | Settings | Font size, contrast, voice, speed, language |
| 8 | History (v1.5) | List of past scans |
| 9 | Caregiver Link (stretch) | Link/view family member's scans |

## 3. Primary User Journey (Happy Path)

```
[Home]
   |  (tap big Scan button, or say "Scan")
   v
[Camera Capture]
   |  (tap capture, or auto-capture when steady+focused)
   v
[Processing]
   |  (OCR runs client-side -> text sent to /api/analyze)
   v
[Result: Action Card]      <-- app SPEAKS this automatically on arrival
   |  "This is a [document type]. [plain summary]. [action needed] by [date]."
   |
   +--> (tap "Read full text" or say "read more") --> [Reader View]
   |         |  word-by-word highlight plays automatically
   |         |  controls: pause, read again, read slower
   |         +--> (tap Home / say "done") --> [Home]
   |
   +--> (tap Home / say "done") --> [Home]
```

## 4. Low-Confidence Branch

```
[Processing]
   |  OCR confidence < threshold (e.g. 60%)
   v
[Low-Confidence Check]
   "I'm not fully sure I read this correctly."
   [Try Again]  [Use Anyway]
        |              |
        v              v
  [Camera Capture]  [Result: Action Card]  (shown WITH a visible + spoken warning)
```

Medicine labels ALWAYS carry the safety warning in the Action Card regardless of confidence level (see PRD Section 6.1, F10).

## 5. Settings Access

Settings must be reachable from Home with a single, clearly labeled, large icon (e.g., a gear with the word "Settings" beside it, not icon-only). Changes apply immediately and persist (localStorage for anonymous users, MongoDB if logged in).

```
[Home] --(tap Settings icon)--> [Settings]
   Font size: [A-] [A] [A+]
   Contrast: [Normal] [High Contrast]
   Voice: [dropdown of available voices for selected language]
   Speed: [Slow] [Normal] [Fast]
   Language: [English] [Hindi] [Marathi]
   --(tap Back / say "done")--> [Home]
```

## 6. History Flow (v1.5, optional login)

```
[Home] --(tap History)--> [History List]
   each item: document type icon + short date + one-line summary
   --(tap an item)--> [Result: Action Card]  (same screen as live result, replayed)
   --(tap Delete All)--> confirm --> history cleared
```

## 7. Voice-Command Map (applies on relevant screens)

| Spoken command | Action | Available on |
|---|---|---|
| "Scan" | Opens camera capture | Home |
| "Read again" | Replays current text from start | Result / Reader View |
| "Slower" / "Faster" | Adjusts speech rate | Reader View |
| "Stop" | Pauses playback | Reader View |
| "Home" / "Done" | Returns to Home | Any screen |
| "Settings" | Opens Settings | Home |

Voice commands are an addition to tap controls, never a replacement — every action must also work by touch, since microphone/voice recognition reliability varies by device.

## 8. Error & Edge-Case Flows

| Situation | Behavior |
|---|---|
| Camera permission denied | Clear message + button to open device settings; offer "upload a photo instead" as fallback |
| No internet (analyze step fails) | Show extracted text + TTS still works (client-side); show "Can't explain this right now — no internet" instead of crashing |
| OCR returns empty/near-empty text | "I couldn't find readable text. Try moving closer or improving the light." + Try Again |
| Unsupported browser (no Web Speech API) | Detect on load; show a one-time notice; app still shows text, just without audio |
| User has no documents scanned yet (History) | Friendly empty state, large Scan button repeated here too |

## 9. First-Time Experience

On first visit only: a brief (3-screen max) walkthrough showing the big Scan button, explaining "point your phone at any document," and offering to set language/font size before first use. Skippable with one tap. No account required to pass through this.
