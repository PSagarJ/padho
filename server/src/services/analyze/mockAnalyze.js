// Rule-based stand-in for the real LLM. SAME input and output shape as the
// contract (TRD Section 5), so swapping later changes no frontend code.
// NOTE: this mock answers in English only. Hindi/Marathi explanations
// come from the real LLM step (parked for later in Phase 4).

import { MEDICINE_CAUTION } from "./validate.js";

// ---------- Step 1: detect the document type by scoring keywords ----------
const KEYWORDS = {
  medicine_label: [
    /\b(tablets?|capsules?|syrup|suspension|ointment|drops)\b/i,
    /\b\d+(\.\d+)?\s?(mg|mcg|ml)\b/i,
    /\b(dosage|dose|composition|contains)\b/i,
    /\b(mfg|manufactured|expiry|exp\.?|batch|b\.?\s?no)\b/i,
    /\b(schedule h|prescription)\b/i,
    /गोळी|गोळ्या|औषध|मात्रा|खुराक|दवा/,
  ],
  bill: [
    /\b(bill|invoice|amount (due|payable)|total|due date|units consumed|consumer (no|number)|meter)\b/i,
    /(₹|rs\.?|inr)\s?[\d,]+/i,
    /\b(electricity|water|gas|broadband)\b/i,
    /देयक|बिल|रक्कम|अंतिम तारीख|बकाया/,
  ],
  government_letter: [
    /\b(notice|dear (sir|madam|customer)|kindly|hereby|with reference|subject|sincerely|yours faithfully)\b/i,
    /\b(government|municipal|department|office of|bank|kyc)\b/i,
    /सूचना|नोटीस|विषय|कार्यालय|सरकार|बँक|बैंक/,
  ],
  form: [
    /\b(application|applicant|signature|specimen|nominee|declaration|tick)\b/i,
    /\bform\b/i,
    /अर्ज|आवेदन|फॉर्म|स्वाक्षरी/,
  ],
};

// ---------- Form field glossary (F21 + F22: abbreviations expanded) ----------
// "expects" describes the KIND of answer. Never a personal value.
const FIELD_GLOSSARY = [
  {
    re: /\bname\b/i,
    label: "Name",
    meaning: "Your name.",
    expects: "Your full name, the same as on your ID.",
  },
  {
    re: /\b(date of birth|d\.?o\.?b\.?)\b/i,
    label: "Date of Birth",
    meaning: "The day you were born.",
    expects: "A date: day, month and year.",
  },
  {
    re: /a\/c\.?\s*(no\.?|number)?/i,
    label: "A/C No.",
    meaning: "Your bank account number. A/C is short for account.",
    expects: "A number, usually 10 to 16 digits.",
  },
  {
    re: /\bifsc\b/i,
    label: "IFSC",
    meaning:
      "The code of your bank branch. IFSC is short for Indian Financial System Code.",
    expects: "11 letters and numbers. It is printed on your passbook.",
  },
  {
    re: /\bkyc\b/i,
    label: "KYC",
    meaning: "Proof of who you are. KYC is short for Know Your Customer.",
    expects: "Usually a tick or details of an ID document.",
  },
  {
    re: /\bpan\b/i,
    label: "PAN",
    meaning: "Your tax card number. PAN is short for Permanent Account Number.",
    expects: "10 letters and numbers, as printed on your PAN card.",
  },
  {
    re: /\b(aadhaar|aadhar)\b/i,
    label: "Aadhaar No.",
    meaning: "Your Aadhaar identity number.",
    expects: "A 12-digit number. Write it yourself; this app never keeps it.",
  },
  {
    re: /\b(mobile|phone)\s*(no\.?|number)?/i,
    label: "Mobile No.",
    meaning: "Your phone number.",
    expects: "A 10-digit number.",
  },
  {
    re: /\baddress\b/i,
    label: "Address",
    meaning: "The place where you live.",
    expects: "House number, street, area, city and PIN code.",
  },
  {
    re: /\bnominee\b/i,
    label: "Nominee",
    meaning: "The person who gets your money if something happens to you.",
    expects: "The name of a person you trust, and how they are related to you.",
  },
  {
    re: /\bsignature\b/i,
    label: "Signature",
    meaning: "Your sign, written by your own hand.",
    expects: "Your usual signature.",
  },
  {
    re: /\bdate\b(?!\s+of\s+birth)/i,
    label: "Date",
    meaning: "Today's date, or the date of signing.",
    expects: "A date: day, month and year.",
  },
  // Marathi labels seen on real forms
  {
    re: /नाव/,
    label: "नाव",
    meaning: "Your name.",
    expects: "Your full name, the same as on your ID.",
  },
  {
    re: /जन्मतारीख/,
    label: "जन्मतारीख",
    meaning: "Your date of birth.",
    expects: "A date: day, month and year.",
  },
  {
    re: /पत्ता/,
    label: "पत्ता",
    meaning: "Your address.",
    expects: "House number, street, area, city and PIN code.",
  },
  {
    re: /स्वाक्षरी|सही/,
    label: "स्वाक्षरी",
    meaning: "Your signature.",
    expects: "Your usual signature.",
  },
];

