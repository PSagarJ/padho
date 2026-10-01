# Backend Schema Document

## Project: Padho — Accessible Document Reader

**Status:** Draft v1.0
**Last updated:** [date]

---

## 1. Database Choice & Approach

MongoDB (document store) via Mongoose. Collections are kept minimal and deliberately **exclude document images** — only extracted text, summaries, and metadata are ever persisted, consistent with the privacy-by-design principle in the PRD.

The app works fully **without any account** (anonymous mode, no persistence beyond the current session/localStorage). Accounts are only needed for History (v1.5) and Caregiver Link (stretch).

## 2. Collections

### 2.1 `users`

```js
{
  _id: ObjectId,
  identifier: String,       // email or phone number, unique
  identifierType: "email" | "phone",
  passwordHash: String,     // bcrypt hash; null if using OTP-only login
  preferences: {
    language: "en" | "hi" | "mr",
    fontSize: Number,       // px value, e.g. 20-32
    contrastMode: "normal" | "high",
    voiceURI: String,       // selected Web Speech voice identifier
    speechRate: Number,     // e.g. 0.8 (slow) - 1.2 (fast)
  },
  caregiverLinks: [ObjectId],   // ref: users._id (stretch goal)
  createdAt: Date,
  updatedAt: Date
}
```

### 2.2 `scans`

```js
{
  _id: ObjectId,
  userId: ObjectId | null,     // null for anonymous/local-only scans never synced
  documentType: "medicine_label" | "bill" | "government_letter" | "form" | "general",
  ocrConfidence: Number,        // 0.0 - 1.0
  extractedText: String,        // raw OCR output (text only, never image)
  plainSummary: String,
  keyFields: {
    amount: String,
    dueDate: Date,
    dosage: String,
    timing: String
  },
  actionCard: {
    whatIsThis: String,
    needsAction: Boolean,
    byWhen: Date
  },
  warnings: [String],
  language: "en" | "hi" | "mr",
  createdAt: Date
}
```

### 2.3 `reminders` (stretch, depends on F18)

```js
{
  _id: ObjectId,
  userId: ObjectId,
  scanId: ObjectId,          // ref: scans._id
  dueDate: Date,
  message: String,
  notified: Boolean,
  createdAt: Date
}
```

## 3. Relationships

```
users (1) ──────< (many) scans
users (1) ──────< (many) reminders
scans (1) ──────< (many) reminders        [optional link]
users (many) ───< (many) users            [caregiverLinks, self-referencing, stretch]
```

- A `scan` can exist with `userId: null` (anonymous, kept only in the browser's localStorage, never sent to the backend at all) — this is the default for v1.
- Only when a user is logged in AND opts to save history does a `scan` get POSTed to `/api/history` and persisted server-side.

## 4. Auth Logic

### 4.1 Approach

- **Anonymous-first.** No login required to use any core feature (scan, read, understand).
- Login is **optional**, offered only when a user wants History or Caregiver Link.
- Keep auth as simple as possible: email or phone + password, using JWT for session management. (An OTP-based phone login is a reasonable alternative if simpler for your target users, but adds an SMS-provider cost — stick with password auth for v1 to stay free.)

### 4.2 Flow

```
Register:  POST /api/auth/register { identifier, password }
           -> bcrypt hash password -> save user -> return JWT

Login:     POST /api/auth/login { identifier, password }
           -> compare bcrypt hash -> return JWT

Protected requests:
           Header: Authorization: Bearer <JWT>
           -> middleware verifies JWT, attaches req.user
```

### 4.3 Password & Token Rules

- Passwords hashed with bcrypt (min. 10 salt rounds), never stored plain.
- JWT secret stored in `.env`, never committed.
- Token expiry: reasonable default (e.g., 7 days), refresh not required for a portfolio-scale project.
- All `/api/history` and `/api/caregiver` routes require valid JWT via middleware.

## 5. Indexes (for later performance, not urgent at MVP scale)

- `users.identifier` — unique index
- `scans.userId` + `scans.createdAt` — compound index (for fast "get my history, newest first")
- `reminders.userId` + `reminders.dueDate` — compound index (for fast upcoming-reminder queries)

## 6. Data Deletion ("Delete my data")

- `DELETE /api/history` removes all `scans` documents for `req.user.id`.
- Also cascades to delete associated `reminders`.
- No soft-delete / recovery — deletion is immediate and permanent, consistent with the privacy promise made to users.

## 7. What Is Deliberately NOT Stored

- Document **images** — never uploaded to the backend at all; OCR happens client-side.
- Full OCR text is stored only if the user is logged in and history is enabled; anonymous users' data lives only in browser localStorage and clears when they clear site data.
- No analytics/tracking identifiers tied to document content.
- Contents of scanned forms and any ID numbers (e.g., Aadhaar), ever.
