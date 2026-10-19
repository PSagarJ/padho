// Checks requests coming in and responses going out of /api/analyze.
// Both the mock and the real LLM go through validateAnalyzeResponse,
// so the frontend can always trust the shape.

export const DOCUMENT_TYPES = [
  "medicine_label",
  "bill",
  "government_letter",
  "form",
  "general",
];
export const LANGUAGES = ["en", "hi", "mr"];
export const MAX_TEXT_LENGTH = 20000;

// Enforced in server code, not only in a prompt (TRD 5.1)
export const MEDICINE_CAUTION =
  "Please confirm with your pharmacist or doctor.";

// ---------- Request ----------
// Returns a list of problems. Empty list = request is fine.
export function validateAnalyzeRequest(body) {
  const errors = [];

  if (!body || typeof body.text !== "string" || body.text.trim() === "") {
    errors.push("text is required");
  } else if (body.text.length > MAX_TEXT_LENGTH) {
    errors.push(`text is too long (max ${MAX_TEXT_LENGTH} characters)`);
  }

  if (!body || !LANGUAGES.includes(body.language)) {
    errors.push("language must be one of: en, hi, mr");
  }

  if (
    body &&
    body.ocrConfidence !== undefined &&
    (typeof body.ocrConfidence !== "number" ||
      body.ocrConfidence < 0 ||
      body.ocrConfidence > 1)
  ) {
    errors.push("ocrConfidence must be a number between 0 and 1");
  }

  return errors;
}

// ---------- Response ----------
const str = (v) => (typeof v === "string" ? v : "");

// Throws if the response is unusable; otherwise returns a clean copy
// with every field in the exact shape the contract promises.
export function validateAnalyzeResponse(raw) {
  if (!raw || typeof raw !== "object") {
    throw new Error("Analyze result is not an object");
  }
  if (!DOCUMENT_TYPES.includes(raw.documentType)) {
    throw new Error("Analyze result has an invalid documentType");
  }

  const confidence =
    typeof raw.confidence === "number"
      ? Math.min(1, Math.max(0, raw.confidence))
      : 0;

  const keyFields = {
    amount: str(raw.keyFields?.amount),
    dueDate: str(raw.keyFields?.dueDate),
    dosage: str(raw.keyFields?.dosage),
    timing: str(raw.keyFields?.timing),
  };

  // `fields` only exists for forms; always an array so the frontend is simple
  let fields = [];
  if (raw.documentType === "form" && Array.isArray(raw.fields)) {
    fields = raw.fields
      .filter((f) => f && str(f.label) && str(f.meaning))
      .map((f) => ({
        label: str(f.label),
        meaning: str(f.meaning),
        expects: str(f.expects),
      }));
  }

  const warnings = Array.isArray(raw.warnings)
    ? raw.warnings.filter((w) => typeof w === "string" && w.trim() !== "")
    : [];

  // Medicine labels ALWAYS carry the pharmacist caution, at the top
  if (
    raw.documentType === "medicine_label" &&
    !warnings.includes(MEDICINE_CAUTION)
  ) {
    warnings.unshift(MEDICINE_CAUTION);
  }

  return {
    documentType: raw.documentType,
    confidence,
    plainSummary: str(raw.plainSummary),
    keyFields,
    fields,
    actionCard: {
      whatIsThis: str(raw.actionCard?.whatIsThis),
      needsAction: Boolean(raw.actionCard?.needsAction),
      byWhen: str(raw.actionCard?.byWhen),
    },
    warnings,
  };
}
