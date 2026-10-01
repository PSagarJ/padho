# Product Requirement Document (PRD)
## Project: Padho: Accessible Document Reader for Older Adults & Limited-Literacy Users

**Status:** Draft v1.1 (updated after Phase 0 user interviews)
**Owner:** [Your name]
**Last updated:** 2026-10-01

### Changelog
- **v1.1:** Added form-field explainer (new document type `form`) based on Phase 0 interviews. Clarified medicine scope (v1 reads only what is printed). Added discovery evidence (Section 10), new non-goals, new risks, and a document-type priority order.
- **v1.0:** Initial draft.

---

## 1. Problem Statement

Older adults and people with limited literacy regularly encounter printed documents they struggle to read or understand: medicine labels, utility bills, bank letters, government notices, and **forms they must fill in**. Existing tools like Google Lens can extract and read text aloud, but they are general-purpose products built for digitally confident users. They don't explain *what a document is*, *what the reader needs to do about it*, *what a form field is asking for*, or *by when* — and they aren't designed around large text, voice-first interaction, or low-literacy use patterns.

Phase 0 interviews showed that the core gap is often **understanding, not reading**: people can read the words on a form or label but don't know what a field or term means, or what to do next.

## 2. Goal

Build a mobile-first web app that lets a user point their phone camera at a printed document and get:
1. The text read aloud clearly
2. A plain-language explanation of what the document is
3. A clear "what to do next" action, including any deadline
4. For forms: a plain-language explanation of each field (what it means and what kind of answer it expects)
5. Extra safety handling for high-stakes documents like medicine labels

**One-sentence pitch:** *Point your phone at any confusing paper. Padho tells you what it is, what it means, and what to do — out loud, in your language.*

## 3. Target Users

**Primary:** Older adults (60+) who can read but find small text, dense wording, short forms/abbreviations, or bureaucratic language difficult.

**Secondary:** People with limited literacy who can recognize some words/icons but struggle with full sentences, complex documents, or reading and writing in a given script.

**Tertiary (bonus, not a design driver):** People reading in a non-native language; younger people filling unfamiliar forms (e.g., an Aadhaar-linking form).

**Design principle:** Design for the primary user's hardest moment (confusing letter, worrying medicine label, a form with unfamiliar short forms), not the easiest one.

## 4. Non-Goals (explicitly out of scope for v1)

- Not a general-purpose OCR/translation tool (not competing with Lens on breadth)
- Not a medical diagnosis or legal advice tool — never interprets beyond what's printed
- **Not a form-filling tool:** the app explains fields; it never fills them in, suggests personal values, or stores form contents
- **No general drug information in v1:** the app reads back what is printed on the label and does not state what a medicine treats or whether it is safe for the user (see Section 8)
- Not a social or multi-user collaboration app (caregiver link is a stretch goal, not core)
- Not optimized for desktop use — mobile phone is the only target form factor for v1
- Not handling handwritten text in v1 (printed text only)
- Not covering languages beyond English, Hindi and Marathi in v1 (documented limitation)

## 5. Core User Stories

1. *As an older adult*, I want to scan a medicine label and hear the dosage and timing read clearly, so I take my medicine correctly.
2. *As an older adult*, I want to scan a bill and immediately know the amount due and the due date, without reading the whole page.
3. *As a limited-literacy user*, I want to use the app with almost no reading required, using icons and voice.
4. *As any target user*, I want to choose my language (English, Hindi, Marathi) and have both the reading and the explanation happen in that language.
5. *As a cautious user*, I want to know when the app isn't sure it read something correctly, especially for medicine, so I don't act on a mistake.
6. *As a user*, I want my documents to stay private — I don't want my bills or medical info stored on someone else's server.
7. *As an older adult filling a bank form*, I want each field and short form (e.g., "A/C No.") explained in my language, so I know what details to write and don't have to ask someone.
8. *As a user who cannot read or write the form's language*, I want the form's fields read aloud and explained in a language I understand, so I can fill it in without depending on another person.
9. *As a user of any form*, I want to be sure the app never stores what I write or my ID numbers (e.g., Aadhaar).

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
| F7 | Document type detection | Classify as medicine label / bill / government letter / **form** / general |
| F8 | Plain-language summary | Rewrite the document's meaning simply |
| F9 | Action card | Show "What is this / Do I need to act / By when" |
| F10 | Confidence + safety warnings | Flag low-confidence reads; always add a caution note for medicine |
| F11 | Language selection | English, Hindi, Marathi support |
| F12 | Accessibility settings | Font size, contrast, voice speed, voice choice |
| F21 | Form field explainer | For `form` documents: list each detected field with a plain-language meaning and the kind of answer expected; never fills or stores answers |
| F22 | Abbreviation expansion | Expand short forms/abbreviations found on forms and bills (e.g., "A/C", "IFSC", "KYC") into plain words |