// Fields come back in the same order they appear in the text (UI brief)
function findFormFields(text) {
  const found = [];
  const seen = new Set();
  for (const entry of FIELD_GLOSSARY) {
    const m = entry.re.exec(text);
    if (m && !seen.has(entry.label)) {
      seen.add(entry.label);
      found.push({
        index: m.index,
        label: entry.label,
        meaning: entry.meaning,
        expects: entry.expects,
      });
    }
  }
  return found
    .sort((a, b) => a.index - b.index)
    .map(({ label, meaning, expects }) => ({ label, meaning, expects }));
}

function detectType(text) {
  const scores = {};
  for (const [type, patterns] of Object.entries(KEYWORDS)) {
    scores[type] = patterns.filter((p) => p.test(text)).length;
  }
  // Field labels also count as evidence for a form
  scores.form += Math.min(findFormFields(text).length, 4);

  // Order = priority when scores tie (PRD 6.5: medicine, form, bill/letter)
  const order = ["medicine_label", "form", "bill", "government_letter"];
  let best = "general";
  let bestScore = 1; // need at least 2 hits to leave "general"
  for (const type of order) {
    if (scores[type] > bestScore) {
      best = type;
      bestScore = scores[type];
    }
  }
  return { type: best, score: bestScore };
}

// ---------- Step 2: one builder per type ----------
const firstMatch = (text, re) => {
  const m = re.exec(text);
  return m ? (m[1] ?? m[0]).trim() : "";
};

function buildMedicine(text) {
  // Dosage and timing ONLY if printed. Never guess (TRD 5.1).
  const dosage = firstMatch(text, /\b((?:take|use|give)\s+[^.\n]{3,60})/i);

  const TIMING = [
    /\b(?:once|twice|thrice|\d+\s*times?)\s+(?:a|per)\s+day\b/i,
    /\b(?:once|twice|thrice)\s+daily\b/i,
    /\b(?:after|before|with)\s+(?:food|meals?)\b/i,
    /\bat\s+(?:bedtime|night)\b/i,
    /\b(?:morning|evening)\b/i,
  ];
  const timing = [
    ...new Set(TIMING.map((re) => firstMatch(text, re)).filter(Boolean)),
  ].join(", ");

  const expiry = firstMatch(
    text,
    /exp(?:iry|\.)?\s*(?:date)?[:\s-]*([A-Za-z]{3,9}\.?\s*\d{2,4}|\d{1,2}[/-]\d{2,4})/i,
  );

  const warnings = [MEDICINE_CAUTION];
  if (!dosage)
    warnings.push(
      "I could not find the dose on this label. Please ask your pharmacist or doctor how to take it.",
    );

  return {
    plainSummary:
      "This looks like a medicine label. I can only read back what is printed on it. I cannot tell you what the medicine is for.",
    keyFields: { dosage, timing },
    actionCard: {
      whatIsThis: "A medicine label.",
      needsAction: true,
      byWhen: expiry ? `Do not use after ${expiry}.` : "",
    },
    warnings,
  };
}

