# Product Requirement Document (PRD)
## Project: Padho — Accessible Document Reader for Older Adults & Limited-Literacy Users

**Status:** Draft v1.0
**Owner:** [Your name]
**Last updated:** [date]

---

## 1. Problem Statement

Older adults and people with limited literacy regularly encounter printed documents they struggle to read or understand: medicine labels, utility bills, bank letters, government notices. Existing tools like Google Lens can extract and read text aloud, but they are general-purpose products built for digitally confident users. They don't explain *what a document is*, *what the reader needs to do about it*, or *by when* — and they aren't designed around large text, voice-first interaction, or low-literacy use patterns.

## 2. Goal

Build a mobile-first web app that lets a user point their phone camera at a printed document and get:
1. The text read aloud clearly
2. A plain-language explanation of what the document is
3. A clear "what to do next" action, including any deadline
4. Extra safety handling for high-stakes documents like medicine labels

## 3. Target Users

**Primary:** Older adults (60+) who can read but find small text, dense wording, or bureaucratic language difficult.

**Secondary:** People with limited literacy who can recognize some words/icons but struggle with full sentences or complex documents.

**Tertiary (bonus, not a design driver):** People reading in a non-native language.

**Design principle:** Design for the primary user's hardest moment (confusing letter, worrying medicine label), not the easiest one.

## 4. Non-Goals (explicitly out of scope for v1)

- Not a general-purpose OCR/translation tool (not competing with Lens on breadth)
- Not a medical diagnosis or legal advice tool — never interprets beyond what's printed
- Not a social or multi-user collaboration app (caregiver link is a stretch goal, not core)
- Not optimized for desktop use — mobile phone is the only target form factor for v1
- Not handling handwritten text in v1 (printed text only)

## 5. Core User Stories

1. *As an older adult*, I want to scan a medicine label and hear the dosage and timing read clearly, so I take my medicine correctly.
2. *As an older adult*, I want to scan a bill and immediately know the amount due and the due date, without reading the whole page.
3. *As a limited-literacy user*, I want to use the app with almost no reading required, using icons and voice.
4. *As any target user*, I want to choose my language (English, Hindi, Marathi) and have both the reading and the explanation happen in that language.
5. *As a cautious user*, I want to know when the app isn't sure it read something correctly, especially for medicine, so I don't act on a mistake.
6. *As a user*, I want my documents to stay private — I don't want my bills or medical info stored on someone else's server.

## 6. Features

### 6.1 Must-Have (v1 / MVP)
| # | Feature | Description |
|---|---|---|
| F1 | Camera capture | Take a photo of a document within the app |
| F2 | OCR extraction | Extract text from the captured image |
| F3 | Text-to-speech playback | Read extracted text aloud, adjustable speed |
| F4 | Large-text reader view | Big, high-contrast, scalable display of the text |
| F5 | Word-by-word highlight | Highlight words as they're spoken |
| F6 | One-button home screen | A single dominant "Scan" action; minimal else |
| F7 | Document type detection | Classify as medicine label / bill / letter / general |
| F8 | Plain-language summary | Rewrite the document's meaning simply |
| F9 | Action card | Show "What is this / Do I need to act / By when" |
| F10 | Confidence + safety warnings | Flag low-confidence reads; always add a caution note for medicine |
| F11 | Language selection | English, Hindi, Marathi support |
| F12 | Accessibility settings | Font size, contrast, voice speed, voice choice |

### 6.2 Should-Have (v1.5)
| # | Feature | Description |
|---|---|---|
| F13 | Voice commands | "Scan", "Read again", "Slower" spoken controls |
| F14 | Read again / read slowly | Repeat or slow down playback on demand |
| F15 | Local history | List of past scans stored on-device (or account-linked) |
| F16 | Delete my data | One tap to clear all stored history |

### 6.3 Could-Have (stretch)
| # | Feature | Description |
|---|---|---|
| F17 | Caregiver link | Family member can view scan summaries + due dates |
| F18 | Reminders | Notify user of upcoming due dates from scanned bills |
| F19 | Offline mode | Full functionality without internet |
| F20 | Expo/React Native port | Native Android app version |

### 6.4 Won't-Have (v1)
- Multi-user accounts with roles/permissions beyond caregiver link
- Handwriting recognition
- Payment processing (even if a bill shows an amount, no "pay now" feature)

## 7. Success Metrics

Since this is a portfolio project rather than a commercial product, success is measured by evidence you can show, not by user growth:

- **OCR accuracy**: % correct on a self-built test set of 30-50 real document photos, before/after preprocessing
- **Task completion**: in a usability session with 3-5 real target users, % who complete "scan a document and tell me what it says" without help
- **Comparative result**: a side-by-side table vs. Google Lens on the same documents, honestly reporting wins and losses
- **Accessibility audit**: passes WCAG AA contrast; fully operable with a screen reader; documented in the README
- **Safety**: zero instances in testing where a low-confidence medicine reading was presented without a warning

## 8. Risks & Open Questions

| Risk | Notes |
|---|---|
| Tesseract.js accuracy on Devanagari script may be weak | Flag honestly in README; consider a cloud OCR fallback as a documented limitation |
| Web Speech API voice/language availability varies by device/browser | Test specifically on Chrome Android, the primary demo target |
| Recruiting 3-5 real older/limited-literacy users for testing | Start early (Phase 0); family/neighbors are a reasonable starting pool |
| LLM cost during development | Mitigated by mock/rule-based outputs during build; real API only for tuning/demo (see Section 8 of project instructions) |
| Scope creep toward "beating Google Lens" generally | Explicitly out of scope — this app wins on specificity, not breadth |

## 9. Competitive Note (for interview/teacher Q&A)

See comparison table already established in project discussion: Lens is general-purpose and assumes digital confidence; this app is single-purpose, voice-first, explains documents rather than just reading them, and adds safety handling for high-stakes text. The project's credibility rests on real user testing and an honest head-to-head comparison, not on a claim of technical superiority over Lens's OCR.