*Note: feature IDs are stable; F21 and F22 were added in v1.1, so they appear after F12 rather than being renumbered.*

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
| F23 | General medicine information | Clearly labeled "general information" about a medicine, from a trusted source (not LLM memory), with a strong disclaimer. Only after the safety review in Section 8 |
| F24 | Fully voice-driven form walkthrough | Step through a form field by field by voice, for users who cannot read or type |

### 6.4 Won't-Have (v1)
- Multi-user accounts with roles/permissions beyond caregiver link
- Handwriting recognition
- Payment processing (even if a bill shows an amount, no "pay now" feature)
- Auto-filling or suggesting values for form fields
- Storing the contents of a scanned form or any ID numbers

### 6.5 Document-Type Priority (build order)
One pipeline serves all types (detect type, then structured JSON, then action card), so types are variations, not separate products. Build and polish in this order:
1. **Medicine label:** highest stakes, clearest safety story
2. **Form explainer:** strongest evidence from interviews
3. **Bills and letters:** simplest; a quick win once the pipeline exists

## 7. Success Metrics

Since this is a portfolio project rather than a commercial product, success is measured by evidence you can show, not by user growth:

- **OCR accuracy**: % correct on a self-built test set of 30-50 real document photos (including at least 8-10 forms), before/after preprocessing
- **Task completion**: in a usability session with 3-5 real target users, % who complete "scan a document and tell me what it says" without help
- **Form task**: % of test users who can say what a given form field means after using the explainer, compared with before
- **Comparative result**: a side-by-side table vs. Google Lens on the same documents, honestly reporting wins and losses
- **Accessibility audit**: passes WCAG AA contrast; fully operable with a screen reader; documented in the README
- **Safety**: zero instances in testing where a low-confidence medicine reading was presented without a warning, and zero instances of the app stating dosage or medical advice that is not printed on the label

## 8. Risks & Open Questions

| Risk | Notes |
|---|---|
| Tesseract.js accuracy on Devanagari script may be weak | Flag honestly in README; consider a cloud OCR fallback as a documented limitation |
| OCR on forms (boxes, tables, mixed Devanagari + English) is harder than on plain paragraphs | Test real forms early in Phase 2; report accuracy for forms separately |
| Medicine scope: users want to know what a medicine is for, but this is general medical information and LLMs can be wrong | v1 reads only what is printed (name, composition, dosage, timing, expiry) plus a pharmacist caution. General info (F23) only from a trusted source, clearly labeled, after review |
| Form contents and ID numbers (e.g., Aadhaar) are highly sensitive | Never store or log form contents; explain fields only; privacy note in README |
| Users who cannot read or type, or who speak a language outside English/Hindi/Marathi | Voice and read-aloud help, but full no-reading use and extra languages are stretch goals; state as limitations |
| Web Speech API voice/language availability varies by device/browser | Test specifically on Chrome Android, the primary demo target |
| Recruiting 3-5 real older/limited-literacy users for testing | Phase 0 interviews already reached several people; reuse them for Phase 7 testing |
| LLM cost during development | Mitigated by mock/rule-based outputs during build (see Section 8 of project instructions); real API only for tuning/demo |
| Scope creep: three document families plus "beating Google Lens" | Mitigated by one shared pipeline, the priority order in 6.5, and the stance that this app wins on specificity, not breadth |

## 9. Competitive Note (for interview/teacher Q&A)

Lens is general-purpose and assumes digital confidence; this app is single-purpose, voice-first, explains documents rather than just reading them (including what each form field means), and adds safety handling for high-stakes text. The project's credibility rests on real user testing and an honest head-to-head comparison, not on a claim of technical superiority over Lens's OCR.

## 10. Discovery Evidence (Phase 0)

Informal interviews with older and younger people from different regions and mother tongues.

| Who | Situation | What they struggled with |
|---|---|---|
| Older Marathi-speaking woman | Wanted to fill in a bank application | Could read it, but didn't understand some short forms or what to write in each section |
| Teenager | Filling an Aadhaar-phone-number linking form | Knowing what details to write |
| Man who speaks Marathi but cannot read or write | Billing details at a store | Needed another person's help to fill the form |
| Several people (incl. well-educated) | Medicine names | Search the medicine name on Google to find out what it is |

**Key quote:** *"I am able to read this, but I don't know what to fill in this specific section."* (older woman, bank form)

**Interview notes:** Some questions were closed or leading ("Can you read this?"). Next round, use open questions ("Tell me about the last time you had to fill a form. What happened?"). The medicine and bill needs were also confirmed in follow-up research.

**Resulting decisions:**
- Add `form` as a core document type (F21, F22)
- Keep medicine and bill/letter types, with the priority order in 6.5
- Medicine v1 reads only what is printed; general drug information is deferred (F23)
- Forms are explained, never filled or stored