function buildBill(text) {
  const amount =
    firstMatch(
      text,
      /(?:amount\s*(?:due|payable)?|total|net payable)[^\d₹]{0,20}((?:₹|rs\.?|inr)\s?[\d,]+(?:\.\d{1,2})?)/i,
    ) || firstMatch(text, /((?:₹|rs\.?|inr)\s?[\d,]+(?:\.\d{1,2})?)/i);
  const dueDate = firstMatch(
    text,
    /due\s*date[:\s-]*(\d{1,2}[/\-.\s][A-Za-z0-9]{1,9}[/\-.\s]\d{2,4})/i,
  );

  return {
    plainSummary: `This looks like a bill.${amount ? ` The amount is ${amount}.` : ""}${dueDate ? ` It should be paid by ${dueDate}.` : ""}`,
    keyFields: { amount, dueDate },
    actionCard: {
      whatIsThis: "A bill to pay.",
      needsAction: true,
      byWhen: dueDate,
    },
    warnings: amount
      ? []
      : ["I could not find the amount. Please check the bill."],
  };
}

function buildLetter(text) {
  const byWhen =
    firstMatch(text, /(within\s+\d+\s+days)/i) ||
    firstMatch(
      text,
      /(?:by|before|on or before)\s+(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4})/i,
    );
  const needsAction =
    /\b(please|kindly|must|submit|visit|update|required|within)\b/i.test(
      text,
    ) || Boolean(byWhen);

  return {
    plainSummary: needsAction
      ? "This looks like an official letter or notice. It asks you to do something."
      : "This looks like an official letter or notice. It does not seem to ask you to do anything.",
    keyFields: { dueDate: byWhen },
    actionCard: {
      whatIsThis: "An official letter or notice.",
      needsAction,
      byWhen,
    },
    warnings: [
      "Please check the full letter, or ask someone you trust, before you act.",
    ],
  };
}

function buildForm(text) {
  const fields = findFormFields(text);
  return {
    plainSummary:
      "This looks like a form. I explain what each box means. I never fill in the form.",
    keyFields: {},
    fields,
    actionCard: {
      whatIsThis: "A form you need to fill in.",
      needsAction: true,
      byWhen: firstMatch(
        text,
        /(?:last date|submit(?:\s+by)?)[:\s-]*(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4})/i,
      ),
    },
    // Design note from OCR testing: never imply every field was found
    warnings: [
      "I may have missed some boxes. If a box is missing, scan that part again.",
    ],
  };
}

function buildGeneral() {
  return {
    plainSummary:
      "I am not sure what kind of paper this is. You can still listen to the full text.",
    keyFields: {},
    actionCard: {
      whatIsThis: "Some printed text.",
      needsAction: false,
      byWhen: "",
    },
    warnings: [],
  };
}

const BUILDERS = {
  medicine_label: buildMedicine,
  bill: buildBill,
  government_letter: buildLetter,
  form: buildForm,
  general: buildGeneral,
};

// ---------- Public function (same name/shape the LLM version will have) ----------
export function mockAnalyze({ text, ocrConfidence }) {
  const { type, score } = detectType(text);
  const result = BUILDERS[type](text);

  const warnings = [...(result.warnings || [])];
  if (typeof ocrConfidence === "number" && ocrConfidence < 0.6) {
    warnings.unshift(
      "I am not fully sure I read this correctly. Please check the text.",
    );
  }

  return {
    documentType: type,
    confidence: type === "general" ? 0.5 : Math.min(0.9, 0.4 + 0.1 * score),
    ...result,
    warnings,
  };
}
